import { useState } from "react";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import ShowMessage from "./shared/ShowMessage";
import Spinner from "./shared/Spinner";
import { Utility } from "./Utility";

function ManageLinks(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const emptyid = Utility.EmptyID;
    const [id, setId] = useState(Utility.EmptyID);
    const [showmodal, setShowModal] = useState(false);
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    const saveData = () => {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("url", url);
        fd.set("name", name);
        setLoading(true);
        setMessage(new MessageModel());
        fetch('//' + window.location.host + '/api/Members/savelink', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        let ms = auth.myself;
                        if (id === Utility.EmptyID) {
                            ms.links.push(data);
                        } else {
                            for (let k in ms.links) {
                                if (ms.links[k].id === id) {
                                    ms.links[k].url = data.url;
                                    ms.links[k].name = data.name;
                                    break;
                                }
                            }
                        }
                        auth.updateMyself(ms);
                        setShowModal(false);
                        setId(emptyid);
                        setUrl("");
                        setName("");
                    });
                } else {
                    setMessage("danger", 'Unable to save link');
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = () => {
        fetch('//' + window.location.host + '/api/Members/removelink/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let ms = auth.myself;
                    ms.links = ms.links.filter(t => t.id !== id);
                    auth.updateMyself(ms);
                    setShowModal(false);
                    setId(emptyid);
                    setUrl("");
                    setName("");
                } else {
                    setMessage("danger", 'Unable to remove link.');
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const renderModal = () => {
        if (showmodal) {
            return <>
                <div className="modal fade d-block show" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Link</h1>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowModal(false);
                                    setId(emptyid);
                                    setUrl("");
                                    setName("");
                                }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => { e.preventDefault(); saveData(); return false; }}>
                                    <ShowMessage messagemodal={message} toast={false} />
                                    <div className="mb-2">
                                        <label className="form-label text-primary">URL</label>
                                        <input type="url" name="url" required placeholder="https://www.yocail.com"
                                            className="form-control shadow-none border" maxLength="300" value={url}
                                            onChange={(e) => { setUrl(e.target.value); }} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label text-primary">Text</label>
                                        <input type="text" name="name" required placeholder="Yocail Profile"
                                            className="form-control shadow-none border" maxLength="100" value={name}
                                            onChange={(e) => { setName(e.target.value); }} />
                                    </div>
                                    <div className="mb-2">
                                        <button type="submit" disabled={loading} className="btn btn-blue">{loading ? <Spinner sm={true} />
                                            : null} Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderRows = () => {
        let addbtn = auth.myself.links.length < 5 ? <li className="list-group-item">
            <div className="fs-small my-2 text-center">Add upto 5 links to your profile.
                <button className="btn btn-link text-decoration-none text-primary fw-bold" type="button" 
                onClick={() => {
                    setId(emptyid);
                    setUrl('');
                    setName('');
                    setShowModal(true);
                    }}>Add Link</button>
            </div>
        </li> : null;
        let items = [];
        let links = auth.myself.links;
        for (let k in links) {
            let l = links[k];
            items.push(<li key={k} className="list-group-item">
                <table className="w-100" cellPadding={0} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td>
                                <span className="fs-small fw-semibold">{l.name}</span><br />
                                <span className="fs-verysmall text-secondary">{l.url}</span>
                            </td>
                            <td width="50px" align="center">
                                <button type="button" className="btn btn-link" data-id={l.id} onClick={(e) => {
                                    setId(e.target.getAttribute("data-id"))
                                    removeData();
                                }}>
                                    <i className="bi bi-trash" data-id={l.id}></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </li>);
        }
        return <ul className="list-group">
            {items}
            {addbtn}
        </ul>;
    }


    return <>
        {renderRows()}
        {renderModal()}
    </>;

}
export default ManageLinks;
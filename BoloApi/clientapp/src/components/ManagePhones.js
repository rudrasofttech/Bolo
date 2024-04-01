import { useState } from "react";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import { Utility } from "./Utility";
import ShowMessage from "./shared/ShowMessage";
import Spinner from "./shared/Spinner";

function ManagePhones(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [id, setId] = useState(Utility.EmptyID);
    const [showmodal, setShowModal] = useState(false);
    const [phone, setPhone] = useState("");


    const saveData = () => {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("phone", phone);
        setLoading(true);
        setMessage(new MessageModel());

        fetch('//' + window.location.host + '/api/members/savephone', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        let ms = auth.myself;
                        if (id === Utility.EmptyID) {
                            ms.phones.push(data);
                        } else {
                            for (let k in ms.phones) {
                                if (ms.phones[k].id === id) {
                                    ms.phones[k].phone = data.phone;
                                    break;
                                }
                            }
                        }
                        auth.updateMyself(ms);

                        setShowModal(false);
                        setId(Utility.EmptyID);
                        setPhone("");
                    });
                } else {
                    setMessage("danger", 'Unable to save phone.');
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = () => {
        setLoading(true);
        setMessage(new MessageModel());
        fetch('//' + window.location.host + '/api/Members/removephone/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let ms = auth.myself;
                    ms.phones = ms.phones.filter(t => t.id !== id);
                    auth.updateMyself(ms);
                    setShowModal(false);
                    setId(Utility.EmptyID);
                    setPhone("");
                } else {
                    setMessage("danger", 'Unable to delete phone.');
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
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Phone</h1>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowModal(false);
                                    setId(Utility.EmptyID);
                                    setPhone("");
                                }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => { e.preventDefault(); saveData(); return false; }}>
                                    <ShowMessage messagemodal={message} toast={false} />
                                    <div className="mb-2">
                                        <input type="text" name="Phone" required placeholder="9871000222"
                                            className="form-control shadow-none border" maxLength="15" value={phone}
                                            onChange={(e) => { setPhone(e.target.value); }} />
                                    </div>
                                    <div className="mb-2">
                                        <button type="submit" disabled={loading} className="btn btn-blue">
                                            {loading ? <Spinner sm={true} /> : null} Save</button>
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
        let addbtn = auth.myself.phones.length < 2 ? <li className="list-group-item">
            <div className="fs-small my-2 text-center">Add upto 2 phone numbers to your profile.
                <button type="button" className="btn btn-link text-decoration-none text-primary fw-bold"
                    onClick={() => {
                        setShowModal(true);
                        setId(Utility.EmptyID);
                        setPhone("");

                    }}>Add Phone</button>
            </div>
        </li> : null;
        let items = [];
        let links = auth.myself.phones;
        for (let k in links) {
            let l = links[k];
            items.push(<li key={k} className="list-group-item">
                <table className="w-100" cellPadding={0} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td>
                                <span className="fs-small fw-semibold">{l.phone}</span>
                            </td>
                            <td width="50px" align="center">
                                <button type="button" className="btn btn-link" data-id={l.id} onClick={(e) => {
                                    setId(e.target.getAttribute("data-id"));
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

export default ManagePhones;
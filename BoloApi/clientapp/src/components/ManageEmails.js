import { useState } from "react";
import { Utility } from "./Utility";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";
import ShowMessage from "./shared/ShowMessage";
import Spinner from "./shared/Spinner";

function ManageEmails(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [id, setId] = useState(Utility.EmptyID);
    const [showmodal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");

    const saveData = () => {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("email", email);
        setLoading(true);
        setMessage(new MessageModel());

        fetch('//' + window.location.host + '/api/members/saveemail', {
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
                            ms.emails.push(data);
                        } else {
                            for (let k in ms.emails) {
                                if (ms.emails[k].id === id) {
                                    ms.emails[k].email = data.email;
                                    break;
                                }
                            }
                        }
                        auth.updateMyself(ms);
                        
                        setShowModal(false);
                        setId(Utility.EmptyID);
                        setEmail("");

                    });
                } else {
                    setMessage("danger", 'Unable to save email.');
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = () => {
        fetch('//' + window.location.host + '/api/Members/removeemail/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let ms = auth.myself;
                    ms.emails = ms.emails.filter(t => t.id !== id);
                    auth.updateMyself(ms);
                    setMessage(new MessageModel());
                    setShowModal(false);
                    setId(Utility.EmptyID);
                    setEmail("");
                } else {
                    setMessage("danger", 'Unable to save email.');
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
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Email</h1>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowModal(false);
                                    setId(Utility.EmptyID);
                                    setEmail("");
                                }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => { e.preventDefault(); saveData(); return false; }}>
                                    <ShowMessage messagemodal={message} toast={false} />
                                    <div className="mb-2">
                                        <input type="email" name="Email" required placeholder="joe@yocail.com"
                                            className="form-control shadow-none border" maxLength="100" value={email}
                                            onChange={(e) => { setEmail(e.target.value); }} />
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
        let addbtn = auth.myself.emails.length < 2 ? <li className="list-group-item">
            <div className="fs-small my-2 text-center">Add upto 2 emails to your profile.
                <button type="button" className="btn btn-link text-decoration-none text-primary fw-bold"
                    onClick={() => {
                        setShowModal(true);
                        setId(Utility.EmptyID);
                        setEmail("");
                    }}>Add Emails</button></div>
        </li> : null;
        let items = [];
        let links = auth.myself.emails;
        for (let k in links) {
            let l = links[k];
            items.push(<li key={k} className="list-group-item">
                <table className="w-100" cellPadding={0} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td>
                                <span className="fs-small fw-semibold">{l.email}</span>
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
export default ManageEmails;
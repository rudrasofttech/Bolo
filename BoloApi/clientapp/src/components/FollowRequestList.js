import { useEffect, useState } from "react";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import MemberPicSmall from "./shared/MemberPicSmall";
import ShowMessage from "./shared/ShowMessage";

function FollowRequestList(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [requests, setRequests] = useState([]);
    

    useEffect(() => {
        setLoading(true);
        setMessage(new MessageModel());
        fetch('//' + window.location.host + '/api/Follow/Requests', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        setRequests(data);
                        
                    });
                } else {
                    setMessage(new MessageModel('danger','Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }, [auth.token]);

    const allowRequest = (id) => {
        setLoading(true);
        setMessage(new MessageModel());
        fetch('//' + window.location.host + '/api/Follow/Allow/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setRequests(requests.filter(t => t.id !== id));
                } else if (response.status === 500) {
                    setMessage(new MessageModel('danger', 'Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }

    const rejectRequest = (id) => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/Follow/Reject/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setRequests(requests.filter(t => t.id !== id));
                    
                } else if (response.status === 500) {
                    setMessage(new MessageModel('danger', 'Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }

    const renderList = () => {
        let items = [];
        for (let k in requests) {
            let r = requests[k];
            items.push(<div key={r.id} className="row mx-0  justify-content-center align-items-center">
                <div className="col px-0">
                    <MemberPicSmall member={r} />
                    <a href={'//' + window.location.host + '/profile?un=' + r.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                        {r.userName}
                    </a>
                </div>
                <div className="col-6">
                    <button type="button" disabled={loading} data-id={r.id} onClick={(e) => { allowRequest(e.target.getAttribute("data-id")) }} className="btn btn-primary">Allow</button>
                    <button type="button" disabled={loading} data-id={r.id} onClick={(e) => { rejectRequest(e.target.getAttribute("data-id")) }} className="mx-2 btn btn-secondary">Reject</button>
                </div>
            </div>)
        }
        if (items.length === 0) {
            items.push(<div key={0}>
                <p>No Follow Requests Here.</p>
            </div>)
        }
        return items;
    }

    
    return <>
        {renderList()}
        <ShowMessage messagemodal={message} />
    </>;
}

export default FollowRequestList;
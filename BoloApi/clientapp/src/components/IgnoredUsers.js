import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";
import MemberPicSmall from "./shared/MemberPicSmall";
import Layout from "./Layout";
import ShowMessage from "./shared/ShowMessage";
import Spinner from "./shared/Spinner";

function IgnoredUsers() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [items, setItems] = useState([]);
    const q = '';
    

    
    useEffect(() => {
        setLoading(true);
        let url = '//' + window.location.host + '/api/Ignored?q=' + q;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logOut();
            } else if (response.status === 200) {
                response.json().then(data => {
                    setItems(data);
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    },[q]);

    const removeMember = (userid) => {
        setLoading(true);
        let url = '//' + window.location.host + '/api/Ignored/remove/' + userid;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logOut();
            } else if (response.status === 200) {
                response.text().then(data => {
                    console.log(data);
                    if (data === "true") {
                        setItems(items.filter(t => t.id !== userid));
                    }
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    }

    const renderComp = () => {
        let temp = [];
        for (let k in items) {
            temp.push(<div key={items[k].id} className="row g-1 mb-2 border-bottom align-items-center">
                <div className="col-2">
                    <MemberPicSmall member={items[k]} />
                </div>
                <div className="col">
                    <Link href={'//' + window.location.host + '/profile/' + items[k].userName} className="text-primary fs-20">
                        {items[k].userName}
                    </Link>
                </div>
                <div className="col-3 text-end">
                    <button className="btn btn-secondary" data-userid={items[k].id} onClick={(e) => { removeMember(e.target.getAttribute("data-userid")) }} type="button">Remove</button>
                </div>
            </div>);
        }
        return <div style={{ maxWidth: "600px" }}>{temp}</div>;

    }
    return <Layout>
        {renderComp()}
        <Spinner show={loading} center={true} />
        <ShowMessage messagemodal={message} toast={true } />
    </Layout>;
}
export default IgnoredUsers;
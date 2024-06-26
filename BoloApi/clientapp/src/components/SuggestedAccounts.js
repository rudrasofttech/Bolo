﻿import { useEffect, useState } from "react";
import { MessageModel } from "./shared/Model";
import MemberSmallRow from "./shared/MemberSmallRow";
import Spinner from "./shared/Spinner";
import ShowMessage from "./shared/ShowMessage";
import { useAuth } from "./shared/AuthProvider";

function SuggestedAccounts(props) {
    const auth = useAuth();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    
    useEffect(() => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/Follow/Recommended', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log("recommended");
                        console.log(data);
                        setList(data);
                        setMessage(new MessageModel());
                    });
                } else if (response.status === 500) {
                    setMessage(new MessageModel("danger", "Unable to process this request"));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to process this request, check your internet connection."));
            }).finally(() => {
                setLoading(false);
            });
    }, [auth.token]);

    return <>
        <Spinner show={loading} center={true} sm={true} />
        {list.length > 0 ? <div className="border rounded-4 mt-4">
            <h4 className="text-primary my-3 fs-24 text-center ff-righteous">Suggested Accounts</h4>
            {list.map(l => {
                return <div className="p-3 py-2">
                    <MemberSmallRow token={auth.token} member={l} />
                </div>;
            })}
        </div> : null }
        <ShowMessage messagemodal={message} />
    </>;
}

export default SuggestedAccounts;
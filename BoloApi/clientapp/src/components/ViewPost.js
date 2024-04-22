import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";
import { Utility } from "./Utility";
import Spinner from "./shared/Spinner";
import MemberPost from "./shared/MemberPost";
import ShowMessage from "./shared/ShowMessage";
import Layout from "./Layout";
import AskPushNotification from "./AskPushNotification";
import SendInvite from "./SendInvite";
import SuggestedAccounts from "./SuggestedAccounts";

function ViewPost(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [post, setPost] = useState(null);
    let { id } = useParams();

    useEffect(() => {
        setLoading(true);
        let url = `${Utility.GetAPIURL()}/api/post/${id}`;

        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        setPost(data);
                    });
                }
            }).catch(error => {
                setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
                console.log(error);
            }).finally(() => { setLoading(false); });
    }, [id]);

    return <Layout>
        <div className="px-md-5 my-md-3 my-2">
            <div className="row">
                <div className="col-lg-8 col-md-8 col-12">
                    <div className="d-flex justify-content-center">
                        <Spinner center={true} loading={loading} />
                        {post != null ? <MemberPost post={post} ondelete={(id) => {
                            console.log(`Post ${id} Deleted.`);
                        }} onIgnoredMember={(userid) => {
                            console.log(`User ${userid} Ignored.`);
                        }} /> : null }
                        
                        <ShowMessage toast={true} messagemodal={message} />
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 d-none d-md-block">
                    <AskPushNotification />
                    <SendInvite myself={auth.myself} />
                    <div className="sticky-top py-2">
                        <SuggestedAccounts />
                    </div>
                </div>
            </div>
        </div>
    </Layout>;
}

export default ViewPost;
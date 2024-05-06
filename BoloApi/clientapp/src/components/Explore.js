import { useAuth } from "./shared/AuthProvider";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import MemberPostList from "./MemberPostList";
import HashTagDetail from "./HashTagDetail";
import AskPushNotification from "./AskPushNotification";
import SendInvite from "./SendInvite";
import SuggestedAccounts from "./SuggestedAccounts";

function Explore(props) {
    const auth = useAuth();
    const { hashtag } = useParams()
    return <Layout>
        {/*<div className="px-md-5 my-md-3 my-2">*/}
        <div className="row">
            <div className="col-lg-6 offset-lg-3">
                <div className="my-md-3 my-2">
                    {hashtag && hashtag.indexOf("#") > -1 ? <HashTagDetail token={auth.token} search={hashtag} /> : null}
                    <MemberPostList search={hashtag || "userfeed"} token={auth.token} viewMode={1} viewModeAllowed="true" />
                </div>
            </div>
            {/*<div className="col-lg-4 d-none d-md-block">*/}
            {/*    <AskPushNotification />*/}
            {/*    <SendInvite myself={auth.myself} />*/}
            {/*    <div className="sticky-column py-2">*/}
            {/*        <SuggestedAccounts />*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
        {/*</div>*/}
    </Layout>;
}

export default Explore;
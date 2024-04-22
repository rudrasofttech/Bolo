import { useAuth } from "./shared/AuthProvider";
import Layout from "./Layout";
import MemberPostList from "./MemberPostList";
import AskPushNotification from "./AskPushNotification";
import SendInvite from "./SendInvite";
import SuggestedAccounts from "./SuggestedAccounts";

function Explore(props) {
    const auth = useAuth();

    return <Layout>
        {/*<div className="px-md-5 my-md-3 my-2">*/}
            <div className="row">
            <div className="col-lg-8 offset-lg-2 col-12">
                    <div className="px-md-5 my-md-3 my-2">
                        <MemberPostList search={props.search || "userfeed"} token={auth.token} viewMode={1} viewModeAllowed="true" />
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
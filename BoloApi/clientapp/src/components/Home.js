import Layout from "./Layout";
import MemberPostList from "./MemberPostList";
import HashTagDetail from "./HashTagDetail";
import { useState } from "react";
import AskPushNotification from "./AskPushNotification";
import SendInvite from "./SendInvite";
import SuggestedAccounts from "./SuggestedAccounts";
import { useAuth } from "./shared/AuthProvider";

function Home(props) {
    const auth = useAuth();
    const [search, setSearch] = useState(props.search || "");

    return <Layout>
        <div className="container my-md-3 my-2">
            <div className="row">
                <div className="col-lg-8 col-md-8 col-12">
                    {search.indexOf("#") > -1 ? <HashTagDetail token={auth.token} search={search} /> : null}
                    <MemberPostList search={search} viewMode={2} viewModeAllowed="false" />
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

export default Home;


import Layout from "./Layout";
import MemberPostList from "./MemberPostList";
import HashTagDetail from "./HashTagDetail";
import { useState } from "react";

function Home(props) {
    const token = localStorage.getItem("token") == null ? '' : localStorage.getItem("token");
    const [search, setSearch] = useState("");
    return <>
        <Layout>
            <div className="container my-md-3 my-2">
                <div className="row">
                    <div className="col-lg-8 col-md-8 col-12">
                        {search.indexOf("#") > -1 ? <HashTagDetail token={token} search={search} /> : null}
                        <MemberPostList search={search} token={token} viewMode={2} viewModeAllowed="false" />
                    </div>
                    <div className="col-lg-4 col-md-4 d-none d-md-block">
                        <div className="sticky-column py-2">
                            {/*<AskPushNotification />*/}
                            {/*<SendInvite />*/}
                            {/*<SuggestedAccounts />*/}
                        </div>
                    </div>
                </div>
            </div>
    </Layout>
    </>;
}

export default Home;


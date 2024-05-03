import Layout from "./Layout";
import MemberPostList from "./MemberPostList";
//import HashTagDetail from "./HashTagDetail";
//import { useEffect, useState } from "react";
//import { useSearchParams } from 'react-router-dom';
//import AskPushNotification from "./AskPushNotification";
//import SendInvite from "./SendInvite";
//import SuggestedAccounts from "./SuggestedAccounts";
import { useAuth } from "./shared/AuthProvider";

function Home() {
    const auth = useAuth();
    //const [searchParams] = useSearchParams();
    //const q = searchParams.has('q') ? searchParams.get('q') : ""
    
    return <Layout>
        {/*<div className="px-md-5 my-md-3 my-2">*/}
        <div className="row">
            <div className="col-lg-6 offset-lg-3 col-12">
                <div className="d-flex justify-content-center my-md-3 my-2">
                    <MemberPostList search={""} viewMode={2} viewModeAllowed="false" />
                </div>
            </div>
            {/*<div className="col-lg-4 col-md-4 d-none d-md-block">*/}
            {/*    <AskPushNotification />*/}
            {/*    <SendInvite myself={auth.myself} />*/}
            {/*    <div className="sticky-top py-2">*/}
            {/*        <SuggestedAccounts />*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
        {/*</div>*/}
    </Layout>;
}

export default Home;


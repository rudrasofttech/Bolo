import Layout from "./Layout";
import MemberPostList from "./MemberPostList";

function Home() {
    return <Layout>
        <div className="row">
            <div className="col-lg-6 offset-lg-3 col-12">
                <div className="d-flex justify-content-center my-md-3 my-2">
                    <MemberPostList search={"userfeed"} viewMode={2} viewModeAllowed="false" />
                </div>
            </div>
        </div>
    </Layout>;
}

export default Home;


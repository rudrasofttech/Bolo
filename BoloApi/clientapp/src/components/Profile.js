import { Link, useParams } from "react-router-dom";
import { useAuth } from "./shared/AuthProvider";
import { useEffect, useState } from "react";
import { MessageModel } from "./shared/Model";
import FollowButton from "./shared/FollowButton";
import Spinner from "./shared/Spinner";
import MemberSmallList from "./shared/MemberSmallList";
import FollowRequestList from "./FollowRequestList";
import ExpandableTextLabel from "./shared/ExpandableTextLabel";
import MemberPostList from "./MemberPostList";
import ShowMessage from "./shared/ShowMessage";
import Layout from "./Layout";
import DropDownButton from "./shared/UI/DropDownButton";

function Profile() {
    const auth = useAuth();
    const { username } = useParams()
    const [loading, setLoading] = useState(false);
    const [showfollowers, setShowFollowers] = useState(false);
    const [showfollowing, setShowFollowing] = useState(false);
    //const [showSettings, setShowSettings] = useState(false);
    const [showrequests, setShowRequests] = useState(false);
    const [hasFollowRequest, setHasFollowRequest] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [followStatus, setFollowStatus] = useState(null);
    const [member, setMember] = useState(null);

    useEffect(() => {
        setLoading(true);
        let un = "";
        if (username === undefined) {
            auth.validate();
            un = auth.myself.id;
        } else {
            un = username;
        }
        fetch('//' + window.location.host + '/api/Members/' + un, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        setMember(data);
                        loadFollowStatus(data.id);
                        checkIfHasRequest(data.id)
                    });
                } else {
                    setMessage(new MessageModel("danger", "Unable to load profile."));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            }).finally(() => {
                setLoading(false);
            });
    }, [username]);

    const loadFollowStatus = (username) => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/Follow/Status/' + username, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        setFollowStatus(data.status);
                    });
                }

            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            }).finally(() => {
                setLoading(false);
            });
    }

    const checkIfHasRequest = (username) => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/Follow/HasRequest/' + username, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    setHasFollowRequest(true);

                } else {
                    setHasFollowRequest(false);
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            }).finally(() => {
                setLoading(false);
            });
    }

    const allowRequest = () => {
        fetch('//' + window.location.host + '/api/Follow/allow/' + member.id, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    setHasFollowRequest(false);
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            }).finally(() => {
                setLoading(false);
            });
    }

    const rejectRequest = () => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/Follow/Reject/' + member.id, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    setHasFollowRequest(false);
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            }).finally(() => {
                setLoading(false);
            });
    }

    const renderFollowHtml = () => {
        if (followStatus != null) {
            return <FollowButton token={auth.token} member={member} status={followStatus} />
        }
    }

    const renderFollowers = () => {
        if (showfollowers) {
            return <>
                <div className="modal fade show" style={{ display: "block" }} id="followersModal" tabIndex="-1"
                    aria-labelledby="followersModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered  modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title fw-semibold fs-20" id="followersModalLabel">Followers</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                    onClick={() => { setShowFollowers(false); }}></button>
                            </div>
                            <div className="modal-body">
                                <MemberSmallList memberid={member.id} target="follower" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        return null;
    }

    const renderFollowing = () => {
        if (showfollowing) {
            return <>
                <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabIndex="-1" aria-labelledby="followingModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered  modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title  fw-semibold fs-20" id="followingModalLabel">Following</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                    onClick={() => { setShowFollowing(false); }}></button>
                            </div>
                            <div className="modal-body">
                                <MemberSmallList memberid={member.id} target="following" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        return null;
    }

    const renderFollowRequest = () => {
        if (showrequests) {
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabIndex="-1"
                aria-labelledby="followrequestModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followingModalLabel">Follow Request</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                onClick={() => { setShowRequests(false); }}></button>
                        </div>
                        <div className="modal-body">
                            <FollowRequestList />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return null;
    }

    const renderRequestApproval = () => {
        if (hasFollowRequest) {
            return <div className="row">
                <div className="col">
                    <p>You have follow request from this account, take action.</p>
                    <button type="button" disabled={loading} className="btn btn-primary me-2" onClick={() => { allowRequest(); }}>Approve</button>
                    <button className="btn btn-secondary" disabled={loading} type="button" onClick={() => { rejectRequest(); }}>Reject</button>
                </div>
            </div>;
        }
    }



    const renderComp = () => {

        var followlist = null;
        if (showfollowing) {
            followlist = <>{renderFollowing()}</>;
        }
        else if (showfollowers) {
            followlist = <>{renderFollowers()}</>;
        }
        else if (showrequests) {
            followlist = <>{renderFollowRequest()}</>
        }

        let me = null, settings = null, followhtml = null;
        if (member !== null) {
            if (member != null && auth.myself.id === member.id) {
                settings = <div className="d-inline-block">
                    <DropDownButton buttoncss="btn-link text-decoration-none " text={<><i className="bi bi-gear me-1"></i>Settings</>}>
                        <li>
                            <Link to="/manageprofile" className="dropdown-item text-dark py-2">Edit Profile</Link></li>
                        <li>
                            <Link className="dropdown-item text-dark py-2" to="/ignored">Ignored Members</Link>
                        </li>
                        <li>
                            <button type="button" className="btn btn-link dropdown-item text-dark text-decoration-none py-2" onClick={() => auth.logOut()}>Logout</button>
                        </li>
                    </DropDownButton>
                </div>;
            } else {
                followhtml = renderFollowHtml();
            }
            me = <>
                <div className="d-flex justify-content-center">
                    <div className="col-lg-8 offset-lg-2 col-12">
                        <div className="my-md-3 my-2" style={{ maxWidth: "800px" }}>
                            <div className="py-3 bg-white fs-5">
                                <div className="row">
                                    <div className="col-md-3">
                                        {member.pic !== "" ? <img src={"//" + window.location.host + "/" + member.pic} className="img-fluid profile-pic-border mb-2" alt="" />
                                            : <img src="/theme1/images/person-fill.svg" className="img-fluid profile-pic-border mb-2 w-100" alt="" />}
                                        <h1 className="fs-20 text-center text-primary">@{member.userName}</h1>
                                    </div>
                                    <div className="col-md pt-3">
                                        {member.name !== "" ? <div className="fs-2 mb-3 text-primary">{member.name}</div> : null}
                                        {member.countryName !== "" ? <div className="mb-2 fs-20 text-secondary"><i className="bi bi-globe-central-south-asia"></i> {member.countryName}</div> : null}
                                        {/*{member.thoughtStatus !== "" ? <div className="mb-2 fs-20 text-secondary">{member.thoughtStatus}</div> : null}*/}
                                        {member.bio === null ? null : <div className="mb-2  fs-20">
                                            <ExpandableTextLabel cssclassName="text-justify lh-base" text={member.bio} maxlength={200} />
                                        </div>}
                                        <div className="d-flex justify-content-start">
                                            {member.phones.length > 0 ? <div className="d-inline-block me-1">
                                                <DropDownButton buttoncss="btn-link text-decoration-none text-primary" text={<><i className="bi bi-phone-fill"></i> Phones</>}>{member.phones.map(l => {
                                                    return <li><a href={`tel:${l.phone}`} className="dropdown-item text-dark py-2">{l.phone}</a></li>
                                                })}</DropDownButton>
                                            </div> : null}
                                            {member.emails.length > 0 ? <div className="d-inline-block me-1">
                                                <DropDownButton buttoncss="btn-link text-decoration-none text-primary" text={<><i className="bi bi-envelope-at-fill"></i> Emails</>}>{member.emails.map(l => {
                                                    return <li>
                                                        <a href={`mailto:${l.email}`} className="dropdown-item text-dark py-2">{l.email}</a>
                                                    </li>;
                                                })}</DropDownButton>
                                            </div> : null}
                                            {member.links.length > 0 ? <div className="d-inline-block me-1">
                                                <DropDownButton buttoncss="btn-link text-decoration-none text-primary" text={<><i className="bi bi-link-45deg"></i> External Links</>}>{member.links.map(l => {
                                                    return <li>
                                                        <a href={l.url} className="dropdown-item text-dark py-2" rel="noreferrer" target="_blank">{l.name}</a>
                                                    </li>;
                                                })}</DropDownButton>
                                            </div> : null}
                                            {settings}
                                        </div>

                                        {followhtml}
                                        {member.followRequestCount > 0 && member.userName === auth.myself.userName ? <div className="mt-2"><button type="button" className="btn btn-light text-success fw-bold " onClick={() => { setShowRequests(true) }}>{member.followRequestCount} Follow Request</button></div> : null}
                                        {renderRequestApproval()}
                                    </div>
                                </div>
                                <div className="d-flex rounded-5 mt-3 py-2" style={{ background: "rgba(48,35,91,.08)" }}>
                                    <div className="flex-grow-1 text-center">
                                        <button type="button" className="btn btn-link text-primary fw-semibold text-decoration-none">{member.postCount} Posts</button></div>
                                    <div className="flex-grow-1 text-center">
                                        {
                                            (auth.myself && member != null && auth.myself.id === member.id) ?
                                                <button type="button" className="btn btn-link text-primary fw-semibold text-decoration-none"
                                                    onClick={() => { setShowFollowing(true) }}>
                                                    {member.followingCount} Following</button> :
                                                <button type="button" className="btn btn-link text-primary fw-semibold text-decoration-none">
                                                    {member.followingCount} Following</button>
                                        }
                                    </div>
                                    <div className="flex-grow-1 text-center">
                                        {
                                            (auth.myself && member != null && auth.myself.id === member.id) ?
                                                <button type="button" className="btn btn-link text-primary fw-semibold text-decoration-none"
                                                    onClick={() => { setShowFollowers(true); }}>{member.followerCount} Followers</button> :
                                                <button type="button" className="btn btn-link text-primary fw-semibold text-decoration-none">
                                                    {member.followerCount} Followers</button>
                                        }
                                    </div>
                                </div>
                            </div>
                            <ShowMessage messagemodal={message} toast={true} />
                            <MemberPostList search={member.userName} viewMode={1} viewModeAllowed="true" />
                        </div>
                    </div>
                </div>
                {followlist}
            </>;
        }

        return <Layout>
            {me}
        </Layout>;
    }

    return <>{renderComp()}</>;
}

export default Profile;
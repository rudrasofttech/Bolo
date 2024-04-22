import { useState } from "react";
import { Link } from "react-router-dom";
import MemberPicSmall from "./MemberPicSmall";
import PhotoCarousel from "./PhotoCarousel";
import MemberSmallList from "./MemberSmallList";
import DateLabel from "./DateLabel";
import ExpandableTextLabel from "./ExpandableTextLabel";
import MemberComment from "./MemberComment";
import ShowMessage from "./ShowMessage";
import EditPost from "../EditPost";
import { MessageModel } from "./Model";
import { useAuth } from "./AuthProvider";

function MemberPost(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [post, setPost] = useState(props.post);
    const [hashtag, setHashtag] = useState(props.hashtag ? props.hashtag : '');
    const [showModal, setShowModal] = useState('') /*reaction,comment,post,edit,delete,flag,share */
    //const [muted, setMuted] = useState(true);


    const addReaction = () => {
        fetch('//' + window.location.host + '/api/post/addreaction/' + post.id, {
            method: 'get',
            headers: { "Authorization": 'Bearer ' + auth.token }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let p = post;
                    p.hasReacted = data.hasReacted;
                    p.reactionCount = data.reactionCount;
                    setMessage(new MessageModel());

                    setPost(p);
                });
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel('danger', data.error));
                }).catch(err => {
                    setMessage(new MessageModel('danger', "Unable to add reaction to post."));
                    console.log(err);
                });
            }
        }).catch(error => {
            setMessage(new MessageModel('danger', "Unable to connect to internet."));
            console.log(error);
        });
    }

    const editPost = () => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/post/edit/' + post.id, {
            method: 'post',
            body: JSON.stringify({ describe: post.describe, acceptComment: post.acceptComment, allowShare: post.allowShare }),
            headers: {
                'Authorization': 'Bearer ' + auth.token,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status === 200) {
                setMessage(new MessageModel());
                setShowModal('');
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error, 0));
                }).catch(err => {
                    console.log(err);
                    setMessage(new MessageModel("danger", "Unable to add reaction to post.", 0));
                });
            }
        }).catch(error => {
            setMessage(new MessageModel("danger", "Unable to connect to internet.", 0));
            console.log(error);
        }).finally(() => {
            setLoading(false);
        });
    }

    const sharePost = (sharewithid) => {
        fetch(`//${window.location.host}/api/post/share/${post.id}?uid=${sharewithid}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setMessage(new MessageModel("success", "Post is shared.", 0));
                } else {
                    response.json().then(data => {
                        setMessage(new MessageModel("danger", data.error, 0));
                    }).catch(err => {
                        setMessage(new MessageModel("danger", "Unable to share post.", 0));
                        console.log(err);
                    });
                }
            }).catch(error => {
                setMessage(new MessageModel("danger", "Unable to connect to internet.", 0));
                console.log(error);
            });
    }

    const deletePost = () => {
        fetch(`//${window.location.host}/api/post/delete/${post.id}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 200) {
                let id = post.id;
                setMessage(new MessageModel());
                setShowModal("");
                setPost(null);
                if (props.ondelete !== undefined && props.ondelete !== null) {
                    props.ondelete(id);
                }
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error));
                    setShowModal("");
                }).catch(err => {
                    setMessage(new MessageModel("danger", "Unable to delete post."));
                    setShowModal("");
                    console.log(err);
                });
            }
        }).catch((error) => {
            setShowModal("");
            setMessage(new MessageModel("danger", "Unable to connect to internet."));
            console.log(error);
        });
    }

    const ignoreMember = () => {
        fetch(`//${window.location.host}/api/ignored/${post.owner.id}`, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.text().then(data => {
                    //console.log(data);
                    if (data === "false") { } else if (data === "true") {
                        if (props.onIgnoredMember !== undefined && props.onIgnoredMember !== null) {
                            props.onIgnoredMember(post.owner.id);
                        }
                    }
                });
            }
        });
    }

    const flagPost = (typeid) => {
        fetch(`//${window.location.host}/api/post/flag/${post.id}?type=${typeid}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 200) {
                setShowModal("");
                setMessage(new MessageModel("info", "Thank you! for reporting the post."));
            } else {
                setShowModal("");
                setMessage(new MessageModel("danger", "Unable to process your request."));
            }
        }).catch(() => {
            setShowModal("");
            setMessage(new MessageModel("danger", "Unable to process your request."));
        });
    }

    const renderPostOptions = () => {
        if (showModal === "post") {
            let deletebtn = null; let ignoreaccbtn = null, editbtn = null;
            if (post.owner.id === auth.myself.id) {
                editbtn = <div className="text-center border-bottom mb-1 p-1">
                    <button type="button" className="btn btn-link btn-lg text-decoration-none text-primary fw-normal"
                        onClick={() => { setShowModal('edit'); }}>
                        <i className="bi bi-pencil-fill me-2"></i> Edit
                    </button>
                </div>;
                deletebtn = <div className="text-center border-bottom mb-1 p-1">
                    <button type="button" className="btn btn-link btn-lg text-decoration-none text-danger  fw-normal"
                        onClick={() => { setShowModal('delete'); }}>
                        <i className="bi bi-trash3-fill  me-2"></i> Delete
                    </button>
                </div>;
            }

            if (post.owner.id !== auth.myself.id) {
                ignoreaccbtn = <div className="text-center mb-1 p-1">
                    <button type="button" className="btn btn-link btn-lg text-decoration-none text-danger  fw-normal"
                        onClick={() => { ignoreMember(); }}>
                        <i className="bi bi-sign-stop-fill me-2"></i> Ignore Member
                    </button>
                </div>;
            }
            return <>
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                {editbtn}
                                {deletebtn}
                                {ignoreaccbtn}
                                <div className="text-center mb-1 p-1">
                                    <button type="button" className="btn btn-link btn-lg text-decoration-none text-danger  fw-normal"
                                        onClick={() => { setShowModal('flag'); }}>
                                        <i className="bi bi-flag-fill me-2"></i> Report
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer text-center">
                                <button type="button" className="btn btn-secondary"
                                    onClick={() => { setShowModal(''); }} data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderPostDisplay = (p) => {
        p.describe = p.describe + " ";
        let ownerlink = hashtag !== '' ? <div className="d-inline-block">
            <Link to={`//${window.location.host}/post/hastag?ht=${hashtag}`} className="text-primary fw-semibold fs-20">
                {p.owner.userName}
            </Link>
            <Link to={`//${window.location.host}/profile/${p.owner.userName}`} className="text-primary fw-semibold fs-20">
                {p.owner.userName}
            </Link>
        </div> :
            <Link to={`//${window.location.host}/profile/${p.owner.userName}`} className="text-primary fw-semibold fs-20">
                {p.owner.userName}
            </Link>;
        let owner = <div className="py-lg-3 py-2">
            <div className="row g-0 align-items-center ">
                <div className="col-2 col-lg-2 px-md-1" style={{ maxWidth: "60px" }}>
                    <MemberPicSmall member={p.owner} />
                </div>
                <div className="col col-lg ps-1">
                    {ownerlink}
                </div>
                <div className="col-1 text-end">
                    <button className="btn btn-link text-primary fs-4"
                        onClick={() => {
                            setShowModal('post');
                        }}>
                        <i className="bi bi-three-dots"></i>
                    </button>
                </div>
            </div>
        </div>;
        let postshtml = null;

        if (p.videoURL !== "") {
            postshtml = <div style={{ minHeight: "300px" }}>
                <video src={p.videoURL} className="w-100"></video>
            </div>;
        } else if (p.photos) {
            if (p.photos.length === 1) {
                postshtml = <div className="text-center bg-light" style={{ minHeight: "300px" }}>
                    <img src={p.photos[0].photo} alt="" className="img-fluid" onDoubleClick={() => { addReaction(); }} />
                </div>
            } else {
                postshtml = <div className="text-center bg-light" style={{ minHeight: "400px" }}>
                    <PhotoCarousel photos={p.photos} postid={p.id} />
                </div>;
            }
        }

        let commentbox = showModal === "comment" ? <MemberComment post={p}
            cancel={() => { setShowModal(''); }} onCommentAdded={count => { post.commentCount = count; setPost(post); }}
            onCommentRemoved={count => { post.commentCount = count; setPost(post); }} /> : null;

        if (!p.acceptComment)
            commentbox = null;
        let reactionCountHtml = <span className="d-block mt-1 text-dark" style={{ fontSize: "0.7rem" }}>{(p.reactionCount > 0) ? <>{p.reactionCount}<br />Likes</> : " "}</span>;

        let reactionhtml = <div className="p-2 me-2 fs-3 d-inline-block text-center text-primary pointer" onClick={addReaction}>
            <i className="bi bi-heart"></i>{reactionCountHtml}
        </div>;
        if (p.hasReacted) {
            reactionhtml = <div className="p-2 fs-3 d-inline-block text-center text-danger pointer" onClick={addReaction}><i className="bi bi-heart-fill"></i>{reactionCountHtml}</div>;
        }
        let commentBtn = p.acceptComment ? <div className="p-2 me-2 fs-3 d-inline-block text-center text-primary pointer" onClick={() => { setShowModal('comment'); }}><i className="bi bi-chat-square-text"></i><span className="d-block mt-1 text-dark" style={{ fontSize: "0.7rem" }}>{p.commentCount > 0 ? <>{p.commentCount}<br />Comments</> : " "}</span></div> : null;
        let shareBtn = p.allowShare ? <div className="p-2 fs-3 d-inline-block text-center text-primary pointer" title="Share post with people" onClick={() => { setShowModal('share'); }}>
            <i className="bi bi-share-fill"></i>
        </div> : null;

        let likemodal = null;
        if (showModal === "reaction") {
            likemodal = <>
                <div className="modal fade show d-block" id={"reactionListModal-" + post.id} tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-fullscreen-lg-down">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title fw-semibold">Likes</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setShowModal(''); }}></button>
                            </div>
                            <div className="modal-body p-2">
                                <MemberSmallList target="reaction" postid={post.id} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        return <div id={post.id} className="mb-2 bg-white memberpost">
            {owner}
            {postshtml}
            <div className="row align-items-start g-1 mt-2">
                <div className="col">
                    <div className=" text-secondary" style={{ fontSize: "13px" }}>
                        <DateLabel value={p.postDate} />
                    </div>
                </div>
                <div className="col text-end">
                    {reactionhtml}
                    {commentBtn}
                    {shareBtn}
                </div>
            </div>
            <div className="lh-sm">
                <ExpandableTextLabel cssclass="fs-small" text={p.describe === null ? "" : p.describe} maxlength={100} />
            </div>
            {likemodal}
            {commentbox}
            {renderPostOptions()}
            <div className="border-bottom my-3"></div>
        </div>;
    }

    const renderShareModal = () => {
        if (showModal === "share") {
            return <>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title text-primary fw-semibold fs-4" >Share</h4>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(''); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <MemberSmallList token={auth.token} memberid={auth.myself.id} target="share" onSelected={(id) => { sharePost(id); }}></MemberSmallList>
                            </div>
                            <ShowMessage messagemodal={message} />
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderDeleteModal = () => {
        if (showModal === "delete") {
            return <>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title text-primary fw-semibold fs-5" >Delete Post</h4>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(''); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>You are going to delete this post permanently. Please confirm?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={deletePost}>Yes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(''); }}>No</button>
                            </div>
                        </div>
                    </div>
                </div><div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderFlagModal = () => {
        if (showModal === "flag") {
            return <>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title text-primary fw-semibold fs-5" >Flag Post</h4>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(''); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        <button type="button" onClick={() => { flagPost(1) }} className="btn btn-link text-dark">Abusive Content</button>
                                    </li>
                                    <li className="list-group-item">
                                        <button type="button" onClick={() => { flagPost(2) }} className="btn btn-link text-dark">Spam Content</button>
                                    </li>
                                    <li className="list-group-item">
                                        <button type="button" onClick={() => { flagPost(3) }} className="btn btn-link text-dark">Fake / Misleading</button></li>
                                    <li className="list-group-item">
                                        <button type="button" onClick={() => { flagPost(4) }} className="btn btn-link text-dark">Nudity</button></li>
                                    <li className="list-group-item">
                                        <button type="button" onClick={() => { flagPost(5) }} className="btn btn-link text-dark">Promoting Violence</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderEditModal = () => {
        if (showModal === "edit") {
            return <>
                <div className="modal d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-body">
                                <EditPost post={post} onchange={(describe, ac, as) => {
                                    let p = post;
                                    p.describe = describe;
                                    p.acceptComment = ac;
                                    p.allowShare = as;
                                    setPost(p);
                                }} />
                                {loading ? <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div> : null}
                                <ShowMessage messagemodal={message} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={editPost}>Save</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(''); }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        return null;
    }

    return <>{post === null ? null : <>
        {renderPostDisplay(post)}
        {renderEditModal()}
        {renderDeleteModal()}
        {renderFlagModal()}
        {renderShareModal()}
    </>}</>;

}
export default MemberPost;
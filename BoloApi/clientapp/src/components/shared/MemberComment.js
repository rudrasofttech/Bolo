import { useEffect, useState } from "react";
import MemberPicSmall from "./MemberPicSmall";
import DateLabel from "./DateLabel";
import ConfirmBox from "./ConfirmBox";
import AutoAdjustTextArea from "./AutoAdjustTextArea";
import { MessageModel } from "./Model";
import { useAuth } from "./AuthProvider";

function MemberComment(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [loadingComments, setLoadingComments] = useState(false);
    const [comments, setComments] = useState({ current: 0, pageSize: 20, total: 0, commentList: [] });
    const [currentPage, setCurrentPage] = useState(0);
    const [commenttext, setCommentText] = useState('');
    const [commentiddel, setCommentIDDel] = useState(0);
    const [textarearows, setTextAreaRows] = useState()

    useEffect(() => {
        setLoadingComments(true);
        let url = '//' + window.location.host + '/api/post/comments/' + props.post.id + '?ps=' + comments.pageSize + '&p=' + currentPage;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
             if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    let temp = comments.commentList;
                    for (let k in data.commentList) {
                        if (temp.filter(t => t.id === data.commentList[k].id).length === 0)
                            temp.push(data.commentList[k]);
                    }

                    setComments({
                        current: data.current,
                        pageSize: data.pageSize,
                        total: data.total,
                        totalPages: data.totalPages,
                        commentList: temp
                    });

                });
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error));
                }).catch(err => {
                    console.log(err);
                    setMessage(new MessageModel("danger", "Unable to load comments of this post."));
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", "Unable to connect to internet."));
        }).finally(() => {
            setLoadingComments(false);
        });
    }, [props.post, auth.token, currentPage]);


    const addComment = () => {
        setLoading(true);
        const fd = new FormData();
        fd.set("comment", commenttext);
        fd.set("postId", props.post.id);
        fetch(`//${window.location.host}/api/post/addcomment`, {
            method: 'post',
            body: fd,
            headers: { 'Authorization': 'Bearer ' + auth.token }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let temp = comments.commentList;
                    temp.unshift(data);

                    setComments({
                        current: comments.current,
                        pageSize: comments.pageSize,
                        total: comments.total + 1,
                        totalPages: comments.totalPages,
                        commentList: temp
                    });
                    setCommentText("");

                    if (props.onCommentAdded !== undefined && props.onCommentAdded !== null) {
                        props.onCommentAdded(comments.total);
                    }
                });
            } else {
                setMessage(new MessageModel("danger", 'Unable to save comment'));
            }
        })
            .catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            })
            .finally(() => { setLoading(false); });
    }

    const removeComment = () => {
        let url = `//${window.location.host}/api/post/removecomment/${commentiddel}`;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                 if (response.status === 200) {
                    let temp = comments.commentList.filter(t => t.id !== commentiddel);
                    setCommentIDDel(0);
                    setComments({
                        current: comments.current,
                        pageSize: comments.pageSize,
                        total: comments.total - 1,
                        totalPages: comments.totalPages,
                        commentList: temp
                    });

                    if (props.onCommentRemoved !== undefined && props.onCommentRemoved !== null) {
                        props.onCommentRemoved(comments.total);
                    }
                }
            });
    }



    const renderComments = () => {
        let items = [];
        //if (comments.commentList.length === 0) {
        //    items.push(<p key={0} className="px-2">No Comments Found.</p>)
        //}
        for (var k in comments.commentList) {
            var p = comments.commentList[k];
            var ownedCommentMenu = null;
            if (auth.myself.id === p.postedBy.id) {
                ownedCommentMenu = <button data-id={p.id} onClick={(e) => { setCommentIDDel(parseInt(e.target.getAttribute("data-id"), 10)) }}
                    className="btn btn-link text-primary btn-sm mx-2" type="button">
                    <i data-id={p.id} className="bi bi-trash"></i></button>;
            }
            items.push(<div key={p.id} className="row g-1 border-bottom p-1">
                <div className="col-2 col-md-1"><MemberPicSmall member={p.postedBy} /></div>
                <div className="col">
                    <a href={'//' + window.location.host + '/profile?un=' + p.postedBy.userName}
                        className="fw-semibold text-primary">
                        {p.postedBy.userName}
                    </a>
                    <div className="lh-base mt-2 mb-1">
                        {p.comment.split('\n').map((item) => {
                            return <><span dangerouslySetInnerHTML={{ __html: item }}></span><br /></>
                        })}</div>
                    <div className="mb-2 pb-1">
                        <span className="text-secondary" style={{ fontSize: "12px" }}>
                            <DateLabel value={p.postDate} /></span> {ownedCommentMenu}
                    </div>
                </div>
            </div>);
        }
        return items;
    }

    return <>
        <div className="modal fade show" style={{ display: "block" }} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-semibold">Comments</h5>
                        <button type="button" className="btn-close" onClick={() => { props.cancel(); }}></button>
                    </div>
                    <div className="modal-body p-1" style={{ minHeight: "300px" }}>
                        {loadingComments ? <div className="p-1 text-center">Loading Comments...</div> :
                            <>{renderComments()}
                                {(comments.current + 1 < comments.totalPages) ?
                                    <div className="text-center">
                                        <button className="btn btn-light" onClick={() => {
                                            setCurrentPage(comments.current + 1);
                                        }}>Load More</button>
                                    </div>
                                    : null}
                            </>}
                        {commentiddel > 0 ? <ConfirmBox title="" message="Are you sure you want to remove this comment?"
                            ok={() => { removeComment(); }} cancel={() => { setCommentIDDel(0); }} /> : null}
                    </div>
                    <div className="modal-footer">
                        <table className="w-100" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td valign="middle" align="right">
                                        <AutoAdjustTextArea htmlattr={{ class: "form-control shadow-none border mb-2", required: "required", placeholder: "Type your comment here...", maxLength: 3000 }} onChange={(val) => { setCommentText(val); }} value={commenttext} maxRows={5} minRows={1} />
                                    </td>
                                    <td valign="middle" width="58px" className="ps-1">
                                        <button type="button" className="btn btn-blue" onClick={addComment}>Post</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop fade show"></div>
    </>;

}
export default MemberComment;
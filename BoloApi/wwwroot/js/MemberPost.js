class MemberPost extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post, showreactionlist: false, hashtag: this.props.hashtag ? this.props.hashtag : '',
            showCommentBox: false
        };

        this.addReaction = this.addReaction.bind(this);
    }

    addReaction() {
        fetch('//' + window.location.host + '/api/post/addreaction/' + this.state.post.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        var p = this.state.post;
                        p.hasReacted = data.hasReacted;
                        p.reactionCount = data.reactionCount;
                        this.setState({ loading: false, message: '', bsstyle: '', post: p });
                    });
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }

                } else {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }

                }
            });
    }

    render() {
        var p = this.state.post;
        var ownerlink = this.state.hashtag !== '' ? <div className="d-inline-block">
            <a href={'//' + window.location.host + '/post/hastag?ht=' + this.state.hashtag} className="fs-6 ms-2 fw-bold  text-dark text-decoration-none">
                {p.owner.userName}
            </a>
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 ms-2  text-dark text-decoration-none">
                {p.owner.userName}
            </a>
        </div> :
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                {p.owner.userName}
            </a>;
        var owner = <div className="row align-items-center g-1">
            <div className="col">
                <MemberPicSmall member={p.owner} />
                {ownerlink}
            </div>
            <div className="col-md-1 col-2 text-end">
                <button className="btn btn-link text-dark"><i className="bi bi-three-dots"></i></button>
            </div>
        </div>;
        var postshtml = null;
        if (p.videoURL !== "") {

        } else if (p.photos) {
            if (p.photos.length == 1) {
                postshtml = <div className="text-center">
                    <img src={p.photos[0].photo} className="img-fluid" onDoubleClick={() => { this.addReaction(); }} />
                </div>
            } else {
                var imgs = [];
                for (var i in p.photos) {
                    imgs.push(<li key={"img" + p.photos[i].id} className="list-group-item p-0 me-1 border-0"><img src={p.photos[i].photo} style={{ maxHeight: "450px", maxWidth: "450px" }} /></li>);
                }
                postshtml = <div className="table-responsive">
                    <ul className="list-group list-group-horizontal" onDoubleClick={() => { this.addReaction(); }}>
                        {imgs}
                    </ul></div>;
            }
        }
        var commentbox = !this.state.showCommentBox ? null : <MemberComment post={p} cancel={() => { this.setState({ showCommentBox: false }); }} />;
        var reactionCountHtml = (p.reactionCount > 0) ? <button className="btn btn-link text-dark text-decoration-none fw-bold ps-0" type="button" onClick={() => { this.setState({ showreactionlist: true }) }}>{p.reactionCount} Likes</button> : null;
        var reactionhtml = <button type="button" className="btn btn-link fs-4 fw-bold text-dark pe-2 ps-0" onClick={() => { this.addReaction(); }}><i className="bi bi-heart"></i></button>;
        if (p.hasReacted) {
            reactionhtml = <button type="button" className="btn btn-link fs-4 fw-bold text-danger pe-2 ps-0" onClick={() => { this.addReaction(); }}><i className="bi bi-heart-fill"></i></button>;
        }
        var commentBtn = null, commentCountHtml = null;
        if (p.acceptComment) {
            commentCountHtml = <button className="btn btn-link text-dark text-decoration-none fw-bold ps-0" type="button" onClick={() => { this.setState({ showCommentBox: true }) }}>{p.commentCount > 0 ? p.commentCount + " Comments" : "None"}</button>;
            commentBtn = <button type="button" className="btn btn-link fs-4 fw-bold text-dark pe-1" onClick={() => { this.setState({ showCommentBox: true }) }}><i className="bi bi-chat-square-text"></i></button>;
        }
        var likemodal = null;
        if (this.state.showreactionlist) {
            likemodal = <div className="modal fade show d-block" id={"reactionListModal-" + this.state.post.id} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen-lg-down">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Likes</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showreactionlist: false }); }}></button>
                        </div>
                        <div className="modal-body p-1">
                            <MemberSmallList target="reaction" postid={this.state.post.id} />
                        </div>
                    </div>
                </div>
            </div>
        }
        return <div id={this.state.post.id} className="border my-2">
            {owner}
            <div className="row">
                <div className="col-md-6">
                    {postshtml}
                    <div className="text-center my-1"></div>
                </div>
                <div className="col-md-6">
                    <div className="mt-1">
                        <button type="button" className="btn btn-link text-decoration-none fw-bold text-dark pe-2 ps-0"><DateLabel value={p.postDate} /></button>
                        {reactionhtml}{reactionCountHtml} {commentBtn}{commentCountHtml}
                    </div>
                    <div>
                        <ExpandableTextLabel text={p.describe === null ? "" : p.describe} maxlength={200} />
                    </div>
                </div>
            </div>
            {likemodal}
            {commentbox}
        </div>;
    }
}

class MemberComment extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post, comments: { current: 0, pageSize: 20, total: 0, commentList: [] },
            commenttext: '', commentiddel: 0
        };

        this.fetchComments = this.fetchComments.bind(this);
        this.removeComment = this.removeComment.bind(this);
    }

    componentDidMount() {
        this.fetchComments();
    }

    addComment() {
        this.setState({ loading: true });
        const fd = new FormData();
        fd.set("comment", this.state.commenttext);
        fd.set("postId", this.state.post.id);
        fetch('//' + window.location.host + '/api/post/addcomment', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    var temp = this.state.comments.commentList;
                    temp.unshift(data);
                    let comments = {
                        current: data.current,
                        pageSize: data.pageSize,
                        total: data.total,
                        totalPages: data.totalPages,
                        commentList: temp
                    };
                    this.setState({
                        loading: false, comments
                    });
                });
                this.setState({ loading: false, commenttext: "" });
            } else {
                this.setState({ loading: false, message: 'Unable to save comment', bsstyle: 'danger' });
            }
        });
    }

    removeComment() {
        let url = '//' + window.location.host + '/api/post/removecomment/' + this.state.commentiddel;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    var temp = this.state.comments.commentList.filter(t => t.id !== this.state.commentiddel);
                    let comments = {
                        current: this.state.comments.current,
                        pageSize: this.state.comments.pageSize,
                        total: this.state.comments.total,
                        totalPages: this.state.comments.totalPages,
                        commentList: temp
                    };
                    this.setState({
                        loading: false, commentiddel: 0, comments
                    });
                }
            });
    }

    fetchComments() {
        let url = '//' + window.location.host + '/api/post/comments/' + this.state.post.id + '?ps=' + this.state.comments.pageSize + '&p=' + this.state.comments.current;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        var temp = this.state.comments.commentList;
                        for (var k in data.commentList) {
                            if (temp.filter(t => t.id == data.commentList[k].id).length === 0)
                                temp.push(data.commentList[k]);
                        }
                        let comments = {
                            current: data.current,
                            pageSize: data.pageSize,
                            total: data.total,
                            totalPages: data.totalPages,
                            commentList: temp
                        };
                        this.setState({
                            loggedin: true, loading: false, comments
                        });
                    });
                }
            });
    }

    render() {
        var items = [];
        if (this.state.comments.commentList.length === 0) {
            items.push(<p key={0} className="px-2">No Comments Found.</p>)
        }
        for (var k in this.state.comments.commentList) {
            var p = this.state.comments.commentList[k];
            var ownedCommentMenu = null;
            if (this.state.myself.id === p.postedBy.id) {
                ownedCommentMenu = <React.Fragment>
                    <button data-id={p.id} onClick={(e) => { this.setState({ commentiddel: parseInt(e.target.getAttribute("data-id"), 10) }) }} className="btn btn-link text-secondary text-decoration-none px-0 fs-12" type="button">Remove</button>
                </React.Fragment>;
            }
            items.push(<table key={p.id} cellPadding="0" cellSpacing="0" width="100%" border="0">
                <tbody>
                    <tr>
                        <td width="50px" valign="middle">
                            <MemberPicSmall member={p.postedBy} />
                        </td>
                        <td valign="middle" className="px-2">
                            <a href={'//' + window.location.host + '/profile?un=' + p.postedBy.userName} className="fs-6 fw-bold pointer d-inline-block text-dark text-decoration-none">
                                {p.postedBy.userName}
                            </a>
                            <ExpandableTextLabel text={p.comment} maxlength={200} />
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td className="px-2">
                            <span className="fs-12 text-secondary"><DateLabel value={p.postDate} /></span> {ownedCommentMenu}
                        </td>
                    </tr>
                </tbody>
            </table>);
        }
        let confirmdelete = null;
        if (this.state.commentiddel > 0) {
            confirmdelete = <ConfirmBox title="Remove Comment" message="Are you sure you want to remove this comment?"
                ok={() => { this.removeComment(); }} cancel={() => { this.setState({ commentiddel: 0 }); }} />;
        }

        return <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-fullscreen-md-down">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Comments</h5>
                        <button type="button" className="btn-close" onClick={() => { this.props.cancel(); }}></button>
                    </div>
                    <div className="modal-body p-1" style={{ minHeight: "300px" }}>
                        {items}
                        {confirmdelete}
                    </div>
                    <div className="modal-footer">
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td valign="middle" align="right">
                                        <textarea rows="1" className="form-control" value={this.state.commenttext} onChange={(e) => { this.setState({ commenttext: e.target.value }); }}></textarea>
                                    </td>
                                    <td valign="middle" width="58px">
                                        <button type="button" className="btn btn-link" onClick={() => { this.addComment(); }}>Post</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }
}
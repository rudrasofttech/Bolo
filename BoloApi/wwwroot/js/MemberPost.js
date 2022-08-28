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
                                        <button type="button" className="btn btn-link text-decoration-none" onClick={() => { this.addComment(); }}>Post</button>
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

class MemberPostList extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: null, q: this.props.search, p: 0, posts: [],
            viewMode: parseInt(this.props.viewMode, 10),
            viewModeAllowed: this.props.viewModeAllowed === "true" ? true : false,
            post: null
        };

        this.selectPost = this.selectPost.bind(this);
        this.addReaction = this.addReaction.bind(this);
    }

    selectPost(id) {
        this.setState({ viewMode: 2 }, () => { document.getElementById(id).scrollIntoView({ behavior: "auto", block: "center", inline: "center" }); })
    }

    addReaction(id) {
        fetch('//' + window.location.host + '/api/Post/addreaction/' + id, {
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
                        var temp = this.state.posts;
                        for (var k in temp) {
                            var p = temp[k];
                            if (p.id == id) {
                                p.hasReacted = data.hasReacted;
                                p.reactionCount = data.reactionCount;
                            }
                        }
                        this.setState({ loading: false, message: '', bsstyle: '', posts: temp });
                    });
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
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

    componentDidMount() {
        this.loadFeed();
    }

    loadFeed() {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/post?q=' + this.state.q + '&p=' + this.state.p;

        if (this.state.q === "userfeed")
            url = '//' + window.location.host + '/api/post/feed?p=' + this.state.p;

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
                        var temp = this.state.posts;
                        for (var k in data.posts) {
                            temp.push(data.posts[k]);
                        }
                        this.setState({
                            loggedin: true, loading: false,
                            model: {
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            },
                            posts: temp
                        });
                    });
                }
            });
    }

    renderPosts() {

        var empty = <div key={0}>
            <p className="text-center fs-3 mt-5"><i className="bi bi-emoji-dizzy me-2"></i>Nothing to see here</p>
        </div>;
        if (this.state.viewMode === 2) {
            var items = []
            if (this.state.model !== null) {
                for (var k in this.state.posts) {
                    items.push(<MemberPost key={this.state.posts[k].id} post={this.state.posts[k]} />);
                }
            }
            if (items.length == 0) {
                items.push(empty);
            }
            return items;
        } else if (this.state.viewMode === 1) {
            var items = [];
            for (var k in this.state.posts) {
                var p = this.state.posts[k];
                if (p.videoURL !== "") { } else {
                    items.push(<div className="col" key={p.id}><div className="card border-0 rounded-0 pointer">
                        <img src={p.photos[0].photo} data-postid={p.id} onClick={(e) => { this.selectPost(e.target.getAttribute("data-postid")) }} className="card-img border-0 rounded-0" style={{ padding: "1px" }} />
                    </div></div>);
                }
            }
            if (items.length == 0) {
                items.push(empty);
                return items;
            }
            return <div className="row row-cols-3 row-cols-md-4 g-0">{items}</div>;
        }
    }

    render() {

        var html = (this.state.loading === false) ? this.renderPosts() : null;
        var loadmore = null;
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>;
        }
        if (this.state.model !== null) {
            if ((this.state.model.current + 1) < this.state.model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { this.setState({ p: this.state.model.current + 1 }, () => { this.loadFeed(); }) }}>Load More</button>
                </div>;
            }
        }
        var viewmodetabhtml = null;
        if (this.state.viewModeAllowed && this.state.posts.length > 0) {
            viewmodetabhtml = <div>
                <nav className="nav nav-pills nav-fill">
                    <a onClick={() => { this.setState({ viewMode: 1 }); }} className={this.state.viewMode === 1 ? "nav-link fs-4 active bg-white text-success rounded-0" : "nav-link fs-4 bg-white text-dark rounded-0"}><i className="bi bi-grid-3x3-gap-fill"></i></a>
                    <a onClick={() => { this.setState({ viewMode: 2 }); }} className={this.state.viewMode === 2 ? "nav-link fs-4 active bg-white text-success rounded-0" : "nav-link fs-4 bg-white text-dark rounded-0"}><i className="bi bi-view-list"></i></a>
                </nav>
            </div>;
        }
        return <React.Fragment>
            {viewmodetabhtml}
            {html}
            {loadmore}
            {loading}
        </React.Fragment>;
    }
}

class MemberSmallList extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: null, q: '', p: 0, reactions: [], followList: []
        };
        if (this.props.target === 'reaction') {
            this.url = '//' + window.location.host + '/api/post/reactionlist/' + this.props.postid;
        } else if (this.props.target === 'follower') {
            this.url = '//' + window.location.host + '/api/Follow/Follower/' + this.props.memberid;
        }
        else if (this.props.target === 'following') {
            this.url = '//' + window.location.host + '/api/Follow/Following/' + this.props.memberid;
        }

        this.followerRemoved = this.followerRemoved.bind(this);
    }

    componentDidMount() {
        this.loadFeed();
    }

    followerRemoved(id) {
        var items = [];
        for (var k in this.state.followList) {
            var p = this.state.followList[k];
            if (p.follower.id != id) {
                items.push(p);
            }
        }
        this.setState({ followList: items });
    }

    loadFeed() {
        this.setState({ loading: true });
        fetch(this.url + "?q=" + this.state.q + "&p=" + this.state.p, {
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
                        if (this.props.target === 'reaction') {
                            console.log(data);
                            var temp = this.state.reactions;
                            for (var k in data.reactions) {
                                temp.push(data.reactions[k]);
                            }
                            this.setState({
                                loggedin: true, loading: false,
                                model: {
                                    current: data.current,
                                    pageSize: data.pageSize,
                                    total: data.total,
                                    totalPages: data.totalPages
                                },
                                reactions: temp
                            });
                        } else if (this.props.target === 'follower' || this.props.target === 'following') {
                            var temp = this.state.followList;
                            for (var k in data.followList) {
                                temp.push(data.followList[k]);
                            }
                            this.setState({
                                loggedin: true, loading: false,
                                model: {
                                    current: data.current,
                                    pageSize: data.pageSize,
                                    total: data.total,
                                    totalPages: data.totalPages
                                },
                                followList: temp
                            });
                        }
                    });
                }
            });
    }

    renderPosts() {
        if (this.props.target === 'reaction') {
            var items = [];
            for (var k in this.state.reactions) {
                var p = this.state.reactions[k];
                items.push(<MemberSmallRow key={p.member.id} member={p.member} status={p.status} />);
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
        else if (this.props.target === 'follower') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                items.push(<MemberSmallRow key={p.follower.id} member={p.follower} status={p.status}
                    showRemove={this.state.myself.id === this.props.memberid ? true : false}
                    removed={(id) => { this.followerRemoved(id); }}
                />);
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
        else if (this.props.target === 'following') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                if (p.tag !== null && p.tag !== "") {
                } else {
                    items.push(<MemberSmallRow key={p.following.id} member={p.following} status={p.status} />);
                }
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
    }

    render() {
        var loadmore = null;
        if (this.state.model !== null) {
            if ((this.state.model.current + 1) < this.state.model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { this.setState({ p: this.state.model.current + 1 }, () => { this.loadFeed(); }) }}>Load More</button>
                </div>;
            }
        }

        return <div style={{ minHeight: "50vh" }}>
            {this.renderPosts()}
            {loadmore}
        </div>;
    }
}

class MemberSmallRow extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member, status: this.props.status, showRemove: this.props.showRemove, showRemoveConfirm: false
        };

        this.removeFollow = this.removeFollow.bind(this);
    }

    removeFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/remove/' + this.state.member.id, {
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
                    this.setState({ status: 0, showRemove: false, loading: false });
                    if (this.props.removed) {
                        this.props.removed(this.state.member.id);
                    }
                }
            });
    }

    render() {
        var followbtn = <FollowButton member={this.state.member} status={this.state.status} />;
        if (this.state.showRemove) {
            followbtn = <button type="button" className="btn btn-light text-dark" onClick={() => { this.setState({ showRemoveConfirm: true }) }}>Remove</button>;
        }
        var removeConfirmBox = null;
        if (this.state.showRemoveConfirm) {
            removeConfirmBox = <ConfirmBox cancel={() => { this.setState({ showRemoveConfirm: false }) }}
                ok={() => { this.setState({ showRemoveConfirm: false }); this.removeFollow(); }}
                message="Are you sure you want to remove this member from your followers?" />;
        }
        return <div className="row mx-0  justify-content-center align-items-center">
            <div className="col px-0">
                <MemberPicSmall member={this.state.member} />
                <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                    {this.state.member.userName}
                </a>
            </div>
            <div className="col-3 col-md-3 px-0 text-end pe-2">
                {followbtn}
                {removeConfirmBox}
            </div>
        </div>
    }
}

class MemberPicSmall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            member: this.props.member
        };
    }

    render() {
        var memberpic = this.state.member.pic !== "" ? <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="border-0">
            <img src={this.state.member.pic} className="d-inline-block p-1 img-fluid pointer rounded-3 owner-thumb-small" alt="" /></a>
            : <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="border-0">
                <img src="/images/nopic.jpg" className="img-fluid p-1 owner-thumb-small d-inline-block rounded-3" alt="" /></a>;


        return <React.Fragment>{memberpic}</React.Fragment>;
    }
}

class FollowButton extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member, status: null, notify: this.props.notify
        };

        this.askToFollow = this.askToFollow.bind(this);
        this.unFollow = this.unFollow.bind(this);
        this.loadStatus = this.loadStatus.bind(this);
    }

    componentDidMount() {
        this.loadStatus();
    }

    loadStatus() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/Status/' + this.state.member.id, {
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
                        this.setState({ status: data.status, loading: false })
                    });
                }
            }).catch(error => {
                this.setState({ bsstyle: 'text-danger', message: 'Unable to contact server', loading: false })
            });
    }

    askToFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/ask/' + this.state.member.id, {
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
                        this.setState({ status: data.status, loading: false })
                        if (this.props.notify) {
                            this.props.notify(this.state.member.id, this.state.status);
                        }
                    });
                }
            }).catch(error => {
                this.setState({ bsstyle: 'text-danger', message: 'Unable to contact server', loading: false })
            });
    }

    unFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/unfollow/' + this.state.member.id, {
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
                        //console.log(data);
                        this.setState({ status: data.status, loading: false })
                        if (this.props.notify) {
                            this.props.notify(this.state.member.id, this.state.status);
                        }
                    });
                } else {
                    this.setState({ bsstyle: 'text-danger', message: 'Unable to process request', loading: false });
                }
            }).catch(error => {
                this.setState({ bsstyle: 'text-danger', message: 'Unable to contact server', loading: false });
            });
    }

    render() {
        var followbtn = null;
        if (this.state.loading === false) {
            if (this.state.status === 0) {
                if (this.state.member.id !== this.state.myself.id) {
                    followbtn = <button type="button" className="btn btn-primary fw-bold" onClick={this.askToFollow}>Follow</button>;
                }
            } else if (this.state.status === 1) {
                followbtn = <button type="button" className="btn btn-light fw-bold" onClick={this.unFollow}>Unfollow</button>;
            }
            else if (this.state.status === 2) {
                followbtn = <button type="button" className="btn btn-light fw-bold" onClick={this.unFollow}>Requested</button>;
            }
        } else if (this.state.loading === true) {
            followbtn = <button type="button" className="btn btn-light fw-bold" disabled >Working...</button>;
        }

        return <React.Fragment>{followbtn}</React.Fragment>;
    }
}

class ConfirmBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true
        };
    }

    render() {
        if (this.state.open) {
            return <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.title}</h5>
                            <button type="button" className="btn-close" onClick={() => { this.setState({ open: false }, () => { this.props.cancel(); }); }}></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-center">{this.props.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" style={{ minWidth: "60px" }} onClick={() => { this.props.ok(); }}>Yes</button><button type="button" className="btn btn-secondary" style={{ minWidth: "60px" }} onClick={() => { this.setState({ open: false }, () => { this.props.cancel(); }); }}>No</button>
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            return null;
        }
    }
}

class ExpandableTextLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text, expand: false, showexpand: false,
            maxlength: parseInt(this.props.maxlength, 10),
            cssclass: this.props.cssclass !== undefined ? this.props.cssclass : ""
        };
    }
    componentDidMount() {
        if (this.state.text.length > this.state.maxlength || (this.state.text.match(/\n/g) || []).length > 3) {
            this.setState({ showexpand: true });
        }

    }

    render() {
        var length = (this.state.text.length < this.state.maxlength) ? this.state.text.length : this.state.maxlength;
        var text = null, expandbtn = null;
        if (this.state.expand) {
            text = <React.Fragment>
                {this.state.text.split('\n').map((item, key) => {
                    return <React.Fragment key={key}>{item}<br /></React.Fragment>
                })}
            </React.Fragment>;
        } else {
            text = <div style={{ maxHeight: "28px", overflowY: "hidden", display: "inline-flex" }}>
                {this.state.text.substring(0, length).split('\n').map((item, key) => {
                    return <React.Fragment key={key}>{item}<br /></React.Fragment>
                })}</div>;
        }

        if (this.state.showexpand) {
            expandbtn = <button type="button" onClick={() => { this.setState({ expand: !this.state.expand }) }} className="btn btn-link d-block p-0 text-secondary text-decoration-none" >{(!this.state.expand) ? "More" : "Less"}</button>
        }

        return <div className={this.state.cssclass}>{text}{expandbtn}</div>;
    }
}

class DateLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    transformData() {
        var d = new Date(this.state.value);
        return d.getDate() + "." + d.getMonth() + "." + d.getFullYear();
    }

    render() {
        return <React.Fragment>{this.transformData()}</React.Fragment>;
    }
}

class MessageStrip extends React.Component {
    constructor(props) {
        super(props);

        this.state = { bsstyle: this.props.bsstyle !== undefined ? this.props.bsstyle : "", message: this.props.message !== undefined ? this.props.message : "" };

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.message !== prevState.message) {
            return { message: nextProps.message, bsstyle: nextProps.bsstyle };
        }
        else return null;
    }

    render() {
        if (this.state.message !== '') {
            return <div className={'noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                {this.state.message}
            </div>;
        } else {
            return null;
        }
    }
}

class Emoji extends React.Component {
    constructor(props) {
        super(props);

        this.onEmojiClick = this.onEmojiClick.bind(this);
    }

    onEmojiClick(value) {
        this.props.onSelect(value);
    }

    render() {
        return <div className="emojicont p-2 border-top border-bottom border-right border-left bg-light" style={{ maxWidth: "100%" }}>
            <ul className="list-inline mb-1">
                <li className="list-inline-item"><span title="GRINNING FACE" onClick={() => this.onEmojiClick('😀')}>😀</span></li>
                <li className="list-inline-item"><span title="GRINNING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😁')}>😁</span></li>
                <li className="list-inline-item"><span title="FACE WITH TEARS OF JOY" onClick={() => this.onEmojiClick('😂')}>😂</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😃')}>😃</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND SMILING EYES" onClick={() => this.onEmojiClick('😄')}>😄</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => this.onEmojiClick('😅')}>😅</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES" onClick={() => this.onEmojiClick('😆')}>😆</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HALO" onClick={() => this.onEmojiClick('😇')}>😇</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HORNS" onClick={() => this.onEmojiClick('😈')}>😈</span></li>
                <li className="list-inline-item"><span title="WINKING FACE" onClick={() => this.onEmojiClick('😉')}>😉</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😊')}>😊</span></li>
                <li className="list-inline-item"><span title="FACE SAVOURING DELICIOUS FOOD" onClick={() => this.onEmojiClick('😋')}>😋</span></li>
                <li className="list-inline-item"><span title="RELIEVED FACE" onClick={() => this.onEmojiClick('😌')}>😌</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HEART-SHAPED EYES" onClick={() => this.onEmojiClick('😍')}>😍</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH SUNGLASSES" onClick={() => this.onEmojiClick('😎')}>😎</span></li>
                <li className="list-inline-item"><span title="SMIRKING FACE" onClick={() => this.onEmojiClick('😏')}>😏</span></li>
                <li className="list-inline-item"><span title="NEUTRAL FACE" onClick={() => this.onEmojiClick('😐')}>😐</span></li>
                <li className="list-inline-item"><span title="EXPRESSIONLESS FACE" onClick={() => this.onEmojiClick('😑')}>😑</span></li>
                <li className="list-inline-item"><span title="UNAMUSED FACE" onClick={() => this.onEmojiClick('😒')}>😒</span></li>
                <li className="list-inline-item"><span title="FACE WITH COLD SWEAT" onClick={() => this.onEmojiClick('😓')}>😓</span></li>
                <li className="list-inline-item"><span title="PENSIVE FACE" onClick={() => this.onEmojiClick('😔')}>😔</span></li>
                <li className="list-inline-item"><span title="CONFUSED FACE" onClick={() => this.onEmojiClick('😕')}>😕</span></li>
                <li className="list-inline-item"><span title="CONFOUNDED FACE" onClick={() => this.onEmojiClick('😖')}>😖</span></li>
                <li className="list-inline-item"><span title="KISSING FACE" onClick={() => this.onEmojiClick('😗')}>😗</span></li>
                <li className="list-inline-item"><span title="FACE THROWING A KISS" onClick={() => this.onEmojiClick('😘')}>😘</span></li>
                <li className="list-inline-item"><span title="KISSING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😙')}>😙</span></li>
                <li className="list-inline-item"><span title="KISSING FACE WITH CLOSED EYES" onClick={() => this.onEmojiClick('😚')}>😚</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE" onClick={() => this.onEmojiClick('😛')}>😛</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE AND WINKING EYE" onClick={() => this.onEmojiClick('😜')}>😜</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES" onClick={() => this.onEmojiClick('😝')}>😝</span></li>
                <li className="list-inline-item"><span title="DISAPPOINTED FACE" onClick={() => this.onEmojiClick('😞')}>😞</span></li>
                <li className="list-inline-item"><span title="WORRIED FACE" onClick={() => this.onEmojiClick('😟')}>😟</span></li>
                <li className="list-inline-item"><span title="ANGRY FACE" onClick={() => this.onEmojiClick('😠')}>😠</span></li>
                <li className="list-inline-item"><span title="POUTING FACE" onClick={() => this.onEmojiClick('😡')}>😡</span></li>
                <li className="list-inline-item"><span title="CRYING FACE" onClick={() => this.onEmojiClick('😢')}>😢</span></li>
                <li className="list-inline-item"><span title="PERSEVERING FACE" onClick={() => this.onEmojiClick('😣')}>😣</span></li>
                <li className="list-inline-item"><span title="FACE WITH LOOK OF TRIUMPH" onClick={() => this.onEmojiClick('😤')}>😤</span></li>
                <li className="list-inline-item"><span title="DISAPPOINTED BUT RELIEVED FACE" onClick={() => this.onEmojiClick('😥')}>😥</span></li>
                <li className="list-inline-item"><span title="FROWNING FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😦')}>😦</span></li>
                <li className="list-inline-item"><span title="ANGUISHED FACE" onClick={() => this.onEmojiClick('😧')}>😧</span></li>
                <li className="list-inline-item"><span title="FEARFUL FACE" onClick={() => this.onEmojiClick('😨')}>😨</span></li>
                <li className="list-inline-item"><span title="WEARY FACE" onClick={() => this.onEmojiClick('😩')}>😩</span></li>
                <li className="list-inline-item"><span title="SLEEPY FACE" onClick={() => this.onEmojiClick('😪')}>😪</span></li>
                <li className="list-inline-item"><span title="TIRED FACE" onClick={() => this.onEmojiClick('😫')}>😫</span></li>
                <li className="list-inline-item"><span title="GRIMACING FACE" onClick={() => this.onEmojiClick('😬')}>😬</span></li>
                <li className="list-inline-item"><span title="LOUDLY CRYING FACE" onClick={() => this.onEmojiClick('😭')}>😭</span></li>
                <li className="list-inline-item"><span title="FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😮')}>😮</span></li>
                <li className="list-inline-item"><span title="HUSHED FACE" onClick={() => this.onEmojiClick('😯')}>😯</span></li>
                <li className="list-inline-item"><span title="FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => this.onEmojiClick('😰')}>😰</span></li>
                <li className="list-inline-item"><span title="FACE SCREAMING IN FEAR" onClick={() => this.onEmojiClick('😱')}>😱</span></li>
                <li className="list-inline-item"><span title="ASTONISHED FACE" onClick={() => this.onEmojiClick('😲')}>😲</span></li>
                <li className="list-inline-item"><span title="FLUSHED FACE" onClick={() => this.onEmojiClick('😳')}>😳</span></li>
                <li className="list-inline-item"><span title="SLEEPING FACE" onClick={() => this.onEmojiClick('😴')}>😴</span></li>
                <li className="list-inline-item"><span title="DIZZY FACE" onClick={() => this.onEmojiClick('😵')}>😵</span></li>
                <li className="list-inline-item"><span title="FACE WITHOUT MOUTH" onClick={() => this.onEmojiClick('😶')}>😶</span></li>
                <li className="list-inline-item"><span title="FACE WITH MEDICAL MASK" onClick={() => this.onEmojiClick('😷')}>😷</span></li>
                <li className="list-inline-item"><span title="FROWN FACE" onClick={() => this.onEmojiClick('🙁')}>🙁</span></li>
                <li className="list-inline-item"><span title="SMILING FACE" onClick={() => this.onEmojiClick('🙂')}>🙂</span></li>
                <li className="list-inline-item"><span title="UPSIDEDOWN FACE" onClick={() => this.onEmojiClick('🙃')}>🙃</span></li>
                <li className="list-inline-item"><span title="EYES ROLLING FACE" onClick={() => this.onEmojiClick('🙄')}>🙄</span></li>
                <li className="list-inline-item"><span title="ZIPPED FACE" onClick={() => this.onEmojiClick('🤐')}>🤐</span></li>
                <li className="list-inline-item"><span title="MONEY FACE" onClick={() => this.onEmojiClick('🤑')}>🤑</span></li>
                <li className="list-inline-item"><span title="FEVERISH FACE" onClick={() => this.onEmojiClick('🤒')}>🤒</span></li>
                <li className="list-inline-item"><span title="SPECTACLED FACE" onClick={() => this.onEmojiClick('🤓')}>🤓</span></li>
                <li className="list-inline-item"><span title="WONDERING FACE" onClick={() => this.onEmojiClick('🤔')}>🤔</span></li>
                <li className="list-inline-item"><span title="HURT FACE" onClick={() => this.onEmojiClick('🤕')}>🤕</span></li>
                <li className="list-inline-item"><span title="COWBOY FACE" onClick={() => this.onEmojiClick('🤠')}>🤠</span></li>
                <li className="list-inline-item"><span title="CLOWN FACE" onClick={() => this.onEmojiClick('🤡')}>🤡</span></li>
                <li className="list-inline-item"><span title="SICK VOMIT FACE" onClick={() => this.onEmojiClick('🤢')}>🤢</span></li>
                <li className="list-inline-item"><span title="LAUGHING ROLLING FACE" onClick={() => this.onEmojiClick('🤣')}>🤣</span></li>
                <li className="list-inline-item"><span title="LEERING FACE" onClick={() => this.onEmojiClick('🤤')}>🤤</span></li>
                <li className="list-inline-item"><span title="LEING FACE" onClick={() => this.onEmojiClick('🤥')}>🤥</span></li>
                <li className="list-inline-item"><span title="BLOWING NOSE FACE" onClick={() => this.onEmojiClick('🤧')}>🤧</span></li>
                <li className="list-inline-item"><span title="ROCK FACE" onClick={() => this.onEmojiClick('🤨')}>🤨</span></li>
                <li className="list-inline-item"><span title="STARY EYES FACE" onClick={() => this.onEmojiClick('🤩')}>🤩</span></li>
                <li className="list-inline-item"><span title="MAD FACE" onClick={() => this.onEmojiClick('🤪')}>🤪</span></li>
                <li className="list-inline-item"><span title="SHUSHING FACE" onClick={() => this.onEmojiClick('🤫')}>🤫</span></li>
                <li className="list-inline-item"><span title="CURSING FACE" onClick={() => this.onEmojiClick('🤬')}>🤬</span></li>
                <li className="list-inline-item"><span title="CHUGLI FACE" onClick={() => this.onEmojiClick('🤭')}>🤭</span></li>
                <li className="list-inline-item"><span title="VOMIT FACE" onClick={() => this.onEmojiClick('🤮')}>🤮</span></li>
                <li className="list-inline-item"><span title="MIND BLOWN FACE" onClick={() => this.onEmojiClick('🤯')}>🤯</span></li>
                <li className="list-inline-item"><span title="VICTORIAN FACE" onClick={() => this.onEmojiClick('🧐')}>🧐</span></li>
            </ul>
        </div>;
    }
}

class HeartBeat extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            activity: this.props.activity === undefined ? 1 : this.props.activity,
            interval: this.props.interval === undefined ? 3000 : this.props.interval
        };

        this.pulseinterval = null;
        this.sendHeartbeat = this.sendHeartbeat.bind(this);
    }

    componentDidMount() {
        this.sendHeartbeat();
        if (this.pulseinterval === null) {
            this.pulseinterval = setInterval(this.sendHeartbeat, this.state.interval);
        }
    }

    componentWillUnmount() {
        if (this.pulseinterval !== null) {
            clearInterval(this.pulseinterval);
        }
    }

    sendHeartbeat() {
        if (this.state.loggedin) {
            fetch('//' + window.location.host + '/api/Members/savepulse?s=' + this.state.activity, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                });
        }
    }

    render() {
        return null;
    }
}

class BlockContact extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: this.props.myself, person: this.props.person,
            bsstyle: '', message: '',
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            blocked: null
        };

        this.fetchContactDetail = this.fetchContactDetail.bind(this);
        this.handleUnblockClick = this.handleUnblockClick.bind(this);
        this.handleBlockClick = this.handleBlockClick.bind(this);
        this.setContactRelation = this.setContactRelation.bind(this);
    }

    componentDidMount() {

        this.fetchContactDetail();
    }

    handleUnblockClick() {
        this.setContactRelation(BoloRelationType.Confirmed);
    }

    handleBlockClick() {
        this.setContactRelation(BoloRelationType.Blocked);
    }

    setContactRelation(relationship) {
        fetch('//' + window.location.host + '/api/Contacts/ChangeRelation/' + this.state.person.id + '?t=' + relationship, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.boloRelation === BoloRelationType.Blocked) {
                        this.setState({ blocked: true });
                    } else {
                        this.setState({ blocked: false });
                    }
                    var contactlist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    if (contactlist.get(this.state.person.id) !== undefined) {
                        contactlist.get(this.state.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    }
                });
            }
        });
    }

    fetchContactDetail() {
        try {
            fetch('//' + window.location.host + '/api/Contacts/' + this.state.person.id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        if (data.boloRelation === BoloRelationType.Blocked) {
                            this.setState({ blocked: true });
                        } else if (data.boloRelation === BoloRelationType.Confirmed) {
                            this.setState({ blocked: false });
                        } else {
                            this.setState({ blocked: null });
                        }
                        if (this.props.onRelationshipChange !== undefined) {
                            this.props.onRelationshipChange(data.boloRelation);
                        }
                    });
                }
            });
        } catch (err) {
            if (this.contactlist.get(this.state.person.id) !== undefined) {
                this.setState({ blocked: this.contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Blocked });
            }
        }
    }

    render() {
        if (this.state.blocked === true) {
            return <button className="btn mr-1 ml-1 btn-danger" onClick={this.handleUnblockClick}>Unblock</button>;
        } else if (this.state.blocked === false) {
            return <button className="btn mr-1 ml-1 btn-secondary" onClick={this.handleBlockClick}>Block</button>;
        } else {
            return null;
        }
    }
}

function transformMessage(text, id) {
    try {
        const reglink = /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi;
        let match;

        //while ((match = reglink.exec(text)) !== null) {
        //    console.log(`Found ${match[0]} start=${match.index} end=${reglink.lastIndex}.`);
        //    // expected output: "Found football start=6 end=14."
        //    // expected output: "Found foosball start=16 end=24."
        //}
        var links = [];
        //find all urls in the text
        //const matches = text.matchAll(reglink);
        //for (const match of matches) {
        while ((match = reglink.exec(text)) !== null) {
            isthere = false;
            for (link of links) {
                if (link === match[0].trim()) {
                    isthere = true;
                    break;
                }
            }
            //store only unique urls in links to replace
            if (!isthere) {
                links.push(match[0].trim());
            }
        }
        //finally replace url with appropriate tags
        for (l of links) {
            var imgreg = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/g;
            if (imgreg.test(l)) {
                let img = "<a href='" + l + "' target='_blank'><img src='" + l + "' class='img-fluid d-block mt-1 mb-1 img-thumbnail' style='width:300px; '/></a>";
                text = text.replaceAllOccurence(l, img, true);
            } else {
                let anchor = "<a href='" + l + "' target='_blank'>" + l + "</a>";
                text = text.replaceAllOccurence(l, anchor, true);
            }
        }
    } catch (err) {
        console.log(err);
    }
    return text;
}
//helper function to replace all occurance of string in string
String.prototype.replaceAllOccurence = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};

﻿class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: localStorage.getItem("token"),
            user: localStorage.getItem("myself"),
            mainview: localStorage.getItem("token") === null ? "login" : "home",
            loginform: { email: "", password: "" },
            registerform: { name: "", email: "" },
            postid: 0
        }
        this.fetchData = this.fetchData.bind(this);
        //this.handleLogin = this.handleLogin.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
    }

    setToken = (data) => {
        this.setState({ token: data });
    }

    setData = (data) => {
        this.setState({ data: data });
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.fetchData();
        }
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.fetchData();
        }
    }

    fetchData() {
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.clear();
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false, loading: false, user: null, token: '' });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ bsstyle: '', message: "", loggedin: true, loading: false, user: data });
                    });
                }
            });
    }

    //handleLogin(e) {
    //    e.preventDefault();
    //    this.setState({ loading: true });
    //    fetch('//' + window.location.host + '/api/Members/Login', {
    //        method: 'post',
    //        body: JSON.stringify({ ID: this.state.loginform.email, Passcode: this.state.loginform.password }),
    //        headers: {
    //            'Content-Type': 'application/json'
    //        }
    //    })
    //        .then(response => {
    //            if (response.status === 200) {
    //                response.json().then(data => {
    //                    //console.log(data);
    //                    if (data.token !== undefined) {
    //                        localStorage.setItem("token", data.token);
    //                        localStorage.setItem("user", data.member);
    //                        this.setState({ bsstyle: '', message: '', loggedin: true, mainview : "conversation", token: data.token, user: data.member });
    //                    }
    //                });
    //            }
    //            else if (response.status === 404) {
    //                response.json().then(data => {
    //                    this.setState({ bsstyle: 'danger', message: data.error, loading: false });
    //                });
    //            }
    //        });
    //}

    //handleRegisterSubmit(e) {
    //    e.preventDefault();
    //    this.setState({ loading: true });
    //    fetch('//' + window.location.host + '/api/Members', {
    //        method: 'post',
    //        body: JSON.stringify({ Name: this.state.registername, Email: this.state.registeremail, Phone: '', CountryCode: '' }),
    //        headers: {
    //            'Content-Type': 'application/json'
    //        }
    //    })
    //        .then(response => {
    //            console.log(response.status);
    //            if (response.status === 200) {
    //                this.setState({
    //                    loading: false,
    //                    bsstyle: 'success',
    //                    message: 'Your registration is complete, an OTP has been sent to your email address from waarta@rudrasofttech.com. Please verify and login. Please do check SPAM folder of your email.',
    //                    loggedin: false,
    //                    loginemail: this.state.registeremail,
    //                    showregisterform: false
    //                });
    //            } else if (response.status === 400) {
    //                response.json().then(data => {
    //                    this.setState({
    //                        loading: false,
    //                        bsstyle: 'danger',
    //                        message: data.Error[0]
    //                    });
    //                });
    //            }
    //            else {
    //                this.setState({
    //                    loading: false,
    //                    bsstyle: 'danger',
    //                    message: 'Unable to process your request please try again.',
    //                });
    //            }
    //        });

    //    return false;
    //}

    renderProfileCompleteness() {
        //completed items
        if (localStorage.getItem("token") != null) {
            var showprofilecompleteribbon = false;
            if (this.state.user.emptyFields && this.state.user.emptyFields.indexOf("recoveryquestion") > -1) {
                showprofilecompleteribbon = true;
            }
            if (this.state.user.emptyFields && this.state.user.emptyFields.indexOf("recoveryanswer") > -1) {
                showprofilecompleteribbon = true;
            }
            if (showprofilecompleteribbon) {
                return <div className="alert alert-light text-center" role="alert">
                    Password recovery question and answer is missing from you profile.&nbsp; <a className="text-danger fs-bold" onClick={() => { this.setState({ mainview: "manageprofile" }); }}>Update Profile Now</a>
                </div>;
            }
        }
        return null;
    }

    renderHeader() {
        if (this.state.mainview !== "login" && this.state.mainview !== "register") {
            const token = localStorage.getItem("token");
            let linkitems = [];
            let loggedin = true;
            if (token === null) {
                loggedin = false;
            }

            let profilepic = null;
            if (loggedin && this.state.user !== null && this.state.user.pic !== "") {
                profilepic = <img src={this.state.user.pic} width="20" height="20" className="rounded" />
            } else {
                profilepic = <i className="bi bi-person-square"></i>
            }
            if (loggedin) {
                linkitems.push(<td key={1} align="center" valign="middle" width="55px">
                    <a className="text-dark fs-3" onClick={() => { this.setState({ mainview: "profile" }) }} title="Profile"><i className="bi bi-person-badge"></i>
                    </a>
                </td>);
            } else {
                linkitems.push(<td key={2} align="center" valign="middle" width="55px">
                    <a className="text-dark fs-3" onClick={() => { this.setState({ mainview: "login" }) }} title="Login"><i className="bi bi-person-badge"></i>
                    </a>
                </td>);
            }

            return <div className="container-xl px-0 fixed-top bg-light maxwidth border border-top-0">
                <table cellPadding="5" cellSpacing="0" width="100%" className="my-1">
                    <tbody>
                        <tr>
                            <td>
                                <a onClick={() => { this.setState({ mainview: "home" }) }} className="text-dark text-decoration-none fs-4">Waarta</a>
                            </td>
                            <td align="center" valign="middle" width="55px">
                                <a className="text-dark fs-3" onClick={() => { this.setState({ mainview: "home" }) }} title="Home"><i className="bi bi-house"></i></a>
                            </td>
                            <td align="center" valign="middle" width="55px">
                                <a className="text-dark fs-3" onClick={() => { this.setState({ mainview: "add" }) }} title="Add Post"><i className="bi bi-journal-plus"></i></a>
                            </td>
                            <td align="center" valign="middle" width="55px">
                                <a className="text-dark fs-3" onClick={() => { this.setState({ mainview: "notification" }) }} title="Notifications"><i className="bi bi-bell"></i></a>
                            </td>
                            {linkitems}
                        </tr>
                        <tr>
                            <td colSpan="6" align="left">
                                <Search />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>;
        } else {
            return null;
        }
    }

    renderFooter() {
        if (this.state.mainview !== "login" && this.state.mainview !== "register") {
            return <nav className="navbar navbar-expand-lg navbar-light border-top">
                <div className="container">
                    <div className="justify-content-md-end">
                        <a className="text-dark mx-2" onClick={() => { this.setState({ mainview: "faq" }) }} title="Frequently Asked Questions"><i className="bi bi-patch-question"></i></a>
                        <a className="text-dark mx-2" onClick={() => { this.setState({ mainview: "privacy" }) }} title="Privacy"><i className="bi bi-eye-slash-fill"></i></a>
                    </div>
                </div>
            </nav>;
        } else {
            return null;
        }
    }

    renderLogin() {
        if (this.state.mainview == "login") {
            return <div className="row align-items-center justify-content-center m-3" style={{ height: "85vh" }}>
                <div className="col-md-4">
                    <h1 className="cover-heading" style={{ fontSize: "3.5rem" }}>Waarta</h1>
                    <p className="lead">Easily connect with people. Have meaningful conversations. Free exchange of Ideas. Get things done.<br /> Made in India.</p>
                </div>
                <div className="col-md-4">
                    <RegisterForm onLogin={this.loginHandler} beginWithRegister={false} />
                </div>
            </div>;
        } else {
            return null;
        }
    }

    renderRegister(message, loading) {
        if (this.state.mainview === "register") {
            return <div className="row justify-content-center m-3">
                <div className="col-4"></div>
                <div className="col-4">
                    <RegisterForm onLogin={this.loginHandler} beginWithRegister={false} />
                </div>
            </div>;
        } else {
            return null;
        }
    }

    renderManageProfile() {
        if (this.state.mainview === "manageprofile") {
            return <ManageProfile onProfileChange={() => { this.fetchData(); }} onBack={() => { this.setState({ mainview: "profile" }); }} />;
        } else {
            return null;
        }
    }

    renderProfile() {
        if (this.state.mainview === "profile") {
            return <Profile username={this.state.user.userName} onClickSettings={() => { this.setState({ mainview: "manageprofile" }) }} />;
        } else {
            return null;
        }
    }

    renderConversation() {
        if (this.state.mainview === "conversation") {
            return <Conversation />;
        } else {
            return null;
        }
    }

    renderDiscussion() {
        if (this.state.mainview === "discussion") {
            return <Meetings />;
        } else {
            return null;
        }
    }

    renderHome() {
        if (this.state.mainview === "home") {
            return <Home />;
        } else {
            return null;
        }
    }

    renderPrivacy() {
        if (this.state.mainview === "privacy") {
            return <Privacy />;
        } else {
            return null;
        }
    }

    renderFAQ() {
        if (this.state.mainview === "faq") {
            return <main role="main" className="inner cover container py-5">
                <h1>Frequently Asked Questions</h1>

                <h4>What is Waarta?</h4>
                <p>
                    Waarta is a hindi word which literally means communication.

                </p>
                <h4>Purpose of Waarta</h4>
                <p>
                    Sole purpose of waarta is to help facilitate communication between people. Waarta
                    achieves this by providing a set of powerful features like people search, conversations and meetings.
                </p>

                <h4>People Search?</h4>
                <p>
                    "People Search" as the name suggest is a search feature through which you can search member profiles on waarta. For example
                    if you are looking for a software engineer with ASP.net skill and 10 years of experience in New Delhi. You can can search
                    the same on waarta and find elligible profiles. <br />
                    You have to visit conversations page to do a people search.
                </p>

                <h4>Conversations</h4>
                <p>
                    "Conversation" is a powerful one to one online text, audio and video chat feature, through which you can communicate
                    with your contacts on waarta and with the people you searched on waarta.
                </p>
                <h4>Discussions</h4>
                <p>
                    A place where like minded people can share ideas on topics of their choice. There is no restrictions on number of members a dicussion can have.
                </p>
            </main>;
        } else {
            return null;
        }
    }

    render() {
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let messagecontent = this.state.message !== "" ? <div className={"mt-1 alert alert-" + this.state.bsstyle}>
            {this.state.message}
        </div> : null;
        return <React.Fragment>
            {/*{this.renderHeader()}*/}
            <div className="container-xl maxwidth g-0" style={{ minHeight: "calc(100vh - 143px)" }}>
                {this.renderProfileCompleteness()}
                {this.renderLogin()}
                {this.renderHome()}
                {this.renderProfile()}
                {this.renderManageProfile()}
                {this.renderRegister(messagecontent, loading)}
                {this.renderConversation()}
                {this.renderDiscussion()}
                {this.renderFAQ()}
                {this.renderPrivacy()}
            </div>
            {this.renderFooter()}
        </React.Fragment>;
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: null, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
        };
    }

    
    render() {
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        
        return <React.Fragment><MemberPostList search="userfeed" viewMode={2} viewModeAllowed="false"/></React.Fragment>;
    }
}

class Search extends React.Component {
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
            q: '', items: [], eitems: new Map(), emodel: null, searchactivetab: 'people'
        };

        this.search = this.search.bind(this);
    }

    search() {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/search?q=' + this.state.q.replace("#", "");

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
                        this.setState({
                            loggedin: true, loading: false, items: data
                        }, () => { });
                    });
                }
            });
    }

    explore() {
        let url = '//' + window.location.host + '/api/search/explore?p=' + this.state.p;

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
                        var temp = this.state.eitems;
                        for (var k in data.posts) {
                            if (!temp.has(data.posts[k].id)) {
                                temp.set(data.posts[k].id, data.posts[k]);
                            }
                        }
                        this.setState({
                            loading: false,
                            emodel: {
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            },
                            eposts: temp
                        });
                    });
                }
            });
    }

    renderSearchResult() {
        var items = [];
        var i = 1;
        for (var k in this.state.items) {
            var p = this.state.items[k];
            if (p.member) {
                items.push(<li key={i} className="list-group-item border-0 border-bottom p-2"><MemberSmallRow member={p.member} /></li>)
            } else if (p.hashtag) {
                items.push(<li key={i} className="list-group-item border-0 border-bottom p-2">
                    <div>
                        <a className="text-dark fw-bold text-decoration-none" href={'//' + window.location.host + '/post?q=%23' + p.hashtag.tag}>#{p.hashtag.tag}</a>
                        <div>{p.hashtag.postCount} Posts</div>
                    </div>
                </li>);
            }
            i++;
        }
        if (items.length > 0) {
            return <ul className="list-group list-group-flush">
                {items}
            </ul>;
        }
        else {
            return null;
        }
    }

    render() {
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
            </div>
        }
        let clearsearchhtml = <div className="col-md-1 col-2 p-0 text-center">
            <button type="button" className="btn btn-light" aria-label="Close" onClick={() => { this.setState({ q: '', items: [] }) }}><i className="bi bi-trash"></i></button>
        </div>;
        if (this.state.q === '') {
            clearsearchhtml = null;
        }
        return <React.Fragment>
            {loading}
            <div className="row mx-0">
                <div className="col p-0">
                    <input type="text" className="form-control" value={this.state.q} onChange={(e) => { this.setState({ q: e.target.value }); }} placeholder="Search People, Topics, Hashtags" maxLength="150" onKeyUp={(e) => {
                        if (e.keyCode === 13) {
                            this.search();
                        }
                    }} />
                </div>
                {clearsearchhtml}
            </div>
            {this.renderSearchResult()}
        </React.Fragment>;
    }
}

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
                var imgs = [], imgs2 = [];
                for (var i in p.photos) {
                    imgs.push(<li key={"img" + p.photos[i].id} className="list-group-item p-0 me-1 border-0">
                        <div className="postdiv" style={{ backgroundImage: "url(" + p.photos[i].photo + ")" }}>
                            <img src={p.photos[i].photo} style={{ opacity: 0, maxHeight: "450px", maxWidth: "450px" }} />
                        </div></li>);
                    imgs2.push(<span style={{ width: "5px", height: "5px" }} className="bg-secondary d-inline-block me-1"></span>);
                }
                postshtml = <div>
                    <div className="table-responsive">
                        <ul className="list-group list-group-horizontal" onDoubleClick={() => { this.addReaction(); }}>
                            {imgs}
                        </ul></div>
                </div>;
                //postshtml = <PhotoCarousel photos={p.photos} postid={p.id} />;
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
                    items.push(<div className="col" key={p.id}><div className="card h-100 border-0 rounded-0 pointer imgbg" style={{ backgroundImage: "url(" + p.photos[0].photo + ")" }} data-postid={p.id} onClick={(e) => { this.selectPost(e.target.getAttribute("data-postid")) }}>
                        <img src={p.photos[0].photo} className="card-img border-0 rounded-0" style={{ opacity: 0, padding: "1px" }} />
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

class PhotoCarousel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { photos: this.props.photos, id: this.props.postid };
    }
    componentDidMount() {
        var myCarousel = document.querySelector("#postcarousel-" + this.state.id)
        var carousel = new bootstrap.Carousel(myCarousel, {
            interval: false
        });
    }

    render() {
        var dots = [], photos = [];
        var id = "postcarousel-" + this.state.id;
        var active = "active";
        for (var k in this.state.photos) {
            dots.push(<button type="button" data-bs-target={"#" + id} data-bs-slide-to={k} className={active} aria-label={"Slide " + k}></button>);
            photos.push(<div className={"carousel-item " + active}>
                <div className="postdiv bg-light" style={{ backgroundImage: "url(" + this.state.photos[k].photo + ")" }}>
                    <img src={this.state.photos[k].photo} style={{ opacity: 0, maxHeight: "500px", maxWidth: "450px" }} />
                </div>
            </div>);
            active = "";
        }
        return <div id={id} className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
                {dots}
            </div>
            <div className="carousel-inner">
                {photos}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target={"#" + id} data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={"#" + id} data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>;
    }
}

class Profile extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            member: null, bsstyle: '', message: '', followStatus: null,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            showfollowers: false, showfollowing: false, showSettings: false
        };

    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
        if (this.props.username == undefined || this.props.username == null || this.props.username == "") {
            this.setState({ member: JSON.parse(localStorage.getItem("myself")) });
        } else {
            this.loadMember(localStorage.getItem("token"), this.props.username);

        }
    }

    loadMember(t, username) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/' + username, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ loggedin: true, loading: false, member: data }, () => {
                            this.loadFollowStatus(localStorage.getItem("token"), this.state.member.id);
                        });
                    });
                }
            });
    }

    loadFollowStatus(t, username) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Status/' + username, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + t }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ loggedin: true, loading: false, followStatus: data.status });
                    });
                }
            });
    }

    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        localStorage.setItem("myself", JSON.stringify(data));
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    renderFollowHtml() {

        if (this.state.followStatus != null) {
            return <FollowButton member={this.state.member} status={this.state.followStatus} />
        }
    }

    renderFollowers() {
        if (this.state.showfollowers) {
            return <div className="modal fade show" style={{ display: "block" }} id="followersModal" tabindex="-1" aria-labelledby="followersModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followersModalLabel">Followers</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showfollowers: false }) }}></button>
                        </div>
                        <div className="modal-body">
                            <MemberSmallList memberid={this.state.member.id} target="follower" />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return null;
    }

    renderFollowing() {
        if (this.state.showfollowing) {
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabindex="-1" aria-labelledby="followingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followingModalLabel">Following</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showfollowing: false }) }}></button>
                        </div>
                        <div className="modal-body">
                            <MemberSmallList memberid={this.state.member.id} target="following" />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return null;
    }

    render() {
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        if (this.state.showSettings) {
            return <ManageProfile onProfileChange={() => { this.validate(localStorage.getItem("token")); }} onBack={() => { this.setState({ showSettings: false }); }} />;
        }
        var followlist = null;
        if (this.state.showfollowing) {
            followlist = <React.Fragment>{this.renderFollowing()}</React.Fragment>;
        }
        else if (this.state.showfollowers) {
            followlist = <React.Fragment>{this.renderFollowers()}</React.Fragment>;
        }

        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>
        }
        let me = null, pic = null, settings = null, followhtml = null;
        if (this.state.member !== null) {
            pic = this.state.member.pic !== "" ? <img src={this.state.member.pic} className="img-fluid rounded profile-thumb" alt="" />
                : <img src="/images/nopic.jpg" className="img-fluid profile-thumb rounded" alt="" />;
            let name = null, thought = null, email = null, phone = null;
            if (this.state.member.name !== "") {
                name = <div className="fs-6 p-1 ms-2 fw-bold">{this.state.member.name}</div>;
            }
            if (this.state.member.thoughtStatus !== "") {
                thought = <p>{this.state.member.thoughtStatus}</p>;
            }
            if (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) {
                settings = <div className="p-1 ms-2"><a className="text-dark text-decoration-none" onClick={() => { this.setState({ showSettings: true }) }}><i className="bi bi-gear"></i> Settings</a></div>;
            } else {
                followhtml = this.renderFollowHtml();
            }
            me = <React.Fragment><div className="pt-2 border-bottom mb-1">
                <div className="row mx-0">
                    <div className="col-5 p-1 col-md-3 text-end">
                        {pic}
                    </div>
                    <div className="col-7 col-md-9 p-1">
                        <div className="fs-6 p-1 ms-2 fw-bold">@{this.state.member.userName}</div>
                        {name}
                        {settings}
                        {followhtml}
                    </div>
                </div>
                <div className="row mx-0">
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none">{this.state.member.postCount} Posts</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({ showfollowing: true }) }}>{this.state.member.followingCount} Following</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({ showfollowers: true }) }}>{this.state.member.followerCount} Followers</button></div>
                </div>
                {thought}
                <p>{this.state.member.bio}</p>
            </div>
                <MemberPostList search={this.state.member.userName} viewMode={2} viewModeAllowed="true" />
                {followlist}
            </React.Fragment>;
        }

        return <React.Fragment>
            {loading}
            {me}
        </React.Fragment>;
    }
}

class ManageProfile extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            onProfileChange: this.props.onProfileChange === undefined ? null : this.props.onProfileChange,
            showProfilePicModal: false, src: null,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                locked: true
            },
            croppedImageUrl: null, profilepiczoom: 1
        };

        this.hammer = null;
        this.pinch = null;
        this.profilePicCanvas = null;
        this.profilePicImgInst = null;
        this.handleChange = this.handleChange.bind(this);
        this.saveData = this.saveData.bind(this);
        this.toggleProfilePicModal = this.toggleProfilePicModal.bind(this);
        this.saveProfilePic = this.saveProfilePic.bind(this);
        this.removeProfilePicture = this.removeProfilePicture.bind(this);
        this.handleProfileImageLoaded = this.handleProfileImageLoaded.bind(this);
        this.handleProfileZoom = this.handleProfileZoom.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    handleChange(e) {
        let m = this.state.myself;
        switch (e.target.name) {
            case 'userName':
                m.userName = e.target.value.replace(" ", "").replace("\\", "").replace("/", "").replace(";", "").replace("\"", "").replace("'", "").replace("#", "");
                break;
            case 'phone':
                m.phone = e.target.value;
                break;
            case 'email':
                m.email = e.target.value;
                break;
            case 'bio':
                m.bio = e.target.value;
                break;
            case 'name':
                if (e.target.value.trim() === "") {
                    alert("Name is required.");
                    e.target.focus();
                } else {
                    m.name = e.target.value;
                }
                break;
            case 'birthYear':
                m.birthYear = e.target.value;
                break;
            case 'gender':
                m.gender = e.target.value;
                break;
            case 'visibility':
                m.visibility = e.target.value;
                break;
            case 'country':
                m.country = e.target.value;
                break;
            case 'state':
                m.state = e.target.value;
                break;
            case 'city':
                m.city = e.target.value;
                break;
            case 'thoughtStatus':
                m.thoughtStatus = e.target.value;
                break;
            default:
                break;
        }

        this.setState({ myself: m });
    }

    handleProfileImageLoaded(e) {
        this.profilePicCanvas.remove(this.profilePicImgInst);
        this.profilePicImgInst = new fabric.Image(e.target, { angle: 0, padding: 0, cornersize: 0 });
        if (e.target.width >= e.target.height) {
            this.profilePicImgInst.scaleToHeight(this.profilePicCanvas.height);
        } else if (e.target.height > e.target.width) {
            this.profilePicImgInst.scaleToWidth(this.profilePicCanvas.width);
        }
        this.profilePicImgInst.hasControls = false;
        //this.profilePicImgInst.lockMovementX = true;
        //this.profilePicImgInst.lockMovementY = true;
        this.profilePicCanvas.centerObject(this.profilePicImgInst);
        this.profilePicCanvas.add(this.profilePicImgInst);
    }

    handleProfileZoom() {
        this.profilePicCanvas.setZoom(this.state.profilepiczoom * 0.1);
    }

    handleFile = e => {
        const fileReader = new FileReader()
        fileReader.onloadend = () => {
            this.setState({ src: fileReader.result }, () => {
                if (this.profilePicCanvas === null) {

                    this.profilePicCanvas = new fabric.Canvas('profilePicCanvas');
                    this.profilePicCanvas.setDimensions({ width: 300, height: 300 });
                    this.profilePicCanvas.setZoom(1);
                    this.hammer = new Hammer.Manager(this.profilePicCanvas.upperCanvasEl); // Initialize hammer
                    this.pinch = new Hammer.Pinch();
                    this.hammer.add([this.pinch]);

                    this.hammer.on('pinch', (ev) => {
                        //console.log(ev);
                        //let point = new fabric.Point(ev.center.x, ev.center.y);
                        //let delta = this.profilepiczoom * ev.scale;

                        this.profilePicCanvas.setZoom(this.state.profilepiczoom * ev.scale);
                    });
                }

                var img = new Image();
                img.onload = this.handleProfileImageLoaded;
                img.src = this.state.src;
            });
        }
        fileReader.readAsDataURL(e.target.files[0]);
    }

    toggleProfilePicModal() {
        this.setState({ showProfilePicModal: !this.state.showProfilePicModal });
    }

    removeProfilePicture(e) {
        this.setState({ loading: true });
        const fd = new FormData();
        fd.set("pic", "");
        fetch('//' + window.location.host + '/api/Members/savepic', {
            method: 'post',
            body: fd,
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
                    this.setState({ loading: false, showProfilePicModal: false });
                    if (localStorage.getItem("token") !== null) {
                        this.validate(localStorage.getItem("token"));
                    }
                    if (this.state.onProfileChange !== null) {
                        this.state.onProfileChange();
                    }
                } else {
                    this.setState({ loading: false, message: 'Unable to save profile pic', bsstyle: 'danger' });
                }
            });
    }

    saveProfilePic() {
        this.setState({
            croppedImageUrl: this.profilePicCanvas.toDataURL("image/png")
        }, () => {
            this.hammer = null;
            this.pinch = null;
            this.profilePicCanvas = null;
            this.profilePicImgInst = null;
            this.setState({ loading: true });
            const fd = new FormData();
            fd.set("pic", this.state.croppedImageUrl);
            fetch('//' + window.location.host + '/api/Members/savepic', {
                method: 'post',
                body: fd,
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
                        this.setState({ loading: false, showProfilePicModal: false, profilepiczoom: 1 });
                        if (localStorage.getItem("token") !== null) {
                            this.validate(localStorage.getItem("token"));
                        }
                        if (this.state.onProfileChange !== null) {
                            this.state.onProfileChange();
                        }
                    } else {
                        this.setState({ loading: false, message: 'Unable to save profile pic', bsstyle: 'danger' });
                    }
                });
        });

    }

    saveData(name, value) {
        this.setState({ loading: true });
        if (name !== 'bio') {
            fetch('//' + window.location.host + '/api/Members/Save' + name + '?d=' + value, {
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
                        this.setState({ loading: false, message: '', bsstyle: '' });
                        if (this.state.onProfileChange) {
                            this.state.onProfileChange();
                        }
                    } else if (response.status === 400) {
                        try {
                            response.json().then(data => {
                                //console.log(data);
                                this.setState({ loading: false, message: data.error, bsstyle: 'danger' }, () => {
                                    if (this.props.onProfileChange) {
                                        this.props.onProfileChange();
                                    }
                                });
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
        } else {
            const fd = new FormData();
            fd.set("d", value);
            fetch('//' + window.location.host + '/api/Members/savebio', {
                method: 'post',
                body: fd,
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
                        this.setState({ loading: false });
                        if (this.state.onProfileChange !== null) {
                            this.state.onProfileChange();
                        }
                    } else {
                        this.setState({ loading: false, message: 'Unable to save data', bsstyle: 'danger' });
                    }
                });
        }
    }

    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    renderUSStates() {
        return <select name="state" id="state" className="form-control" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData}><option value=""></option><option value="Alabama">Alabama</option><option value="Alaska">Alaska</option><option value="Arizona">Arizona</option><option value="Arkansas">Arkansas</option><option value="California">California</option><option value="Colorado">Colorado</option><option value="Connecticut">Connecticut</option><option value="Delaware">Delaware</option><option value="District of Columbia">District of Columbia</option><option value="Florida">Florida</option><option value="Georgia">Georgia</option><option value="Guam">Guam</option><option value="Hawaii">Hawaii</option><option value="Idaho">Idaho</option><option value="Illinois">Illinois</option><option value="Indiana">Indiana</option><option value="Iowa">Iowa</option><option value="Kansas">Kansas</option><option value="Kentucky">Kentucky</option><option value="Louisiana">Louisiana</option><option value="Maine">Maine</option><option value="Maryland">Maryland</option><option value="Massachusetts">Massachusetts</option><option value="Michigan">Michigan</option><option value="Minnesota">Minnesota</option><option value="Mississippi">Mississippi</option><option value="Missouri">Missouri</option><option value="Montana">Montana</option><option value="Nebraska">Nebraska</option><option value="Nevada">Nevada</option><option value="New Hampshire">New Hampshire</option><option value="New Jersey">New Jersey</option><option value="New Mexico">New Mexico</option><option value="New York">New York</option><option value="North Carolina">North Carolina</option><option value="North Dakota">North Dakota</option><option value="Northern Marianas Islands">Northern Marianas Islands</option><option value="Ohio">Ohio</option><option value="Oklahoma">Oklahoma</option><option value="Oregon">Oregon</option><option value="Pennsylvania">Pennsylvania</option><option value="Puerto Rico">Puerto Rico</option><option value="Rhode Island">Rhode Island</option><option value="South Carolina">South Carolina</option><option value="South Dakota">South Dakota</option><option value="Tennessee">Tennessee</option><option value="Texas">Texas</option><option value="Utah">Utah</option><option value="Vermont">Vermont</option><option value="Virginia">Virginia</option><option value="Virgin Islands">Virgin Islands</option><option value="Washington">Washington</option><option value="West Virginia">West Virginia</option><option value="Wisconsin">Wisconsin</option><option value="Wyoming">Wyoming</option></select>;
    }

    renderIndianStates() {
        return <select name="state" id="state" className="form-control" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData}>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
            <option value="Daman and Diu">Daman and Diu</option>
            <option value="Delhi">Delhi</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Puducherry">Puducherry</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
        </select>;
    }

    renderStates() {
        if (this.state.myself.country.toLowerCase() == "india") {
            return this.renderIndianStates();
        } else if (this.state.myself.country.toLowerCase() == "usa") {
            return this.renderUSStates();
        } else {
            return <input type="text" name="state" className="form-control" maxLength="100" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData} />
        }
    }

    renderProfilePicModal() {
        if (this.state.showProfilePicModal) {
            const { crop, profile_pic, src } = this.state;
            return (
                <div className="modal  d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Profile Picture</h5>
                                <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={this.toggleProfilePicModal}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <button className="btn btn-primary" type="button" onClick={() => { document.getElementById("profile_pic").click(); }}>Choose Picture</button>
                                    <input type="file" className="d-none" id="profile_pic" value={profile_pic}
                                        onChange={this.handleFile} />
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col">
                                        <canvas id="profilePicCanvas" style={{ width: "300px", height: "300px" }}></canvas>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={this.saveProfilePic}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else { return null; }
    }

    render() {
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        var yearitems = []
        for (var i = 1947; i <= 2004; i++) {
            yearitems.push(<option value={i}>{i}</option>);
        }
        let loading = this.state.loading ? <div className="progress fixed-bottom rounded-0" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}></div>
        </div> : null;
        if (this.state.loggedin && this.state.myself !== null) {

            let message = this.state.message !== "" ? <div className={'text-center noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                {this.state.message}
            </div> : null;
            let pic = this.state.myself.pic !== "" ? <React.Fragment><img src={this.state.myself.pic} className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />
                <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.removeProfilePicture}>Remove</button></React.Fragment> : <img src="/images/nopic.jpg" className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />;
            return <React.Fragment>
                <div className="container py-5">
                    {loading}
                    {message}
                    <div className="row align-items-center">
                        <div className="col-md-6 text-center">
                            {pic}
                            <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.toggleProfilePicModal}>Change</button>
                            {this.renderProfilePicModal()}
                        </div>
                        <div className="col-md-6">
                            <div className="mb-2">
                                <label htmlFor="channelnametxt" className="form-label">Username</label>
                                <input type="text" id="channelnametxt" readOnly name="userName" placeholder="Unique Channel Name" className="form-control" value={this.state.myself.userName} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="nametxt" className="form-label">Name <span className="text-danger">(Required)</span></label>
                                <input type="text" id="nametxt" name="name" placeholder="Your Name" className="form-control" value={this.state.myself.name} onChange={this.handleChange} onBlur={() => { this.saveData("name", this.state.myself.name) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Mobile <span className="text-danger">(Required)</span></label>
                                <input type="text" name="phone" className="form-control" maxLength="15" value={this.state.myself.phone} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("phone", this.state.myself.phone) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Email <span className="text-danger">(Required)</span></label>
                                <input type="email" name="email" className="form-control" maxLength="250" value={this.state.myself.email} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("email", this.state.myself.email) }} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="birthyeartxt" className="form-label">Year of Birth (optional)</label>
                                <select id="birthyeartxt" name="birthYear" className="form-select" value={this.state.myself.birthYear} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("birthYear", this.state.myself.birthYear) }}>
                                    {yearitems}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="thoughtStatus" className="form-label">One line Introduction (Optional)</label>
                        <input type="text" name="thoughtStatus" className="form-control" maxLength="195" value={this.state.myself.thoughtStatus} onChange={this.handleChange}
                            onBlur={() => { this.saveData("thoughtstatus", this.state.myself.thoughtStatus) }} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="biotxt" className="form-label">About Me (Optional)</label>
                        <textarea className="form-control" id="biotxt" maxLength="950" name="bio" value={this.state.myself.bio} onChange={this.handleChange} rows="4" placeholder="Write something about yourself."
                            onBlur={() => { this.saveData("bio", this.state.myself.bio) }}></textarea>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="visibilityselect" className="form-label">Profile Visibility (Optional)</label>
                            <select className="form-select" id="genderselect" name="visibility" value={this.state.myself.visibility} onChange={this.handleChange}
                                onBlur={() => { this.saveData("visibility", this.state.myself.visibility) }}>
                                <option value="0"></option>
                                <option value="2">Public</option>
                                <option value="1">Private</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="countryselect" className="form-label">Country (Optional)</label>
                            <select className="form-select" id="countryselect" name="country" value={this.state.myself.country} onChange={this.handleChange} onBlur={() => { this.saveData("country", this.state.myself.country) }}>
                                <option value=""></option>
                                <option value="India">India</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-2 mt-3 border text-end bg-light sticky-bottom">

                        <button className="btn btn-link text-dark mx-2" onClick={() => {
                            localStorage.clear();
                            location.reload();
                        }}>Logout</button>
                    </div>
                </div>
            </React.Fragment>;
        } else {
            return <React.Fragment>
                {loading}
            </React.Fragment>;
        }
    }
}

class RegisterForm extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }

        this.state = {
            showregisterform: props.beginWithRegister,
            registerdto: { userName: '', password: '', userEmail: '' },
            logindto: { userName: '', password: '' },
            loading: false, message: '', bsstyle: '', loggedin: loggedin
        };

        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegisterClickHere = this.handleRegisterClickHere.bind(this);
        this.handleLoginClickHere = this.handleLoginClickHere.bind(this);
    }

    handleLogin(e) {
        e.preventDefault();

        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Login', {
            method: 'post',
            body: JSON.stringify({ UserName: this.state.logindto.userName, Password: this.state.logindto.password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                //console.log(response);
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        if (data.token !== undefined) {
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("myself", JSON.stringify(data.member));
                            this.setState({ bsstyle: '', message: '', loggedin: true, loading: false });
                            if (this.props.onLogin !== undefined) {
                                this.props.onLogin();
                            } else {
                                this.setState({ redirectto: '/' });
                            }
                        }
                    });
                }
                else if (response.status === 404) {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ bsstyle: 'danger', message: data.error, loading: false });
                    });

                }
            });
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/members/register', {
            method: 'post',
            body: JSON.stringify({ UserName: this.state.registerdto.userName, Password: this.state.registerdto.password, Email: this.state.registerdto.userEmail }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log(response.status);
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        bsstyle: 'success',
                        message: 'Your registration is complete.',
                        loggedin: false,
                        logindto: { userName: this.state.registerdto.userName, password: '' },
                        showregisterform: false
                    });
                } else if (response.status === 400) {

                    response.json().then(data => {

                        this.setState({
                            loading: false,
                            bsstyle: 'danger',
                            message: data.error
                        });
                    });
                }
                else {
                    this.setState({
                        loading: false,
                        bsstyle: 'danger',
                        message: 'Unable to process your request please try again.',
                    });
                }
            });

        return false;
    }

    handleRegisterClickHere() {
        this.setState({ showregisterform: true, message: "" });
    }

    handleLoginClickHere() {
        this.setState({ showregisterform: false, message: "" });
    }

    renderLoginForm() {
        return <form onSubmit={this.handleLogin}>
            <div className="mb-3">
                <label>Username</label>
                <input type="text" className="form-control" required name="userName" value={this.state.logindto.userName} onChange={(e) => { this.setState({ logindto: { userName: e.target.value, password: this.state.logindto.password } }) }} />
            </div>
            <div className="mb-3">
                <label>Password</label>
                <input className="form-control" required name="password" type="password" onChange={(e) => { this.setState({ logindto: { userName: this.state.logindto.userName, password: e.target.value } }) }} />
            </div>
            <div className="row">
                <div className="col">
                    <button className="btn btn-dark" type="submit">Login</button>
                </div>
                <div className="col text-end">
                    <a href="/forgotpassword" className="btn btn-link text-dark">Forgot Password?</a>
                </div>
            </div>
        </form>;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.beginWithRegister !== prevState.beginWithRegister) {
            return { someState: nextProps.beginWithRegister };
        }
        else return null;
    }

    render() {
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let messagecontent = this.state.message !== "" ? <div className={"mt-1 alert alert-" + this.state.bsstyle}>
            {this.state.message}
        </div> : null;

        let logincontents = this.state.GenerateOTPButton ?
            this.renderOTPForm()
            : this.renderLoginForm();

        let formcontents = this.state.showregisterform ?
            <div>
                <h3>Register</h3>
                <div >
                    <form autoComplete="off" onSubmit={this.handleRegisterSubmit}>
                        <div className="mb-3">
                            <label>Email</label>
                            <input className="form-control" maxLength="250" required name="userEmail" type="email"
                                value={this.state.registerdto.userEmail}
                                onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: this.state.registerdto.password, userEmail: e.target.value } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Username</label>
                            <input type="text" className="form-control" required name="username" value={this.state.registerdto.userName}
                                onChange={(e) => { this.setState({ registerdto: { userName: e.target.value, password: this.state.registerdto.password, userEmail: this.state.registerdto.userEmail } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Password</label>
                            <input className="form-control" minLength="8" required name="password" type="password" onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: e.target.value, userEmail: this.state.registerdto.userEmail } }) }} />
                        </div>

                        <button className="btn btn-dark" type="submit">Register</button>
                    </form>

                    <p className="text-center mt-2">
                        Already a Member! <a onClick={this.handleLoginClickHere} className="link-success">Login Here</a> </p>
                    {messagecontent}
                    {loading}
                </div>
            </div> :
            <div>
                <h3>Login</h3>
                <div >
                    {logincontents}
                    <p className="text-center mt-3 p-3 border-top">
                        Register for FREE <a onClick={this.handleRegisterClickHere} className="link-success">Click Here</a></p>
                    {messagecontent}
                    {loading}
                </div>
            </div>;
        return <div className="row align-items-center justify-content-center mx-0">
            <div className="col px-0">
                {formcontents}
            </div></div>;
    }
}

class ViewProfile extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            profile: this.props.profile === undefined ? null : this.props.profile
        };
    }

    componentDidMount() {
        //if (localStorage.getItem("token") !== null) {
        //    this.fetchData(localStorage.getItem("token"));
        //}
    }

    componentDidUpdate(prevProps, prevState) {
        //if ((prevState.channel !== this.state.channel || prevState.profileid !== this.state.profileid) && localStorage.getItem("token") !== null) {
        //    this.fetchData(localStorage.getItem("token"));
        //}
    }

    static getDerivedStateFromProps(props, state) {
        if (props.channel !== state.channel || props.profileid !== state.profileid || props.profile !== state.profile) {
            return {
                channel: props.channel,
                profileid: props.profileid,
                profile: props.profile === undefined ? null : props.profile
            };
        }
        return null;
    }

    processString(options) {
        var key = 0;

        function processInputWithRegex(option, input) {
            if (!option.fn || typeof option.fn !== 'function') return input;

            if (!option.regex || !(option.regex instanceof RegExp)) return input;

            if (typeof input === 'string') {
                var regex = option.regex;
                var result = null;
                var output = [];

                while ((result = regex.exec(input)) !== null) {
                    var index = result.index;
                    var match = result[0];

                    output.push(input.substring(0, index));
                    output.push(option.fn(++key, result));

                    input = input.substring(index + match.length, input.length + 1);
                    regex.lastIndex = 0;
                }

                output.push(input);
                return output;
            } else if (Array.isArray(input)) {
                return input.map(function (chunk) {
                    return processInputWithRegex(option, chunk);
                });
            } else return input;
        }

        return function (input) {
            if (!options || !Array.isArray(options) || !options.length) return input;

            options.forEach(function (option) {
                return input = processInputWithRegex(option, input);
            });

            return input;
        };
    }

    renderText(text) {
        let parts = text.split(/(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim) // re is a matching regular expression
        for (let i = 1; i < parts.length; i += 2) {
            parts[i] = <a key={'link' + i} href={parts[i]}>{parts[i].split('\n').map((item, key) => {
                return <React.Fragment key={key}>{item}<br /></React.Fragment>
            })}</a>
        }
        return parts
    }

    render() {
        if (this.state.profile !== null) {
            var d = new Date();
            let pic = <React.Fragment><img src="/images/nopic.jpg" style={{ width: "50px" }} className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;

            if (this.state.profile.pic !== "") {
                pic = <React.Fragment><img src={this.state.profile.pic} className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;
            }
            let age = this.state.profile.birthYear > 0 ? <React.Fragment>{d.getFullYear() - this.state.profile.birthYear} Years Old</React.Fragment> : null;

            let address = this.state.profile.city + ' ' + this.state.profile.state + ' ' + this.state.profile.country;

            if (address.trim() !== '') {
                address = 'From ' + address;
            }
            let config = [{
                regex: /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => <span key={key}>
                    <a target="_blank" href={`${result[1]}://${result[2]}.${result[3]}${result[4]}`}>{result[2]}.{result[3]}{result[4]}</a>{result[5]}
                </span>
            },
            {
                regex: /\n/gim,
                fn: (key, result) => <br key={key} />
            }, {
                regex: /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => <span key={key}>
                    <a target="_blank" href={`http://${result[1]}.${result[2]}${result[3]}`}>{result[1]}.{result[2]}{result[3]}</a>{result[4]}
                </span>
            }];
            var bio = <p>{this.processString(config)(this.state.profile.bio)}</p>;
            return (
                <div className="text-center">
                    {pic}
                    <h4>{this.state.profile.name}</h4>
                    <p>{bio}</p>
                    <p><em>{age} {address}</em></p>
                </div>
            );
        } else {
            return null;
        }
    }
}


function transformMessage(text, id) {
    try {
        const reglink = /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi;
        let match;

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

class Conversation extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '', selectedperson: null,
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            searchtext: '', dummy: new Date(), showsearch: true, showprofilemodal: false, profiletoshow: null
        };
        this.hubConnection = null;
        this.contactupdateinterval = null;
        this.contactlist = new Map();
        this.loginHandler = this.loginHandler.bind(this);
        this.handleProfileSelect = this.handleProfileSelect.bind(this);
        this.validate = this.validate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this);
        this.handleUpdateParent = this.handleUpdateParent.bind(this);
        this.fetchContacts = this.fetchContacts.bind(this);
        this.handleShowSearch = this.handleShowSearch.bind(this);
        this.checkContactPulse = this.checkContactPulse.bind(this);
        this.search = this.search.bind(this);
        this.startHub = this.startHub.bind(this);
        this.handleProfileModalClose = this.handleProfileModalClose.bind(this);
        this.handleProfileItemClick = this.handleProfileItemClick.bind(this);
        this.setMessageStatus = this.setMessageStatus.bind(this);
        this.messageStatusEnum = {
            Pending: 0,
            Sent: 1,
            Received: 2,
            Seen: 3
        }
    }

    componentDidMount() {
        this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    componentWillUnmount() {
        if (this.contactupdateinterval !== null) {
            clearInterval(this.contactupdateinterval);
        }
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();
        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
        }).catch(err => console.log('Error while establishing connection :('));


        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: 2 /*Received*/ };
            //if received message is from current person then show in ui else save in local storage
            this.handleReceivedMessage(mi);
        });

        //update local contact list when some contact updates their information
        //if member is logged changes will be reflected immediately 
        //other wise when member log in latest contact info wil be fetched from db
        this.hubConnection.on('ContactUpdated', (dto) => {
            if (this.contactlist.get(dto.id) !== undefined) {
                let p = this.contactlist.get(dto.id).person
                if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city
                    || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) {
                    this.contactlist.get(dto.id).person = dto;
                    this.setState({ dummy: Date.now() });
                }
            }
        });

        this.hubConnection.on('ContactSaved', (dto) => {
            if (this.contactlist.get(dto.id) === undefined) {
                this.contactlist.set(dto.person.id, dto);
                this.setState({ dummy: Date.now() });
            }
        });
    }

    compare_contact(a, b) {
        // a should come before b in the sorted order
        //console.log(a);
        if (a[1].unseenMessageCount > b[1].unseenMessageCount) {
            return -1;

        } else if (a[1].person.activity !== 5 && b[1].person.activity === 5) {
            return -1;
        }
        else if (a[1].person.activity === 5 && b[1].person.activity !== 5) {
            // a should come after b in the sorted order
            return 1;
        }
        else {
            // a and b are the same
            return 0;
        }
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false, token: null });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });

                    //fetch contacts after validation is done
                    this.fetchContacts();
                    this.contactupdateinterval = setInterval(this.checkContactPulse, 5000);
                    if (this.hubConnection === null) {
                        this.startHub();
                    }
                }
            });
    }

    //function checks if any contact has not send pulse for last 5 seconds then deem them off-line
    checkContactPulse() {
        for (const [key, contact] of this.contactlist.entries()) {
            var dt = new Date(contact.lastPulse);
            dt.setSeconds(dt.getSeconds() + 5);
            if (dt < Date.now()) {
                contact.activity = 5;
            }
        }
    }

    fetchContacts() {

        fetch('//' + window.location.host + '/api/Contacts/Member', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        for (var k in data) {
                            if (this.contactlist.get(data[k].person.id) === undefined) {
                                this.contactlist.set(data[k].person.id.toLowerCase(), data[k]);
                            } else {
                                //this.contactlist.get(data[k].person.id).recentMessage = data[k].recentMessage;
                                //this.contactlist.get(data[k].person.id).recentMessageDate = data[k].recentMessageDate;
                                //this.contactlist.get(data[k].person.id).person = data[k].person;
                                this.contactlist.set(data[k].person.id, data[k]);
                            }

                            if (data[k].messagesOnServer.length > 0) {
                                var msgs = localStorage.getItem(data[k].person.id) !== null ? new Map(JSON.parse(localStorage.getItem(data[k].person.id))) : new Map();
                                for (var i in data[k].messagesOnServer) {
                                    if (msgs.get(data[k].messagesOnServer[i].id) === undefined) {
                                        var mi = { id: data[k].messagesOnServer[i].id, sender: data[k].messagesOnServer[i].sentBy.id, text: data[k].messagesOnServer[i].message, timestamp: data[k].messagesOnServer[i].sentDate, status: 2 /*Received*/ };
                                        msgs.set(mi.id, mi);
                                        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
                                        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                                        this.setMessageStatus(mi.id, "SetReceived");
                                        this.contactlist.get(data[k].person.id).recentMessageDate = mi.timestamp;
                                        if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                                            this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
                                        } else {
                                            this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
                                        }
                                    }
                                }
                                localStorage.setItem(data[k].person.id, JSON.stringify(Array.from(msgs)));
                            }
                        }
                        localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                        this.setState({ loading: false, dummy: new Date() });
                    });
                } else {
                    this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                }
            });
    }

    //search for members
    search() {
        if (this.state.searchtext !== "") {
            this.setState({ loading: true });
            fetch('//' + window.location.host + '/api/Members/search?s=' + this.state.searchtext, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            //console.log(data);
                            this.contactlist = new Map();
                            for (var k in data) {
                                this.contactlist.set(data[k].id, { id: 0, person: data[k], createDate: null, boloRelation: 3, recentMessage: '', recentMessageDate: '' });
                            }

                            this.setState({ loading: false, dummy: new Date() });
                        });
                    } else {
                        this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                    }
                });
        }
    }

    setMessageStatus(mid, action) {
        fetch('//' + window.location.host + '/api/ChatMessages/' + action + '?mid=' + mid, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        });
    }

    handleUpdateParent(action, data) {
        switch (action) {
            case "updatemessageseen":
                if (this.contactlist.get(data.id.toLowerCase()) !== undefined) {
                    this.contactlist.get(data.id.toLowerCase()).unseenMessageCount = 0;
                    localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                    this.setState({ dummy: Date.now() });
                }
                break;
        }
    }

    handleShowSearch(show) {
        if (show) {
            this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        }
        this.setState({ showsearch: show });
    }

    handleProfileSelect(e) {
        this.setState({ selectedperson: e })
    }

    handleProfileModalClose() {
        this.setState({ profiletoshow: null, showprofilemodal: false });
    }

    //handle profile menu item click
    handleProfileItemClick(e) {
        //should only move forward if there is memberid and there is some profileselect action provided
        if (e !== null && this.contactlist.get(e) !== undefined) {
            this.setState({ profiletoshow: this.contactlist.get(e).person, showprofilemodal: true });
        }
    }

    //handle search result item click
    handleResultItemClick(e) {
        this.setState({ selectedperson: null });
        if (this.state.loggedin) {
            //should only move forward if there is memberid and there is some profileselect action provided
            if (e !== null && this.contactlist.get(e) !== undefined) {
                this.setState({ selectedperson: this.contactlist.get(e).person, showsearch: false, showprofilemodal: false })
            }
        }
        else {
            alert("Please log in to gain full access.");
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        this.search();
    }

    //if user is not chating to receiver  at present than add received message to message list and increase unseen message count of the contact
    handleReceivedMessage(mi) {
        let usermsgs = localStorage.getItem(mi.sender.toLowerCase());
        let usermsgmap = null;
        if (usermsgs !== null)
            usermsgmap = new Map(JSON.parse(usermsgs));
        else
            usermsgmap = new Map();

        usermsgmap.set(mi.id, mi);
        localStorage.setItem(mi.sender.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries())));

        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
        this.setMessageStatus(mi.id, "SetReceived");
        if (this.contactlist.get(mi.sender.toLowerCase()) !== undefined) {

            if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
            } else {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
            }
            localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
            this.setState({ dummy: Date.now() });
        }

    }

    //the usual BS required for form fields to work in react
    handleChange(e) {
        switch (e.target.name) {
            case 'searchtext':
                if (e.target.value.trim() === "") {
                    this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                }
                this.setState({ searchtext: e.target.value });
                break;
            default:
        }
    }

    renderPeopleList() {
        const items = [];
        const hundred = { width: "100%" };
        var sortedcontacts = new Map([...this.contactlist.entries()].sort(this.compare_contact));
        for (const [key, contact] of sortedcontacts.entries()) {
            let obj = contact.person;
            if (this.state.myself === null || obj.id !== this.state.myself.id) {
                let thought = null;
                if (obj.thoughtStatus !== "") {
                    thought = <p className="card-text"><small>{obj.thoughtStatus}</small></p>
                }
                let online = <span className="offline"></span>;
                if (obj.activity !== 5) {
                    online = <span className="online"></span>;
                }
                let unseenmsgcount = contact.unseenMessageCount > 0 ? <span className="badge bg-primary">{contact.unseenMessageCount}</span> : null;
                let blocked = contact.boloRelation === BoloRelationType.Blocked ? <span className="badge bg-danger">Blocked</span> : null;
                let pic = obj.pic !== "" ? <img src={obj.pic} className="card-img" alt="" />
                    : null;

                items.push(<div className="card mb-1" style={{ maxWidth: "400px", cursor: "pointer" }} onClick={() => this.handleResultItemClick(obj.id)}>
                    <div className="card-body p-1" style={{ position: "relative" }}>
                        <span style={{ maxWidth: "30px", display: "inline-block", float: "right" }} >{pic}</span>
                        <h5 className="card-title">{online} {obj.name} {unseenmsgcount} {blocked}</h5>
                        {thought}
                    </div>
                </div>);
            }
        }

        if (items.length > 0) {
            return <div className="row searchresult p-1">{items}</div>;
        } else {
            return <div className="row justify-content-center">
                <div className="col-12">
                    <div className="alert alert-light" role="alert">
                        No profiles to show here.
                        <br />
                        Search for people based on their name, location, profession or gender etc.
                        Here are some examples of search phrases.
                        <ul>
                            <li>Raj Kiran Singh</li>
                            <li>Raj From India</li>
                            <li>Software Developer in Noida</li>
                            <li>Women in India</li>
                            <li>Men in India</li>
                            <li>Mumbai Maharashtra</li>
                            <li>Delhi Mumbai Kolkatta</li>
                        </ul>
                    </div>
                </div>
            </div>;
        }
    }

    render() {
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let personchatorprofile = null;
        if (this.state.selectedperson !== null /*&& !this.state.showsearch*/) {
            personchatorprofile = <PersonChat person={this.state.selectedperson} myself={this.state.myself} updateParent={this.handleUpdateParent} handleShowSearch={this.handleShowSearch} />
        }
        else if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personchatorprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={this.state.profiletoshow} />
                        </div>
                    </div>
                </div>
            </div>;
        }
        else {
            personchatorprofile = null; //<HeartBeat activity="1" interval="3000" />;
        }

        let searchhtml = null;
        if (true || this.state.showsearch) {
            searchhtml = <div className="col-sm-4 col-md-3 searchcont bg-light">
                <form onSubmit={this.handleSearchSubmit} className="searchform1 form-inline mt-1 mb-1">
                    <div className="input-group mb-1">
                        <input type="search" className="form-control" onChange={this.handleChange} title="Find People by Name, Location, Profession etc." name="searchtext" id="search-input" placeholder="Find People by Name, Location, Profession etc" aria-label="Search for..."
                            autoComplete="off" spellCheck="false" aria-describedby="button-addon2" />
                        <button className="btn" type="submit" id="button-addon2"><img src="/icons/search.svg" alt="" width="24" height="24" title="Search People" /></button>
                    </div>

                </form>
                {this.renderPeopleList()}
            </div>;
        }

        return (
            <React.Fragment>
                <div className="container">
                    <div className="row">
                        {searchhtml}
                        {loading}
                        <div className="col-sm-8 col-md-9 p-0">
                            {personchatorprofile}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

class PersonChat extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        let p = this.props.person;

        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: this.props.myself !== undefined ? this.props.myself : null, bsstyle: '', message: '', person: p, filestoupload: [],
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"), textinput: '', dummy: Date.now(),
            videoCapable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            peerCapable: SimplePeer.WEBRTC_SUPPORT, videoplaying: false, audioplaying: false, showemojimodal: false, peerconnected: false,
            profiletoshow: null, showprofilemodal: false
        };
        this.mystream = null;
        this.otherstream = null;
        this.peer = null;
        this.checkPersonPulseInterval = null;
        this.messages = (localStorage.getItem(p.id) !== null) ? new Map(JSON.parse(localStorage.getItem(p.id))) : new Map();
        this.hubConnection = null;
        this.freader = new FileReader();
        this.handleChange = this.handleChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.startHub = this.startHub.bind(this);
        this.createPeer = this.createPeer.bind(this);
        this.onPeerSignal = this.onPeerSignal.bind(this);
        this.onPeerConnect = this.onPeerConnect.bind(this);
        this.onPeerClose = this.onPeerClose.bind(this);
        this.onPeerError = this.onPeerError.bind(this);
        this.onPeerStream = this.onPeerStream.bind(this);
        this.handleVideoToggle = this.handleVideoToggle.bind(this);
        this.handleAudioToggle = this.handleAudioToggle.bind(this);
        this.getUserCam = this.getUserCam.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.sayHello = this.sayHello.bind(this);
        this.answerHello = this.answerHello.bind(this);
        this.saysHello = this.saysHello.bind(this);
        this.updateReceivedMessageStatusAll = this.updateReceivedMessageStatusAll.bind(this);
        this.handleVideoCancel = this.handleVideoCancel.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
        this.handleEmojiModal = this.handleEmojiModal.bind(this);
        this.handleEmojiSelect = this.handleEmojiSelect.bind(this);
        this.handlePhotoClick = this.handlePhotoClick.bind(this);
        this.handleDocClick = this.handleDocClick.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleFileChunkUpload = this.handleFileChunkUpload.bind(this);
        this.processFileUpload = this.processFileUpload.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.checkPersonPulse = this.checkPersonPulse.bind(this);
        this.attachMyStreamToVideo = this.attachMyStreamToVideo.bind(this);
        this.attachOtherStreamToVideo = this.attachOtherStreamToVideo.bind(this);
        this.hubConnectionClosed = this.hubConnectionClosed.bind(this);
        this.hubConnectionReconnecting = this.hubConnectionReconnecting.bind(this);
        this.hubConnectionReconnected = this.hubConnectionReconnected.bind(this);
        this.handleProfileModalClose = this.handleProfileModalClose.bind(this);
        this.handleProfileImageClick = this.handleProfileImageClick.bind(this);
        this.deleteMyMessagesFromServer = this.deleteMyMessagesFromServer.bind(this);
        this.updateTextInputHeight = this.updateTextInputHeight.bind(this);
        this.fetchSentMessages = this.fetchSentMessages.bind(this);
        this.setMessageStatus = this.setMessageStatus.bind(this);
        this.setContactRelation = this.setContactRelation.bind(this);
        this.handleAddToContacts = this.handleAddToContacts.bind(this);
        this.handleBlockandRemove = this.handleBlockandRemove.bind(this);
        this.messageStatusEnum = {
            Pending: 0,
            Sent: 1,
            Received: 2,
            Seen: 3
        }
    }

    hubConnectionClosed(err) {
        console.log("Hub connection is closed");

        //this.hubConnection.start().then(() => {
        //    console.log('Hub Connection started!');
        //    //join meeting room
        //    //this.sayHello();
        //}).catch(err => console.log('Error while establishing connection :('));
    }

    hubConnectionReconnecting(err) {
        console.log("Hub connection is reconnecting");
    }

    hubConnectionReconnected(connectionid) {
        console.log("Hub Connection Reconnected, Check for sent messages on server");
        this.fetchSentMessages();
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
                    let contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ?
                        new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    if (contactlist.get(this.state.person.id) !== undefined) {
                        contactlist.get(this.state.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    }

                    if (data.boloRelation === BoloRelationType.Blocked) {
                        try {
                            this.props.handleShowSearch(true);
                        } catch (err) {
                            console.log("Error in blocking and removing contact. " + err);
                        }
                    }
                });
            }
        });
    }

    //
    //Function fetches sent messages from server
    //can be called when signarl hub reconnects or the component is loaded for first time
    //
    fetchSentMessages() {
        fetch('//' + window.location.host + '/api/ChatMessages/SentMessages?sender=' + this.state.person.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    for (var k in data) {
                        if (!this.messages.has(data[k].id)) {
                            var temp = data[k];
                            var mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: this.messageStatusEnum.Received };
                            this.messages.set(mi.id, mi);
                            //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
                            //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({ dummy: Date.now() }, () => {
                        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                    });
                });
            }
        });
    }

    fetchMessages() {
        fetch('//' + window.location.host + '/api/ChatMessages?sender=' + this.state.person.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.messages = new Map();
                    for (var k in data) {
                        var temp = data[k];
                        var mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: this.messageStatusEnum.Received };
                        this.messages.set(mi.id, mi);
                        if (temp.status != this.messageStatusEnum.Received) {
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({ dummy: Date.now() }, () => {
                        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                        this.scrollToBottom();

                    });
                    this.updateReceivedMessageStatusAll();
                });
            }
        });
    }

    setMessageStatus(mid, action) {
        fetch('//' + window.location.host + '/api/ChatMessages/' + action + '?mid=' + mid, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        });
    }

    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //send a hello
            this.sayHello();
        }).catch(err => console.log('Error while establishing connection :('));

        this.hubConnection.onclose(this.hubConnectionClosed);

        this.hubConnection.onreconnecting(this.hubConnectionReconnecting);

        this.hubConnection.onreconnected(this.hubConnectionReconnected);

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            this.receiveTextMessage(sender, text, timestamp, id);
        });

        this.hubConnection.on('MessageSent', (receiver, text, timestamp, id) => {
            var mi = { id: id, sender: this.state.myself.id, text: text, timestamp: timestamp, status: this.messageStatusEnum.Sent };
            //try to add sent message to current message list
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase()) {
                this.messages.set(id, mi);
                this.setState({ dummy: Date.now() }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
                this.scrollToBottom();
            }

        });

        this.hubConnection.on('MessageStatus', (messageid, receiver, status) => {
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase() && this.messages.get(messageid) !== undefined) {
                this.messages.get(messageid).status = status;
                this.setState({ dummy: Date.now() }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
            }
        });

        this.hubConnection.on('ContactSaved', (cdto) => {
            let contactmap = new Map();
            if (localStorage.getItem("contacts") !== null) {
                contactmap = new Map(JSON.parse(localStorage.getItem("contacts")));
            }
            contactmap.set(cdto.person.id, cdto);
            localStorage.setItem("contacts", JSON.stringify(Array.from(contactmap)));
        });

        //this function is strictly call by server to transfer webrtc peer data
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            //console.log("receivesignal sender : " + sender);
            //console.log("receivesignal data : " + data);
            if (this.peer !== null) {
                this.peer.signal(data);
            }
        });

        this.hubConnection.on('SaysHello', (caller) => {
            console.log("SaysHello By : " + caller);
            this.saysHello(caller);
        });

        this.hubConnection.on('AnswerHello', (responder) => {
            console.log("Call Answered By : " + responder);
            this.answerHello(responder);
        });

        this.hubConnection.on('EndPeer', (id) => {
            if (this.state.person.id.toLowerCase() === id.toLowerCase()) {
                if (this.peer !== null) {
                    this.peer.destroy();
                    this.peer = null;
                    console.log("EndPeer By : " + id);
                }
            }
        });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ContactUpdated', (dto) => {
            if (this.state.person.id === dto.id) {
                this.setState({ person: dto });
            }
        });
    }

    receiveTextMessage(sender, text, timestamp, id) {
        var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: this.messageStatusEnum.Seen };
        //if received message is from current person then show in ui else save in localstorage
        if (sender.toLowerCase() === this.state.person.id.toLowerCase()) {
            this.messages.set(id, mi);
            this.setState({ dummy: Date.now() }, () => {

                localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
            });

            this.scrollToBottom();
            this.props.updateParent("updatemessageseen", { id: sender });
            this.playmsgbeep();

            this.setMessageStatus(mi.id, "SetSeen");

        }
    }

    //say hello when hub connection is established, this will begin a handshake which will
    //eventually lead to rtc peer connection
    sayHello() {
        this.hubConnection.invoke("sayHello", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => { console.log("Unable to say hello."); console.error(err); })
    }

    //catch the hello other user sent and answer it.
    //main purpose of this function is to notify that your are here to 
    //receive peer connection
    saysHello(caller) {
        if (caller.toLowerCase() === this.state.person.id.toLowerCase()) {
            this.createPeer(true);
            //answer hello by provided your id
            this.hubConnection.invoke("AnswerHello", caller, this.state.myself.id.toLowerCase());
        }
    }

    answerHello(responder) {
        //check if answer to your hello came from the person your are chating at present
        if (this.state.person.id === responder.toLowerCase()) {

            //try create a peer connection
            this.createPeer(false);
        }
    }

    sendTextMessage(text, sendto) {
        if (text.trim() !== "") {
            //this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, this.state.textinput)
            //    .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            const fd = new FormData();
            fd.set("Text", text);
            fd.set("SentTo", sendto);
            fd.set("PublicID", "00000000-0000-0000-0000-000000000000");
            fetch('//' + window.location.host + '/api/ChatMessages', {
                method: 'post',
                body: fd,
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
                            //if message is successfully saved in database then you will have id here 
                            console.log(data);
                            var mi = { id: data.id, sender: this.state.myself.id, text: data.message, timestamp: data.sentDate, status: this.messageStatusEnum.Sent };
                            //try to add sent message to current message list
                            this.messages.set(mi.id, mi);
                            this.setState({ dummy: Date.now() }, () => {
                                localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                                this.updateTextInputHeight();
                            });
                            this.scrollToBottom();
                        });

                    } else {
                        this.setState({ loading: false, message: 'Unable to send message', bsstyle: 'danger' });
                    }
                });

            if (this.detectXtralargeScreen()) {
                this.textinput.focus();
            }

        }
    }

    //function checks if person has not send pulse for last 5 seconds then deem person offline
    checkPersonPulse() {
        var dt = new Date(this.state.person.lastPulse);
        dt.setSeconds(dt.getSeconds() + 5);
        if (dt < Date.now()) {
            let p = this.state.person;
            p.activity = 5;
            this.setState({ person: p })
        }
    }

    detectEdgeorIE() {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        return (isIE || isEdge);
    }

    detectXtralargeScreen() {
        return window.matchMedia("(min-width: 1024px)").matches;
    }

    createPeer(initiater) {
        //RTC Peer configuration
        let configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        if (window.location.hostname.toLowerCase() === "localhost") {
            configuration = {};
        }
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        this.peer = new SimplePeer({ initiator: initiater, config: configuration, stream: this.mystream });
        //this.peer["cid"] = u.connectionID;
        //this.peer["hubConnection"] = this.hubConnection;
        //this.peer["myself"] = this.myself;

        //set peer event handlers
        this.peer.on("error", this.onPeerError);
        this.peer.on("signal", this.onPeerSignal);
        this.peer.on("connect", this.onPeerConnect);
        this.peer.on("close", this.onPeerClose);
        this.peer.on("stream", stream => { this.onPeerStream(stream); });
        this.peer.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data)
        });
    }

    /**
     * Simple Peer events
     * 
     */
    onPeerSignal(data) {
        this.hubConnection
            .invoke('SendSignal', data, this.state.person.id, this.state.myself.id)
            .catch(err => console.error('SendSignal ' + err));
    }

    onPeerConnect() {
        this.peer.send(this.state.myself.name + ' peer connected.');
    }

    onPeerError(err) {
        console.log(this.state.person.name + " peer gave error. ");
        console.error(err);
    }

    onPeerClose() {
        console.log("Peer Closed");
        this.hubConnection.invoke("EndPeer", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => console.error('Endpeer ' + err));
    }

    onPeerStream(stream) {
        console.log("received a stream"); console.log(stream);
        this.otherstream = stream;
        //update state so that UI changes
        this.setState({ dummydate: Date.now() }, () => {
            let v = document.getElementById('othervideo');
            if (v !== null) {
                if ('srcObject' in v) {
                    v.srcObject = this.otherstream
                } else {
                    v.src = window.URL.createObjectURL(this.otherstream) // for older browsers
                }
                v.muted = false;
                v.volume = 0.8;
                v.play();
            }
        });
    }
    //simple peer events end here

    playmsgbeep() {
        try {
            let cb = document.getElementById("chatbeep");
            if (cb != null) {
                cb.currentTime = 0;
                cb.volume = 0.15;
                //we have to unmute the audio since it  is muted at time of loading
                cb.muted = false;
                cb.play();
            }
        } catch (err) {
            console.error(err);
        }
    }

    //call this function to gain access to camera and microphone
    getUserCam() {
        //config 
        var videoconst = true;
        //if (window.matchMedia("(max-width: 414px) and (orientation: portrait)").matches) {
        //    videoconst = {
        //        width: {
        //            min: 375
        //        },
        //        height: {
        //            min: 740
        //        }
        //    };
        //}
        var constraints = {
            audio: true, video: videoconst
        };
        //simple feature avialability check
        if (navigator.mediaDevices.getUserMedia) {
            //try to gain access and then take appropriate action
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(this.addMedia)
                .catch(this.userMediaError); // always check for errors at the end.
        }
    }

    //assign media stream received from getusermedia to my video 
    addMedia(stream) {
        //save stream in global variable 
        this.mystream = stream;
        //update state so that myvideo element can be added to dom and then manipulated
        this.setState({ dummydate: new Date() }, () => {
            this.attachMyStreamToVideo();
        });

        //based on initial state enable or disable video and audio
        //initially video will be disabled or micrphone will broadcast
        if (this.mystream.getVideoTracks().length > 0) {
            this.mystream.getVideoTracks()[0].enabled = this.state.videoplaying;
        }
        if (this.mystream.getAudioTracks().length > 0) {
            this.mystream.getAudioTracks()[0].enabled = this.state.audioplaying;
        }

        //set stream to all existing peers
        if (this.peer !== null) {
            this.peer.addStream(this.mystream);
        }
    }

    attachMyStreamToVideo() {
        if (this.state.videoplaying || this.state.audioplaying) {
            var video = document.getElementById('myvideo');
            if (video !== null) {
                video.srcObject = this.mystream;
                //only play when meta data is loaded from stream
                video.onloadedmetadata = function (e) {
                    if (video !== undefined) {
                        //provision to reduce echoe
                        //mute the self video
                        video.volume = 0;
                        video.muted = 0;

                        //start playing the video
                        video.play();
                    }
                };
            }
        }
    }

    attachOtherStreamToVideo() {
        var video = document.getElementById('othervideo');
        if (video !== null) {
            video.srcObject = this.otherstream;
            //only play when meta data is loaded from stream
            video.onloadedmetadata = function (e) {
                if (video !== undefined) {
                    //provision to reduce echoe
                    //mute the self video
                    video.volume = 0;
                    video.muted = 0;

                    //start playing the video
                    video.play();
                }
            };
        }
    }

    //handle error when trying to get usermedia. This may be raised when user does not allow access to camera and microphone
    userMediaError(err) {
        console.log("Unable to access user media");
        console.error(err);
        if (err.name !== undefined && err.name !== null) {
            if (err.name.toLowerCase() === "notallowederror") {
                alert("You have specifically denied access to camera and microphone. Please check browser title or address bar to see the notification.");
            } else {
                alert("Unable to access camera.");
            }
        }
        this.setState({ videoplaying: false, audioplaying: false });
        //dont know if user should be updated or not
        //this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
    }

    closeVideo() {
        if (this.mystream !== null) {
            //const tracks = this.mystream.getTracks()
            //for(var i = 0; i < tracks.length; i++) {
            //    tracks[i].stop();
            //}
        }
    }

    showMessageStatus(status) {
        switch (status) {
            case this.messageStatusEnum.Received:
                return "Received";
            case this.messageStatusEnum.Sent:
                return "Sent"
            case this.messageStatusEnum.Seen:
                //return "Received";
                return "Seen";
            default:
                return "";
        }
    }

    //function only update message status of any messages from the sender with sent status to received in localstorage
    //it will be responsbility of sender to get updated status from received
    updateReceivedMessageStatusAll() {
        for (const [key, mi] of this.messages.entries()) {
            if (mi.sender !== this.state.myself.id && mi.status !== this.messageStatusEnum.Seen) {
                this.messages.get(key).status = this.messageStatusEnum.Seen;
                this.setMessageStatus(mi.id, "SetSeen");
            }
        }
        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
    }

    deleteMyMessagesFromServer() {
        fetch('//' + window.location.host + '/api/chatmessages/MemberMessages/' + this.state.person.id, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                console.log("messages deleted from server");
            }
        });
    }

    processFileUpload() {
        let m = null;
        if (this.state.filestoupload.length > 0) {
            m = this.state.filestoupload[0];
        }


        if (m !== null) {
            this.freader = new FileReader();
            this.freader.uploadFile = this.uploadFile;
            this.uploadFile(this.state.id, m, 0);
        }
    }

    uploadFile(meetingid, msg, start) {
        const slice_size = 1000 * 1024;
        var next_slice = start + slice_size + 1;
        var blob = msg.filedata.slice(start, next_slice);
        var mid = meetingid;
        this.freader.onloadend = event => {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }
            this.handleFileChunkUpload(event.target.result, msg, start, next_slice, slice_size);
        };

        this.freader.readAsDataURL(blob);
    }

    updateTextInputHeight() {
        if (this.state.textinput !== "") {
            // Reset field height
            //this.textinput.style.height = 'inherit';

            // Get the computed styles for the element
            const computed = window.getComputedStyle(this.textinput);

            // Calculate the height
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + this.textinput.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

            //this.textinput.style.height = `${height}px`;

            this.textinput.style.height = `${this.textinput.scrollHeight}px`;
        } else {
            this.textinput.style.height = "40px";
            this.textinput.style.minHeight = "40px";
        }
    }

    handleFileChunkUpload(data, msg, start, next_slice, slice_size) {

        const fd = new FormData();
        fd.set("f", data);
        fd.set("filename", msg.name);
        fd.set("gfn", false);
        //no need to change file name on server
        //fd.set("filename", start === 0 ? msg.name : msg.serverfname);
        //fd.set("gfn", start === 0 ? true : false);
        fetch('//' + window.location.host + '/api/members/uploadfile', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {

                response.json().then(data => {
                    msg.serverfname = data.filename;
                    let flist = this.state.filestoupload;
                    for (var i = 0; flist.length > i; i++) {
                        let cfile = flist[i];
                        if (cfile.name === msg.name) {
                            var size_done = start + slice_size;
                            msg.progresspercent = Math.floor((size_done / msg.filedata.size) * 100);
                            cfile.progresspercent = msg.progresspercent;
                            if (next_slice > msg.filedata.size) {
                                flist.splice(i, 1);
                                msg.filedata = null;
                                //this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, 'https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname)
                                //    .catch(err => { console.log("Unable to send file to other person."); console.error(err); });
                                this.sendTextMessage('https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname, this.state.person.id);
                                this.setState({ filestoupload: flist });
                                this.generateVideoThumbnail(msg.serverfname);

                                this.processFileUpload();
                            } else {
                                this.setState({ filestoupload: flist });
                                //if there is more to file than call upload file again
                                this.uploadFile(this.state.id, msg, next_slice);
                            }
                            break;
                        }
                    }
                });

            }
        });
    }

    generateVideoThumbnail(filename) {
        fetch('//' + window.location.host + '/api/members/GenerateThumbnail?filename=' + filename, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
    }

    handlePhotoClick(e) {
        e.preventDefault();
        if (!this.state.loggedin) {
            alert("Log in to use this feature. Share files upto 300 MB in size.");
        } else {
            this.fileinput.click();
        }
    }

    handleDocClick(e) {
        e.preventDefault();
        if (!this.state.loggedin) {
            alert("Log in to use this feature. Share files upto 300 MB in size.");
        } else {
            this.fileinput.click();
        }
    }

    handleFileUploadCancel(event, fname) {
        //remove the targeted file
        let flist = this.state.filestoupload;
        for (var i = 0; flist.length > i; i++) {
            let cfile = flist[i];
            if (cfile.name === fname) {
                flist.splice(i, 1);
                //cfile.cancel = true;
                this.setState({ filestoupload: flist });
                break;
            }
        }
    }

    handleFileInput(e) {

        //alert("Soon you will be able to share files.");
        //return;
        if (this.fileinput.files.length > 10) {
            alert("Only 10 files at a time.");
            return;
        }
        for (var i = 0; i < this.fileinput.files.length; i++) {
            if ((this.fileinput.files[i].size / 1048576).toFixed(1) > 300) {
                alert("File size cannot exceed 300 MB");
                return;
            }
        }

        let flist = this.state.filestoupload;
        for (var i = 0; i < this.fileinput.files.length; i++) {
            let f = { name: this.fileinput.files[i].name, filedata: this.fileinput.files[i], progresspercent: 0, serverfname: "", cancel: false };
            flist.push(f);
        }
        this.setState({ filestoupload: flist });

        this.fileinput.value = "";
        this.processFileUpload();
    }

    handleEmojiSelect(value) {
        this.setState({
            textinput: this.state.textinput + value
        });

        this.textinput.focus();
    }

    handleEmojiModal() {
        this.setState({ showemojimodal: !this.state.showemojimodal });
    }

    handleVideoCancel() {
        this.closeVideo();
        this.hubConnection.invoke("EndCall", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => { console.log("Unable to end call."); console.error(err); })
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({
                    textinput: e.target.value
                }, () => { this.updateTextInputHeight(); });

                break;
            default:
        }
    }

    handleSend(e) {
        e.preventDefault();
        this.sendTextMessage(this.state.textinput, this.state.person.id);
        this.setState({ textinput: '' });
    }

    //enable or disable video track of my stream
    handleVideoToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getVideoTracks().length > 0) {
                this.mystream.getVideoTracks()[0].enabled = !this.state.videoplaying;
                this.setState({ videoplaying: !this.state.videoplaying }, () => { this.attachMyStreamToVideo(); });
            }
        } else {
            this.setState({ videoplaying: true, audioplaying: true });
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();

        }
    }
    //enable or disable audio track of my stream
    handleAudioToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getAudioTracks().length > 0) {
                this.mystream.getAudioTracks()[0].enabled = !this.state.audioplaying;
                this.setState({ audioplaying: !this.state.audioplaying }, () => { this.attachMyStreamToVideo(); });
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();
            this.setState({ audioplaying: true });
        }
    }

    scrollToBottom = () => {

        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView();
        }
    }

    handleProfileModalClose() {
        this.setState({ profiletoshow: null, showprofilemodal: false });
    }

    //handle search result item click
    handleProfileImageClick(e) {
        this.setState({ profiletoshow: this.state.person, showprofilemodal: true });
    }

    handleContactRelationshipChange(e) {

    }

    handleAddToContacts() {
        this.setContactRelation(BoloRelationType.Confirmed);
    }

    handleBlockandRemove() {
        this.setContactRelation(BoloRelationType.Blocked);
    }

    componentDidMount() {
        //

        this.fetchMessages();

        this.startHub();

        //this.deleteMyMessagesFromServer();
        this.checkPersonPulseInterval = setInterval(this.checkPersonPulse, 5000);
        //set unseenmessage count of person to zero and save
        let clist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (clist.get(this.state.person.id.toLowerCase()) !== undefined) {
            clist.get(this.state.person.id.toLowerCase()).unseenMessageCount = 0;
        }
        localStorage.setItem("contacts", JSON.stringify(Array.from(clist)));
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log("componentDidUpdate");
        if (prevProps.person.id !== this.props.person.id) {
            this.messages = (localStorage.getItem(this.props.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(this.props.person.id))) : new Map();
            this.setState({ dummy: Date.now(), person: this.props.person }, () => {

                this.fetchMessages();

                this.updateReceivedMessageStatusAll()
            });
            this.props.updateParent("updatemessageseen", { id: this.props.person.id });
            //each time compoment updates scroll to bottom
            //this can be improved by identifying if new messages added
            this.scrollToBottom();
        }

    }

    componentWillUnmount() {

        //destroy peer and signalr connection since the component will unmount
        if (this.peer !== null) {
            this.peer.destroy();
            this.peer = null;
        }
        this.hubConnection.stop();
        if (this.checkPersonPulseInterval !== null) {
            clearInterval(this.checkPersonPulseInterval);
        }
    }

    getFileExtensionBasedName(filename) {
        return filename.substring(61, filename.length);
    }

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <tr><td colSpan="2"><Emoji onSelect={this.handleEmojiSelect} /></td></tr>;
        } else {
            return null;
        }
    }

    renderVideoCallModal() {
        return <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <h4>Waiting For {this.state.person.name}</h4>
                        <button type="button" className="btn btn-danger btn-lg" onClick={this.handleVideoCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>;
    }

    renderLinksInMessage(msg) {
        var tempmid = msg.id;
        if (msg.text.startsWith('https://' + window.location.host + '/data/')) {
            if (msg.text.toLowerCase().endsWith(".jpg") || msg.text.toLowerCase().endsWith(".jpeg") || msg.text.toLowerCase().endsWith(".png") || msg.text.toLowerCase().endsWith(".gif") || msg.text.toLowerCase().endsWith(".bmp")) {
                return <span id={tempmid}>
                    <img src={msg.text} className='img-fluid' style={{ maxWidth: "260px" }} />
                </span>;
            }
            else if (msg.text.toLowerCase().endsWith(".mp3")) {
                return <span id={tempmid}>
                    <audio src={msg.text} controls playsInline style={{ maxWidth: "260px" }} />
                </span>;
            }
            else if (msg.text.toLowerCase().endsWith(".ogg") || msg.text.toLowerCase().endsWith(".mp4") || msg.text.toLowerCase().endsWith(".webm") || msg.text.toLowerCase().endsWith(".mov")) {
                return <span id={tempmid}>
                    <video src={msg.text.toLowerCase()} controls playsInline style={{ maxWidth: "260px" }} />
                </span>;
            }
            else {
                return <span id={tempmid}>
                    <a href={msg.text} target="_blank">
                        {this.getFileExtensionBasedName(msg.text.toLowerCase())}
                    </a>
                </span>;
            }
        }
        else if ((msg.text.startsWith('https://') || msg.text.startsWith('http://')) && msg.text.trim().indexOf(" ") === -1) {
            return <span id={tempmid}>
                <a href={msg.text.trim()} target="_blank">
                    {msg.text}
                </a>
            </span>;
        }
        else {
            return <span id={tempmid}>{msg.text.split('\n').map((item, key) => {
                return <React.Fragment key={key}>{item}<br /></React.Fragment>
            })}</span>
        }
    }

    renderContactRelationChange() {
        let html = null;
        let contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        let style = {
            margin: "0 auto", maxWidth: "80%", width: "25rem", padding: "15px"
        };
        if (contactlist.get(this.state.person.id) !== undefined) {
            if (contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Temporary) {
                html = <li style={style} >
                    <div className="card bg-light mb-3">
                        <div className="card-header">New Contact</div>
                        <div className="card-body">
                            <h5 className="card-title">Take Action Here</h5>
                            <p className="card-text">This person is not your contact list.</p>
                            <button className="btn btn-success me-2" onClick={this.handleAddToContacts}>Add to Contacts</button>
                            <button className="btn btn-outline-dark" onClick={this.handleBlockandRemove}>Block and Remove</button>
                        </div>
                    </div>
                </li>;
            }
        }

        return html;
    }

    renderMessages() {
        let sentlistyle = { display: "block", textAlign: 'right' };
        let reclistyle = { display: "block", textAlign: 'left' };
        let sentmessagestyle = {
            marginBottom: "1px", maxWidth: "100%", position: "relative",

            fontSize: "1.2rem",
            //border: "none",
            borderRadius: "0rem",
            //color: "#000",
            //backgroundColor: "#DBF4FD",
            wordWrap: "break-word"
        };
        let recmessagestyle = {
            marginBottom: "1px", maxWidth: "100%", position: "relative",
            //border: "none",
            borderRadius: "0rem",
            fontSize: "1.2rem",
            //color: "#000",
            //backgroundColor: "#F2F6F9",
            wordWrap: "break-word"
        };
        const items = [];
        for (const [key, obj] of this.messages.entries()) {
            if (obj.sender === this.state.myself.id) {
                items.push(<li style={sentlistyle} key={key}>
                    <div style={sentmessagestyle} className="border-end border-5 border-primary m-1 pe-3 py-2">
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment.utc(obj.timestamp).local().fromNow(true)}</small> <small style={{ fontSize: "0.75rem" }}>{this.showMessageStatus(obj.status)}</small></span>
                    </div>
                </li>);
            } else {
                items.push(<li style={reclistyle} key={key}>
                    <div style={recmessagestyle} className="border-start border-5 border-success m-1 ps-3 py-2">
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment.utc(obj.timestamp).local().fromNow(true)}</small></span>
                    </div>
                </li>);
            }
        }

        return <React.Fragment>
            {items}
            {this.renderContactRelationChange()}
            <li style={{ float: "left", clear: "both" }}
                ref={(el) => { this.messagesEnd = el; }}>
            </li>
        </React.Fragment>;
    }

    renderVideo() {
        let myvideoclassname = "full";
        let othervideo = null, myvideo = null;
        let hasstream = false;
        if (this.otherstream !== null) {
            for (var i = 0; i < this.otherstream.getTracks().length; i++) {
                if (this.otherstream.getTracks()[i].enabled) {
                    hasstream = true;
                    break;
                }
            }
            if (hasstream) {
                myvideoclassname = "docked";
                othervideo = <video id="othervideo" muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight: "70vh" }}></video>;
            }
        }
        if (this.mystream !== null) {
            hasstream = false;
            for (var i = 0; i < this.mystream.getTracks().length; i++) {
                if (this.mystream.getTracks()[i].enabled) {
                    hasstream = true;
                    break;
                }
            }
            if (hasstream) {
                myvideo = <video id="myvideo" className={myvideoclassname} muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight: "70vh" }}></video>;
            }
        }

        if (othervideo !== null || myvideo !== null) {
            return <div className="col col-sm-7 videochatcolumn" style={{ padding: "0px 5px", textAlign: "center" }}>
                {othervideo}
                {myvideo}
            </div>;
        } else {
            return null;
        }
    }

    renderFileUploadProcessModal() {
        let items = [];
        for (var i = 0; i < this.state.filestoupload.length; i++) {
            let f = this.state.filestoupload[i];
            items.push(
                <div className="row" key={i}>
                    <div className="col-9 col-xl-10 col-sm-10">
                        <div className="progress">
                            <div className="progress-bar progress-bar-animated" role="progressbar" aria-valuenow={f.progresspercent} aria-valuemin="0" aria-valuemax="100" style={{ width: f.progresspercent + "%" }}></div>
                        </div>
                    </div>
                    <div className="col-3 col-xl-2 col-sm-2"><button type="button" className="btn btn-sm btn-light" onClick={(e) => this.handleFileUploadCancel(e, f.name)}>Cancel</button></div>
                </div>
            );
        }
        if (this.state.filestoupload.length > 0) {
            return (
                <React.Fragment>
                    <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    {items}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    render() {
        if (this.messages.length == 0) { profile = <ViewProfile profile={this.state.person} />; }
        let pic = <img src="/images/nopic.jpg" className="mx-auto d-block img-fluid" alt="No Pic" style={{ cursor: "pointer" }} onClick={this.handleProfileImageClick} />;
        if (this.state.person !== null) {
            if (this.state.person.pic !== "") {
                pic = <img src={this.state.person.pic} className="mx-auto d-block img-fluid" alt="" style={{ cursor: "pointer" }} onClick={this.handleProfileImageClick} />;
            }
        }

        let personprofile = null;
        if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={this.state.person} />
                        </div>
                    </div>
                </div>
            </div>;
        }

        let videotoggleele = this.state.videoplaying ? <button type="button" className="btn btn-sm btn-primary ms-1 me-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video On" />
        </button> : <button type="button" className="btn btn-secondary btn-sm ms-1 me-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video Off" />
        </button>;
        let audiotoggleele = this.state.audioplaying ?
            <button type="button" className="btn btn-primary btn-sm ms-1 me-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()}>
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone On" />
            </button>
            : <button type="button" className="btn btn-secondary btn-sm ms-1 me-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()} >
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone Off" />
            </button>;
        //if browser is edge or ie no need to show video or audio control button
        if (this.detectEdgeorIE()) {
            audiotoggleele = null;
            videotoggleele = null;
        }
        let online = <span className="offline"></span>;
        if (this.state.person.activity !== 5) {
            online = <span className="online"></span>;
        }
        let videohtml = this.renderVideo();
        let chatmsgcontstyle = {};
        if (videohtml === null && this.detectXtralargeScreen()) {
            chatmsgcontstyle = { padding: "0px" };
        }
        return (
            <React.Fragment>
                <div className="personalchatcont">
                    <table className="chatpersoninfocont sticky-top">
                        <tbody>
                            <tr>
                                <td width="40px" className="p-1">
                                    {pic}
                                </td>
                                <td className="noPadding">
                                    <h5 className="ml-1" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={this.state.person.name}>{online} {this.state.person.name}</h5>
                                </td>
                                <td width="50px" style={{ paddingRight: "10px" }}>
                                    <BlockContact myself={this.state.myself} person={this.state.person} onRelationshipChange={this.handleContactRelationshipChange} />
                                </td>
                                <td width="37px">
                                    {videotoggleele}
                                </td><td width="37px">
                                    {audiotoggleele}
                                </td>

                            </tr>
                        </tbody>
                    </table>
                    <div className="videochatcont ">

                        {videohtml}
                        <div className="chatmsgcont" style={chatmsgcontstyle}>
                            <ul className="list-unstyled">{this.renderMessages()}</ul>
                        </div>

                    </div>
                    <div style={{ position: "absolute", bottom: "0px", width: "100%" }}>
                        <form onSubmit={this.handleSend}>
                            <table style={{ "width": "100%", backgroundColor: "#fff" }}>
                                <tbody>
                                    <tr>
                                        <td style={{
                                            width: "37px", paddingLeft: "5px"
                                        }}>
                                            <div className="dropdown">
                                                <a className="btn btn-light btn-sm dropdown-toggle" href="#" role="button" id="navbarDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <img src="/icons/file-plus.svg" alt="" width="24" height="24" title="Share Files" />
                                                </a>
                                                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                                    <li>
                                                        <a className="dropdown-item" href="#" onClick={this.handlePhotoClick} title="20 Files at a time, max files size 10 MB">Photos and Videos</a>
                                                    </li>
                                                    <li><a className="dropdown-item" href="#" onClick={this.handleDocClick} title="20 Files at a time, max files size 10 MB">Documents</a>
                                                        <input type="file" style={{ display: "none" }} ref={(el) => { this.fileinput = el; }} accept=".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*" onChange={this.handleFileInput} multiple="multiple" />
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                        <td >
                                            <textarea ref={(input) => { this.textinput = input; }} name="textinput" autoComplete="off" accessKey="t" title="Keyboard Shortcut ALT + t"
                                                className="form-control" value={this.state.textinput} onChange={this.handleChange} width="100%"
                                                style={{ height: "40px", overflow: "hidden", resize: "none", maxHeight: "200px" }}></textarea>
                                        </td><td style={{ "width": "100px" }}>
                                            <button type="button" className={this.state.showemojimodal ? "btn btn-sm btn-warning ms-1" : "btn btn-sm btn-light ms-1"} onClick={this.handleEmojiModal} accessKey="o" title="Keyboard Shortcut ALT + o" ><img src="/icons/smile.svg" alt="" width="24" height="24" /></button>
                                            <button type="submit" id="msgsubmit" className="btn btn-sm btn-dark ms-1" title="Send Message" title="Keyboard Shortcut ALT + s" accessKey="s"><img src="/icons/send.svg" alt="" width="24" height="24" /></button>
                                        </td>
                                    </tr>
                                    {this.renderEmojiModal()}
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>
                {personprofile}
                {this.renderFileUploadProcessModal()}
                <audio id="chatbeep" muted="muted" volume="0">
                    <source src="/media/swiftly.mp3"></source>
                    <source src="/media/swiftly.m4r"></source>
                    <source src="/media/swiftly.ogg"></source>
                </audio>
                <HeartBeat activity="4" interval="3000" />
            </React.Fragment >
        );
    }
}

class UserInfo {
    //this guid used by bolo to publicly identify a user
    memberID;
    //this is connection id generated by signalr
    connectionID;
    //name of the user its provided by user.
    name;
    lastpulse;
    //has video capability
    videoCapable;
    //has rtcpeer capability
    peerCapable;
    stream;
    pic;
    bio;

    constructor() {
        this.memberID = "00000000-0000-0000-0000-000000000000";
        this.connectionID = "";
        this.name = "";
        this.lastpulse = Date.now();
        this.videoCapable = true;
        this.peerCapable = true;
        this.stream = null;
        this.pic = "";
    }

    isAlive() {
        var dt = new Date(this.lastpulse);
        dt.setSeconds(dt.getSeconds() + 40);

        if (dt < Date.now()) {
            return false;
        } else {
            return true;
        }
    }
}

var MessageEnum = {
    Text: 1,
    MemberAdd: 2,
    MemberLeave: 3,
    File: 4
}

var BoloRelationType =
{
    Temporary: 1,
    Confirmed: 2,
    Search: 3,
    Blocked: 4
}

var MessageStatusEnum = {
    notify: 0,
    inqueue: 1,
    inprogress: 2,
    ready: 5,
    sent: 3,
    error: 4
}

class MessageInfo {
    //user info of who sent the message
    sender;
    //when it was sent
    timeStamp;
    //type of message info, MessageEnum
    type;
    //message body 
    text;
    status;
    progresspercent;
    file;

    constructor() {
        this.progresspercent = 0;
        this.status = MessageStatusEnum.inprogress;
        this.file = null;
    }
}
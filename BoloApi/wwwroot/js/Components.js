class IgnoredUsers extends React.Component {
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
            q: '', items: []
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/Ignored?q=' + this.state.q;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({ loggedin: true, loading: false, items: data });
                });
            }
        });
    };

    removeMember = (userid) => {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/Ignored/remove/' + userid;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                response.text().then(data => {
                    console.log(data);
                    if (data === "true") {
                        this.setState({ loading: false, items: this.state.items.filter(t => t.id !== userid) });
                    }
                });
            }
        });
    }
    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} /></div>
            </div>;
        }

        let temp = [];
        for (let k in this.state.items) {
            temp.push(<table key={this.state.items[k].id} className="w-100 mb-2 border-bottom" cellPadding="0" cellSpacing="0">
                <tbody>
                    <tr>
                        <td width="45px" className="p-1" align="center" valign="middle">
                            <MemberPicSmall member={this.state.items[k]} />
                        </td>
                        <td>
                            <a href={'//' + window.location.host + '/profile?un=' + this.state.items[k].userName} className="text-dark text-decoration-none">
                                {this.state.items[k].userName}
                            </a>
                        </td>
                        <td width="100px" align="right">
                            <button className="btn btn-secondary" data-userid={this.state.items[k].id} onClick={(e) => { this.removeMember(e.target.getAttribute("data-userid")) }} type="button">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>)
        }
        if (temp.length === 0) {
            temp.push(<table className="w-100 mb-1" cellPadding="0" cellSpacing="0">
                <tbody>
                    <tr>
                        <td align="center" valign="middle">
                            No ignored members found.
                        </td>
                    </tr>
                </tbody>
            </table>)
        }
        return <div>{temp}</div>;

    }
}

class App extends React.Component {

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
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), search: this.props.search !== "" ? this.props.search : "userfeed"
        };
    }

    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} /></div>
            </div>;
        }

        return <div className="row">
            <div className="col-lg-8">
                <MemberPostList search={this.state.search} viewMode={2} viewModeAllowed="false" />
            </div>
            <div className="col-lg-4">
                <AskPushNotification />
                <div className="p-2 rightsidebar">
                    <SendInvite />
                    <SuggestedAccounts />
                </div>
            </div>
        </div>;
    }
}

class Explore extends React.Component {
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
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), search: this.props.search !== "" ? this.props.search : "userfeed"
        };
    }

    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} /></div>
            </div>;
        }

        return <div className="row">
            <div className="col-lg-8">
                <MemberPostList search="explore" viewMode={1} viewModeAllowed="true" />
            </div>
            <div className="col-lg-4">
                <AskPushNotification />
                <div className="p-2 rightsidebar">
                    <SendInvite />
                    <SuggestedAccounts />
                </div>
            </div>
        </div>;
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
                        //console.log(data);
                        this.setState({
                            loggedin: true, loading: false, items: data
                        }, () => { });
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
                        <a className="text-dark fw-bold text-decoration-none" href={'//' + window.location.host + '/?q=%23' + p.hashtag.tag}>#{p.hashtag.tag}</a>
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
            return null;
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
                    <input type="text" className="form-control" value={this.state.q} onChange={(e) => { this.setState({ q: e.target.value }, () => { this.search(); }); }} placeholder="Search People, Topics, Hashtags" maxLength="150" onKeyUp={(e) => {
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

class Post extends React.Component {
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
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), id: this.props.id, post: null
        };
    }

    componentDidMount() {
        this.fetchPost();
    }

    fetchPost = () => {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/post/' + this.state.id;

        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({
                        loading: false, post: data
                    });
                });
            }
        });
    }

    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} /></div>
            </div>;
        }
        if (this.state.post !== null) {
            return <div className="row mt-1 g-0">
                <div className="col-lg-8">
                    <MemberPost post={this.state.post} ondelete={(id) => { this.setState({ post: null }) }} onIgnoredMember={userid => { }} />
                </div>
                <div className="col-lg-4">
                    <div className="p-2 rightsidebar">
                        <AskPushNotification />
                        <SendInvite />
                        <SuggestedAccounts />
                    </div>
                </div>
            </div>;
        } else {
            return <div className="row mt-1 g-0">
                <div className="col-lg-8">
                    {!this.state.loading ? <h1>Incorrect Data, No Post Found.</h1> : ""}
                </div>
                <div className="col-lg-4">
                    <div className="p-2 rightsidebar">
                        <AskPushNotification />
                        <SendInvite />
                        <SuggestedAccounts />
                    </div>
                </div>
            </div>;;
        }
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
            showCommentBox: false, showpostoptions: false, showeditform: false, showdeletemodal: false, showflagmodal: false,
            showModal: '' /*reaction,comment,post,edit,delete,flag,share */, muted: true
        };

        this.addReaction = this.addReaction.bind(this);
        this.sharePost = this.sharePost.bind(this);
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

    editPost = () => {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/post/edit/' + this.state.post.id, {
            method: 'post',
            body: JSON.stringify({ describe: this.state.post.describe, acceptComment: this.state.post.acceptComment, allowShare: this.state.post.allowShare }),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                this.setState({ loading: false, message: '', bsstyle: '', showModal: '' /*showeditform: false, showpostoptions: false*/ });
            } else if (response.status > 400 && response.status < 500) {
                this.setState({ loading: false, message: 'Unable to process request', bsstyle: 'danger' });
            } else {
                try {
                    response.json().then(data => {
                        this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                    });
                } catch (err) {
                    this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                }
            }
        }).catch(() => {
            this.setState({ loading: false, message: 'Unable to contact server', bsstyle: 'danger' });
        });
    }

    removeMessage = () => { this.setState({ bsstyle: '', message: '' }); }

    sharePost(sharewithid) {
        fetch('//' + window.location.host + '/api/post/share/' + this.state.post.id + "?uid=" + sharewithid, {
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
                    this.setState({ loading: false, bsstyle: "success", message: "Post is shared." });
                    setTimeout(this.removeMessage, 1500);
                } else if (response.status === 400 || response.status === 500) {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to process your request', bsstyle: 'danger' });
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

    deletePost = () => {
        fetch('//' + window.location.host + '/api/post/delete/' + this.state.post.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({ loggedin: false, loading: false });
            } else if (response.status === 200) {
                let id = this.state.post.id;
                this.setState({ loading: false, message: '', bsstyle: '', showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, post: null },
                    () => {
                        if (this.props.ondelete !== undefined && this.props.ondelete !== null) {
                            this.props.ondelete(id);
                        }
                    });

            } else if (response.status === 400) {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, loading: false, message: data.error, bsstyle: 'danger' });
                    });
                } catch (err) {
                    this.setState({ showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                }

            } else {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, loading: false, message: data.error, bsstyle: 'danger' });
                    });
                } catch (err) {
                    this.setState({ showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                }

            }
        }).catch((data) => {
            this.setState({ showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/, loading: false, message: 'Unable to contact server', bsstyle: 'danger' });
        });
    }

    ignoreMember = () => {
        fetch('//' + window.location.host + '/api/ignored/' + this.state.post.owner.id, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                response.text().then(data => {
                    //console.log(data);
                    if (data == "false") { } else if (data == "true") {
                        if (this.props.onIgnoredMember !== undefined && this.props.onIgnoredMember !== null) {
                            this.props.onIgnoredMember(this.state.post.owner.id);
                        }
                    }
                });
            }
        });
    }

    flagPost = (typeid) => {
        fetch('//' + window.location.host + '/api/post/flag/' + this.state.post.id + "?type=" + typeid, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                this.setState({ showModal: '' }, () => { alert("Thank you! for reporting the post.") });

            } else {
                this.setState({ showModal: '' }, () => { alert("Unable to process your request") });
            }
        }).catch(() => {
            this.setState({ showModal: '' }, () => { alert("Unable to process your request") });
        });
    }

    renderPostOptions() {
        if (this.state.showModal === "post"/*this.state.showpostoptions*/) {
            let deletebtn = null; let ignoreaccbtn = null, editbtn = null;
            if (this.state.post.owner.id === this.state.myself.id) {
                editbtn = <div className="text-center border-bottom mb-1 p-1"><button type="button" className="btn btn-link btn-lg text-decoration-none text-primary" onClick={() => { this.setState({ showModal: 'edit' /*showdeletemodal: false, showeditform: true, showpostoptions: false*/ }); }}><i className="bi bi-pencil-fill me-2"></i> Edit Post</button></div>;
                deletebtn = <div className="text-center border-bottom mb-1 p-1"><button type="button" className="btn btn-link btn-lg text-decoration-none text-danger" onClick={() => { this.setState({ showModal: 'delete' /*showdeletemodal: true, showeditform: false, showpostoptions: false*/ }); }}><i className="bi bi-trash3-fill  me-2"></i> Delete Post</button></div>;
            }

            if (this.state.post.owner.id !== this.state.myself.id) {
                ignoreaccbtn = <div className="text-center mb-1 p-1">
                    <button type="button" className="btn btn-link btn-lg text-decoration-none text-danger" onClick={() => { this.ignoreMember(); }}><i className="bi bi-sign-stop-fill me-2"></i> Ignore Member</button>
                </div>;
            }
            return <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            {editbtn}
                            {deletebtn}
                            {ignoreaccbtn}
                            <div className="text-center mb-1 p-1">
                                <button type="button" className="btn btn-link btn-lg text-decoration-none text-danger" onClick={() => { this.setState({ showModal: 'flag' /*showflagmodal: true, showdeletemodal: false, showeditform: false, showpostoptions: false*/ }); }}><i className="bi bi-flag-fill me-2"></i> Report Post</button>
                            </div>
                        </div>
                        <div className="modal-footer text-center">
                            <button type="button" className="btn btn-secondary" onClick={() => { this.setState({ showModal: '' /*showpostoptions: false*/ }) }} data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        }
    }

    renderPostDisplay(p) {
        p.describe = p.describe + " ";
        let tempdescribe = p.describe;
        let describe = p.describe;
        let hashtagarr = tempdescribe.replace(/\n/g, " ").split(" ").filter(v => v.startsWith('#'));
        hashtagarr.forEach(function (hashtag) {
            let myExp = new RegExp(hashtag + "\\s", 'g');
            describe = describe.replace(myExp, "<a href='//" + location.host + "/?q=" + encodeURIComponent(hashtag) + "'>" + hashtag + "</a> ");
        });

        let ownerlink = this.state.hashtag !== '' ? <div className="d-inline-block">
            <a href={'//' + window.location.host + '/post/hastag?ht=' + this.state.hashtag} className="fs-6 fw-bold  text-dark text-decoration-none">
                {p.owner.userName}
            </a>
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 text-dark text-decoration-none">
                {p.owner.userName}
            </a>
        </div> :
            <a href={'//' + window.location.host + '/profile?un=' + p.owner.userName} className="fs-6 fw-bold pointer d-inline-block text-dark text-decoration-none">
                {p.owner.userName}
            </a>;
        let owner = <table className="w-100 mb-2" cellPadding="0" cellSpacing="0">
            <tbody>
                <tr>
                    <td width="45px" valign="top">
                        <MemberPicSmall member={p.owner} />
                    </td>
                    <td className="ps-2" valign="top">
                        {ownerlink}
                        <span className="d-block" style={{ fontSize: "0.67rem", lineHeight: "10px" }}>
                            <DateLabel value={p.postDate} />
                        </span>
                    </td>
                    <td width="40px">
                        <button className="btn btn-link text-dark" onClick={() => { this.setState({ showModal: 'post' /*showpostoptions: true*/ }) }}><i className="bi bi-three-dots"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>;
        let postshtml = null;
        if (p.videoURL !== "") {
            postshtml = <div>
                <video src={"//" + location.host + "/" + p.videoURL} className="w-100"></video>
            </div>;
        } else if (p.photos) {
            if (p.photos.length == 1) {
                postshtml = <div className="text-center">
                    <img src={"//" + location.host + "/" + p.photos[0].photo} className="img-fluid w-100" onDoubleClick={() => { this.addReaction(); }} />
                </div>
            } else {
                postshtml = <PhotoCarousel photos={p.photos} postid={p.id} />;
            }
        }

        let commentbox = this.state.showModal === "comment" ? <MemberComment post={p}
            cancel={() => { this.setState({ showModal: '' }); }} onCommentAdded={count => { this.state.post.commentCount = count; this.setState({ post: this.state.post }) }}
            onCommentRemoved={count => { this.state.post.commentCount = count; this.setState({ post: this.state.post }) }} /> : null;

        if (!p.acceptComment)
            commentbox = null;

        let reactionCountHtml = (p.reactionCount > 0) ? <button className="btn btn-link text-dark text-decoration-none fw-bold ps-0" type="button" title="Show Reactions" onClick={() => { this.setState({ showModal: 'reaction'/* showreactionlist: true */ }) }}>{p.reactionCount}</button> : null;
        let reactionhtml = <button type="button" className="btn btn-link fs-4 fw-bold text-dark pe-2 ps-0" onClick={() => { this.addReaction(); }}><i className="bi bi-heart"></i></button>;
        if (p.hasReacted) {
            reactionhtml = <button type="button" className="btn btn-link fs-4 fw-bold text-danger pe-2 ps-0" onClick={() => { this.addReaction(); }}><i className="bi bi-heart-fill"></i></button>;
        }
        let commentBtn = null, commentCountHtml = null;
        if (p.acceptComment) {
            commentCountHtml = p.commentCount > 0 ? <button className="btn btn-link text-dark text-decoration-none fw-bold ps-0" type="button" title="Show Comments" onClick={() => { this.setState({ showModal: 'comment' /*showCommentBox: true*/ }) }}>{p.commentCount}</button> : null;
            commentBtn = <button type="button" className="btn btn-link fs-4 fw-bold text-dark pe-1" onClick={() => { this.setState({ showModal: 'comment' /*showCommentBox: true */ }) }}><i className="bi bi-chat-square-text"></i></button>;
        }
        let shareBtn = null;
        if (p.allowShare) {
            shareBtn = <button type="button" title="Share post with people" className="btn btn-link fs-4 fw-bold text-dark pe-1" onClick={() => { this.setState({ showModal: 'share' }) }}><i className="bi bi-send"></i></button>
        }
        let likemodal = null;
        if (this.state.showModal === "reaction"/*this.state.showreactionlist*/) {
            likemodal = <div className="modal fade show d-block" id={"reactionListModal-" + this.state.post.id} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen-lg-down">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Likes</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showModal: '' /*showreactionlist: false*/ }); }}></button>
                        </div>
                        <div className="modal-body p-1">
                            <MemberSmallList target="reaction" postid={this.state.post.id} />
                        </div>
                    </div>
                </div>
            </div>
        }
        return <div id={this.state.post.id} className="mb-2 border rounded-3 bg-white p-2 p-md-3 memberpost">
            {owner}
            {postshtml}
            <div className="text-center">
                {reactionhtml}{reactionCountHtml} {commentBtn}{commentCountHtml} {shareBtn}
            </div>
            <ExpandableTextLabel cssclass="text-center" text={describe === null ? "" : describe} maxlength={200} />
            {likemodal}
            {commentbox}
            {this.renderPostOptions()}
        </div>;
    }

    renderShareModal() {
        if (this.state.showModal === "share") {
            return <React.Fragment>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" >Share Post with People</h1>
                                <button type="button" className="btn-close" onClick={() => { this.setState({ showModal: '' }) }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <MemberSmallList memberid={this.state.myself.id} target="share" onSelected={(id) => { this.sharePost(id); }}></MemberSmallList>
                            </div>
                            <div className="modal-footer">
                                {this.state.loading ? <div className="progress mb-2" style={{ height: "5px" }}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
                                </div> : null}
                                {this.state.bsstyle === "success" && this.state.message !== "" ? <div className="text-success text-center my-2">{this.state.message}</div> : null}
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment>;
        }
    }

    renderDeleteModal() {
        if (this.state.showModal === "delete"/*this.state.showdeletemodal*/) {
            return <React.Fragment>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" >Delete Post</h1>
                                <button type="button" className="btn-close" onClick={() => { this.setState({ showModal: ''/*showdeletemodal: false, showeditform: false, showpostoptions: false*/ }) }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>You are going to delete this post permanently. Please confirm?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={this.deletePost}>Yes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { this.setState({ showModal: ''/*showdeletemodal: false, showeditform: false, showpostoptions: false*/ }) }}>No</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>;
        }
    }

    renderFlagModal() {
        if (this.state.showModal === "flag"/*this.state.showflagmodal*/) {
            return <React.Fragment>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" >Flag Post</h1>
                                <button type="button" className="btn-close" onClick={() => { this.setState({ showModal: ''/*showdeletemodal: false, showeditform: false, showpostoptions: false, showflagmodal: false*/ }) }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        <button onClick={() => { this.flagPost(1) }} className="btn btn-light" type="button">Abusive Content</button>
                                    </li>
                                    <li className="list-group-item">
                                        <button onClick={() => { this.flagPost(2) }} className="btn btn-light" type="button">Spam Content</button>
                                    </li>
                                    <li className="list-group-item"><button onClick={() => { this.flagPost(3) }} className="btn btn-light" type="button">Fake / Misleading</button></li>
                                    <li className="list-group-item"><button onClick={() => { this.flagPost(4) }} className="btn btn-light" type="button">Nudity</button></li>
                                    <li className="list-group-item"><button onClick={() => { this.flagPost(5) }} className="btn btn-light" type="button">Promoting Violence</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>;
        }
    }

    renderEditModal() {
        if (this.state.showModal === "edit"/*this.state.showeditform*/) {
            let loading = this.state.loading ? <div className="progress my-1" style={{ height: "10px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-label="" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }} ></div>
            </div> : null;
            let message = this.state.message !== "" && this.state.bsstyle === "danger" ? <div className="alert alert-danger" role="alert">
                {this.state.message}
            </div> : null;

            return <React.Fragment><div className="modal d-block" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-body">
                            <EditPost post={this.state.post} onchange={(describe, ac, as) => {
                                let p = this.state.post;
                                p.describe = describe;
                                p.acceptComment = ac;
                                p.allowShare = as;
                                this.setState({ post: p });
                            }} />
                            {loading}
                            {message}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={this.editPost}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => { this.setState({ showModal: ''/*showeditform: false, showpostoptions: false*/ }); }}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
                <div className="modal-backdrop fade show"></div>
            </React.Fragment>;
        }
        return null;
    }

    render() {
        let p = this.state.post;
        if (p === null) return null;

        return <React.Fragment>
            {this.renderPostDisplay(p)}
            {this.renderEditModal()}
            {this.renderDeleteModal()}
            {this.renderFlagModal()}
            {this.renderShareModal()}
        </React.Fragment>;
    }
}

class EditPost extends React.Component {
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
            describe: this.props.post.describe, acceptComment: this.props.post.acceptComment, allowShare: this.props.post.allowShare, rows: 7
        };
    }

    acceptCommentChanged = () => {
        this.setState({ acceptComment: !this.state.acceptComment }, () => { this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare); });
    }
    allowShareChanged = () => {
        this.setState({ allowShare: !this.state.allowShare }, () => { this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare); });
    }
    render() {
        let chk = <input className="form-check-input" type="checkbox" id="acceptcommentchk" role="switch" onChange={this.acceptCommentChanged} />;
        if (this.state.acceptComment)
            chk = <input className="form-check-input" checked type="checkbox" id="acceptcommentchk" role="switch" onChange={this.acceptCommentChanged} />;

        let chk2 = <input className="form-check-input" type="checkbox" id="allowsharechk" role="switch" onChange={this.allowShareChanged} />;
        if (this.state.allowShare)
            chk2 = <input className="form-check-input" checked type="checkbox" id="allowsharechk" role="switch" onChange={this.allowShareChanged} />;
        return <div>
            <div className="mb-3">
                <textarea className="form-control border-0 border-bottom" onChange={(e) => {
                    this.setState({ describe: e.target.value }, () => { this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare) });
                }} value={this.state.describe} rows={this.state.rows} placeholder="Add some description to your photo..." maxlength="7000"></textarea>
            </div>
            <div className="mb-3 ps-3">
                <div className="form-check form-switch">
                    {chk}
                    <label className="form-check-label" htmlFor="acceptcommentchk">Accept comment On Post</label>
                </div>
            </div>
            <div className="mb-3 ps-3">
                <div className="form-check form-switch">
                    {chk2}
                    <label className="form-check-label" htmlFor="allowsharechk">Allow sharing of Post</label>
                </div>
            </div>
        </div>
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
            loadingComments: false, loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post, comments: { current: 0, pageSize: 20, total: 0, commentList: [] },
            commenttext: '', commentiddel: 0, textarearows: 1
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
                    var temp = this.state.comments.commentList;
                    temp.unshift(data);
                    let comments = {
                        current: this.state.comments.current,
                        pageSize: this.state.comments.pageSize,
                        total: this.state.comments.total + 1,
                        totalPages: this.state.comments.totalPages,
                        commentList: temp
                    };
                    this.setState({
                        loading: false, comments, commenttext: ""
                    });
                    if (this.props.onCommentAdded !== undefined && this.props.onCommentAdded !== null) {
                        this.props.onCommentAdded(comments.total);
                    }
                });
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
                    let temp = this.state.comments.commentList.filter(t => t.id !== this.state.commentiddel);
                    let comments = {
                        current: this.state.comments.current,
                        pageSize: this.state.comments.pageSize,
                        total: this.state.comments.total - 1,
                        totalPages: this.state.comments.totalPages,
                        commentList: temp
                    };
                    this.setState({
                        loading: false, commentiddel: 0, comments
                    });

                    if (this.props.onCommentRemoved !== undefined && this.props.onCommentRemoved !== null) {
                        this.props.onCommentRemoved(comments.total);
                    }
                }
            });
    }

    fetchComments() {
        this.setState({ loadingComments: true });
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
                    this.setState({ loggedin: false, loadingComments: false });
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
                            loadingComments: false, comments
                        });
                    });
                } else {
                    this.setState({
                        loadingComments: false
                    });
                }
            }).catch(() => {
                this.setState({
                    loadingComments: false
                });
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
                    <button data-id={p.id} onClick={(e) => { this.setState({ commentiddel: parseInt(e.target.getAttribute("data-id"), 10) }) }} className="btn btn-light" type="button"><i data-id={p.id} className="bi bi-trash"></i></button>
                </React.Fragment>;
            }
            items.push(<table key={p.id} cellPadding="0" cellSpacing="0" width="100%" border="0">
                <tbody>
                    <tr>
                        <td width="35" className="p-1" valign="middle">
                            <MemberPicSmall member={p.postedBy} />
                        </td>
                        <td valign="middle" className="px-2">
                            <a href={'//' + window.location.host + '/profile?un=' + p.postedBy.userName} className="fs-6 fw-bold pointer d-inline-block text-decoration-none">
                                {p.postedBy.userName}
                            </a><br />
                            <span className="fs-12 text-secondary"><DateLabel value={p.postDate} /></span>

                        </td>
                        <td width="40" valign="middle" align="center">{ownedCommentMenu}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-2" colSpan="3">
                            <React.Fragment>
                                {p.comment.split('\n').map((item, key) => {
                                    return <React.Fragment key={key}><span dangerouslySetInnerHTML={{ __html: item }}></span><br /></React.Fragment>
                                })}
                            </React.Fragment>
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
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Comments</h5>
                        <button type="button" className="btn-close" onClick={() => { this.props.cancel(); }}></button>
                    </div>
                    <div className="modal-body p-1" style={{ minHeight: "300px" }}>
                        {this.state.loadingComments ? <p>Loading Comments...</p> : items}
                        {confirmdelete}
                    </div>
                    <div className="modal-footer">
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td valign="middle" align="right">
                                        <AutoAdjustTextArea htmlattr={{ class: "form-control mb-2", required: "required", placeholder: "Type your comment here...", maxLength: 3000 }} required={true} onChange={(val) => { this.setState({ commenttext: val }) }} value={this.state.commenttext} maxRows={5} minRows={1} />
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
        let ls = { model: null, posts: [] };
        if (this.props.search === "userfeed" && localStorage.getItem("userfeed") != null)
            ls = JSON.parse(localStorage.getItem("userfeed"))
        else if (this.props.search === "explore" && localStorage.getItem("explore") != null)
            ls = JSON.parse(localStorage.getItem("explore"))
        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: ls.model, q: this.props.search, p: 0, posts: ls.posts,
            viewMode: parseInt(this.props.viewMode, 10),
            viewModeAllowed: this.props.viewModeAllowed === "true" ? true : false,
            post: null
        };
        this.selectPost = this.selectPost.bind(this);
        this.addReaction = this.addReaction.bind(this);
        this.postDeleted = this.postDeleted.bind(this);
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
        this.loadFeed(true);
    }

    loadFeed(firsttime) {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/post?q=' + encodeURIComponent(this.state.q) + '&p=' + this.state.p;

        if (this.state.q === "userfeed")
            url = '//' + window.location.host + '/api/post/feed?p=' + this.state.p;
        else if (this.state.q === "explore")
            url = '//' + window.location.host + '/api/post/explore?p=' + this.state.p;
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
                        let temp = firsttime ? data.posts : this.state.posts;
                        if (!firsttime) {
                            for (var k in data.posts) {
                                temp.push(data.posts[k]);
                            }
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
                        }, () => {
                            let obj = { model: this.state.model, posts: this.state.posts };
                            if (this.state.q === "userfeed")
                                localStorage.setItem("userfeed", JSON.stringify(obj));
                            else if (this.state.q === "explore")
                                localStorage.setItem("explore", JSON.stringify(obj));
                        });
                    });
                }
            });
    }

    postDeleted(id) {
        this.setState({
            posts: this.state.posts.filter(t => t.id !== id)
        });
    }

    renderPosts() {
        let empty = <div key={0}>
            <div className="text-center fs-3 pt-5">
                <i className="bi bi-emoji-dizzy me-2"></i><h2>Nothing to see here</h2>
                <p>You can start by Posting Photos or Following People</p>
            </div>
        </div>;
        if (this.state.viewMode === 2) {
            let items = []
            if (this.state.model !== null) {
                for (var k in this.state.posts) {
                    items.push(<MemberPost key={this.state.posts[k].id} post={this.state.posts[k]} ondelete={this.postDeleted} onIgnoredMember={(userid) => {
                        this.setState({
                            posts:
                                this.state.posts.filter(t => t.owner.id !== userid)
                        });
                    }} />);
                }
            }
            if (items.length == 0) {
                items.push(empty);
            }
            return <div>{items}</div>;
        } else if (this.state.viewMode === 1) {
            let items = [];
            for (var k in this.state.posts) {
                var p = this.state.posts[k];
                if (p.videoURL !== "") { } else {
                    items.push(<div className="col pointer">
                        <div className="card border">
                            <div className="imgbg rounded-3" style={{ backgroundImage: "url(//" + window.location.host + "/" + p.photos[0].photo + ")" }}>
                                <img src={"//" + window.location.host + "/" + p.photos[0].photo} className="opacity-0 img-fluid" data-postid={p.id} onClick={(e) => {
                                    this.selectPost(e.target.getAttribute("data-postid"));
                                }} />
                            </div></div>
                    </div>);
                }
            }
            if (items.length == 0) {
                items.push(empty);
                return items;
            }
            return <div className="row row-cols-3 g-2">{items}</div>;
        }
    }

    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} /></div>
            </div>;
        }
        var html = (this.state.loading === false) ? this.renderPosts() : null;
        var loadmore = null;

        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>;
        }
        if (this.state.model !== null) {
            if ((this.state.model.current + 1) < this.state.model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { this.setState({ p: this.state.model.current + 1 }, () => { this.loadFeed(false); }) }}>Load More</button>
                </div>;
            }
        }
        var viewmodetabhtml = null;
        if (this.state.viewModeAllowed && this.state.posts.length > 0) {
            viewmodetabhtml = <nav className="nav nav-pills m-1">
                <a onClick={() => { this.setState({ viewMode: 1 }); }} className={this.state.viewMode === 1 ? "nav-link fs-4 active bg-white text-success border rounded-3 me-2" : "nav-link fs-4 bg-white border rounded-3 text-dark me-2"}><i className="bi bi-grid-3x3-gap-fill"></i></a>
                <a onClick={() => { this.setState({ viewMode: 2 }); }} className={this.state.viewMode === 2 ? "nav-link fs-4 active bg-white text-success border rounded-3 me-2" : "nav-link fs-4 bg-white border rounded-3 text-dark me-2"}><i className="bi bi-view-list"></i></a>
            </nav>;
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
        } else if (this.props.target === 'follower' || this.props.target === 'share') {
            this.url = '//' + window.location.host + '/api/Follow/followerlist/';
        }
        else if (this.props.target === 'following') {
            this.url = '//' + window.location.host + '/api/Follow/followinglist/';
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
                        } else if (this.props.target === 'follower' || this.props.target === 'following' || this.props.target === "share") {
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
        else if (this.props.target === 'share') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                items.push(<MemberSmallRow key={p.follower.id} member={p.follower} status={p.status}
                    showRemove={false} showShare={true} onShare={(id) => {
                        if (this.props.onSelected !== undefined && this.props.onSelected !== null)
                            this.props.onSelected(id);
                    }}
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
            {this.state.loading ? <p>Loading Data...</p> : null}
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
            member: this.props.member, status: this.props.status, showRemove: this.props.showRemove,
            showShare: (this.props.showShare === undefined || this.props.showShare === null) ? false : this.props.showShare,
            showRemoveConfirm: false
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
            //replace follow button with remmove
            followbtn = <button type="button" className="btn btn-light text-dark" onClick={() => { this.setState({ showRemoveConfirm: true }) }}>Remove</button>;
        }
        if (this.state.showShare)
            followbtn = <button type="button" data-id={this.props.member.id} className="btn btn-primary" onClick={(e) => { this.props.onShare(e.target.getAttribute("data-id")); }}>Share</button>;
        var removeConfirmBox = null;
        if (this.state.showRemoveConfirm) {
            removeConfirmBox = <ConfirmBox cancel={() => { this.setState({ showRemoveConfirm: false }) }}
                ok={() => { this.setState({ showRemoveConfirm: false }); this.removeFollow(); }}
                message="Are you sure you want to remove this member from your followers?" />;
        }
        return <table className="w-100 mb-1" cellPadding="0" cellSpacing="0">
            <tbody>
                <tr>
                    <td width="35px" className="p-1" align="center" valign="middle">
                        <MemberPicSmall member={this.state.member} />
                    </td>
                    <td>
                        <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="text-dark text-decoration-none">
                            {this.state.member.userName}
                        </a>
                    </td>
                    <td width="100px" align="right">
                        {followbtn}
                        {removeConfirmBox}
                    </td>
                </tr>
            </tbody>
        </table>
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
            <img src={'//' + window.location.host + "/" + this.state.member.pic} className="d-inline-Ignore img-fluid pointer rounded-3 owner-thumb-small" alt="" /></a>
            : <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="border-0 text-secondary">
                <img src={'//' + location.host + '/images/nopic.jpg'} alt="No Pic" className="d-inline-block img-fluid pointer rounded-3 owner-thumb-small" /></a>;


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
                    followbtn = <button type="button" className="btn btn-light" onClick={this.askToFollow}>Follow</button>;
                }
            } else if (this.state.status === 1) {
                followbtn = <button type="button" className="btn btn-light" onClick={this.unFollow}>Unfollow</button>;
            }
            else if (this.state.status === 2) {
                followbtn = <button type="button" className="btn btn-light" onClick={this.unFollow}>Requested</button>;
            }
        } else if (this.state.loading === true) {
            followbtn = null;
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
            text: this.props.text, expand: false, showexpand: this.props.text.length > parseInt(this.props.maxlength, 10),
            maxlength: parseInt(this.props.maxlength, 10),
            cssclass: this.props.cssclass !== undefined ? this.props.cssclass : ""
        };
    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.text !== this.state.text) {
            let se = false;
            if (nextProps.text.length > nextProps.maxlength || (nextProps.text.match(/\n/g) || []).length > 3) {
                se = true;
            }
            this.setState({
                text: nextProps.text, maxlength: parseInt(nextProps.maxlength, 10),
                cssclass: nextProps.cssclass !== undefined ? nextProps.cssclass : "", showexpand: se
            });
        }
    }

    componentDidMount() {
        if (this.state.text.length > this.state.maxlength || (this.state.text.match(/\n/g) || []).length > 3) {
            this.setState({ showexpand: true });
        }
    }

    render() {
        if (this.state.text.trim() === "") return null;

        let length = (this.state.text.length < this.state.maxlength) ? this.state.text.length : this.state.maxlength;
        let text = null, expandbtn = null;
        if (this.state.expand) {
            text = <React.Fragment>
                {this.state.text.split('\n').map((item, key) => {
                    return <React.Fragment key={key}><span dangerouslySetInnerHTML={{ __html: item }}></span><br /></React.Fragment>
                })}
            </React.Fragment>;
        } else {
            text = <div style={{ maxHeight: "28px", overflowY: "hidden", display: "inline-flex" }}>
                {this.state.text.split('\n').map((item, key) => {
                    return <React.Fragment key={key}><span dangerouslySetInnerHTML={{ __html: item }}></span><br /></React.Fragment>
                })}</div>;
        }

        if (this.state.showexpand) {
            expandbtn = <button type="button" onClick={() => { this.setState({ expand: !this.state.expand }) }} className="btn btn-link text-secondary" >{(!this.state.expand) ? "More" : "Less"}</button>
        }

        return <div className={this.state.cssclass}>{text}{expandbtn}</div>;
    }
}

class DateLabel extends React.Component {

    constructor(props) {
        super(props);
        this.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.state = {
            value: this.props.value
        };
    }

    transformData() {
        var d = new Date(this.state.value);
        return d.getDate() + " " + this.month[d.getMonth()] + " " + d.getFullYear();
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
        this.state = {
            photos: this.props.photos,
            id: "carousel" + this.props.postid,
            active: 0
        };
    }

    render() {
        let items1 = [], items2 = [];
        for (let k = 0; k < this.state.photos.length; k++) {
            items1.push(<button type="button" data-bs-target={this.state.id} className={k === this.state.active ? "btn btn-sm btn-primary me-2" : "btn btn-sm btn-secondary me-2"} data-index={k} onClick={(e) => {
                this.setState({ active: parseInt(e.target.getAttribute("data-index", 10)) });
            }}></button>)
            items2.push(<div className={k === this.state.active ? "carousel-item text-center active" : "carousel-item text-center"}>
                <img src={"//" + location.host + "/" + this.state.photos[k].photo} className="img-fluid w-100" alt="" />
            </div>);
        }
        return <React.Fragment>
            <div id={this.state.id} className="carousel carousel-dark slide" data-bs-ride="true">
                <div className="carousel-inner">
                    {items2}
                </div>
                <button className={this.state.active === 0 ? "d-none" : "carousel-control-prev"} type="button" data-bs-target={this.state.id} data-bs-slide="prev" onClick={() => {
                    if (this.state.active > 0) {
                        this.setState({ active: this.state.active - 1 });
                    }
                }}>
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className={this.state.active === this.state.photos.length - 1 ? "d-none" : "carousel-control-next"} type="button" data-bs-target={this.state.id} data-bs-slide="next" onClick={() => {
                    if (this.state.active < this.state.photos.length - 1) {
                        this.setState({ active: this.state.active + 1 });
                    }
                }}>
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div><div className="text-center">
                {items1}
            </div></React.Fragment>;
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
            showfollowers: false, showfollowing: false, showSettings: false, showrequests: false, hasFollowRequest: false
        };

        this.checkIfHasRequest = this.checkIfHasRequest.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
            if (this.props.username == undefined || this.props.username == null || this.props.username == "") {
                //this.setState({ member: JSON.parse(localStorage.getItem("myself")) });
                this.loadMember(localStorage.getItem("token"), JSON.parse(localStorage.getItem("myself")).id);
            } else {
                this.loadMember(localStorage.getItem("token"), this.props.username);

            }
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
                            this.checkIfHasRequest(this.state.member.id)
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

    checkIfHasRequest(username) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/HasRequest/' + username, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({ loading: false, hasFollowRequest: true });
                } else {
                    this.setState({ loading: false, hasFollowRequest: false });
                }
            });
    }

    allowRequest() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/allow/' + this.state.member.id, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({ loading: false, hasFollowRequest: false });
                } else {
                    this.setState({ loading: false });
                }
            });
    }

    rejectRequest() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Reject/' + this.state.member.id, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({ loading: false, hasFollowRequest: false });
                } else {
                    this.setState({ loading: false });
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
            return <div className="modal fade show" style={{ display: "block" }} id="followersModal" tabIndex="-1" aria-labelledby="followersModalLabel" aria-hidden="true">
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
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabIndex="-1" aria-labelledby="followingModalLabel" aria-hidden="true">
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

    renderFollowRequest() {
        if (this.state.showrequests) {
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabIndex="-1" aria-labelledby="followrequestModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followingModalLabel">Follow Request</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showrequests: false }) }}></button>
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

    renderRequestApproval() {
        if (this.state.hasFollowRequest) {
            return <div className="row">
                <div className="col">
                    <p>You have follow request from this account, take action.</p>
                    <button type="button" className="btn btn-primary me-2" onClick={() => { this.allowRequest(); }}>Approve</button><button className="btn btn-secondary" type="button" onClick={() => { this.rejectRequest(); }}>Reject</button>
                </div>
            </div>
        }
    }

    render() {
        if (!this.state.loggedin) {
            return <div className="row">
                <div className="col-md-6 offset-md-3">
                    <RegisterForm beginWithRegister={false} onLogin={() => {
                        this.setState({
                            loggedin: localStorage.getItem("token") === null ? false : true,
                            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                        })
                    }} />
                </div>
            </div>;
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
        else if (this.state.showrequests) {
            followlist = <React.Fragment>{this.renderFollowRequest()}</React.Fragment>
        }

        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>
        }
        let me = null, pic = null, settings = null, followhtml = null;
        if (this.state.member !== null) {
            pic = this.state.member.pic !== "" ? <img src={"//" + window.location.host + "/" + this.state.member.pic} className="img-fluid rounded profile-thumb" alt="" />
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
            me = <div>
                <div className="row">
                    <div className="col-lg-5">
                        <div className="rightsidebar">
                            <div className="text-center mb-2 p-2 border bg-white rounded-3">
                                {pic}
                                <div className="row">
                                    <div className="col-4">
                                        <button type="button" className="btn btn-link text-dark text-decoration-none">Posts <br />{this.state.member.postCount}</button></div>
                                    <div className="col-4">
                                        {
                                            (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) ?
                                                <button type="button" className="btn btn-link text-dark text-decoration-none" onClick={() => { this.setState({ showfollowing: true }) }}>Following <br />{this.state.member.followingCount}</button> :
                                                <button type="button" className="btn btn-link text-dark text-decoration-none">Following <br />{this.state.member.followingCount}</button>
                                        }
                                    </div>
                                    <div className="col-4">
                                        {
                                            (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) ?
                                                <button type="button" className="btn btn-link text-dark text-decoration-none" onClick={() => { this.setState({ showfollowers: true }) }}>Followers <br />{this.state.member.followerCount}</button> :
                                                <button type="button" className="btn btn-link text-dark text-decoration-none">Followers <br />{this.state.member.followerCount}</button>
                                        }
                                    </div>
                                </div>
                                {name}
                                <div className="p-1 ms-2">@{this.state.member.userName}</div>
                                {settings}
                                {followhtml}
                                {this.state.member.followRequestCount > 0 && this.state.member.userName == this.state.myself.userName ? <div className="mt-2"><button type="button" className="btn btn-light text-success fw-bold " onClick={() => { this.setState({ showrequests: true }) }}>{this.state.member.followRequestCount} Follow Request</button></div> : null}
                                {this.renderRequestApproval()}
                                {thought}
                                <p>{this.state.member.bio}</p>
                            </div>
                            <AskPushNotification />
                            <SendInvite />
                            <SuggestedAccounts />
                        </div>

                    </div>
                    <div className="col-lg-7">
                        <MemberPostList search={this.state.member.userName} viewMode={2} viewModeAllowed="true" />
                    </div>

                </div>
                {followlist}
            </div>;
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
            showProfilePicModal: false, src: null, showSecAnsModal: false,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                locked: true
            },
            croppedImageUrl: null, profilepiczoom: 1, countryitems: []
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

        this.fetchCountryItems();
    }

    fetchCountryItems() {
        fetch('//' + window.location.host + '/api/CountryItem/', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({ countryitems: data });
                });
            }
        });
    }

    handleChange(e) {
        let m = this.state.myself;
        switch (e.target.name) {
            case 'securityQuestion':
                m.securityQuestion = e.target.value;
                break;
            case 'securityAnswer':
                m.securityAnswer = e.target.value;
                break;
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
                        this.setState({ loading: false, message: 'Data is saved', bsstyle: 'success' });
                        if (this.state.onProfileChange) {
                            this.state.onProfileChange();
                        }
                    } else if (response.status === 400) {
                        try {
                            response.json().then(data => {
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

    renderSecAnsModal() {
        if (this.state.showSecAnsModal) {
            return <React.Fragment><div className="modal  d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Set Security Answer</h5>
                            <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showSecAnsModal: false }) }}>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="securityAnswerTxt" className="form-label">Security Question </label>
                                <div>{this.state.myself.securityQuestion}</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="securityAnswerTxt" className="form-label">Security Answer <span className="text-danger">(Required)</span></label>
                                <input type="text" id="securityAnswerTxt" maxLength="100" name="securityAnswer" className="form-control" maxLength="300" value={this.state.myself.securityAnswer} onChange={this.handleChange} />
                            </div>
                            {this.state.message !== "" ? <div className={'my-1 text-center noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                                {this.state.message}
                            </div> : null}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => { this.saveData("securityanswer", this.state.myself.securityAnswer) }}>Save</button>
                        </div>
                    </div>
                </div>
            </div><div className="modal-backdrop fade show"></div></React.Fragment>;
        }
        else { return null; }
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
            let pic = this.state.myself.pic !== "" ? <React.Fragment><img src={"//" + location.host + "/" + this.state.myself.pic} className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />
                <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.removeProfilePicture}>Remove</button></React.Fragment> : <img src="/images/nopic.jpg" className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />;
            return <React.Fragment>
                <div className="container py-5">
                    {loading}
                    {message}
                    {this.renderSecAnsModal()}
                    <div className="row align-items-center">
                        <div className="col-md-6 text-center">
                            {pic}
                            <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.toggleProfilePicModal}>Change</button>
                            {this.renderProfilePicModal()}
                        </div>
                        <div className="col-md-6">
                            <div className="mb-2">
                                <label htmlFor="channelnametxt" className="form-label fw-bold">Username</label>
                                <input type="text" id="channelnametxt" readOnly name="userName" placeholder="Unique Channel Name" className="form-control" value={this.state.myself.userName} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="nametxt" className="form-label fw-bold">Name <span className="text-danger">(Required)</span></label>
                                <input type="text" id="nametxt" name="name" placeholder="Your Name" className="form-control" value={this.state.myself.name} onChange={this.handleChange} onBlur={() => { this.saveData("name", this.state.myself.name) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label fw-bold">Mobile <span className="text-danger">(Required)</span></label>
                                <input type="text" name="phone" className="form-control" maxLength="15" value={this.state.myself.phone} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("phone", this.state.myself.phone) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label fw-bold">Email <span className="text-danger">(Required)</span></label>
                                <input type="email" name="email" className="form-control" maxLength="250" value={this.state.myself.email} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("email", this.state.myself.email) }} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="birthyeartxt" className="form-label fw-bold">Year of Birth</label>
                                <select id="birthyeartxt" name="birthYear" className="form-select" value={this.state.myself.birthYear} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("birthYear", this.state.myself.birthYear) }}>
                                    {yearitems}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row g-1 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="securityQuesitonTxt" className="form-label fw-bold">Security Question <span className="text-danger">(Required)</span></label>
                            <input type="text" id="securityQuesitonTxt" name="securityQuestion" className="form-control" maxLength="300" value={this.state.myself.securityQuestion} onChange={this.handleChange}
                                onBlur={() => { this.saveData("securityquestion", this.state.myself.securityQuestion) }} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="securityAnswerTxt" className="form-label fw-bold">Security Answer <span className="text-danger">(Required)</span></label>
                            <div>Your existing answer is not shown. <button type="button" className="btn btn-primary ms-2 btn-sm" onClick={() => { this.setState({ showSecAnsModal: true }); }}>Change Answer</button></div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="thoughtStatus" className="form-label fw-bold">One line Introduction</label>
                        <input type="text" name="thoughtStatus" className="form-control" maxLength="195" value={this.state.myself.thoughtStatus} onChange={this.handleChange}
                            onBlur={() => { this.saveData("thoughtstatus", this.state.myself.thoughtStatus) }} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="biotxt" className="form-label fw-bold">About Me</label>
                        <textarea className="form-control" id="biotxt" maxLength="950" name="bio" value={this.state.myself.bio} onChange={this.handleChange} rows="4" placeholder="Write something about yourself."
                            onBlur={() => { this.saveData("bio", this.state.myself.bio) }}></textarea>
                    </div>

                    <div className="row g-1">
                        <div className="col-md-6">
                            <label htmlFor="visibilityselect" className="form-label fw-bold">Profile Visibility</label>
                            <select className="form-select" id="genderselect" name="visibility" value={this.state.myself.visibility} onChange={this.handleChange}
                                onBlur={() => { this.saveData("visibility", this.state.myself.visibility) }}>
                                <option value="0"></option>
                                <option value="2">Public</option>
                                <option value="1">Private</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="countryselect" className="form-label fw-bold">Country</label>
                            <select className="form-select" id="countryselect" name="country" value={this.state.myself.country} onChange={this.handleChange} onBlur={() => { this.saveData("country", this.state.myself.country) }}>
                                <option value=""></option>
                                <option value="AD">Andorra</option>
                                <option value="AE">United Arab Emirates</option>
                                <option value="AF">Afghanistan</option>
                                <option value="AG">Antigua and Barbuda</option>
                                <option value="AI">Anguilla</option>
                                <option value="AL">Albania</option>
                                <option value="AM">Armenia</option>
                                <option value="AO">Angola</option>
                                <option value="AQ">Antarctica</option>
                                <option value="AR">Argentina</option>
                                <option value="AS">American Samoa</option>
                                <option value="AT">Austria</option>
                                <option value="AU">Australia</option>
                                <option value="AW">Aruba</option>
                                <option value="AX">Åland Islands</option>
                                <option value="AZ">Azerbaijan</option>
                                <option value="BA">Bosnia and Herzegovina</option>
                                <option value="BB">Barbados</option>
                                <option value="BD">Bangladesh</option>
                                <option value="BE">Belgium</option>
                                <option value="BF">Burkina Faso</option>
                                <option value="BG">Bulgaria</option>
                                <option value="BH">Bahrain</option>
                                <option value="BI">Burundi</option>
                                <option value="BJ">Benin</option>
                                <option value="BL">Saint Barthélemy</option>
                                <option value="BM">Bermuda</option>
                                <option value="BN">Brunei Darussalam</option>
                                <option value="BO">Bolivia, Plurinational State of</option>
                                <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
                                <option value="BR">Brazil</option>
                                <option value="BS">Bahamas</option>
                                <option value="BT">Bhutan</option>
                                <option value="BV">Bouvet Island</option>
                                <option value="BW">Botswana</option>
                                <option value="BY">Belarus</option>
                                <option value="BZ">Belize</option>
                                <option value="CA">Canada</option>
                                <option value="CC">Cocos (Keeling) Islands</option>
                                <option value="CD">Congo, the Democratic Republic of the</option>
                                <option value="CF">Central African Republic</option>
                                <option value="CG">Congo</option>
                                <option value="CH">Switzerland</option>
                                <option value="CI">Côte d'Ivoire</option>
                                <option value="CK">Cook Islands</option>
                                <option value="CL">Chile</option>
                                <option value="CM">Cameroon</option>
                                <option value="CN">China</option>
                                <option value="CO">Colombia</option>
                                <option value="CR">Costa Rica</option>
                                <option value="CU">Cuba</option>
                                <option value="CV">Cape Verde</option>
                                <option value="CW">Curaçao</option>
                                <option value="CX">Christmas Island</option>
                                <option value="CY">Cyprus</option>
                                <option value="CZ">Czech Republic</option>
                                <option value="DE">Germany</option>
                                <option value="DJ">Djibouti</option>
                                <option value="DK">Denmark</option>
                                <option value="DM">Dominica</option>
                                <option value="DO">Dominican Republic</option>
                                <option value="DZ">Algeria</option>
                                <option value="EC">Ecuador</option>
                                <option value="EE">Estonia</option>
                                <option value="EG">Egypt</option>
                                <option value="EH">Western Sahara</option>
                                <option value="ER">Eritrea</option>
                                <option value="ES">Spain</option>
                                <option value="ET">Ethiopia</option>
                                <option value="FI">Finland</option>
                                <option value="FJ">Fiji</option>
                                <option value="FK">Falkland Islands (Malvinas)</option>
                                <option value="FM">Micronesia, Federated States of</option>
                                <option value="FO">Faroe Islands</option>
                                <option value="FR">France</option>
                                <option value="GA">Gabon</option>
                                <option value="GB">United Kingdom</option>
                                <option value="GD">Grenada</option>
                                <option value="GE">Georgia</option>
                                <option value="GF">French Guiana</option>
                                <option value="GG">Guernsey</option>
                                <option value="GH">Ghana</option>
                                <option value="GI">Gibraltar</option>
                                <option value="GL">Greenland</option>
                                <option value="GM">Gambia</option>
                                <option value="GN">Guinea</option>
                                <option value="GP">Guadeloupe</option>
                                <option value="GQ">Equatorial Guinea</option>
                                <option value="GR">Greece</option>
                                <option value="GS">South Georgia and the South Sandwich Islands</option>
                                <option value="GT">Guatemala</option>
                                <option value="GU">Guam</option>
                                <option value="GW">Guinea-Bissau</option>
                                <option value="GY">Guyana</option>
                                <option value="HK">Hong Kong</option>
                                <option value="HM">Heard Island and McDonald Islands</option>
                                <option value="HN">Honduras</option>
                                <option value="HR">Croatia</option>
                                <option value="HT">Haiti</option>
                                <option value="HU">Hungary</option>
                                <option value="ID">Indonesia</option>
                                <option value="IE">Ireland</option>
                                <option value="IL">Israel</option>
                                <option value="IM">Isle of Man</option>
                                <option value="IN">India</option>
                                <option value="IO">British Indian Ocean Territory</option>
                                <option value="IQ">Iraq</option>
                                <option value="IR">Iran, Islamic Republic of</option>
                                <option value="IS">Iceland</option>
                                <option value="IT">Italy</option>
                                <option value="JE">Jersey</option>
                                <option value="JM">Jamaica</option>
                                <option value="JO">Jordan</option>
                                <option value="JP">Japan</option>
                                <option value="KE">Kenya</option>
                                <option value="KG">Kyrgyzstan</option>
                                <option value="KH">Cambodia</option>
                                <option value="KI">Kiribati</option>
                                <option value="KM">Comoros</option>
                                <option value="KN">Saint Kitts and Nevis</option>
                                <option value="KP">Korea, Democratic People's Republic of</option>
                                <option value="KR">Korea, Republic of</option>
                                <option value="KW">Kuwait</option>
                                <option value="KY">Cayman Islands</option>
                                <option value="KZ">Kazakhstan</option>
                                <option value="LA">Lao People's Democratic Republic</option>
                                <option value="LB">Lebanon</option>
                                <option value="LC">Saint Lucia</option>
                                <option value="LI">Liechtenstein</option>
                                <option value="LK">Sri Lanka</option>
                                <option value="LR">Liberia</option>
                                <option value="LS">Lesotho</option>
                                <option value="LT">Lithuania</option>
                                <option value="LU">Luxembourg</option>
                                <option value="LV">Latvia</option>
                                <option value="LY">Libya</option>
                                <option value="MA">Morocco</option>
                                <option value="MC">Monaco</option>
                                <option value="MD">Moldova, Republic of</option>
                                <option value="ME">Montenegro</option>
                                <option value="MF">Saint Martin (French part)</option>
                                <option value="MG">Madagascar</option>
                                <option value="MH">Marshall Islands</option>
                                <option value="MK">Macedonia, the Former Yugoslav Republic of</option>
                                <option value="ML">Mali</option>
                                <option value="MM">Myanmar</option>
                                <option value="MN">Mongolia</option>
                                <option value="MO">Macao</option>
                                <option value="MP">Northern Mariana Islands</option>
                                <option value="MQ">Martinique</option>
                                <option value="MR">Mauritania</option>
                                <option value="MS">Montserrat</option>
                                <option value="MT">Malta</option>
                                <option value="MU">Mauritius</option>
                                <option value="MV">Maldives</option>
                                <option value="MW">Malawi</option>
                                <option value="MX">Mexico</option>
                                <option value="MY">Malaysia</option>
                                <option value="MZ">Mozambique</option>
                                <option value="NA">Namibia</option>
                                <option value="NC">New Caledonia</option>
                                <option value="NE">Niger</option>
                                <option value="NF">Norfolk Island</option>
                                <option value="NG">Nigeria</option>
                                <option value="NI">Nicaragua</option>
                                <option value="NL">Netherlands</option>
                                <option value="NO">Norway</option>
                                <option value="NP">Nepal</option>
                                <option value="NR">Nauru</option>
                                <option value="NU">Niue</option>
                                <option value="NZ">New Zealand</option>
                                <option value="OM">Oman</option>
                                <option value="PA">Panama</option>
                                <option value="PE">Peru</option>
                                <option value="PF">French Polynesia</option>
                                <option value="PG">Papua New Guinea</option>
                                <option value="PH">Philippines</option>
                                <option value="PK">Pakistan</option>
                                <option value="PL">Poland</option>
                                <option value="PM">Saint Pierre and Miquelon</option>
                                <option value="PN">Pitcairn</option>
                                <option value="PR">Puerto Rico</option>
                                <option value="PS">Palestine, State of</option>
                                <option value="PT">Portugal</option>
                                <option value="PW">Palau</option>
                                <option value="PY">Paraguay</option>
                                <option value="QA">Qatar</option>
                                <option value="RE">Réunion</option>
                                <option value="RO">Romania</option>
                                <option value="RS">Serbia</option>
                                <option value="RU">Russian Federation</option>
                                <option value="RW">Rwanda</option>
                                <option value="SA">Saudi Arabia</option>
                                <option value="SB">Solomon Islands</option>
                                <option value="SC">Seychelles</option>
                                <option value="SD">Sudan</option>
                                <option value="SE">Sweden</option>
                                <option value="SG">Singapore</option>
                                <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                                <option value="SI">Slovenia</option>
                                <option value="SJ">Svalbard and Jan Mayen</option>
                                <option value="SK">Slovakia</option>
                                <option value="SL">Sierra Leone</option>
                                <option value="SM">San Marino</option>
                                <option value="SN">Senegal</option>
                                <option value="SO">Somalia</option>
                                <option value="SR">Suriname</option>
                                <option value="SS">South Sudan</option>
                                <option value="ST">Sao Tome and Principe</option>
                                <option value="SV">El Salvador</option>
                                <option value="SX">Sint Maarten (Dutch part)</option>
                                <option value="SY">Syrian Arab Republic</option>
                                <option value="SZ">Swaziland</option>
                                <option value="TC">Turks and Caicos Islands</option>
                                <option value="TD">Chad</option>
                                <option value="TF">French Southern Territories</option>
                                <option value="TG">Togo</option>
                                <option value="TH">Thailand</option>
                                <option value="TJ">Tajikistan</option>
                                <option value="TK">Tokelau</option>
                                <option value="TL">Timor-Leste</option>
                                <option value="TM">Turkmenistan</option>
                                <option value="TN">Tunisia</option>
                                <option value="TO">Tonga</option>
                                <option value="TR">Turkey</option>
                                <option value="TT">Trinidad and Tobago</option>
                                <option value="TV">Tuvalu</option>
                                <option value="TW">Taiwan, Province of China</option>
                                <option value="TZ">Tanzania, United Republic of</option>
                                <option value="UA">Ukraine</option>
                                <option value="UG">Uganda</option>
                                <option value="UM">United States Minor Outlying Islands</option>
                                <option value="US">United States</option>
                                <option value="UY">Uruguay</option>
                                <option value="UZ">Uzbekistan</option>
                                <option value="VA">Holy See (Vatican City State)</option>
                                <option value="VC">Saint Vincent and the Grenadines</option>
                                <option value="VE">Venezuela, Bolivarian Republic of</option>
                                <option value="VG">Virgin Islands, British</option>
                                <option value="VI">Virgin Islands, U.S.</option>
                                <option value="VN">Viet Nam</option>
                                <option value="VU">Vanuatu</option>
                                <option value="WF">Wallis and Futuna</option>
                                <option value="WS">Samoa</option>
                                <option value="YE">Yemen</option>
                                <option value="YT">Mayotte</option>
                                <option value="ZA">South Africa</option>
                                <option value="ZM">Zambia</option>
                                <option value="ZW">Zimbabwe</option>
                            </select>
                        </div>
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
            showregisterform: props.beginWithRegister, showForgotPassword: false,
            registerdto: { userName: '', password: '', userEmail: '', securityQuestion: '', securityAnswer: '' },
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
                            location.reload();
                            //if (this.props.onLogin !== undefined) {
                            //    this.props.onLogin();
                            //} else {
                            //    this.setState({ redirectto: '/' });
                            //}
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
            body: JSON.stringify({
                UserName: this.state.registerdto.userName,
                Password: this.state.registerdto.password,
                Email: this.state.registerdto.userEmail,
                SecurityQuestion: this.state.registerdto.securityQuestion,
                SecurityAnswer: this.state.registerdto.securityAnswer
            }),
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
        if (!this.state.showForgotPassword) {
            return <div className="border rounded-3 bg-white p-3">
                <h3>Login</h3>
                <form onSubmit={this.handleLogin}>
                    <div className="my-3">
                        <input type="text" placeholder="Username or Email" className="form-control" required name="userName" value={this.state.logindto.userName} onChange={(e) => { this.setState({ logindto: { userName: e.target.value, password: this.state.logindto.password } }) }} />
                    </div>
                    <div className="my-3">
                        <input className="form-control" required placeholder="Password" name="password" type="password" onChange={(e) => { this.setState({ logindto: { userName: this.state.logindto.userName, password: e.target.value } }) }} />
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <button className="btn btn-dark" disabled={this.state.loading} style={{ minWidth: "60px" }} type="submit">{this.state.loading ? <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div> : "Login"}
                            </button>
                        </div>
                        <div className="col text-end">
                            <button type="button" onClick={() => { this.setState({ showForgotPassword: true }); }} className="btn btn-link text-dark">Forgot Password?</button>
                        </div>
                    </div>
                </form></div>;
        } else {
            return <div className="p-2">
                <ForgotPassword />
                <p className="my-2 text-center border-top py-2">
                    <button type="button" onClick={() => { this.setState({ showForgotPassword: false }); }} className="btn btn-link text-dark">Try Login Again</button>
                </p>
            </div>;
        }
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

        let formcontents = this.state.showregisterform ? <React.Fragment>
            <div className="border rounded-3 bg-white p-3">
                <div className="float-end"><span className="text-danger">*</span> Required</div>
                <h3 className="mb-2">Register</h3>
                <form autoComplete="off" onSubmit={this.handleRegisterSubmit}>
                    <div className="mb-3">
                        <label className="fw-bold">Username <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" minLength="3" maxLength="30" required name="username" value={this.state.registerdto.userName}
                            onChange={(e) => {
                                let rdto = this.state.registerdto;
                                rdto.userName = e.target.value;
                                this.setState({ registerdto: rdto });
                            }} aria-describedby="usernameHelp" />
                        <div id="usernameHelp" className="form-text">Username should be unique and creative,
                            it will be your identity on the site.<br />
                            {/*मन चाहा Username चुने, यह Yocail पर आपकी पहचान बनेगा। Username अनोखा और रचनात्मक रखे।*/}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="fw-bold">Password <span className="text-danger">*</span></label>
                        <input className="form-control" minLength="8" required name="password" type="password" onChange={(e) => {
                            let rdto = this.state.registerdto;
                            rdto.password = e.target.value;
                            this.setState({ registerdto: rdto });
                        }} />
                        <div id="passwordHelp" className="form-text">Password should be at least 8 characters long, make it difficult to guess.
                            {/*<br />*/}
                            {/*पासवर्ड कम से कम आठ अक्षर का हो, पासवर्ड कठिन चुने।*/}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="fw-bold">Security Question <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" minLength="10" required maxlength="300" name="securityQuestion" value={this.state.registerdto.securityQuestion}
                            onChange={(e) => {
                                let rdto = this.state.registerdto;
                                rdto.securityQuestion = e.target.value;
                                this.setState({ registerdto: rdto });
                            }} aria-describedby="securityquestionHelp" />
                        <div id="securityquestionHelp" className="form-text">In case you forget your password, we will ask you this security question. Choose your security question wisely.
                            {/*<br />*/}
                            {/*पासवर्ड भूल जाने पर यही security question आप से पूछा जाएगा। Security question ऐसा रखे जिसका उत्तर सिर्फ आपको पता हो।*/}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="fw-bold">Security Answer <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" maxlength="100" required name="securityAnswer" value={this.state.registerdto.securityAnswer}
                            onChange={(e) => {
                                let rdto = this.state.registerdto;
                                rdto.securityAnswer = e.target.value;
                                this.setState({ registerdto: rdto });
                            }} aria-describedby="securitypasswordHelp" />
                        <div id="securitypasswordHelp" className="form-text">You will be allowed to reset your password only if you provide this security answer.
                            {/*<br />*/}
                            {/*आप को अपना पासवॉर्ड तभी बदलने दिया जाएगा जब आपका security question उत्तर इस से मेल खाएगा।*/}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="fw-bold">Email <span className="text-danger">*</span></label>
                        <input className="form-control" maxLength="250" required name="userEmail" type="email"
                            value={this.state.registerdto.userEmail}
                            onChange={(e) => {
                                let rdto = this.state.registerdto;
                                rdto.userEmail = e.target.value;
                                this.setState({ registerdto: rdto });
                            }} />
                    </div>
                    <button className="btn btn-dark" type="submit">{this.state.loading ? <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div> : "Register"}</button>
                </form>
                {messagecontent}
                {loading}
            </div>
            <p className="text-center my-3">
                Already a Member! <a onClick={this.handleLoginClickHere} className="link-success">Login Here</a>
            </p>
        </React.Fragment> :
            <React.Fragment>
                {logincontents}
                <p className="text-center mt-3 p-3 border-top">
                    Register for FREE <a onClick={this.handleRegisterClickHere} className="link-success">Click Here</a></p>
                {messagecontent}
                {loading}
            </React.Fragment>;
        return <React.Fragment>
            {formcontents}
        </React.Fragment>;
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

class FollowRequestList extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), requests: []
        };
    }

    componentDidMount() {
        this.fetchRequests();
    }

    fetchRequests = () => {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Requests', {
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
                        this.setState({ loading: false, requests: data, bsstyle: '', message: '' });
                    });
                } else if (response.status === 500) {
                    this.setState({ bsstyle: 'danger', message: 'Unable to process this request', loading: false });
                }
            }).catch(() => {
                this.setState({ bsstyle: 'danger', message: 'Unable to process this request, check your internet connection.', loading: false });
            });
    }

    allowRequest = (id) => {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Allow/' + id, {
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
                    this.setState({ loading: false, requests: this.state.requests.filter(t => t.id !== id), bsstyle: '', message: '' });
                } else if (response.status === 500) {
                    this.setState({ bsstyle: 'danger', message: 'Unable to process this request', loading: false });
                }
            }).catch(() => {
                this.setState({ bsstyle: 'danger', message: 'Unable to process this request, check your internet connection.', loading: false });
            });
    }

    rejectRequest = (id) => {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Reject/' + id, {
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
                    this.setState({ loading: false, requests: this.state.requests.filter(t => t.id !== id), bsstyle: '', message: '' });
                } else if (response.status === 500) {
                    this.setState({ bsstyle: 'danger', message: 'Unable to process this request', loading: false });
                }
            }).catch(() => {
                this.setState({ bsstyle: 'danger', message: 'Unable to process this request, check your internet connection.', loading: false });
            });
    }

    renderList = () => {
        var items = [];
        for (let k in this.state.requests) {
            let r = this.state.requests[k];
            items.push(<div key={r.id} className="row mx-0  justify-content-center align-items-center">
                <div className="col px-0">
                    <MemberPicSmall member={r} />
                    <a href={'//' + window.location.host + '/profile?un=' + r.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                        {r.userName}
                    </a>
                </div>
                <div className="col-6">
                    <button type="button" data-id={r.id} onClick={(e) => { this.allowRequest(e.target.getAttribute("data-id")) }} className="btn btn-primary">Allow</button>
                    <button type="button" data-id={r.id} onClick={(e) => { this.rejectRequest(e.target.getAttribute("data-id")) }} className="mx-2 btn btn-secondary">Reject</button>
                </div>
            </div>)
        }
        if (items.length === 0) {
            items.push(<div key={0}>
                <p>No Follow Requests Here.</p>
            </div>)
        }
        return items;
    }

    render() {
        return <React.Fragment>{this.renderList()}</React.Fragment>;
    }

}

class SuggestedAccounts extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), list: []
        };
        this.fetchRecommended = this.fetchRecommended.bind(this);
    }

    componentDidMount() {
        this.fetchRecommended();
    }

    fetchRecommended() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Recommended', {
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
                        console.log("recommended");
                        console.log(data);
                        this.setState({ loading: false, list: data, bsstyle: '', message: '' });
                    });
                } else if (response.status === 500) {
                    this.setState({ bsstyle: 'danger', message: 'Unable to process this request', loading: false });
                }
            }).catch(() => {
                this.setState({ bsstyle: 'danger', message: 'Unable to process this request, check your internet connection.', loading: false });
            });
    }

    renderResult() {

        let items = [];
        for (let k in this.state.list) {
            items.push(<li key={k} className="list-group-item border-0 border-bottom p-2"><MemberSmallRow member={this.state.list[k]} /></li>)
        }
        if (items.length > 0) {
            return <React.Fragment>
                <div className="row mb-1 mt-2">
                    <div className="col-7 fw-bold">Suggested Accounts</div>
                    <div className="col text-end"><button type="button" className="btn btn-light d-none btn-sm">See all</button></div>
                </div>
                <ul className="list-group list-group-flush">
                    {items}
                </ul>
            </React.Fragment>;
        }
        else {
            return null;
        }
    }

    render() {
        if (this.state.loggedin) {
            return <React.Fragment>{this.renderResult()}</React.Fragment>;
        } else {
            return null;
        }
    }
}

class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"), username: '', securityQuestion: '', securityAnswer: '', password: '', verifyPassword: ''
        };
    }

    loadSecurityQuestion = () => {
        this.setState({ loading: true });
        fetch("//" + window.location.host + "/api/members/getsecurityquestion/" + this.state.username, {
            method: "get"
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        this.setState({ loading: false, securityQuestion: data.securityQuestion, bsstyle: '', message: '' });
                    });
                } else {
                    this.setState({ loading: false, securityQuestion: '', bsstyle: 'danger', message: 'Incorrect username provided.' });
                }
            })
            .catch(error => { this.setState({ loading: false, securityQuestion: '', bsstyle: 'danger', message: 'Unable to contact server.' }); });
    };

    savePassword = () => {
        if (this.state.password !== this.state.verifyPassword) {
            this.setState({
                loading: false,
                bsstyle: 'danger',
                message: 'Verify password should match password.',
            });
            return;
        }
        this.setState({ loading: true });
        let fd = new FormData();
        fd.append("username", this.state.username);
        fd.append("question", this.state.securityQuestion);
        fd.append("answer", this.state.securityAnswer);
        fd.append("password", this.state.password);
        fetch("//" + window.location.host + "/api/members/validatesecurityanswer", {
            method: "post",
            body: fd
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({ loading: false, bsstyle: 'success', message: 'Your password is successfully reset. You can try logging in now.' });
                } else if (response.status == 500 || response.status === 400 || response.status === 404) {
                    response.json().then(data => {
                        this.setState({ loading: false, bsstyle: 'danger', message: data.error });
                    });
                } else {
                    this.setState({ loading: false, securityQuestion: '', bsstyle: 'danger', message: 'Incorrect username provided.' });
                }
            })
            .catch(error => { this.setState({ loading: false, securityQuestion: '', bsstyle: 'danger', message: 'Unable to contact server.' }); });
    };

    render() {
        return <div className="bg-white border p-3 rounded-3">
            <h3>Forgot Password</h3>
            <p>Provide your username or email address, you will be asked with security question.</p>
            <form onSubmit={(e) => { e.preventDefault(); this.loadSecurityQuestion(); }}>
                <label className="form-label" >Username</label>
                <div className="row g-0 mb-3">
                    <div className="col-9">

                        <input type="text" className="form-control" style={{ width: "210 px" }} maxlength="300" placeholder="Username or Email" value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }); }} required />
                    </div>
                    <div className="col-3">
                        <button type="submit" className="btn btn-light btn-sm">Load Member</button>
                    </div>
                </div>
            </form>
            {
                this.state.securityQuestion !== "" ?
                    <form onSubmit={(e) => { e.preventDefault(); this.savePassword(); }}>
                        <div className="mb-3">
                            <label className="form-label">Security Question</label>
                            <input type="text" readOnly required className="form-control" value={this.state.securityQuestion} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Security Answer</label>
                            <input type="text" maxLength="300" className="form-control" value={this.state.securityAnswer} onChange={(e) => { this.setState({ securityAnswer: e.target.value }) }} />
                            <div className="form-text">Your new password will set only if your security answer matches with our records.</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input type="password" required className="form-control" minLength="8" value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Verify New Password</label>
                            <input type="password" required className="form-control" value={this.state.verifyPassword} onChange={(e) => { this.setState({ verifyPassword: e.target.value }) }} />
                        </div>
                        <button type="submit" className="btn btn-primary">Save New Password</button>
                    </form>
                    : null
            }

            {this.state.loading ? <div className="progress my-2" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-label="" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }} ></div>
            </div> : null}
            {this.state.message !== "" ? <div className={"my-2 alert alert-" + this.state.bsstyle}>
                {this.state.message}
            </div> : null}
        </div>;
    }
}

class PostShareModal extends React.Component {
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
            post: this.props.post, members: [], memberid: null, search: ''
        };

    }

    render() {
        return <MemberSmallList memberid={this.state.member.id} target="share" />;
    }
}

class AddVideo extends React.Component {
    constructor(props) {
        super(props);
        this.videoinput = null;
        this.videotag = null;
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            video: null, describe: "", allowComment: false, allowShare: false, play: true, muted: true
        };
    }

    videoFileChange = (e) => {
        let fileURL = URL.createObjectURL(e.target.files[0]);
        this.videotag.src = fileURL;
        // wait for duration to change from NaN to the actual duration
        //this.videoinput.ondurationchange = function () {
        //    alert(this.duration);
        //};
    }

    saveData = () => {
        this.setState({ loading: true });
        const fd = new FormData();
        fd.append("Video", this.state.video);
        fd.append("Describe", this.state.describe);
        fd.append("AcceptComment", this.state.allowComment);
        fd.append("AllowShare", this.state.allowShare);

        fetch("//" + location.host + "/api/post/postvideo", {
            method: "post",
            body: fd,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") }
        }).then(response => {
            if (response.status === 200) {
                this.setState({ loading: false });
                location.href = "//" + location.host;
            } else if (response.status === 413) {
                this.setState({ loading: false, bssytle: 'error', message: "Video file too large." })
            }
        })
    }

    render() {
        return <div>
            <div className="mb-3">
                <div className="text-center mb-2">
                    <button type="button" className="btn btn-primary" onClick={() => { this.videoinput.click(); }}><i className="bi bi-upload"></i></button>
                    <input ref={el => { this.videoinput = el }} type="file" className="d-none" onChange={this.videoFileChange} />
                </div>
                <div className="text-center">
                    <video ref={el => { this.videotag = el }} muted className={this.state.video !== null ? "img-fluid" : "d-none img-fluid"} style={{ maxHeight: "600px" }} onDurationChange={(e) => {
                        //alert(e.target.duration);
                        if (e.target.duration < 100) {
                            this.videotag.play();
                            this.setState({ video: this.videoinput.files[0], play: true });
                        } else {
                            this.setState({ video: null, bsstyle: "error", message: "Video should not be more than 30 seconds long." })
                        }
                    }}>
                    </video>
                    {this.state.video !== null ?
                        <div className="my-1">
                            {
                                this.state.play ?
                                    <button type="button" className="btn btn-light btn-sm me-2" onClick={() => { this.videotag.pause(); this.setState({ play: false }); }}><i className="bi bi-pause-fill"></i></button> :
                                    <button type="button" className="btn btn-light btn-sm me-2" onClick={() => { this.videotag.play(); this.setState({ play: true }); }}><i className="bi bi-play-fill"></i></button>
                            }
                            {
                                this.state.muted ?
                                    <button type="button" className="btn btn-light btn-sm me-2" onClick={() => { this.videotag.muted = false; this.setState({ muted: false }); }}><i className="bi bi-volume-mute-fill"></i></button> :
                                    <button type="button" className="btn btn-light btn-sm me-2" onClick={() => { this.videotag.muted = true; this.setState({ muted: true }); }}><i className="bi bi-volume-up-fill"></i></button>
                            }
                        </div> :
                        null}
                </div>
            </div>
            <div className="mb-3">
                <textarea value={this.state.describe} onChange={(e) => { this.setState({ describe: e.target.value }) }} className="form-control border-0 border-bottom" rows="7" placeholder="Add some description to your video..." maxlength="7000"></textarea>
            </div>
            <div className="mb-3 ps-3">
                <div className="form-check form-switch">
                    {this.state.allowComment ?
                        <input className="form-check-input" type="checkbox" role="switch" checked onChange={(e) => { this.setState({ allowComment: false }) }} /> :
                        <input className="form-check-input" type="checkbox" role="switch" onChange={(e) => { this.setState({ allowComment: true }) }} />}
                    <label className="form-check-label" for="acceptcommentchk">Accept Comment On Post</label>
                </div>
            </div>
            <div className="ps-3">
                <div className="form-check form-switch">
                    {this.state.allowShare ?
                        <input className="form-check-input" type="checkbox" role="switch" checked onChange={() => { this.setState({ allowShare: false }); }} /> :
                        <input className="form-check-input" type="checkbox" role="switch" onChange={() => { this.setState({ allowShare: true }); }} />}
                    <label className="form-check-label" for="allowsharechk">Allow Sharing of Post</label>
                </div>
            </div>
            <div><button type="button" className="btn btn-primary" onClick={this.saveData}>Save</button></div>
        </div>
    }
}

class NotificationList extends React.Component {
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
            list: []
        };
    }
    componentDidMount() {
        this.getNotifications();
    }

    getNotifications = () => {
        fetch("//" + location.host + "/api/notification", {
            method: 'get',
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.setState({ list: data.notifications }, () => { this.updateUnseenNotificationCount() });
                });
            }
        });
    }

    addReceivedNotification = (n) => {
        let l = this.state.list;
        l.unshift(n);
        this.setState({ list: l }, () => { this.updateUnseenNotificationCount() });
    }

    updateUnseenNotificationCount = () => {
        let count = this.state.list.filter(t => !t.seen).length;
        if (count > 0) {
            $(".notificationcountcnt").append('<span style="top:8px; font-size:13px;" class="position-absolute start-100 translate-middle badge rounded-pill bg-danger">' + count + ' <span class="visually-hidden">unread messages</span></span>');
            $(".notificationcount").html(count);
        }
        else {
            $(".notificationcountcnt").find(".rounded-pill").remove();
            $(".notificationcount").html("");
        }
    }

    onNotificationClick = (id) => {
        fetch("//" + location.host + "/api/notification/setseen/" + id, {
            method: 'get',
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        }).then((data) => {
            if (data.status === 200) {
                let url = "";
                for (var k in this.state.list) {
                    if (this.state.list[k].id == id) {
                        this.state.list[k].seen = true;
                        url = this.state.list[k].url;
                        break;
                    }
                }
                this.setState({ list: this.state.list }, () => { location.href = this.getURL(url); });
            }
        });

    }

    getURL = (p) => {
        if (p.startsWith("https://") || p.startsWith("http://") || p.startsWith("//") || p.startsWith("data:")) {
            return p;
        } else {
            return '//' + location.host + '/' + p;
        }
    }

    render() {
        let items = [];
        for (let k in this.state.list) {
            let n = this.state.list[k];
            items.push(<div className='row g-1 mb-2 pointer' key={k}>
                <div className='col-1'>
                    <img src={this.getURL(n.pic)} className="img-fluid rounded-1" data-id={n.id} onClick={(e) => { this.onNotificationClick(e.target.getAttribute("data-id")); }} />
                </div>
                <div className='col'>
                    <p data-id={n.id} onClick={(e) => { this.onNotificationClick(e.target.getAttribute("data-id")); }} className={"m-0 p-0 " + (!n.seen ? "fw-bold" : "")}>{n.title}</p>
                    {n.type === 4 ? <span className="text-primary fw-bold fs-12">Follow Request</span> : null}
                    <span className="fs-12">{dayjs(n.createDate).format("DD-MMM-YYYY")}</span>
                </div>
                {n.pic2 !== "" ? <div className='col-1'>
                    <img src={this.getURL(n.pic2)} className="img-fluid rounded-1" data-id={n.id} onClick={(e) => { this.onNotificationClick(e.target.getAttribute("data-id")); }} />
                </div> : null}
            </div>);
        }
        return <React.Fragment>{items}</React.Fragment>;
    }
}

class AskPushNotification extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.reg = null;
        this.state = {
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            permission: "", showModal: true, mode: "none"
        };
    }
    componentDidMount() {
        this.registerServiceWorker();
    }

    registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then((reg) => {
                    this.reg = reg;
                    if (Notification.permission === "granted") {
                        this.setState({ permission: Notification.permission }, this.getSubscription);
                    } else if (Notification.permission === "blocked" || Notification.permission === "denied") {
                        this.setState({ mode: "blocked" });
                    } else {
                        this.setState({ mode: "ask" });
                    }
                });
        } else {
            this.setState({ mode: "nosupport" });
        }
    }

    getSubscription = () => {
        this.reg.pushManager.getSubscription().then((sub) => {
            if (sub === null) {
                this.reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: "BASWJ1rjpkuNXNGWd0eJ49ZO5y2jCIwU-XdfVqomefHFa1YrgKiYPncNtezdkNIhtloySBXcnWQbWrdYW4e7-p8"
                }).then((sub) => {
                    this.sendSubscriptionData(sub);
                }).catch(function (e) {
                    console.error("Unable to subscribe to push", e);
                    this.setState({ mode: "ask", bsstyle: 'error', message: "Unable to subscribe to push. Try again." });
                });
            } else {
                this.sendSubscriptionData(sub);
            }
        });
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    sendSubscriptionData = (sub) => {
        var frm = new FormData();
        frm.append("endpoint", sub.endpoint);
        frm.append("p256dh", this.arrayBufferToBase64(sub.getKey("p256dh")));
        frm.append("auth", this.arrayBufferToBase64(sub.getKey("auth")));
        fetch("//" + location.host + "/api/Members/subscribenotification", {
            method: 'post',
            body: frm,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(data => {
            this.setState({ mode: "done" });
        }).catch(err => {
            this.setState({ mode: "ask", bsstyle: 'error', message: "Unable to contact server. No internet connection." });
        });
    }

    requestNotificationAccess = () => {
        Notification.requestPermission().then((status) => {
            if (status == "granted") {
                this.setState({ permission: status, noSupport: null }, this.getSubscription);
            } else if (status === "blocked" || status === "denied") {
                this.setState({ permission: status, mode: "ask" });
            } else {
                this.setState({ permission: "", mode: "ask" });
            }
        });
    }

    renderModal = (message) => {
        return <React.Fragment><div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5">Get Yocail Notifications</h1>
                        <button type="button" className="btn-close" onClick={() => { this.setState({ showModal: false }); }}></button>
                    </div>
                    <div className="modal-body">
                        {message !== "" ? <div className="my-1 fw-bold">{message}</div> : null}
                        <button onClick={this.requestNotificationAccess} className="btn btn-success my-2">Allow Notification</button>
                    </div>
                </div>
            </div>
        </div>
            <div className="modal-backdrop fade show"></div>
        </React.Fragment>;

    };

    render() {
        if (this.state.mode === "nosupport" || this.state.mode === "done") {
            return <React.Fragment></React.Fragment>;
        }
        let message = "Remain up to date with latest comments, reactions and content.";
        if (this.state.permission === "blocked") {
            message = "You have blocked the notification.";
        } else if (this.state.permission === "denied") {
            message = "Notification permission is denied. Please allow yocail browser notifications.";
        }
        if (this.state.mode === "ask") {
            if (this.state.showModal) {
                return <React.Fragment>{this.renderModal(message)}</React.Fragment>
            } else {
                return <div className="p-1 border rounded-3 mb-2 bg-white">
                    <div className="text-center">
                        <div className="my-1">{message}</div>
                        <button onClick={this.requestNotificationAccess} className="btn btn-success my-2">Allow Notification</button>
                    </div>
                </div>;
            }
        }
        return <React.Fragment></React.Fragment>;
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
                let img = "<a href='" + l + "' target='_blank'><img src='" + l + "' className='img-fluid d-block mt-1 mb-1 img-thumbnail' style='width:300px; '/></a>";
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

class SendInvite extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.textarea = null;
        let myself = localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself"));
        let inviteText = "Check this new website I found, http://yocail.com\r\n\r\nYou can post your pictures here, connect with people.";
        if (myself !== null)
            inviteText = inviteText + "\r\n\r\nMy profile on Yocail is http://yocail.com/profile?un=" + myself.userName;
        this.state = {
            loading: false, loggedin: loggedin, success: '', error: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            showModal: false, text: inviteText
        };
    }

    removeSuccessMessage = () => {
        this.setState({ success: "" });
    }

    copyInviteText = () => {
        // Get the text field
        //var copyText = this.state.text;

        if (this.textarea !== null) {
            // Select the text field
            this.textarea.select();
            this.textarea.setSelectionRange(0, 99999); // For mobile devices
        }
        // Copy the text inside the text field
        navigator.clipboard.writeText(this.state.text);

        this.setState({ success: "Message copied to clibboard." }, () => { setTimeout(this.removeSuccessMessage, 2000); })
    }

    renderModal() {
        if (this.state.showModal) {
            return <React.Fragment>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Spread The Word</h1>
                                <button type="button" className="btn-close" onClick={() => { this.setState({ showModal: false }); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <textarea ref={(el) => { this.textarea = el; }} rows="7" className="form-control" value={this.state.text}
                                    onChange={(e) => { this.setState({ text: e.target.value }); }}></textarea>
                                <p>You can use this text to invite your friends to yocail.<br /> Share this text over whatsapp or email.</p>
                                {this.state.success !== "" ? <div className="text-success my-1">{this.state.success}</div> : null}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary me-2" onClick={this.copyInviteText}>Copy Invite Text</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </React.Fragment>;
        }
        else return null;
    }

    render() {

        if (this.state.loggedin) {
            return <React.Fragment>
                <div className="text-center mb-2 p-2 rounded-2 bg-white">
                    <div className="my-1">Invite your friends and build your followers.</div>
                    <button onClick={() => { this.setState({ showModal: true }); }} type="button" className="btn btn-outline-dark my-2"><i className="bi bi-heart-fill text-danger"></i> Tell a Friend</button>
                </div>
                {this.renderModal()}
            </React.Fragment>;
        } else {
            return null;
        }
    }
}

class AutoAdjustTextArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cssclass: this.props.cssclass, htmlattr: this.props.htmlattr,
            maxlength: this.props.maxlength,
            value: this.props.value, rows: this.props.minRows,
            maxRows: this.props.maxRows, minRows: this.props.minRows
        };
    }
    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }
    valueChanged = (val) => {
        let newlines = val.split("\n").length;
        if (newlines > this.state.maxRows) newlines = this.state.maxRows;
        else if (newlines < this.state.minRows) newlines = this.state.minRows;
        this.setState({ value: val, rows: newlines }, () => { this.props.onChange(this.state.value); });
    };

    render() {
        return <textarea maxLength={this.state.maxlength} {...this.state.htmlattr} rows={this.state.rows} className={this.props.cssclass} value={this.state.value} onChange={(e) => { this.valueChanged(e.target.value); }}></textarea>;
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

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
            return <ul class="list-group list-group-flush">
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
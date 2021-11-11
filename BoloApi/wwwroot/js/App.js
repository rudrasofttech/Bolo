﻿class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: localStorage.getItem("token"),
            user: localStorage.getItem("user"),
            mainview: localStorage.getItem("token") === null ? "login" : "conversation",
            loginform: { email: "", password: "" },
            registerform: {name: "", email: ""}
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
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false, loading: false, user: null, token:'' });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ bsstyle: '', message: "", loggedin: true, loading: false, user: data, mainview : this.state.mainview !== "profile" ?  "conversation" : "profile"});
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

    renderHeader() {
        if (this.state.mainview !== "login" && this.state.mainview !== "register") {
            const token = localStorage.getItem("token");
            let linkitems = [];
            let loggedin = true;
            if (token === null) {
                loggedin = false;
            }

            let profilepic = null;
            if (loggedin && this.state.user !== null) {
                profilepic = <img src={this.state.user.pic} width="20" height="20" className="rounded-circle" />
            }

            if (loggedin) {
                linkitems.push(<button key={"memberlinkli"} type="button" className="btn btn-dark me-2 membernavlink" onClick={() => { this.setState({ mainview: "profile" }); }}>{profilepic} {this.state.user !== null ? this.state.user.name : ""}</button>);
                linkitems.push(<button key={"logoutlinkli"} type="button" className="btn btn-dark" title="Sign out" onClick={(e) => {
                    e.preventDefault();
                    localStorage.clear();
                    location.reload();
                }}><i className="bi bi-power"></i></button>);
            } else {
                linkitems.push(<button key={"loginlinkli"} type="button" className="btn btn-dark me-2" onClick={() => { this.setState({ mainview: "login" }); }} >Login</button>);
                linkitems.push(<button key={"registerlinkli"} type="button" className="btn btn-dark" onClick={() => { this.setState({ mainview: "register" }); }}>Register</button>);
            }

            return <div className="container-fluid bg-dark">
                <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-1 ">
                    <a href="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-white text-decoration-none">
                        Waarta
                        </a>
                    <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                        <li><a className="nav-link px-2 text-white" onClick={() => { this.setState({ mainview: "conversation" }) }} title="Chat"><i className="bi bi-chat-dots"></i> Chat</a></li>
                        <li><a className="nav-link px-2 text-white" onClick={() => { this.setState({ mainview: "discussion" }) }} title="Discussion"><i className="bi bi-people-fill"></i> Discussion</a></li>
                    </ul>
                    <div className="col-md-3 text-end">
                        {linkitems}
                        <a className="px-2 text-white" onClick={() => { this.setState({ mainview: "faq" }) }} title="Frequently Asked Questions"><i className="bi bi-patch-question"></i></a>
                        <a className="px-2 text-white" onClick={() => { this.setState({ mainview: "privacy" }) }} title="Privacy"><i className="bi bi-eye-slash-fill"></i></a>
                    </div>
                </header>
            </div>;
        } else {
            return null;
        }
    }

    renderLogin() {
        if (this.state.mainview == "login") {
            return <div className="row align-items-center justify-content-center m-3" style={{ height: "85vh"}}>
                <div className="col-4">
                    <h1 className="cover-heading" style={{ fontSize: "3.5rem" }}>Waarta</h1>
                    <p className="lead">Easily connect with people. Have meaningful conversations. Free exchange of Ideas. Get things done.<br /> Made in India.</p>
                </div>
                <div className="col-4">
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

    renderProfile() {
        if (this.state.mainview === "profile") {
            return <div className="container-fluid"><ManageProfile onProfileChange={() => { this.fetchData() }} /></div>;
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

    renderPrivacy() {
        if (this.state.mainview === "privacy") {
            return <Privacy />;
        } else {
            return null;
        }
    }

    renderFAQ() {
        if (this.state.mainview === "faq") {
            return <main role="main" className="inner cover" style={{ padding: "20px" }}>
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
        return (
            <AuthContext.Provider value={{
                data: this.state.data,
                token: this.state.token,
                setToken: this.setToken,
                setData: this.setData
            }}>
                {this.renderHeader()}
                {this.renderLogin()}
                {this.renderProfile()}
                {this.renderRegister(messagecontent, loading)}
                {this.renderConversation()}
                {this.renderDiscussion()}
                {this.renderFAQ()}
                {this.renderPrivacy()}
            </AuthContext.Provider>
        );
    }
}
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class IgnoredUsers extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "fetchData", () => {
            this.setState({
                loading: true
            });
            let url = '//' + window.location.host + '/api/Ignored?q=' + this.state.q;
            fetch(url, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        this.setState({
                            loggedin: true,
                            loading: false,
                            items: data
                        });
                    });
                }
            });
        });
        _defineProperty(this, "removeMember", userid => {
            this.setState({
                loading: true
            });
            let url = '//' + window.location.host + '/api/Ignored/remove/' + userid;
            fetch(url, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    response.text().then(data => {
                        console.log(data);
                        if (data === "true") {
                            this.setState({
                                loading: false,
                                items: this.state.items.filter(t => t.id !== userid)
                            });
                        }
                    });
                }
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            q: '',
            items: []
        };
    }
    componentDidMount() {
        this.fetchData();
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0 bg-white"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-6 offset-lg-3 mt-5"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            })));
        }
        let temp = [];
        for (let k in this.state.items) {
            temp.push( /*#__PURE__*/React.createElement("table", {
                key: this.state.items[k].id,
                className: "w-100 mb-2 border-bottom",
                cellPadding: "0",
                cellSpacing: "0"
            }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                width: "35px",
                className: "p-1",
                align: "center",
                valign: "middle"
            }, /*#__PURE__*/React.createElement(MemberPicSmall, {
                member: this.state.items[k]
            })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
                href: '//' + window.location.host + '/profile?un=' + this.state.items[k].userName,
                className: "text-dark text-decoration-none"
            }, this.state.items[k].userName)), /*#__PURE__*/React.createElement("td", {
                width: "100px",
                align: "right"
            }, /*#__PURE__*/React.createElement("button", {
                className: "btn btn-secondary",
                "data-userid": this.state.items[k].id,
                onClick: e => {
                    this.removeMember(e.target.getAttribute("data-userid"));
                },
                type: "button"
            }, "Remove"))))));
        }
        if (temp.length === 0) {
            temp.push( /*#__PURE__*/React.createElement("table", {
                className: "w-100 mb-1",
                cellPadding: "0",
                cellSpacing: "0"
            }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                align: "center",
                valign: "middle"
            }, "No ignored members found.")))));
        }
        return /*#__PURE__*/React.createElement("div", {
            className: "bg-white px-2"
        }, /*#__PURE__*/React.createElement("h3", {
            className: "text-center"
        }, "Ignored Members"), temp);
    }
}
class App extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "setToken", data => {
            this.setState({
                token: data
            });
        });
        _defineProperty(this, "setData", data => {
            this.setState({
                data: data
            });
        });
        this.state = {
            token: localStorage.getItem("token"),
            user: localStorage.getItem("myself"),
            mainview: localStorage.getItem("token") === null ? "login" : "home",
            loginform: {
                email: "",
                password: ""
            },
            registerform: {
                name: "",
                email: ""
            },
            postid: 0
        };
        this.fetchData = this.fetchData.bind(this);
        //this.handleLogin = this.handleLogin.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
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
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.clear();
                this.setState({
                    bsstyle: 'danger',
                    message: "Authorization has been denied for this request.",
                    loggedin: false,
                    loading: false,
                    user: null,
                    token: ''
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    this.setState({
                        bsstyle: '',
                        message: "",
                        loggedin: true,
                        loading: false,
                        user: data
                    });
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
                return /*#__PURE__*/React.createElement("div", {
                    className: "alert alert-light text-center",
                    role: "alert"
                }, "Password recovery question and answer is missing from you profile.\xA0 ", /*#__PURE__*/React.createElement("a", {
                    className: "text-danger fs-bold",
                    onClick: () => {
                        this.setState({
                            mainview: "manageprofile"
                        });
                    }
                }, "Update Profile Now"));
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
                profilepic = /*#__PURE__*/React.createElement("img", {
                    src: this.state.user.pic,
                    width: "20",
                    height: "20",
                    className: "rounded"
                });
            } else {
                profilepic = /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-person-square"
                });
            }
            if (loggedin) {
                linkitems.push( /*#__PURE__*/React.createElement("td", {
                    key: 1,
                    align: "center",
                    valign: "middle",
                    width: "55px"
                }, /*#__PURE__*/React.createElement("a", {
                    className: "text-dark fs-3",
                    onClick: () => {
                        this.setState({
                            mainview: "profile"
                        });
                    },
                    title: "Profile"
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-person-badge"
                }))));
            } else {
                linkitems.push( /*#__PURE__*/React.createElement("td", {
                    key: 2,
                    align: "center",
                    valign: "middle",
                    width: "55px"
                }, /*#__PURE__*/React.createElement("a", {
                    className: "text-dark fs-3",
                    onClick: () => {
                        this.setState({
                            mainview: "login"
                        });
                    },
                    title: "Login"
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-person-badge"
                }))));
            }
            return /*#__PURE__*/React.createElement("div", {
                className: "container-xl px-0 fixed-top bg-light maxwidth border border-top-0"
            }, /*#__PURE__*/React.createElement("table", {
                cellPadding: "5",
                cellSpacing: "0",
                width: "100%",
                className: "my-1"
            }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
                onClick: () => {
                    this.setState({
                        mainview: "home"
                    });
                },
                className: "text-dark text-decoration-none fs-4"
            }, "Waarta")), /*#__PURE__*/React.createElement("td", {
                align: "center",
                valign: "middle",
                width: "55px"
            }, /*#__PURE__*/React.createElement("a", {
                className: "text-dark fs-3",
                onClick: () => {
                    this.setState({
                        mainview: "home"
                    });
                },
                title: "Home"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-house"
            }))), /*#__PURE__*/React.createElement("td", {
                align: "center",
                valign: "middle",
                width: "55px"
            }, /*#__PURE__*/React.createElement("a", {
                className: "text-dark fs-3",
                onClick: () => {
                    this.setState({
                        mainview: "add"
                    });
                },
                title: "Add Post"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-journal-plus"
            }))), /*#__PURE__*/React.createElement("td", {
                align: "center",
                valign: "middle",
                width: "55px"
            }, /*#__PURE__*/React.createElement("a", {
                className: "text-dark fs-3",
                onClick: () => {
                    this.setState({
                        mainview: "notification"
                    });
                },
                title: "Notifications"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-bell"
            }))), linkitems), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                colSpan: "6",
                align: "left"
            }, /*#__PURE__*/React.createElement(Search, null))))));
        } else {
            return null;
        }
    }
    renderFooter() {
        if (this.state.mainview !== "login" && this.state.mainview !== "register") {
            return /*#__PURE__*/React.createElement("nav", {
                className: "navbar navbar-expand-lg navbar-light border-top"
            }, /*#__PURE__*/React.createElement("div", {
                className: "container"
            }, /*#__PURE__*/React.createElement("div", {
                className: "justify-content-md-end"
            }, /*#__PURE__*/React.createElement("a", {
                className: "text-dark mx-2",
                onClick: () => {
                    this.setState({
                        mainview: "faq"
                    });
                },
                title: "Frequently Asked Questions"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-patch-question"
            })), /*#__PURE__*/React.createElement("a", {
                className: "text-dark mx-2",
                onClick: () => {
                    this.setState({
                        mainview: "privacy"
                    });
                },
                title: "Privacy"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-eye-slash-fill"
            })))));
        } else {
            return null;
        }
    }
    renderLogin() {
        if (this.state.mainview == "login") {
            return /*#__PURE__*/React.createElement("div", {
                className: "row align-items-center justify-content-center m-3",
                style: {
                    height: "85vh"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-md-4"
            }, /*#__PURE__*/React.createElement("h1", {
                className: "cover-heading",
                style: {
                    fontSize: "3.5rem"
                }
            }, "Waarta"), /*#__PURE__*/React.createElement("p", {
                className: "lead"
            }, "Easily connect with people. Have meaningful conversations. Free exchange of Ideas. Get things done.", /*#__PURE__*/React.createElement("br", null), " Made in India.")), /*#__PURE__*/React.createElement("div", {
                className: "col-md-4"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                onLogin: this.loginHandler,
                beginWithRegister: false
            })));
        } else {
            return null;
        }
    }
    renderRegister(message, loading) {
        if (this.state.mainview === "register") {
            return /*#__PURE__*/React.createElement("div", {
                className: "row justify-content-center m-3"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-4"
            }), /*#__PURE__*/React.createElement("div", {
                className: "col-4"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                onLogin: this.loginHandler,
                beginWithRegister: false
            })));
        } else {
            return null;
        }
    }
    renderManageProfile() {
        if (this.state.mainview === "manageprofile") {
            return /*#__PURE__*/React.createElement(ManageProfile, {
                onProfileChange: () => {
                    this.fetchData();
                },
                onBack: () => {
                    this.setState({
                        mainview: "profile"
                    });
                }
            });
        } else {
            return null;
        }
    }
    renderProfile() {
        if (this.state.mainview === "profile") {
            return /*#__PURE__*/React.createElement(Profile, {
                username: this.state.user.userName,
                onClickSettings: () => {
                    this.setState({
                        mainview: "manageprofile"
                    });
                }
            });
        } else {
            return null;
        }
    }
    renderConversation() {
        if (this.state.mainview === "conversation") {
            return /*#__PURE__*/React.createElement(Conversation, null);
        } else {
            return null;
        }
    }
    renderDiscussion() {
        if (this.state.mainview === "discussion") {
            return /*#__PURE__*/React.createElement(Meetings, null);
        } else {
            return null;
        }
    }
    renderHome() {
        if (this.state.mainview === "home") {
            return /*#__PURE__*/React.createElement(Home, null);
        } else {
            return null;
        }
    }
    renderPrivacy() {
        if (this.state.mainview === "privacy") {
            return /*#__PURE__*/React.createElement(Privacy, null);
        } else {
            return null;
        }
    }
    renderFAQ() {
        if (this.state.mainview === "faq") {
            return /*#__PURE__*/React.createElement("main", {
                role: "main",
                className: "inner cover container py-5"
            }, /*#__PURE__*/React.createElement("h1", null, "Frequently Asked Questions"), /*#__PURE__*/React.createElement("h4", null, "What is Waarta?"), /*#__PURE__*/React.createElement("p", null, "Waarta is a hindi word which literally means communication."), /*#__PURE__*/React.createElement("h4", null, "Purpose of Waarta"), /*#__PURE__*/React.createElement("p", null, "Sole purpose of waarta is to help facilitate communication between people. Waarta achieves this by providing a set of powerful features like people search, conversations and meetings."), /*#__PURE__*/React.createElement("h4", null, "People Search?"), /*#__PURE__*/React.createElement("p", null, "\"People Search\" as the name suggest is a search feature through which you can search member profiles on waarta. For example if you are looking for a software engineer with ASP.net skill and 10 years of experience in New Delhi. You can can search the same on waarta and find elligible profiles. ", /*#__PURE__*/React.createElement("br", null), "You have to visit conversations page to do a people search."), /*#__PURE__*/React.createElement("h4", null, "Conversations"), /*#__PURE__*/React.createElement("p", null, "\"Conversation\" is a powerful one to one online text, audio and video chat feature, through which you can communicate with your contacts on waarta and with the people you searched on waarta."), /*#__PURE__*/React.createElement("h4", null, "Discussions"), /*#__PURE__*/React.createElement("p", null, "A place where like minded people can share ideas on topics of their choice. There is no restrictions on number of members a dicussion can have."));
        } else {
            return null;
        }
    }
    render() {
        let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-valuenow": "75",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: "100%"
            }
        })) : null;
        let messagecontent = this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
            className: "mt-1 alert alert-" + this.state.bsstyle
        }, this.state.message) : null;
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "container-xl maxwidth g-0",
            style: {
                minHeight: "calc(100vh - 143px)"
            }
        }, this.renderProfileCompleteness(), this.renderLogin(), this.renderHome(), this.renderProfile(), this.renderManageProfile(), this.renderRegister(messagecontent, loading), this.renderConversation(), this.renderDiscussion(), this.renderFAQ(), this.renderPrivacy()), this.renderFooter());
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
            loading: null,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            search: this.props.search !== "" ? this.props.search : "userfeed"
        };
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row bg-white g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-6 offset-lg-3 p-3 pt-5 "
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            })));
        }
        return /*#__PURE__*/React.createElement("div", {
            className: "row mt-1 g-0"
        }, /*#__PURE__*/React.createElement("div", {
            className: "col-lg-8"
        }, /*#__PURE__*/React.createElement(MemberPostList, {
            search: this.state.search,
            viewMode: 2,
            viewModeAllowed: "false"
        })), /*#__PURE__*/React.createElement("div", {
            className: "col-lg-4"
        }, /*#__PURE__*/React.createElement("div", {
            style: {
                position: "-webkit-sticky",
                position: "sticky",
                top: "63px"
            },
            className: "ps-2"
        }, /*#__PURE__*/React.createElement(SendInvite, null), /*#__PURE__*/React.createElement(SuggestedAccounts, null))));
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
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            q: '',
            items: [],
            eitems: new Map(),
            emodel: null,
            searchactivetab: 'people'
        };
        this.search = this.search.bind(this);
    }
    search() {
        this.setState({
            loading: true
        });
        let url = '//' + window.location.host + '/api/search?q=' + this.state.q.replace("#", "");
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({
                        loggedin: true,
                        loading: false,
                        items: data
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
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                items.push( /*#__PURE__*/React.createElement("li", {
                    key: i,
                    className: "list-group-item border-0 border-bottom p-2"
                }, /*#__PURE__*/React.createElement(MemberSmallRow, {
                    member: p.member
                })));
            } else if (p.hashtag) {
                items.push( /*#__PURE__*/React.createElement("li", {
                    key: i,
                    className: "list-group-item border-0 border-bottom p-2"
                }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
                    className: "text-dark fw-bold text-decoration-none",
                    href: '//' + window.location.host + '/?q=%23' + p.hashtag.tag
                }, "#", p.hashtag.tag), /*#__PURE__*/React.createElement("div", null, p.hashtag.postCount, " Posts"))));
            }
            i++;
        }
        if (items.length > 0) {
            return /*#__PURE__*/React.createElement("ul", {
                className: "list-group list-group-flush"
            }, items);
        } else {
            return null;
        }
    }
    render() {
        if (!this.state.loggedin) {
            return null;
        }
        let loading = null;
        if (this.state.loading) {
            loading = /*#__PURE__*/React.createElement("div", {
                className: "progress fixed-bottom",
                style: {
                    height: "5px"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-striped progress-bar-animated",
                role: "progressbar",
                "aria-valuenow": "100",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: {
                    width: "100%"
                }
            }));
        }
        let clearsearchhtml = /*#__PURE__*/React.createElement("div", {
            className: "col-md-1 col-2 p-0 text-center"
        }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-light",
            "aria-label": "Close",
            onClick: () => {
                this.setState({
                    q: '',
                    items: []
                });
            }
        }, /*#__PURE__*/React.createElement("i", {
            className: "bi bi-trash"
        })));
        if (this.state.q === '') {
            clearsearchhtml = null;
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, loading, /*#__PURE__*/React.createElement("div", {
            className: "row mx-0"
        }, /*#__PURE__*/React.createElement("div", {
            className: "col p-0"
        }, /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            value: this.state.q,
            onChange: e => {
                this.setState({
                    q: e.target.value
                });
            },
            placeholder: "Search People, Topics, Hashtags",
            maxLength: "150",
            onKeyUp: e => {
                if (e.keyCode === 13) {
                    this.search();
                }
            }
        })), clearsearchhtml), this.renderSearchResult());
    }
}
class Post extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "fetchPost", () => {
            this.setState({
                loading: true
            });
            let url = '//' + window.location.host + '/api/post/' + this.state.id;
            fetch(url, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        this.setState({
                            loading: false,
                            post: data
                        });
                    });
                }
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: null,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            id: this.props.id,
            post: null
        };
    }
    componentDidMount() {
        this.fetchPost();
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0 bg-white"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-6 offset-lg-3 mt-5"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            })));
        }
        if (this.state.post !== null) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-8"
            }, /*#__PURE__*/React.createElement(MemberPost, {
                post: this.state.post,
                ondelete: id => {
                    this.setState({
                        post: null
                    });
                },
                onIgnoredMember: userid => { }
            })), /*#__PURE__*/React.createElement("div", {
                className: "col-lg-4"
            }, /*#__PURE__*/React.createElement("div", {
                style: {
                    position: "-webkit-sticky",
                    position: "sticky",
                    top: "63px"
                },
                className: "ps-1"
            }, /*#__PURE__*/React.createElement(SendInvite, null), /*#__PURE__*/React.createElement(SuggestedAccounts, null))));
        } else {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-8"
            }, !this.state.loading ? /*#__PURE__*/React.createElement("p", null, "No post found.") : ""), /*#__PURE__*/React.createElement("div", {
                className: "col-lg-4"
            }, /*#__PURE__*/React.createElement("div", {
                style: {
                    position: "-webkit-sticky",
                    position: "sticky",
                    top: "63px"
                },
                className: "ps-1"
            }, /*#__PURE__*/React.createElement(SendInvite, null), /*#__PURE__*/React.createElement(SuggestedAccounts, null))));
            ;
        }
    }
}
class MemberPost extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "editPost", () => {
            this.setState({
                loading: true
            });
            fetch('//' + window.location.host + '/api/post/edit/' + this.state.post.id, {
                method: 'post',
                body: JSON.stringify({
                    describe: this.state.post.describe,
                    acceptComment: this.state.post.acceptComment,
                    allowShare: this.state.post.allowShare
                }),
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token"),
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false,
                        message: '',
                        bsstyle: '',
                        showModal: '' /*showeditform: false, showpostoptions: false*/
                    });
                } else if (response.status > 400 && response.status < 500) {
                    this.setState({
                        loading: false,
                        message: 'Unable to process request',
                        bsstyle: 'danger'
                    });
                } else {
                    try {
                        response.json().then(data => {
                            this.setState({
                                loading: false,
                                message: data.error,
                                bsstyle: 'danger'
                            });
                        });
                    } catch (err) {
                        this.setState({
                            loading: false,
                            message: 'Unable to save ' + name,
                            bsstyle: 'danger'
                        });
                    }
                }
            }).catch(() => {
                this.setState({
                    loading: false,
                    message: 'Unable to contact server',
                    bsstyle: 'danger'
                });
            });
        });
        _defineProperty(this, "removeMessage", () => {
            this.setState({
                bsstyle: '',
                message: ''
            });
        });
        _defineProperty(this, "deletePost", () => {
            fetch('//' + window.location.host + '/api/post/delete/' + this.state.post.id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    let id = this.state.post.id;
                    this.setState({
                        loading: false,
                        message: '',
                        bsstyle: '',
                        showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                        post: null
                    }, () => {
                        if (this.props.ondelete !== undefined && this.props.ondelete !== null) {
                            this.props.ondelete(id);
                        }
                    });
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({
                                showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                                loading: false,
                                message: data.error,
                                bsstyle: 'danger'
                            });
                        });
                    } catch (err) {
                        this.setState({
                            showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                            loading: false,
                            message: 'Unable to save ' + name,
                            bsstyle: 'danger'
                        });
                    }
                } else {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({
                                showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                                loading: false,
                                message: data.error,
                                bsstyle: 'danger'
                            });
                        });
                    } catch (err) {
                        this.setState({
                            showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                            loading: false,
                            message: 'Unable to save ' + name,
                            bsstyle: 'danger'
                        });
                    }
                }
            }).catch(data => {
                this.setState({
                    showModal: '' /*showeditform: false, showdeletemodal: false, showpostoptions: false*/,
                    loading: false,
                    message: 'Unable to contact server',
                    bsstyle: 'danger'
                });
            });
        });
        _defineProperty(this, "ignoreMember", () => {
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
        });
        _defineProperty(this, "flagPost", typeid => {
            fetch('//' + window.location.host + '/api/post/flag/' + this.state.post.id + "?type=" + typeid, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            }).then(response => {
                if (response.status === 200) {
                    this.setState({
                        showModal: ''
                    }, () => {
                        alert("Thank you! for reporting the post.");
                    });
                } else {
                    this.setState({
                        showModal: ''
                    }, () => {
                        alert("Unable to process your request");
                    });
                }
            }).catch(() => {
                this.setState({
                    showModal: ''
                }, () => {
                    alert("Unable to process your request");
                });
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post,
            showreactionlist: false,
            hashtag: this.props.hashtag ? this.props.hashtag : '',
            showCommentBox: false,
            showpostoptions: false,
            showeditform: false,
            showdeletemodal: false,
            showflagmodal: false,
            showModal: '' /*reaction,comment,post,edit,delete,flag,share */
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
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    var p = this.state.post;
                    p.hasReacted = data.hasReacted;
                    p.reactionCount = data.reactionCount;
                    this.setState({
                        loading: false,
                        message: '',
                        bsstyle: '',
                        post: p
                    });
                });
            } else if (response.status === 400) {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to save ' + name,
                        bsstyle: 'danger'
                    });
                }
            } else {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to save ' + name,
                        bsstyle: 'danger'
                    });
                }
            }
        });
    }
    sharePost(sharewithid) {
        fetch('//' + window.location.host + '/api/post/share/' + this.state.post.id + "?uid=" + sharewithid, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                this.setState({
                    loading: false,
                    bsstyle: "success",
                    message: "Post is shared."
                });
                setTimeout(this.removeMessage, 1500);
            } else if (response.status === 400 || response.status === 500) {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to process your request',
                        bsstyle: 'danger'
                    });
                }
            } else {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to save ' + name,
                        bsstyle: 'danger'
                    });
                }
            }
        });
    }
    renderPostOptions() {
        if (this.state.showModal === "post" /*this.state.showpostoptions*/) {
            let deletebtn = null;
            let ignoreaccbtn = null,
                editbtn = null;
            if (this.state.post.owner.id === this.state.myself.id) {
                editbtn = /*#__PURE__*/React.createElement("div", {
                    className: "text-center border-bottom mb-1 p-1"
                }, /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-link btn-lg text-decoration-none text-primary",
                    onClick: () => {
                        this.setState({
                            showModal: 'edit' /*showdeletemodal: false, showeditform: true, showpostoptions: false*/
                        });
                    }
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-pencil-fill me-2"
                }), " Edit Post"));
                deletebtn = /*#__PURE__*/React.createElement("div", {
                    className: "text-center border-bottom mb-1 p-1"
                }, /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-link btn-lg text-decoration-none text-danger",
                    onClick: () => {
                        this.setState({
                            showModal: 'delete' /*showdeletemodal: true, showeditform: false, showpostoptions: false*/
                        });
                    }
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-trash3-fill  me-2"
                }), " Delete Post"));
            }
            if (this.state.post.owner.id !== this.state.myself.id) {
                ignoreaccbtn = /*#__PURE__*/React.createElement("div", {
                    className: "text-center mb-1 p-1"
                }, /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-link btn-lg text-decoration-none text-danger",
                    onClick: () => {
                        this.ignoreMember();
                    }
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-sign-stop-fill me-2"
                }), " Ignore Member"));
            }
            return /*#__PURE__*/React.createElement("div", {
                className: "modal d-block",
                tabIndex: "-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, editbtn, deletebtn, ignoreaccbtn, /*#__PURE__*/React.createElement("div", {
                className: "text-center mb-1 p-1"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link btn-lg text-decoration-none text-danger",
                onClick: () => {
                    this.setState({
                        showModal: 'flag' /*showflagmodal: true, showdeletemodal: false, showeditform: false, showpostoptions: false*/
                    });
                }
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-flag-fill me-2"
            }), " Report Post"))), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer text-center"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showpostoptions: false*/
                    });
                },
                "data-bs-dismiss": "modal"
            }, "Close")))));
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
        let ownerlink = this.state.hashtag !== '' ? /*#__PURE__*/React.createElement("div", {
            className: "d-inline-block"
        }, /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/post/hastag?ht=' + this.state.hashtag,
            className: "fs-6 fw-bold  text-dark text-decoration-none"
        }, p.owner.userName), /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/profile?un=' + p.owner.userName,
            className: "fs-6 text-dark text-decoration-none"
        }, p.owner.userName)) : /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/profile?un=' + p.owner.userName,
            className: "fs-6 fw-bold pointer d-inline-block text-dark text-decoration-none"
        }, p.owner.userName);
        let owner = /*#__PURE__*/React.createElement("table", {
            className: "w-100 mb-3",
            cellPadding: "0",
            cellSpacing: "0"
        }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
            width: "45px",
            valign: "top"
        }, /*#__PURE__*/React.createElement(MemberPicSmall, {
            member: p.owner
        })), /*#__PURE__*/React.createElement("td", {
            className: "ps-2",
            valign: "top"
        }, ownerlink, /*#__PURE__*/React.createElement("div", {
            style: {
                fontSize: "0.67rem"
            }
        }, /*#__PURE__*/React.createElement(DateLabel, {
            value: p.postDate
        }))), /*#__PURE__*/React.createElement("td", {
            width: "40px"
        }, /*#__PURE__*/React.createElement("button", {
            className: "btn btn-link text-dark",
            onClick: () => {
                this.setState({
                    showModal: 'post' /*showpostoptions: true*/
                });
            }
        }, /*#__PURE__*/React.createElement("i", {
            className: "bi bi-three-dots"
        }))))));
        let postshtml = null;
        if (p.videoURL !== "") { } else if (p.photos) {
            if (p.photos.length == 1) {
                postshtml = /*#__PURE__*/React.createElement("div", {
                    className: "text-center"
                }, /*#__PURE__*/React.createElement("img", {
                    src: "//" + location.host + "/" + p.photos[0].photo,
                    className: "img-fluid",
                    onDoubleClick: () => {
                        this.addReaction();
                    }
                }));
            } else {
                //var imgs = [], imgs2 = [];
                //for (var i in p.photos) {
                //    imgs.push(<li key={"img" + p.photos[i].id} className="list-group-item p-0 me-1 border-0">
                //        <div className="postdiv" style={{ backgroundImage: "url(//" + location.host + "/" + p.photos[i].photo + ")" }}>
                //            <img src={"//" + location.host + "/" + p.photos[i].photo} style={{ opacity: 0, maxHeight: "500px", maxWidth: "500px" }} />
                //        </div></li>);
                //    imgs2.push(<span style={{ width: "5px", height: "5px" }} className="bg-secondary d-inline-block me-1"></span>);
                //}
                //postshtml = <div className="table-responsive my-1">
                //    <ul className="list-group list-group-horizontal" onDoubleClick={() => { this.addReaction(); }}>
                //        {imgs}
                //    </ul></div>;
                postshtml = /*#__PURE__*/React.createElement(PhotoCarousel, {
                    photos: p.photos,
                    postid: p.id
                });
            }
        }
        let commentbox = this.state.showModal === "comment" ? /*#__PURE__*/React.createElement(MemberComment, {
            post: p,
            cancel: () => {
                this.setState({
                    showModal: ''
                });
            },
            onCommentAdded: count => {
                this.state.post.commentCount = count;
                this.setState({
                    post: this.state.post
                });
            },
            onCommentRemoved: count => {
                this.state.post.commentCount = count;
                this.setState({
                    post: this.state.post
                });
            }
        }) : null;
        if (!p.acceptComment) commentbox = null;
        let reactionCountHtml = p.reactionCount > 0 ? /*#__PURE__*/React.createElement("button", {
            className: "btn btn-link text-dark text-decoration-none fw-bold ps-0",
            type: "button",
            title: "Show Reactions",
            onClick: () => {
                this.setState({
                    showModal: 'reaction' /* showreactionlist: true */
                });
            }
        }, p.reactionCount) : null;
        let reactionhtml = /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-link fs-4 fw-bold text-dark pe-2 ps-0",
            onClick: () => {
                this.addReaction();
            }
        }, /*#__PURE__*/React.createElement("i", {
            className: "bi bi-heart"
        }));
        if (p.hasReacted) {
            reactionhtml = /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link fs-4 fw-bold text-danger pe-2 ps-0",
                onClick: () => {
                    this.addReaction();
                }
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-heart-fill"
            }));
        }
        let commentBtn = null,
            commentCountHtml = null;
        if (p.acceptComment) {
            commentCountHtml = p.commentCount > 0 ? /*#__PURE__*/React.createElement("button", {
                className: "btn btn-link text-dark text-decoration-none fw-bold ps-0",
                type: "button",
                title: "Show Comments",
                onClick: () => {
                    this.setState({
                        showModal: 'comment' /*showCommentBox: true*/
                    });
                }
            }, p.commentCount) : null;
            commentBtn = /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link fs-4 fw-bold text-dark pe-1",
                onClick: () => {
                    this.setState({
                        showModal: 'comment' /*showCommentBox: true */
                    });
                }
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-chat-square-text"
            }));
        }
        let shareBtn = null;
        if (p.allowShare) {
            shareBtn = /*#__PURE__*/React.createElement("button", {
                type: "button",
                title: "Share post with people",
                className: "btn btn-link fs-4 fw-bold text-dark pe-1",
                onClick: () => {
                    this.setState({
                        showModal: 'share'
                    });
                }
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-send"
            }));
        }
        let likemodal = null;
        if (this.state.showModal === "reaction" /*this.state.showreactionlist*/) {
            likemodal = /*#__PURE__*/React.createElement("div", {
                className: "modal fade show d-block",
                id: "reactionListModal-" + this.state.post.id,
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-fullscreen-lg-down"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, "Likes"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showreactionlist: false*/
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body p-1"
            }, /*#__PURE__*/React.createElement(MemberSmallList, {
                target: "reaction",
                postid: this.state.post.id
            })))));
        }
        return /*#__PURE__*/React.createElement("div", {
            id: this.state.post.id,
            className: "mb-4 pb-1 bg-white rounded-3"
        }, owner, postshtml, /*#__PURE__*/React.createElement("div", {
            className: "mt-1 text-center"
        }, reactionhtml, reactionCountHtml, " ", commentBtn, commentCountHtml, " ", shareBtn), /*#__PURE__*/React.createElement(ExpandableTextLabel, {
            cssclass: "m-3",
            text: describe === null ? "" : describe,
            maxlength: 200
        }), likemodal, commentbox, this.renderPostOptions());
    }
    renderShareModal() {
        if (this.state.showModal === "share") {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal fade show d-block",
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-scrollable"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h1", {
                className: "modal-title fs-5"
            }, "Share Post with People"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: () => {
                    this.setState({
                        showModal: ''
                    });
                },
                "aria-label": "Close"
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(MemberSmallList, {
                memberid: this.state.myself.id,
                target: "share",
                onSelected: id => {
                    this.sharePost(id);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, this.state.loading ? /*#__PURE__*/React.createElement("div", {
                className: "progress mb-2",
                style: {
                    height: "5px"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-striped progress-bar-animated",
                role: "progressbar",
                "aria-label": "Animated striped example",
                "aria-valuenow": "100",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: "width: 100%"
            })) : null, this.state.bsstyle === "success" && this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
                className: "text-success text-center my-2"
            }, this.state.message) : null)))));
        }
    }
    renderDeleteModal() {
        if (this.state.showModal === "delete" /*this.state.showdeletemodal*/) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal fade show d-block",
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h1", {
                className: "modal-title fs-5"
            }, "Delete Post"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showdeletemodal: false, showeditform: false, showpostoptions: false*/
                    });
                },
                "aria-label": "Close"
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("p", null, "You are going to delete this post permanently. Please confirm?")), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary",
                onClick: this.deletePost
            }, "Yes"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showdeletemodal: false, showeditform: false, showpostoptions: false*/
                    });
                }
            }, "No"))))));
        }
    }
    renderFlagModal() {
        if (this.state.showModal === "flag" /*this.state.showflagmodal*/) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal fade show d-block",
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h1", {
                className: "modal-title fs-5"
            }, "Flag Post"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showdeletemodal: false, showeditform: false, showpostoptions: false, showflagmodal: false*/
                    });
                },
                "aria-label": "Close"
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("ul", {
                className: "list-group"
            }, /*#__PURE__*/React.createElement("li", {
                className: "list-group-item"
            }, /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.flagPost(1);
                },
                className: "btn btn-light",
                type: "button"
            }, "Abusive Content")), /*#__PURE__*/React.createElement("li", {
                className: "list-group-item"
            }, /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.flagPost(2);
                },
                className: "btn btn-light",
                type: "button"
            }, "Spam Content")), /*#__PURE__*/React.createElement("li", {
                className: "list-group-item"
            }, /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.flagPost(3);
                },
                className: "btn btn-light",
                type: "button"
            }, "Fake / Misleading")), /*#__PURE__*/React.createElement("li", {
                className: "list-group-item"
            }, /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.flagPost(4);
                },
                className: "btn btn-light",
                type: "button"
            }, "Nudity")), /*#__PURE__*/React.createElement("li", {
                className: "list-group-item"
            }, /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.flagPost(5);
                },
                className: "btn btn-light",
                type: "button"
            }, "Promoting Violence"))))))));
        }
    }
    renderEditModal() {
        if (this.state.showModal === "edit" /*this.state.showeditform*/) {
            let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
                className: "progress my-1",
                style: {
                    height: "10px"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-striped progress-bar-animated",
                role: "progressbar",
                "aria-label": "",
                "aria-valuenow": "100",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: {
                    width: "100%"
                }
            })) : null;
            let message = this.state.message !== "" && this.state.bsstyle === "danger" ? /*#__PURE__*/React.createElement("div", {
                className: "alert alert-danger",
                role: "alert"
            }, this.state.message) : null;
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal d-block",
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-lg modal-dialog-scrollable"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(EditPost, {
                post: this.state.post,
                onchange: (describe, ac, as) => {
                    let p = this.state.post;
                    p.describe = describe;
                    p.acceptComment = ac;
                    p.allowShare = as;
                    this.setState({
                        post: p
                    });
                }
            }), loading, message), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary",
                onClick: this.editPost
            }, "Save"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-secondary",
                onClick: () => {
                    this.setState({
                        showModal: '' /*showeditform: false, showpostoptions: false*/
                    });
                }
            }, "Close"))))), /*#__PURE__*/React.createElement("div", {
                className: "modal-backdrop fade show"
            }));
        }
        return null;
    }
    render() {
        let p = this.state.post;
        if (p === null) return null;
        return /*#__PURE__*/React.createElement(React.Fragment, null, this.renderPostDisplay(p), this.renderEditModal(), this.renderDeleteModal(), this.renderFlagModal(), this.renderShareModal());
    }
}
class EditPost extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "acceptCommentChanged", () => {
            this.setState({
                acceptComment: !this.state.acceptComment
            }, () => {
                this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare);
            });
        });
        _defineProperty(this, "allowShareChanged", () => {
            this.setState({
                allowShare: !this.state.allowShare
            }, () => {
                this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare);
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            describe: this.props.post.describe,
            acceptComment: this.props.post.acceptComment,
            allowShare: this.props.post.allowShare,
            rows: 7
        };
    }
    render() {
        let chk = /*#__PURE__*/React.createElement("input", {
            className: "form-check-input",
            type: "checkbox",
            id: "acceptcommentchk",
            role: "switch",
            onChange: this.acceptCommentChanged
        });
        if (this.state.acceptComment) chk = /*#__PURE__*/React.createElement("input", {
            className: "form-check-input",
            checked: true,
            type: "checkbox",
            id: "acceptcommentchk",
            role: "switch",
            onChange: this.acceptCommentChanged
        });
        let chk2 = /*#__PURE__*/React.createElement("input", {
            className: "form-check-input",
            type: "checkbox",
            id: "allowsharechk",
            role: "switch",
            onChange: this.allowShareChanged
        });
        if (this.state.allowShare) chk2 = /*#__PURE__*/React.createElement("input", {
            className: "form-check-input",
            checked: true,
            type: "checkbox",
            id: "allowsharechk",
            role: "switch",
            onChange: this.allowShareChanged
        });
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("textarea", {
            className: "form-control border-0 border-bottom",
            onChange: e => {
                this.setState({
                    describe: e.target.value
                }, () => {
                    this.props.onchange(this.state.describe, this.state.acceptComment, this.state.allowShare);
                });
            },
            value: this.state.describe,
            rows: this.state.rows,
            placeholder: "Add some description to your photo...",
            maxlength: "7000"
        })), /*#__PURE__*/React.createElement("div", {
            className: "mb-3 ps-3"
        }, /*#__PURE__*/React.createElement("div", {
            className: "form-check form-switch"
        }, chk, /*#__PURE__*/React.createElement("label", {
            className: "form-check-label",
            htmlFor: "acceptcommentchk"
        }, "Accept comment On Post"))), /*#__PURE__*/React.createElement("div", {
            className: "mb-3 ps-3"
        }, /*#__PURE__*/React.createElement("div", {
            className: "form-check form-switch"
        }, chk2, /*#__PURE__*/React.createElement("label", {
            className: "form-check-label",
            htmlFor: "allowsharechk"
        }, "Allow sharing of Post"))));
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
            loadingComments: false,
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post,
            comments: {
                current: 0,
                pageSize: 20,
                total: 0,
                commentList: []
            },
            commenttext: '',
            commentiddel: 0,
            textarearows: 1
        };
        this.fetchComments = this.fetchComments.bind(this);
        this.removeComment = this.removeComment.bind(this);
    }
    componentDidMount() {
        this.fetchComments();
    }
    addComment() {
        this.setState({
            loading: true
        });
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
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                        loading: false,
                        comments,
                        commenttext: ""
                    });
                    if (this.props.onCommentAdded !== undefined && this.props.onCommentAdded !== null) {
                        this.props.onCommentAdded(comments.total);
                    }
                });
            } else {
                this.setState({
                    loading: false,
                    message: 'Unable to save comment',
                    bsstyle: 'danger'
                });
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
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                    loading: false,
                    commentiddel: 0,
                    comments
                });
                if (this.props.onCommentRemoved !== undefined && this.props.onCommentRemoved !== null) {
                    this.props.onCommentRemoved(comments.total);
                }
            }
        });
    }
    fetchComments() {
        this.setState({
            loadingComments: true
        });
        let url = '//' + window.location.host + '/api/post/comments/' + this.state.post.id + '?ps=' + this.state.comments.pageSize + '&p=' + this.state.comments.current;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loadingComments: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    var temp = this.state.comments.commentList;
                    for (var k in data.commentList) {
                        if (temp.filter(t => t.id == data.commentList[k].id).length === 0) temp.push(data.commentList[k]);
                    }
                    let comments = {
                        current: data.current,
                        pageSize: data.pageSize,
                        total: data.total,
                        totalPages: data.totalPages,
                        commentList: temp
                    };
                    this.setState({
                        loadingComments: false,
                        comments
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
            items.push( /*#__PURE__*/React.createElement("p", {
                key: 0,
                className: "px-2"
            }, "No Comments Found."));
        }
        for (var k in this.state.comments.commentList) {
            var p = this.state.comments.commentList[k];
            var ownedCommentMenu = null;
            if (this.state.myself.id === p.postedBy.id) {
                ownedCommentMenu = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
                    "data-id": p.id,
                    onClick: e => {
                        this.setState({
                            commentiddel: parseInt(e.target.getAttribute("data-id"), 10)
                        });
                    },
                    className: "btn btn-light",
                    type: "button"
                }, /*#__PURE__*/React.createElement("i", {
                    "data-id": p.id,
                    className: "bi bi-trash"
                })));
            }
            items.push( /*#__PURE__*/React.createElement("table", {
                key: p.id,
                cellPadding: "0",
                cellSpacing: "0",
                width: "100%",
                border: "0"
            }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                width: "35",
                className: "p-1",
                valign: "middle"
            }, /*#__PURE__*/React.createElement(MemberPicSmall, {
                member: p.postedBy
            })), /*#__PURE__*/React.createElement("td", {
                valign: "middle",
                className: "px-2"
            }, /*#__PURE__*/React.createElement("a", {
                href: '//' + window.location.host + '/profile?un=' + p.postedBy.userName,
                className: "fs-6 fw-bold pointer d-inline-block text-decoration-none"
            }, p.postedBy.userName), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
                className: "fs-12 text-secondary"
            }, /*#__PURE__*/React.createElement(DateLabel, {
                value: p.postDate
            }))), /*#__PURE__*/React.createElement("td", {
                width: "40",
                valign: "middle",
                align: "center"
            }, ownedCommentMenu)), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                className: "px-2",
                colSpan: "3"
            }, /*#__PURE__*/React.createElement(React.Fragment, null, p.comment.split('\n').map((item, key) => {
                return /*#__PURE__*/React.createElement(React.Fragment, {
                    key: key
                }, /*#__PURE__*/React.createElement("span", {
                    dangerouslySetInnerHTML: {
                        __html: item
                    }
                }), /*#__PURE__*/React.createElement("br", null));
            })))))));
        }
        let confirmdelete = null;
        if (this.state.commentiddel > 0) {
            confirmdelete = /*#__PURE__*/React.createElement(ConfirmBox, {
                title: "Remove Comment",
                message: "Are you sure you want to remove this comment?",
                ok: () => {
                    this.removeComment();
                },
                cancel: () => {
                    this.setState({
                        commentiddel: 0
                    });
                }
            });
        }
        return /*#__PURE__*/React.createElement("div", {
            className: "modal fade show",
            style: {
                display: "block"
            },
            tabIndex: "-1"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-dialog modal-xl modal-dialog-scrollable"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-content"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-header"
        }, /*#__PURE__*/React.createElement("h5", {
            className: "modal-title"
        }, "Comments"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn-close",
            onClick: () => {
                this.props.cancel();
            }
        })), /*#__PURE__*/React.createElement("div", {
            className: "modal-body p-1",
            style: {
                minHeight: "300px"
            }
        }, this.state.loadingComments ? /*#__PURE__*/React.createElement("p", null, "Loading Comments...") : items, confirmdelete), /*#__PURE__*/React.createElement("div", {
            className: "modal-footer"
        }, /*#__PURE__*/React.createElement("table", {
            width: "100%",
            cellPadding: "0",
            cellSpacing: "0"
        }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
            valign: "middle",
            align: "right"
        }, /*#__PURE__*/React.createElement(AutoAdjustTextArea, {
            htmlattr: {
                class: "form-control mb-2",
                required: "required",
                placeholder: "Type your comment here...",
                maxLength: 3000
            },
            required: true,
            onChange: val => {
                this.setState({
                    commenttext: val
                });
            },
            value: this.state.commenttext,
            maxRows: 5,
            minRows: 1
        })), /*#__PURE__*/React.createElement("td", {
            valign: "middle",
            width: "58px"
        }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-link text-decoration-none",
            onClick: () => {
                this.addComment();
            }
        }, "Post")))))))));
    }
}
class MemberPostList extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        let ls = {
            model: null,
            posts: []
        };
        if (this.props.search === "userfeed" && localStorage.getItem("userfeed") != null) ls = JSON.parse(localStorage.getItem("userfeed")); else if (this.props.search === "explore" && localStorage.getItem("explore") != null) ls = JSON.parse(localStorage.getItem("explore"));
        this.state = {
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: ls.model,
            q: this.props.search,
            p: 0,
            posts: ls.posts,
            viewMode: parseInt(this.props.viewMode, 10),
            viewModeAllowed: this.props.viewModeAllowed === "true" ? true : false,
            post: null
        };
        this.selectPost = this.selectPost.bind(this);
        this.addReaction = this.addReaction.bind(this);
        this.postDeleted = this.postDeleted.bind(this);
    }
    selectPost(id) {
        this.setState({
            viewMode: 2
        }, () => {
            document.getElementById(id).scrollIntoView({
                behavior: "auto",
                block: "center",
                inline: "center"
            });
        });
    }
    addReaction(id) {
        fetch('//' + window.location.host + '/api/Post/addreaction/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                    this.setState({
                        loading: false,
                        message: '',
                        bsstyle: '',
                        posts: temp
                    });
                });
            } else if (response.status === 400) {
                try {
                    response.json().then(data => {
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to save ' + name,
                        bsstyle: 'danger'
                    });
                }
            } else {
                try {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({
                            loading: false,
                            message: data.error,
                            bsstyle: 'danger'
                        });
                    });
                } catch (err) {
                    this.setState({
                        loading: false,
                        message: 'Unable to save ' + name,
                        bsstyle: 'danger'
                    });
                }
            }
        });
    }
    componentDidMount() {
        this.loadFeed(true);
    }
    loadFeed(firsttime) {
        this.setState({
            loading: true
        });
        let url = '//' + window.location.host + '/api/post?q=' + encodeURIComponent(this.state.q) + '&p=' + this.state.p;
        if (this.state.q === "userfeed") url = '//' + window.location.host + '/api/post/feed?p=' + this.state.p; else if (this.state.q === "explore") url = '//' + window.location.host + '/api/post/explore?p=' + this.state.p;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                        loggedin: true,
                        loading: false,
                        model: {
                            current: data.current,
                            pageSize: data.pageSize,
                            total: data.total,
                            totalPages: data.totalPages
                        },
                        posts: temp
                    }, () => {
                        let obj = {
                            model: this.state.model,
                            posts: this.state.posts
                        };
                        if (this.state.q === "userfeed") localStorage.setItem("userfeed", JSON.stringify(obj)); else if (this.state.q === "explore") localStorage.setItem("explore", JSON.stringify(obj));
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
        let empty = /*#__PURE__*/React.createElement("div", {
            key: 0
        }, /*#__PURE__*/React.createElement("div", {
            className: "text-center fs-3 pt-5"
        }, /*#__PURE__*/React.createElement("i", {
            className: "bi bi-emoji-dizzy me-2"
        }), /*#__PURE__*/React.createElement("h2", null, "Nothing to see here"), /*#__PURE__*/React.createElement("p", null, "You can start by Posting Photos or Following People")));
        if (this.state.viewMode === 2) {
            let items = [];
            if (this.state.model !== null) {
                for (var k in this.state.posts) {
                    items.push( /*#__PURE__*/React.createElement(MemberPost, {
                        key: this.state.posts[k].id,
                        post: this.state.posts[k],
                        ondelete: this.postDeleted,
                        onIgnoredMember: userid => {
                            this.setState({
                                posts: this.state.posts.filter(t => t.owner.id !== userid)
                            });
                        }
                    }));
                }
            }
            if (items.length == 0) {
                items.push(empty);
            }
            return items;
        } else if (this.state.viewMode === 1) {
            let items = [];
            for (var k in this.state.posts) {
                var p = this.state.posts[k];
                if (p.videoURL !== "") { } else {
                    items.push( /*#__PURE__*/React.createElement("div", {
                        className: "col",
                        key: p.id
                    }, /*#__PURE__*/React.createElement("div", {
                        className: "card h-100  rounded-0 pointer imgbg",
                        style: {
                            backgroundImage: "url(//" + window.location.host + "/" + p.photos[0].photo + ")"
                        }
                    }, /*#__PURE__*/React.createElement("img", {
                        src: "//" + window.location.host + "/" + p.photos[0].photo,
                        className: "card-img border-0 rounded-0",
                        style: {
                            opacity: 0,
                            padding: "1px"
                        },
                        "data-postid": p.id,
                        onClick: e => {
                            this.selectPost(e.target.getAttribute("data-postid"));
                        }
                    }))));
                }
            }
            if (items.length == 0) {
                items.push(empty);
                return items;
            }
            return /*#__PURE__*/React.createElement("div", {
                className: "row row-cols-3 row-cols-md-4 g-0"
            }, items);
        }
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0 bg-white"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-6 offset-lg-3 mt-5"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            })));
        }
        var html = this.state.loading === false ? this.renderPosts() : null;
        var loadmore = null;
        let loading = null;
        if (this.state.loading) {
            loading = /*#__PURE__*/React.createElement("div", {
                className: "progress fixed-bottom",
                style: {
                    height: "5px"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-striped progress-bar-animated",
                role: "progressbar",
                "aria-valuenow": "100",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: {
                    width: "100%"
                }
            }));
        }
        if (this.state.model !== null) {
            if (this.state.model.current + 1 < this.state.model.totalPages) {
                loadmore = /*#__PURE__*/React.createElement("div", {
                    className: "text-center bg-white p-3"
                }, /*#__PURE__*/React.createElement("button", {
                    className: "btn btn-light",
                    onClick: () => {
                        this.setState({
                            p: this.state.model.current + 1
                        }, () => {
                            this.loadFeed(false);
                        });
                    }
                }, "Load More"));
            }
        }
        var viewmodetabhtml = null;
        if (this.state.viewModeAllowed && this.state.posts.length > 0) {
            viewmodetabhtml = /*#__PURE__*/React.createElement("nav", {
                className: "nav nav-pills mb-2"
            }, /*#__PURE__*/React.createElement("a", {
                onClick: () => {
                    this.setState({
                        viewMode: 1
                    });
                },
                className: this.state.viewMode === 1 ? "nav-link fs-4 active bg-white text-success me-2" : "nav-link fs-4 bg-white text-dark me-2"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-grid-3x3-gap-fill"
            })), /*#__PURE__*/React.createElement("a", {
                onClick: () => {
                    this.setState({
                        viewMode: 2
                    });
                },
                className: this.state.viewMode === 2 ? "nav-link fs-4 active bg-white text-success me-2" : "nav-link fs-4 bg-white text-dark me-2"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-view-list"
            })));
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, viewmodetabhtml, html, loadmore, loading);
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
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: null,
            q: '',
            p: 0,
            reactions: [],
            followList: []
        };
        if (this.props.target === 'reaction') {
            this.url = '//' + window.location.host + '/api/post/reactionlist/' + this.props.postid;
        } else if (this.props.target === 'follower' || this.props.target === 'share') {
            this.url = '//' + window.location.host + '/api/Follow/Follower/' + this.props.memberid;
        } else if (this.props.target === 'following') {
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
        this.setState({
            followList: items
        });
    }
    loadFeed() {
        this.setState({
            loading: true
        });
        fetch(this.url + "?q=" + this.state.q + "&p=" + this.state.p, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
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
                            loggedin: true,
                            loading: false,
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
                            loggedin: true,
                            loading: false,
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
                items.push( /*#__PURE__*/React.createElement(MemberSmallRow, {
                    key: p.member.id,
                    member: p.member,
                    status: p.status
                }));
            }
            return /*#__PURE__*/React.createElement(React.Fragment, null, items);
        } else if (this.props.target === 'follower') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                items.push( /*#__PURE__*/React.createElement(MemberSmallRow, {
                    key: p.follower.id,
                    member: p.follower,
                    status: p.status,
                    showRemove: this.state.myself.id === this.props.memberid ? true : false,
                    removed: id => {
                        this.followerRemoved(id);
                    }
                }));
            }
            return /*#__PURE__*/React.createElement(React.Fragment, null, items);
        } else if (this.props.target === 'share') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                items.push( /*#__PURE__*/React.createElement(MemberSmallRow, {
                    key: p.follower.id,
                    member: p.follower,
                    status: p.status,
                    showRemove: false,
                    showShare: true,
                    onShare: id => {
                        if (this.props.onSelected !== undefined && this.props.onSelected !== null) this.props.onSelected(id);
                    }
                }));
            }
            return /*#__PURE__*/React.createElement(React.Fragment, null, items);
        } else if (this.props.target === 'following') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                if (p.tag !== null && p.tag !== "") { } else {
                    items.push( /*#__PURE__*/React.createElement(MemberSmallRow, {
                        key: p.following.id,
                        member: p.following,
                        status: p.status
                    }));
                }
            }
            return /*#__PURE__*/React.createElement(React.Fragment, null, items);
        }
    }
    render() {
        var loadmore = null;
        if (this.state.model !== null) {
            if (this.state.model.current + 1 < this.state.model.totalPages) {
                loadmore = /*#__PURE__*/React.createElement("div", {
                    className: "text-center bg-white p-3"
                }, /*#__PURE__*/React.createElement("button", {
                    className: "btn btn-light",
                    onClick: () => {
                        this.setState({
                            p: this.state.model.current + 1
                        }, () => {
                            this.loadFeed();
                        });
                    }
                }, "Load More"));
            }
        }
        return /*#__PURE__*/React.createElement("div", {
            style: {
                minHeight: "50vh"
            }
        }, this.renderPosts(), loadmore, this.state.loading ? /*#__PURE__*/React.createElement("p", null, "Loading Data...") : null);
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
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member,
            status: this.props.status,
            showRemove: this.props.showRemove,
            showShare: this.props.showShare === undefined || this.props.showShare === null ? false : this.props.showShare,
            showRemoveConfirm: false
        };
        this.removeFollow = this.removeFollow.bind(this);
    }
    removeFollow() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/follow/remove/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                this.setState({
                    status: 0,
                    showRemove: false,
                    loading: false
                });
                if (this.props.removed) {
                    this.props.removed(this.state.member.id);
                }
            }
        });
    }
    render() {
        var followbtn = /*#__PURE__*/React.createElement(FollowButton, {
            member: this.state.member,
            status: this.state.status
        });
        if (this.state.showRemove) {
            //replace follow button with remmove
            followbtn = /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-light text-dark",
                onClick: () => {
                    this.setState({
                        showRemoveConfirm: true
                    });
                }
            }, "Remove");
        }
        if (this.state.showShare) followbtn = /*#__PURE__*/React.createElement("button", {
            type: "button",
            "data-id": this.props.member.id,
            className: "btn btn-primary",
            onClick: e => {
                this.props.onShare(e.target.getAttribute("data-id"));
            }
        }, "Share");
        var removeConfirmBox = null;
        if (this.state.showRemoveConfirm) {
            removeConfirmBox = /*#__PURE__*/React.createElement(ConfirmBox, {
                cancel: () => {
                    this.setState({
                        showRemoveConfirm: false
                    });
                },
                ok: () => {
                    this.setState({
                        showRemoveConfirm: false
                    });
                    this.removeFollow();
                },
                message: "Are you sure you want to remove this member from your followers?"
            });
        }
        return /*#__PURE__*/React.createElement("table", {
            className: "w-100 mb-1",
            cellPadding: "0",
            cellSpacing: "0"
        }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
            width: "35px",
            className: "p-1",
            align: "center",
            valign: "middle"
        }, /*#__PURE__*/React.createElement(MemberPicSmall, {
            member: this.state.member
        })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/profile?un=' + this.state.member.userName,
            className: "text-dark text-decoration-none"
        }, this.state.member.userName)), /*#__PURE__*/React.createElement("td", {
            width: "100px",
            align: "right"
        }, followbtn, removeConfirmBox))));
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
        var memberpic = this.state.member.pic !== "" ? /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/profile?un=' + this.state.member.userName,
            className: "border-0"
        }, /*#__PURE__*/React.createElement("img", {
            src: '//' + window.location.host + "/" + this.state.member.pic,
            className: "d-inline-Ignore img-fluid pointer rounded-1 owner-thumb-small",
            alt: ""
        })) : /*#__PURE__*/React.createElement("a", {
            href: '//' + window.location.host + '/profile?un=' + this.state.member.userName,
            className: "border-0 text-secondary"
        }, /*#__PURE__*/React.createElement("img", {
            src: '//' + location.host + '/images/nopic.jpg',
            alt: "No Pic",
            className: "d-inline-block img-fluid pointer rounded-1 owner-thumb-small"
        }));
        return /*#__PURE__*/React.createElement(React.Fragment, null, memberpic);
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
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member,
            status: null,
            notify: this.props.notify
        };
        this.askToFollow = this.askToFollow.bind(this);
        this.unFollow = this.unFollow.bind(this);
        this.loadStatus = this.loadStatus.bind(this);
    }
    componentDidMount() {
        this.loadStatus();
    }
    loadStatus() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/follow/Status/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    this.setState({
                        status: data.status,
                        loading: false
                    });
                });
            }
        }).catch(error => {
            this.setState({
                bsstyle: 'text-danger',
                message: 'Unable to contact server',
                loading: false
            });
        });
    }
    askToFollow() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/follow/ask/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.setState({
                        status: data.status,
                        loading: false
                    });
                    if (this.props.notify) {
                        this.props.notify(this.state.member.id, this.state.status);
                    }
                });
            }
        }).catch(error => {
            this.setState({
                bsstyle: 'text-danger',
                message: 'Unable to contact server',
                loading: false
            });
        });
    }
    unFollow() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/follow/unfollow/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    //console.log(data);
                    this.setState({
                        status: data.status,
                        loading: false
                    });
                    if (this.props.notify) {
                        this.props.notify(this.state.member.id, this.state.status);
                    }
                });
            } else {
                this.setState({
                    bsstyle: 'text-danger',
                    message: 'Unable to process request',
                    loading: false
                });
            }
        }).catch(error => {
            this.setState({
                bsstyle: 'text-danger',
                message: 'Unable to contact server',
                loading: false
            });
        });
    }
    render() {
        var followbtn = null;
        if (this.state.loading === false) {
            if (this.state.status === 0) {
                if (this.state.member.id !== this.state.myself.id) {
                    followbtn = /*#__PURE__*/React.createElement("button", {
                        type: "button",
                        className: "btn btn-light",
                        onClick: this.askToFollow
                    }, "Follow");
                }
            } else if (this.state.status === 1) {
                followbtn = /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-light",
                    onClick: this.unFollow
                }, "Unfollow");
            } else if (this.state.status === 2) {
                followbtn = /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    className: "btn btn-light",
                    onClick: this.unFollow
                }, "Requested");
            }
        } else if (this.state.loading === true) {
            followbtn = /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-light",
                disabled: true
            }, "Working...");
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, followbtn);
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
            return /*#__PURE__*/React.createElement("div", {
                className: "modal fade show",
                style: {
                    display: "block"
                },
                tabIndex: "-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, this.props.title), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: () => {
                    this.setState({
                        open: false
                    }, () => {
                        this.props.cancel();
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("p", {
                className: "text-center"
            }, this.props.message)), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary",
                style: {
                    minWidth: "60px"
                },
                onClick: () => {
                    this.props.ok();
                }
            }, "Yes"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-secondary",
                style: {
                    minWidth: "60px"
                },
                onClick: () => {
                    this.setState({
                        open: false
                    }, () => {
                        this.props.cancel();
                    });
                }
            }, "No")))));
        } else {
            return null;
        }
    }
}
class ExpandableTextLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text,
            expand: false,
            showexpand: this.props.text.length > parseInt(this.props.maxlength, 10),
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
                text: nextProps.text,
                maxlength: parseInt(nextProps.maxlength, 10),
                cssclass: nextProps.cssclass !== undefined ? nextProps.cssclass : "",
                showexpand: se
            });
        }
    }
    componentDidMount() {
        if (this.state.text.length > this.state.maxlength || (this.state.text.match(/\n/g) || []).length > 3) {
            this.setState({
                showexpand: true
            });
        }
    }
    render() {
        if (this.state.text.trim() === "") return null;
        let length = this.state.text.length < this.state.maxlength ? this.state.text.length : this.state.maxlength;
        let text = null,
            expandbtn = null;
        if (this.state.expand) {
            text = /*#__PURE__*/React.createElement(React.Fragment, null, this.state.text.split('\n').map((item, key) => {
                return /*#__PURE__*/React.createElement(React.Fragment, {
                    key: key
                }, /*#__PURE__*/React.createElement("span", {
                    dangerouslySetInnerHTML: {
                        __html: item
                    }
                }), /*#__PURE__*/React.createElement("br", null));
            }));
        } else {
            text = /*#__PURE__*/React.createElement("div", {
                style: {
                    maxHeight: "28px",
                    overflowY: "hidden",
                    display: "inline-flex"
                }
            }, this.state.text.split('\n').map((item, key) => {
                return /*#__PURE__*/React.createElement(React.Fragment, {
                    key: key
                }, /*#__PURE__*/React.createElement("span", {
                    dangerouslySetInnerHTML: {
                        __html: item
                    }
                }), /*#__PURE__*/React.createElement("br", null));
            }));
        }
        if (this.state.showexpand) {
            expandbtn = /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => {
                    this.setState({
                        expand: !this.state.expand
                    });
                },
                className: "btn btn-link d-block p-0 text-secondary text-decoration-none"
            }, !this.state.expand ? "More" : "Less");
        }
        return /*#__PURE__*/React.createElement("div", {
            className: this.state.cssclass
        }, text, expandbtn);
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
        return /*#__PURE__*/React.createElement(React.Fragment, null, this.transformData());
    }
}
class MessageStrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bsstyle: this.props.bsstyle !== undefined ? this.props.bsstyle : "",
            message: this.props.message !== undefined ? this.props.message : ""
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.message !== prevState.message) {
            return {
                message: nextProps.message,
                bsstyle: nextProps.bsstyle
            };
        } else return null;
    }
    render() {
        if (this.state.message !== '') {
            return /*#__PURE__*/React.createElement("div", {
                className: 'noMargin noRadius alert alert-' + this.state.bsstyle,
                role: "alert"
            }, this.state.message);
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
        return /*#__PURE__*/React.createElement("div", {
            className: "emojicont p-2 border-top border-bottom border-right border-left bg-light",
            style: {
                maxWidth: "100%"
            }
        }, /*#__PURE__*/React.createElement("ul", {
            className: "list-inline mb-1"
        }, /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "GRINNING FACE",
            onClick: () => this.onEmojiClick('😀')
        }, "\uD83D\uDE00")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "GRINNING FACE WITH SMILING EYES",
            onClick: () => this.onEmojiClick('😁')
        }, "\uD83D\uDE01")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH TEARS OF JOY",
            onClick: () => this.onEmojiClick('😂')
        }, "\uD83D\uDE02")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH OPEN MOUTH",
            onClick: () => this.onEmojiClick('😃')
        }, "\uD83D\uDE03")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH OPEN MOUTH AND SMILING EYES",
            onClick: () => this.onEmojiClick('😄')
        }, "\uD83D\uDE04")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH OPEN MOUTH AND COLD SWEAT",
            onClick: () => this.onEmojiClick('😅')
        }, "\uD83D\uDE05")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES",
            onClick: () => this.onEmojiClick('😆')
        }, "\uD83D\uDE06")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH HALO",
            onClick: () => this.onEmojiClick('😇')
        }, "\uD83D\uDE07")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH HORNS",
            onClick: () => this.onEmojiClick('😈')
        }, "\uD83D\uDE08")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "WINKING FACE",
            onClick: () => this.onEmojiClick('😉')
        }, "\uD83D\uDE09")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH SMILING EYES",
            onClick: () => this.onEmojiClick('😊')
        }, "\uD83D\uDE0A")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE SAVOURING DELICIOUS FOOD",
            onClick: () => this.onEmojiClick('😋')
        }, "\uD83D\uDE0B")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "RELIEVED FACE",
            onClick: () => this.onEmojiClick('😌')
        }, "\uD83D\uDE0C")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH HEART-SHAPED EYES",
            onClick: () => this.onEmojiClick('😍')
        }, "\uD83D\uDE0D")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE WITH SUNGLASSES",
            onClick: () => this.onEmojiClick('😎')
        }, "\uD83D\uDE0E")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMIRKING FACE",
            onClick: () => this.onEmojiClick('😏')
        }, "\uD83D\uDE0F")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "NEUTRAL FACE",
            onClick: () => this.onEmojiClick('😐')
        }, "\uD83D\uDE10")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "EXPRESSIONLESS FACE",
            onClick: () => this.onEmojiClick('😑')
        }, "\uD83D\uDE11")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "UNAMUSED FACE",
            onClick: () => this.onEmojiClick('😒')
        }, "\uD83D\uDE12")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH COLD SWEAT",
            onClick: () => this.onEmojiClick('😓')
        }, "\uD83D\uDE13")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "PENSIVE FACE",
            onClick: () => this.onEmojiClick('😔')
        }, "\uD83D\uDE14")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CONFUSED FACE",
            onClick: () => this.onEmojiClick('😕')
        }, "\uD83D\uDE15")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CONFOUNDED FACE",
            onClick: () => this.onEmojiClick('😖')
        }, "\uD83D\uDE16")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "KISSING FACE",
            onClick: () => this.onEmojiClick('😗')
        }, "\uD83D\uDE17")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE THROWING A KISS",
            onClick: () => this.onEmojiClick('😘')
        }, "\uD83D\uDE18")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "KISSING FACE WITH SMILING EYES",
            onClick: () => this.onEmojiClick('😙')
        }, "\uD83D\uDE19")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "KISSING FACE WITH CLOSED EYES",
            onClick: () => this.onEmojiClick('😚')
        }, "\uD83D\uDE1A")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH STUCK-OUT TONGUE",
            onClick: () => this.onEmojiClick('😛')
        }, "\uD83D\uDE1B")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH STUCK-OUT TONGUE AND WINKING EYE",
            onClick: () => this.onEmojiClick('😜')
        }, "\uD83D\uDE1C")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES",
            onClick: () => this.onEmojiClick('😝')
        }, "\uD83D\uDE1D")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "DISAPPOINTED FACE",
            onClick: () => this.onEmojiClick('😞')
        }, "\uD83D\uDE1E")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "WORRIED FACE",
            onClick: () => this.onEmojiClick('😟')
        }, "\uD83D\uDE1F")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "ANGRY FACE",
            onClick: () => this.onEmojiClick('😠')
        }, "\uD83D\uDE20")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "POUTING FACE",
            onClick: () => this.onEmojiClick('😡')
        }, "\uD83D\uDE21")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CRYING FACE",
            onClick: () => this.onEmojiClick('😢')
        }, "\uD83D\uDE22")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "PERSEVERING FACE",
            onClick: () => this.onEmojiClick('😣')
        }, "\uD83D\uDE23")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH LOOK OF TRIUMPH",
            onClick: () => this.onEmojiClick('😤')
        }, "\uD83D\uDE24")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "DISAPPOINTED BUT RELIEVED FACE",
            onClick: () => this.onEmojiClick('😥')
        }, "\uD83D\uDE25")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FROWNING FACE WITH OPEN MOUTH",
            onClick: () => this.onEmojiClick('😦')
        }, "\uD83D\uDE26")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "ANGUISHED FACE",
            onClick: () => this.onEmojiClick('😧')
        }, "\uD83D\uDE27")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FEARFUL FACE",
            onClick: () => this.onEmojiClick('😨')
        }, "\uD83D\uDE28")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "WEARY FACE",
            onClick: () => this.onEmojiClick('😩')
        }, "\uD83D\uDE29")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SLEEPY FACE",
            onClick: () => this.onEmojiClick('😪')
        }, "\uD83D\uDE2A")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "TIRED FACE",
            onClick: () => this.onEmojiClick('😫')
        }, "\uD83D\uDE2B")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "GRIMACING FACE",
            onClick: () => this.onEmojiClick('😬')
        }, "\uD83D\uDE2C")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "LOUDLY CRYING FACE",
            onClick: () => this.onEmojiClick('😭')
        }, "\uD83D\uDE2D")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH OPEN MOUTH",
            onClick: () => this.onEmojiClick('😮')
        }, "\uD83D\uDE2E")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "HUSHED FACE",
            onClick: () => this.onEmojiClick('😯')
        }, "\uD83D\uDE2F")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH OPEN MOUTH AND COLD SWEAT",
            onClick: () => this.onEmojiClick('😰')
        }, "\uD83D\uDE30")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE SCREAMING IN FEAR",
            onClick: () => this.onEmojiClick('😱')
        }, "\uD83D\uDE31")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "ASTONISHED FACE",
            onClick: () => this.onEmojiClick('😲')
        }, "\uD83D\uDE32")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FLUSHED FACE",
            onClick: () => this.onEmojiClick('😳')
        }, "\uD83D\uDE33")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SLEEPING FACE",
            onClick: () => this.onEmojiClick('😴')
        }, "\uD83D\uDE34")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "DIZZY FACE",
            onClick: () => this.onEmojiClick('😵')
        }, "\uD83D\uDE35")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITHOUT MOUTH",
            onClick: () => this.onEmojiClick('😶')
        }, "\uD83D\uDE36")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FACE WITH MEDICAL MASK",
            onClick: () => this.onEmojiClick('😷')
        }, "\uD83D\uDE37")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FROWN FACE",
            onClick: () => this.onEmojiClick('🙁')
        }, "\uD83D\uDE41")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SMILING FACE",
            onClick: () => this.onEmojiClick('🙂')
        }, "\uD83D\uDE42")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "UPSIDEDOWN FACE",
            onClick: () => this.onEmojiClick('🙃')
        }, "\uD83D\uDE43")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "EYES ROLLING FACE",
            onClick: () => this.onEmojiClick('🙄')
        }, "\uD83D\uDE44")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "ZIPPED FACE",
            onClick: () => this.onEmojiClick('🤐')
        }, "\uD83E\uDD10")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "MONEY FACE",
            onClick: () => this.onEmojiClick('🤑')
        }, "\uD83E\uDD11")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "FEVERISH FACE",
            onClick: () => this.onEmojiClick('🤒')
        }, "\uD83E\uDD12")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SPECTACLED FACE",
            onClick: () => this.onEmojiClick('🤓')
        }, "\uD83E\uDD13")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "WONDERING FACE",
            onClick: () => this.onEmojiClick('🤔')
        }, "\uD83E\uDD14")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "HURT FACE",
            onClick: () => this.onEmojiClick('🤕')
        }, "\uD83E\uDD15")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "COWBOY FACE",
            onClick: () => this.onEmojiClick('🤠')
        }, "\uD83E\uDD20")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CLOWN FACE",
            onClick: () => this.onEmojiClick('🤡')
        }, "\uD83E\uDD21")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SICK VOMIT FACE",
            onClick: () => this.onEmojiClick('🤢')
        }, "\uD83E\uDD22")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "LAUGHING ROLLING FACE",
            onClick: () => this.onEmojiClick('🤣')
        }, "\uD83E\uDD23")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "LEERING FACE",
            onClick: () => this.onEmojiClick('🤤')
        }, "\uD83E\uDD24")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "LEING FACE",
            onClick: () => this.onEmojiClick('🤥')
        }, "\uD83E\uDD25")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "BLOWING NOSE FACE",
            onClick: () => this.onEmojiClick('🤧')
        }, "\uD83E\uDD27")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "ROCK FACE",
            onClick: () => this.onEmojiClick('🤨')
        }, "\uD83E\uDD28")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "STARY EYES FACE",
            onClick: () => this.onEmojiClick('🤩')
        }, "\uD83E\uDD29")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "MAD FACE",
            onClick: () => this.onEmojiClick('🤪')
        }, "\uD83E\uDD2A")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "SHUSHING FACE",
            onClick: () => this.onEmojiClick('🤫')
        }, "\uD83E\uDD2B")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CURSING FACE",
            onClick: () => this.onEmojiClick('🤬')
        }, "\uD83E\uDD2C")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "CHUGLI FACE",
            onClick: () => this.onEmojiClick('🤭')
        }, "\uD83E\uDD2D")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "VOMIT FACE",
            onClick: () => this.onEmojiClick('🤮')
        }, "\uD83E\uDD2E")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "MIND BLOWN FACE",
            onClick: () => this.onEmojiClick('🤯')
        }, "\uD83E\uDD2F")), /*#__PURE__*/React.createElement("li", {
            className: "list-inline-item"
        }, /*#__PURE__*/React.createElement("span", {
            title: "VICTORIAN FACE",
            onClick: () => this.onEmojiClick('🧐')
        }, "\uD83E\uDDD0"))));
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
            loading: false,
            loggedin: loggedin,
            myself: this.props.myself,
            person: this.props.person,
            bsstyle: '',
            message: '',
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
                        this.setState({
                            blocked: true
                        });
                    } else {
                        this.setState({
                            blocked: false
                        });
                    }
                    var contactlist = localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
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
                            this.setState({
                                blocked: true
                            });
                        } else if (data.boloRelation === BoloRelationType.Confirmed) {
                            this.setState({
                                blocked: false
                            });
                        } else {
                            this.setState({
                                blocked: null
                            });
                        }
                        if (this.props.onRelationshipChange !== undefined) {
                            this.props.onRelationshipChange(data.boloRelation);
                        }
                    });
                }
            });
        } catch (err) {
            if (this.contactlist.get(this.state.person.id) !== undefined) {
                this.setState({
                    blocked: this.contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Blocked
                });
            }
        }
    }
    render() {
        if (this.state.blocked === true) {
            return /*#__PURE__*/React.createElement("button", {
                className: "btn mr-1 ml-1 btn-danger",
                onClick: this.handleUnblockClick
            }, "Unblock");
        } else if (this.state.blocked === false) {
            return /*#__PURE__*/React.createElement("button", {
                className: "btn mr-1 ml-1 btn-secondary",
                onClick: this.handleBlockClick
            }, "Block");
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
        let items1 = [],
            items2 = [];
        for (let k = 0; k < this.state.photos.length; k++) {
            items1.push( /*#__PURE__*/React.createElement("button", {
                type: "button",
                "data-bs-target": this.state.id,
                className: k === this.state.active ? "btn btn-sm btn-primary me-2" : "btn btn-sm btn-secondary me-2",
                "data-index": k,
                onClick: e => {
                    this.setState({
                        active: parseInt(e.target.getAttribute("data-index", 10))
                    });
                }
            }));
            items2.push( /*#__PURE__*/React.createElement("div", {
                className: k === this.state.active ? "carousel-item text-center active" : "carousel-item text-center"
            }, /*#__PURE__*/React.createElement("img", {
                src: "//" + location.host + "/" + this.state.photos[k].photo,
                className: "img-fluid",
                alt: ""
            })));
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            id: this.state.id,
            className: "carousel carousel-dark slide",
            "data-bs-ride": "true"
        }, /*#__PURE__*/React.createElement("div", {
            className: "carousel-inner"
        }, items2), /*#__PURE__*/React.createElement("button", {
            className: this.state.active === 0 ? "d-none" : "carousel-control-prev",
            type: "button",
            "data-bs-target": this.state.id,
            "data-bs-slide": "prev",
            onClick: () => {
                if (this.state.active > 0) {
                    this.setState({
                        active: this.state.active - 1
                    });
                }
            }
        }, /*#__PURE__*/React.createElement("span", {
            className: "carousel-control-prev-icon",
            "aria-hidden": "true"
        }), /*#__PURE__*/React.createElement("span", {
            className: "visually-hidden"
        }, "Previous")), /*#__PURE__*/React.createElement("button", {
            className: this.state.active === this.state.photos.length - 1 ? "d-none" : "carousel-control-next",
            type: "button",
            "data-bs-target": this.state.id,
            "data-bs-slide": "next",
            onClick: () => {
                if (this.state.active < this.state.photos.length - 1) {
                    this.setState({
                        active: this.state.active + 1
                    });
                }
            }
        }, /*#__PURE__*/React.createElement("span", {
            className: "carousel-control-next-icon",
            "aria-hidden": "true"
        }), /*#__PURE__*/React.createElement("span", {
            className: "visually-hidden"
        }, "Next"))), /*#__PURE__*/React.createElement("div", {
            className: "text-center p-2"
        }, items1));
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
            loading: false,
            loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            member: null,
            bsstyle: '',
            message: '',
            followStatus: null,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            showfollowers: false,
            showfollowing: false,
            showSettings: false,
            showrequests: false,
            hasFollowRequest: false
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
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/' + username, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    this.setState({
                        loggedin: true,
                        loading: false,
                        member: data
                    }, () => {
                        this.loadFollowStatus(localStorage.getItem("token"), this.state.member.id);
                        this.checkIfHasRequest(this.state.member.id);
                    });
                });
            }
        });
    }
    loadFollowStatus(t, username) {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Follow/Status/' + username, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    this.setState({
                        loggedin: true,
                        loading: false,
                        followStatus: data.status
                    });
                });
            }
        });
    }
    checkIfHasRequest(username) {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Follow/HasRequest/' + username, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                this.setState({
                    loading: false,
                    hasFollowRequest: true
                });
            } else {
                this.setState({
                    loading: false,
                    hasFollowRequest: false
                });
            }
        });
    }
    allowRequest() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Follow/allow/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                this.setState({
                    loading: false,
                    hasFollowRequest: false
                });
            } else {
                this.setState({
                    loading: false
                });
            }
        });
    }
    rejectRequest() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Follow/Reject/' + this.state.member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                this.setState({
                    loading: false,
                    hasFollowRequest: false
                });
            } else {
                this.setState({
                    loading: false
                });
            }
        });
    }
    validate(t) {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                //if token is valid vet user information from response and set "myself" object with member id and name.
                //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                //is set then start signalr hub
                response.json().then(data => {
                    localStorage.setItem("myself", JSON.stringify(data));
                    this.setState({
                        loggedin: true,
                        loading: false,
                        myself: data
                    });
                });
            }
        });
    }
    renderFollowHtml() {
        if (this.state.followStatus != null) {
            return /*#__PURE__*/React.createElement(FollowButton, {
                member: this.state.member,
                status: this.state.followStatus
            });
        }
    }
    renderFollowers() {
        if (this.state.showfollowers) {
            return /*#__PURE__*/React.createElement("div", {
                className: "modal fade show",
                style: {
                    display: "block"
                },
                id: "followersModal",
                tabIndex: "-1",
                "aria-labelledby": "followersModalLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title",
                id: "followersModalLabel"
            }, "Followers"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: () => {
                    this.setState({
                        showfollowers: false
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(MemberSmallList, {
                memberid: this.state.member.id,
                target: "follower"
            })))));
        }
        return null;
    }
    renderFollowing() {
        if (this.state.showfollowing) {
            return /*#__PURE__*/React.createElement("div", {
                className: "modal fade show",
                style: {
                    display: "block"
                },
                id: "followingModal",
                tabIndex: "-1",
                "aria-labelledby": "followingModalLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title",
                id: "followingModalLabel"
            }, "Following"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: () => {
                    this.setState({
                        showfollowing: false
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(MemberSmallList, {
                memberid: this.state.member.id,
                target: "following"
            })))));
        }
        return null;
    }
    renderFollowRequest() {
        if (this.state.showrequests) {
            return /*#__PURE__*/React.createElement("div", {
                className: "modal fade show",
                style: {
                    display: "block"
                },
                id: "followingModal",
                tabIndex: "-1",
                "aria-labelledby": "followrequestModalLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title",
                id: "followingModalLabel"
            }, "Follow Request"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: () => {
                    this.setState({
                        showrequests: false
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(FollowRequestList, null)))));
        }
        return null;
    }
    renderRequestApproval() {
        if (this.state.hasFollowRequest) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col"
            }, /*#__PURE__*/React.createElement("p", null, "You have follow request from this account, take action."), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary me-2",
                onClick: () => {
                    this.allowRequest();
                }
            }, "Approve"), /*#__PURE__*/React.createElement("button", {
                className: "btn btn-secondary",
                type: "button",
                onClick: () => {
                    this.rejectRequest();
                }
            }, "Reject")));
        }
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0 bg-white"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-6 offset-lg-3 mt-5"
            }, /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            })));
        }
        if (this.state.showSettings) {
            return /*#__PURE__*/React.createElement(ManageProfile, {
                onProfileChange: () => {
                    this.validate(localStorage.getItem("token"));
                },
                onBack: () => {
                    this.setState({
                        showSettings: false
                    });
                }
            });
        }
        var followlist = null;
        if (this.state.showfollowing) {
            followlist = /*#__PURE__*/React.createElement(React.Fragment, null, this.renderFollowing());
        } else if (this.state.showfollowers) {
            followlist = /*#__PURE__*/React.createElement(React.Fragment, null, this.renderFollowers());
        } else if (this.state.showrequests) {
            followlist = /*#__PURE__*/React.createElement(React.Fragment, null, this.renderFollowRequest());
        }
        let loading = null;
        if (this.state.loading) {
            loading = /*#__PURE__*/React.createElement("div", {
                className: "progress fixed-bottom",
                style: {
                    height: "5px"
                }
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-striped progress-bar-animated",
                role: "progressbar",
                "aria-valuenow": "100",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: {
                    width: "100%"
                }
            }));
        }
        let me = null,
            pic = null,
            settings = null,
            followhtml = null;
        if (this.state.member !== null) {
            pic = this.state.member.pic !== "" ? /*#__PURE__*/React.createElement("img", {
                src: "//" + window.location.host + "/" + this.state.member.pic,
                className: "img-fluid rounded profile-thumb",
                alt: ""
            }) : /*#__PURE__*/React.createElement("img", {
                src: "/images/nopic.jpg",
                className: "img-fluid profile-thumb rounded",
                alt: ""
            });
            let name = null,
                thought = null,
                email = null,
                phone = null;
            if (this.state.member.name !== "") {
                name = /*#__PURE__*/React.createElement("div", {
                    className: "fs-6 p-1 ms-2 fw-bold"
                }, this.state.member.name);
            }
            if (this.state.member.thoughtStatus !== "") {
                thought = /*#__PURE__*/React.createElement("p", null, this.state.member.thoughtStatus);
            }
            if (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) {
                settings = /*#__PURE__*/React.createElement("div", {
                    className: "p-1 ms-2"
                }, /*#__PURE__*/React.createElement("a", {
                    className: "text-dark text-decoration-none",
                    onClick: () => {
                        this.setState({
                            showSettings: true
                        });
                    }
                }, /*#__PURE__*/React.createElement("i", {
                    className: "bi bi-gear"
                }), " Settings"));
            } else {
                followhtml = this.renderFollowHtml();
            }
            me = /*#__PURE__*/React.createElement("div", {
                className: "row g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col"
            }, /*#__PURE__*/React.createElement("div", {
                className: "pt-2 bg-white border-bottom mb-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "row g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-5 p-1 col-md-3 text-end"
            }, pic), /*#__PURE__*/React.createElement("div", {
                className: "col-7 col-md-9 p-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "fs-6 p-1 ms-2 fw-bold"
            }, "@", this.state.member.userName), name, settings, followhtml, this.state.member.followRequestCount > 0 && this.state.member.userName == this.state.myself.userName ? /*#__PURE__*/React.createElement("div", {
                className: "mt-2"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-light text-success fw-bold ",
                onClick: () => {
                    this.setState({
                        showrequests: true
                    });
                }
            }, this.state.member.followRequestCount, " Follow Request")) : null, this.renderRequestApproval())), /*#__PURE__*/React.createElement("div", {
                className: "row g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col px-0 text-center"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link text-dark fw-bold text-decoration-none"
            }, this.state.member.postCount, " Posts")), /*#__PURE__*/React.createElement("div", {
                className: "col px-0 text-center"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link text-dark fw-bold text-decoration-none",
                onClick: () => {
                    this.setState({
                        showfollowing: true
                    });
                }
            }, this.state.member.followingCount, " Following")), /*#__PURE__*/React.createElement("div", {
                className: "col px-0 text-center"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-link text-dark fw-bold text-decoration-none",
                onClick: () => {
                    this.setState({
                        showfollowers: true
                    });
                }
            }, this.state.member.followerCount, " Followers"))), thought, /*#__PURE__*/React.createElement("p", null, this.state.member.bio)), /*#__PURE__*/React.createElement("div", {
                className: "row mt-1 g-0"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-lg-8"
            }, /*#__PURE__*/React.createElement(MemberPostList, {
                search: this.state.member.userName,
                viewMode: 2,
                viewModeAllowed: "true"
            })), /*#__PURE__*/React.createElement("div", {
                className: "col-lg-4"
            }, /*#__PURE__*/React.createElement("div", {
                style: {
                    position: "-webkit-sticky",
                    position: "sticky",
                    top: "63px"
                },
                className: "ps-2"
            }, /*#__PURE__*/React.createElement(SendInvite, null), /*#__PURE__*/React.createElement(SuggestedAccounts, null)))), followlist));
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, loading, me);
    }
}
class ManageProfile extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "handleFile", e => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                this.setState({
                    src: fileReader.result
                }, () => {
                    if (this.profilePicCanvas === null) {
                        this.profilePicCanvas = new fabric.Canvas('profilePicCanvas');
                        this.profilePicCanvas.setDimensions({
                            width: 300,
                            height: 300
                        });
                        this.profilePicCanvas.setZoom(1);
                        this.hammer = new Hammer.Manager(this.profilePicCanvas.upperCanvasEl); // Initialize hammer
                        this.pinch = new Hammer.Pinch();
                        this.hammer.add([this.pinch]);
                        this.hammer.on('pinch', ev => {
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
            };
            fileReader.readAsDataURL(e.target.files[0]);
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            myself: null,
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            onProfileChange: this.props.onProfileChange === undefined ? null : this.props.onProfileChange,
            showProfilePicModal: false,
            src: null,
            showSecAnsModal: false,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                locked: true
            },
            croppedImageUrl: null,
            profilepiczoom: 1,
            countryitems: []
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
                    this.setState({
                        countryitems: data
                    });
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
        this.setState({
            myself: m
        });
    }
    handleProfileImageLoaded(e) {
        this.profilePicCanvas.remove(this.profilePicImgInst);
        this.profilePicImgInst = new fabric.Image(e.target, {
            angle: 0,
            padding: 0,
            cornersize: 0
        });
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
    toggleProfilePicModal() {
        this.setState({
            showProfilePicModal: !this.state.showProfilePicModal
        });
    }
    removeProfilePicture(e) {
        this.setState({
            loading: true
        });
        const fd = new FormData();
        fd.set("pic", "");
        fetch('//' + window.location.host + '/api/Members/savepic', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                this.setState({
                    loading: false,
                    showProfilePicModal: false
                });
                if (localStorage.getItem("token") !== null) {
                    this.validate(localStorage.getItem("token"));
                }
                if (this.state.onProfileChange !== null) {
                    this.state.onProfileChange();
                }
            } else {
                this.setState({
                    loading: false,
                    message: 'Unable to save profile pic',
                    bsstyle: 'danger'
                });
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
            this.setState({
                loading: true
            });
            const fd = new FormData();
            fd.set("pic", this.state.croppedImageUrl);
            fetch('//' + window.location.host + '/api/Members/savepic', {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false,
                        showProfilePicModal: false,
                        profilepiczoom: 1
                    });
                    if (localStorage.getItem("token") !== null) {
                        this.validate(localStorage.getItem("token"));
                    }
                    if (this.state.onProfileChange !== null) {
                        this.state.onProfileChange();
                    }
                } else {
                    this.setState({
                        loading: false,
                        message: 'Unable to save profile pic',
                        bsstyle: 'danger'
                    });
                }
            });
        });
    }
    saveData(name, value) {
        this.setState({
            loading: true
        });
        if (name !== 'bio') {
            fetch('//' + window.location.host + '/api/Members/Save' + name + '?d=' + value, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false,
                        message: 'Data is saved',
                        bsstyle: 'success'
                    });
                    if (this.state.onProfileChange) {
                        this.state.onProfileChange();
                    }
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
                            this.setState({
                                loading: false,
                                message: data.error,
                                bsstyle: 'danger'
                            }, () => {
                                if (this.props.onProfileChange) {
                                    this.props.onProfileChange();
                                }
                            });
                        });
                    } catch (err) {
                        this.setState({
                            loading: false,
                            message: 'Unable to save ' + name,
                            bsstyle: 'danger'
                        });
                    }
                } else {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({
                                loading: false,
                                message: data.error,
                                bsstyle: 'danger'
                            });
                        });
                    } catch (err) {
                        this.setState({
                            loading: false,
                            message: 'Unable to save ' + name,
                            bsstyle: 'danger'
                        });
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
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false
                    });
                    if (this.state.onProfileChange !== null) {
                        this.state.onProfileChange();
                    }
                } else {
                    this.setState({
                        loading: false,
                        message: 'Unable to save data',
                        bsstyle: 'danger'
                    });
                }
            });
        }
    }
    validate(t) {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                //if token is valid vet user information from response and set "myself" object with member id and name.
                //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                //is set then start signalr hub
                response.json().then(data => {
                    //console.log(data);
                    this.setState({
                        loggedin: true,
                        loading: false,
                        myself: data
                    });
                });
            }
        });
    }
    renderUSStates() {
        return /*#__PURE__*/React.createElement("select", {
            name: "state",
            id: "state",
            className: "form-control",
            value: this.state.myself.state,
            onChange: this.handleChange,
            onBlur: this.saveData
        }, /*#__PURE__*/React.createElement("option", {
            value: ""
        }), /*#__PURE__*/React.createElement("option", {
            value: "Alabama"
        }, "Alabama"), /*#__PURE__*/React.createElement("option", {
            value: "Alaska"
        }, "Alaska"), /*#__PURE__*/React.createElement("option", {
            value: "Arizona"
        }, "Arizona"), /*#__PURE__*/React.createElement("option", {
            value: "Arkansas"
        }, "Arkansas"), /*#__PURE__*/React.createElement("option", {
            value: "California"
        }, "California"), /*#__PURE__*/React.createElement("option", {
            value: "Colorado"
        }, "Colorado"), /*#__PURE__*/React.createElement("option", {
            value: "Connecticut"
        }, "Connecticut"), /*#__PURE__*/React.createElement("option", {
            value: "Delaware"
        }, "Delaware"), /*#__PURE__*/React.createElement("option", {
            value: "District of Columbia"
        }, "District of Columbia"), /*#__PURE__*/React.createElement("option", {
            value: "Florida"
        }, "Florida"), /*#__PURE__*/React.createElement("option", {
            value: "Georgia"
        }, "Georgia"), /*#__PURE__*/React.createElement("option", {
            value: "Guam"
        }, "Guam"), /*#__PURE__*/React.createElement("option", {
            value: "Hawaii"
        }, "Hawaii"), /*#__PURE__*/React.createElement("option", {
            value: "Idaho"
        }, "Idaho"), /*#__PURE__*/React.createElement("option", {
            value: "Illinois"
        }, "Illinois"), /*#__PURE__*/React.createElement("option", {
            value: "Indiana"
        }, "Indiana"), /*#__PURE__*/React.createElement("option", {
            value: "Iowa"
        }, "Iowa"), /*#__PURE__*/React.createElement("option", {
            value: "Kansas"
        }, "Kansas"), /*#__PURE__*/React.createElement("option", {
            value: "Kentucky"
        }, "Kentucky"), /*#__PURE__*/React.createElement("option", {
            value: "Louisiana"
        }, "Louisiana"), /*#__PURE__*/React.createElement("option", {
            value: "Maine"
        }, "Maine"), /*#__PURE__*/React.createElement("option", {
            value: "Maryland"
        }, "Maryland"), /*#__PURE__*/React.createElement("option", {
            value: "Massachusetts"
        }, "Massachusetts"), /*#__PURE__*/React.createElement("option", {
            value: "Michigan"
        }, "Michigan"), /*#__PURE__*/React.createElement("option", {
            value: "Minnesota"
        }, "Minnesota"), /*#__PURE__*/React.createElement("option", {
            value: "Mississippi"
        }, "Mississippi"), /*#__PURE__*/React.createElement("option", {
            value: "Missouri"
        }, "Missouri"), /*#__PURE__*/React.createElement("option", {
            value: "Montana"
        }, "Montana"), /*#__PURE__*/React.createElement("option", {
            value: "Nebraska"
        }, "Nebraska"), /*#__PURE__*/React.createElement("option", {
            value: "Nevada"
        }, "Nevada"), /*#__PURE__*/React.createElement("option", {
            value: "New Hampshire"
        }, "New Hampshire"), /*#__PURE__*/React.createElement("option", {
            value: "New Jersey"
        }, "New Jersey"), /*#__PURE__*/React.createElement("option", {
            value: "New Mexico"
        }, "New Mexico"), /*#__PURE__*/React.createElement("option", {
            value: "New York"
        }, "New York"), /*#__PURE__*/React.createElement("option", {
            value: "North Carolina"
        }, "North Carolina"), /*#__PURE__*/React.createElement("option", {
            value: "North Dakota"
        }, "North Dakota"), /*#__PURE__*/React.createElement("option", {
            value: "Northern Marianas Islands"
        }, "Northern Marianas Islands"), /*#__PURE__*/React.createElement("option", {
            value: "Ohio"
        }, "Ohio"), /*#__PURE__*/React.createElement("option", {
            value: "Oklahoma"
        }, "Oklahoma"), /*#__PURE__*/React.createElement("option", {
            value: "Oregon"
        }, "Oregon"), /*#__PURE__*/React.createElement("option", {
            value: "Pennsylvania"
        }, "Pennsylvania"), /*#__PURE__*/React.createElement("option", {
            value: "Puerto Rico"
        }, "Puerto Rico"), /*#__PURE__*/React.createElement("option", {
            value: "Rhode Island"
        }, "Rhode Island"), /*#__PURE__*/React.createElement("option", {
            value: "South Carolina"
        }, "South Carolina"), /*#__PURE__*/React.createElement("option", {
            value: "South Dakota"
        }, "South Dakota"), /*#__PURE__*/React.createElement("option", {
            value: "Tennessee"
        }, "Tennessee"), /*#__PURE__*/React.createElement("option", {
            value: "Texas"
        }, "Texas"), /*#__PURE__*/React.createElement("option", {
            value: "Utah"
        }, "Utah"), /*#__PURE__*/React.createElement("option", {
            value: "Vermont"
        }, "Vermont"), /*#__PURE__*/React.createElement("option", {
            value: "Virginia"
        }, "Virginia"), /*#__PURE__*/React.createElement("option", {
            value: "Virgin Islands"
        }, "Virgin Islands"), /*#__PURE__*/React.createElement("option", {
            value: "Washington"
        }, "Washington"), /*#__PURE__*/React.createElement("option", {
            value: "West Virginia"
        }, "West Virginia"), /*#__PURE__*/React.createElement("option", {
            value: "Wisconsin"
        }, "Wisconsin"), /*#__PURE__*/React.createElement("option", {
            value: "Wyoming"
        }, "Wyoming"));
    }
    renderIndianStates() {
        return /*#__PURE__*/React.createElement("select", {
            name: "state",
            id: "state",
            className: "form-control",
            value: this.state.myself.state,
            onChange: this.handleChange,
            onBlur: this.saveData
        }, /*#__PURE__*/React.createElement("option", {
            value: "Andhra Pradesh"
        }, "Andhra Pradesh"), /*#__PURE__*/React.createElement("option", {
            value: "Andaman and Nicobar Islands"
        }, "Andaman and Nicobar Islands"), /*#__PURE__*/React.createElement("option", {
            value: "Arunachal Pradesh"
        }, "Arunachal Pradesh"), /*#__PURE__*/React.createElement("option", {
            value: "Assam"
        }, "Assam"), /*#__PURE__*/React.createElement("option", {
            value: "Bihar"
        }, "Bihar"), /*#__PURE__*/React.createElement("option", {
            value: "Chandigarh"
        }, "Chandigarh"), /*#__PURE__*/React.createElement("option", {
            value: "Chhattisgarh"
        }, "Chhattisgarh"), /*#__PURE__*/React.createElement("option", {
            value: "Dadar and Nagar Haveli"
        }, "Dadar and Nagar Haveli"), /*#__PURE__*/React.createElement("option", {
            value: "Daman and Diu"
        }, "Daman and Diu"), /*#__PURE__*/React.createElement("option", {
            value: "Delhi"
        }, "Delhi"), /*#__PURE__*/React.createElement("option", {
            value: "Lakshadweep"
        }, "Lakshadweep"), /*#__PURE__*/React.createElement("option", {
            value: "Puducherry"
        }, "Puducherry"), /*#__PURE__*/React.createElement("option", {
            value: "Goa"
        }, "Goa"), /*#__PURE__*/React.createElement("option", {
            value: "Gujarat"
        }, "Gujarat"), /*#__PURE__*/React.createElement("option", {
            value: "Haryana"
        }, "Haryana"), /*#__PURE__*/React.createElement("option", {
            value: "Himachal Pradesh"
        }, "Himachal Pradesh"), /*#__PURE__*/React.createElement("option", {
            value: "Jammu and Kashmir"
        }, "Jammu and Kashmir"), /*#__PURE__*/React.createElement("option", {
            value: "Jharkhand"
        }, "Jharkhand"), /*#__PURE__*/React.createElement("option", {
            value: "Karnataka"
        }, "Karnataka"), /*#__PURE__*/React.createElement("option", {
            value: "Kerala"
        }, "Kerala"), /*#__PURE__*/React.createElement("option", {
            value: "Madhya Pradesh"
        }, "Madhya Pradesh"), /*#__PURE__*/React.createElement("option", {
            value: "Maharashtra"
        }, "Maharashtra"), /*#__PURE__*/React.createElement("option", {
            value: "Manipur"
        }, "Manipur"), /*#__PURE__*/React.createElement("option", {
            value: "Meghalaya"
        }, "Meghalaya"), /*#__PURE__*/React.createElement("option", {
            value: "Mizoram"
        }, "Mizoram"), /*#__PURE__*/React.createElement("option", {
            value: "Nagaland"
        }, "Nagaland"), /*#__PURE__*/React.createElement("option", {
            value: "Odisha"
        }, "Odisha"), /*#__PURE__*/React.createElement("option", {
            value: "Punjab"
        }, "Punjab"), /*#__PURE__*/React.createElement("option", {
            value: "Rajasthan"
        }, "Rajasthan"), /*#__PURE__*/React.createElement("option", {
            value: "Sikkim"
        }, "Sikkim"), /*#__PURE__*/React.createElement("option", {
            value: "Tamil Nadu"
        }, "Tamil Nadu"), /*#__PURE__*/React.createElement("option", {
            value: "Telangana"
        }, "Telangana"), /*#__PURE__*/React.createElement("option", {
            value: "Tripura"
        }, "Tripura"), /*#__PURE__*/React.createElement("option", {
            value: "Uttar Pradesh"
        }, "Uttar Pradesh"), /*#__PURE__*/React.createElement("option", {
            value: "Uttarakhand"
        }, "Uttarakhand"), /*#__PURE__*/React.createElement("option", {
            value: "West Bengal"
        }, "West Bengal"));
    }
    renderStates() {
        if (this.state.myself.country.toLowerCase() == "india") {
            return this.renderIndianStates();
        } else if (this.state.myself.country.toLowerCase() == "usa") {
            return this.renderUSStates();
        } else {
            return /*#__PURE__*/React.createElement("input", {
                type: "text",
                name: "state",
                className: "form-control",
                maxLength: "100",
                value: this.state.myself.state,
                onChange: this.handleChange,
                onBlur: this.saveData
            });
        }
    }
    renderSecAnsModal() {
        if (this.state.showSecAnsModal) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal  d-block",
                "data-backdrop": "static",
                "data-keyboard": "false",
                tabIndex: "-1",
                role: "dialog",
                "aria-labelledby": "staticBackdropLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, "Set Security Answer"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-dismiss": "modal",
                "aria-label": "Close",
                onClick: () => {
                    this.setState({
                        showSecAnsModal: false
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "securityAnswerTxt",
                className: "form-label"
            }, "Security Question "), /*#__PURE__*/React.createElement("div", null, this.state.myself.securityQuestion)), /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "securityAnswerTxt",
                className: "form-label"
            }, "Security Answer ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("input", {
                type: "text",
                id: "securityAnswerTxt",
                maxLength: "100",
                name: "securityAnswer",
                className: "form-control",
                maxLength: "300",
                value: this.state.myself.securityAnswer,
                onChange: this.handleChange
            })), this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
                className: 'my-1 text-center noMargin noRadius alert alert-' + this.state.bsstyle,
                role: "alert"
            }, this.state.message) : null), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary",
                onClick: () => {
                    this.saveData("securityanswer", this.state.myself.securityAnswer);
                }
            }, "Save"))))), /*#__PURE__*/React.createElement("div", {
                className: "modal-backdrop fade show"
            }));
        } else {
            return null;
        }
    }
    renderProfilePicModal() {
        if (this.state.showProfilePicModal) {
            const {
                crop,
                profile_pic,
                src
            } = this.state;
            return /*#__PURE__*/React.createElement("div", {
                className: "modal  d-block",
                "data-backdrop": "static",
                "data-keyboard": "false",
                tabIndex: "-1",
                role: "dialog",
                "aria-labelledby": "staticBackdropLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, "Profile Picture"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-dismiss": "modal",
                "aria-label": "Close",
                onClick: this.toggleProfilePicModal
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("button", {
                className: "btn btn-primary",
                type: "button",
                onClick: () => {
                    document.getElementById("profile_pic").click();
                }
            }, "Choose Picture"), /*#__PURE__*/React.createElement("input", {
                type: "file",
                className: "d-none",
                id: "profile_pic",
                value: profile_pic,
                onChange: this.handleFile
            })), /*#__PURE__*/React.createElement("div", {
                className: "row justify-content-center"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col"
            }, /*#__PURE__*/React.createElement("canvas", {
                id: "profilePicCanvas",
                style: {
                    width: "300px",
                    height: "300px"
                }
            })))), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary",
                onClick: this.saveProfilePic
            }, "Save")))));
        } else {
            return null;
        }
    }
    render() {
        if (!this.state.loggedin) {
            return /*#__PURE__*/React.createElement(RegisterForm, {
                beginWithRegister: false,
                onLogin: () => {
                    this.setState({
                        loggedin: localStorage.getItem("token") === null ? false : true,
                        myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                        token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                    });
                }
            });
        }
        var yearitems = [];
        for (var i = 1947; i <= 2004; i++) {
            yearitems.push( /*#__PURE__*/React.createElement("option", {
                value: i
            }, i));
        }
        let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress fixed-bottom rounded-0",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-valuenow": "100",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: '100%'
            }
        })) : null;
        if (this.state.loggedin && this.state.myself !== null) {
            let message = this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
                className: 'text-center noMargin noRadius alert alert-' + this.state.bsstyle,
                role: "alert"
            }, this.state.message) : null;
            let pic = this.state.myself.pic !== "" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
                src: this.state.myself.pic,
                className: " mx-auto d-block img-fluid",
                alt: "",
                style: {
                    maxWidth: "200px"
                }
            }), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-sm btn-secondary m-1",
                onClick: this.removeProfilePicture
            }, "Remove")) : /*#__PURE__*/React.createElement("img", {
                src: "/images/nopic.jpg",
                className: " mx-auto d-block img-fluid",
                alt: "",
                style: {
                    maxWidth: "200px"
                }
            });
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "container py-5"
            }, loading, message, this.renderSecAnsModal(), /*#__PURE__*/React.createElement("div", {
                className: "row align-items-center"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-md-6 text-center"
            }, pic, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-sm btn-secondary m-1",
                onClick: this.toggleProfilePicModal
            }, "Change"), this.renderProfilePicModal()), /*#__PURE__*/React.createElement("div", {
                className: "col-md-6"
            }, /*#__PURE__*/React.createElement("div", {
                className: "mb-2"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "channelnametxt",
                className: "form-label fw-bold"
            }, "Username"), /*#__PURE__*/React.createElement("input", {
                type: "text",
                id: "channelnametxt",
                readOnly: true,
                name: "userName",
                placeholder: "Unique Channel Name",
                className: "form-control",
                value: this.state.myself.userName
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-2"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "nametxt",
                className: "form-label fw-bold"
            }, "Name ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("input", {
                type: "text",
                id: "nametxt",
                name: "name",
                placeholder: "Your Name",
                className: "form-control",
                value: this.state.myself.name,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("name", this.state.myself.name);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-2"
            }, /*#__PURE__*/React.createElement("label", {
                className: "form-label fw-bold"
            }, "Mobile ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("input", {
                type: "text",
                name: "phone",
                className: "form-control",
                maxLength: "15",
                value: this.state.myself.phone,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("phone", this.state.myself.phone);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-2"
            }, /*#__PURE__*/React.createElement("label", {
                className: "form-label fw-bold"
            }, "Email ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("input", {
                type: "email",
                name: "email",
                className: "form-control",
                maxLength: "250",
                value: this.state.myself.email,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("email", this.state.myself.email);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-2"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "birthyeartxt",
                className: "form-label fw-bold"
            }, "Year of Birth"), /*#__PURE__*/React.createElement("select", {
                id: "birthyeartxt",
                name: "birthYear",
                className: "form-select",
                value: this.state.myself.birthYear,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("birthYear", this.state.myself.birthYear);
                }
            }, yearitems)))), /*#__PURE__*/React.createElement("div", {
                className: "row g-1 mb-3"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-md-6"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "securityQuesitonTxt",
                className: "form-label fw-bold"
            }, "Security Question ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("input", {
                type: "text",
                id: "securityQuesitonTxt",
                name: "securityQuestion",
                className: "form-control",
                maxLength: "300",
                value: this.state.myself.securityQuestion,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("securityquestion", this.state.myself.securityQuestion);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "col-md-6"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "securityAnswerTxt",
                className: "form-label fw-bold"
            }, "Security Answer ", /*#__PURE__*/React.createElement("span", {
                className: "text-danger"
            }, "(Required)")), /*#__PURE__*/React.createElement("div", null, "Your existing answer is not shown. ", /*#__PURE__*/React.createElement("button", {
                type: "button",
                class: "btn btn-primary ms-2 btn-sm",
                onClick: () => {
                    this.setState({
                        showSecAnsModal: true
                    });
                }
            }, "Change Answer")))), /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "thoughtStatus",
                className: "form-label fw-bold"
            }, "One line Introduction"), /*#__PURE__*/React.createElement("input", {
                type: "text",
                name: "thoughtStatus",
                className: "form-control",
                maxLength: "195",
                value: this.state.myself.thoughtStatus,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("thoughtstatus", this.state.myself.thoughtStatus);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "biotxt",
                className: "form-label fw-bold"
            }, "About Me"), /*#__PURE__*/React.createElement("textarea", {
                className: "form-control",
                id: "biotxt",
                maxLength: "950",
                name: "bio",
                value: this.state.myself.bio,
                onChange: this.handleChange,
                rows: "4",
                placeholder: "Write something about yourself.",
                onBlur: () => {
                    this.saveData("bio", this.state.myself.bio);
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "row g-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-md-6"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "visibilityselect",
                className: "form-label fw-bold"
            }, "Profile Visibility"), /*#__PURE__*/React.createElement("select", {
                className: "form-select",
                id: "genderselect",
                name: "visibility",
                value: this.state.myself.visibility,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("visibility", this.state.myself.visibility);
                }
            }, /*#__PURE__*/React.createElement("option", {
                value: "0"
            }), /*#__PURE__*/React.createElement("option", {
                value: "2"
            }, "Public"), /*#__PURE__*/React.createElement("option", {
                value: "1"
            }, "Private"))), /*#__PURE__*/React.createElement("div", {
                className: "col-md-6"
            }, /*#__PURE__*/React.createElement("label", {
                htmlFor: "countryselect",
                className: "form-label fw-bold"
            }, "Country"), /*#__PURE__*/React.createElement("select", {
                className: "form-select",
                id: "countryselect",
                name: "country",
                value: this.state.myself.country,
                onChange: this.handleChange,
                onBlur: () => {
                    this.saveData("country", this.state.myself.country);
                }
            }, /*#__PURE__*/React.createElement("option", {
                value: ""
            }), /*#__PURE__*/React.createElement("option", {
                value: "AD"
            }, "Andorra"), /*#__PURE__*/React.createElement("option", {
                value: "AE"
            }, "United Arab Emirates"), /*#__PURE__*/React.createElement("option", {
                value: "AF"
            }, "Afghanistan"), /*#__PURE__*/React.createElement("option", {
                value: "AG"
            }, "Antigua and Barbuda"), /*#__PURE__*/React.createElement("option", {
                value: "AI"
            }, "Anguilla"), /*#__PURE__*/React.createElement("option", {
                value: "AL"
            }, "Albania"), /*#__PURE__*/React.createElement("option", {
                value: "AM"
            }, "Armenia"), /*#__PURE__*/React.createElement("option", {
                value: "AO"
            }, "Angola"), /*#__PURE__*/React.createElement("option", {
                value: "AQ"
            }, "Antarctica"), /*#__PURE__*/React.createElement("option", {
                value: "AR"
            }, "Argentina"), /*#__PURE__*/React.createElement("option", {
                value: "AS"
            }, "American Samoa"), /*#__PURE__*/React.createElement("option", {
                value: "AT"
            }, "Austria"), /*#__PURE__*/React.createElement("option", {
                value: "AU"
            }, "Australia"), /*#__PURE__*/React.createElement("option", {
                value: "AW"
            }, "Aruba"), /*#__PURE__*/React.createElement("option", {
                value: "AX"
            }, "\xC5land Islands"), /*#__PURE__*/React.createElement("option", {
                value: "AZ"
            }, "Azerbaijan"), /*#__PURE__*/React.createElement("option", {
                value: "BA"
            }, "Bosnia and Herzegovina"), /*#__PURE__*/React.createElement("option", {
                value: "BB"
            }, "Barbados"), /*#__PURE__*/React.createElement("option", {
                value: "BD"
            }, "Bangladesh"), /*#__PURE__*/React.createElement("option", {
                value: "BE"
            }, "Belgium"), /*#__PURE__*/React.createElement("option", {
                value: "BF"
            }, "Burkina Faso"), /*#__PURE__*/React.createElement("option", {
                value: "BG"
            }, "Bulgaria"), /*#__PURE__*/React.createElement("option", {
                value: "BH"
            }, "Bahrain"), /*#__PURE__*/React.createElement("option", {
                value: "BI"
            }, "Burundi"), /*#__PURE__*/React.createElement("option", {
                value: "BJ"
            }, "Benin"), /*#__PURE__*/React.createElement("option", {
                value: "BL"
            }, "Saint Barth\xE9lemy"), /*#__PURE__*/React.createElement("option", {
                value: "BM"
            }, "Bermuda"), /*#__PURE__*/React.createElement("option", {
                value: "BN"
            }, "Brunei Darussalam"), /*#__PURE__*/React.createElement("option", {
                value: "BO"
            }, "Bolivia, Plurinational State of"), /*#__PURE__*/React.createElement("option", {
                value: "BQ"
            }, "Bonaire, Sint Eustatius and Saba"), /*#__PURE__*/React.createElement("option", {
                value: "BR"
            }, "Brazil"), /*#__PURE__*/React.createElement("option", {
                value: "BS"
            }, "Bahamas"), /*#__PURE__*/React.createElement("option", {
                value: "BT"
            }, "Bhutan"), /*#__PURE__*/React.createElement("option", {
                value: "BV"
            }, "Bouvet Island"), /*#__PURE__*/React.createElement("option", {
                value: "BW"
            }, "Botswana"), /*#__PURE__*/React.createElement("option", {
                value: "BY"
            }, "Belarus"), /*#__PURE__*/React.createElement("option", {
                value: "BZ"
            }, "Belize"), /*#__PURE__*/React.createElement("option", {
                value: "CA"
            }, "Canada"), /*#__PURE__*/React.createElement("option", {
                value: "CC"
            }, "Cocos (Keeling) Islands"), /*#__PURE__*/React.createElement("option", {
                value: "CD"
            }, "Congo, the Democratic Republic of the"), /*#__PURE__*/React.createElement("option", {
                value: "CF"
            }, "Central African Republic"), /*#__PURE__*/React.createElement("option", {
                value: "CG"
            }, "Congo"), /*#__PURE__*/React.createElement("option", {
                value: "CH"
            }, "Switzerland"), /*#__PURE__*/React.createElement("option", {
                value: "CI"
            }, "C\xF4te d'Ivoire"), /*#__PURE__*/React.createElement("option", {
                value: "CK"
            }, "Cook Islands"), /*#__PURE__*/React.createElement("option", {
                value: "CL"
            }, "Chile"), /*#__PURE__*/React.createElement("option", {
                value: "CM"
            }, "Cameroon"), /*#__PURE__*/React.createElement("option", {
                value: "CN"
            }, "China"), /*#__PURE__*/React.createElement("option", {
                value: "CO"
            }, "Colombia"), /*#__PURE__*/React.createElement("option", {
                value: "CR"
            }, "Costa Rica"), /*#__PURE__*/React.createElement("option", {
                value: "CU"
            }, "Cuba"), /*#__PURE__*/React.createElement("option", {
                value: "CV"
            }, "Cape Verde"), /*#__PURE__*/React.createElement("option", {
                value: "CW"
            }, "Cura\xE7ao"), /*#__PURE__*/React.createElement("option", {
                value: "CX"
            }, "Christmas Island"), /*#__PURE__*/React.createElement("option", {
                value: "CY"
            }, "Cyprus"), /*#__PURE__*/React.createElement("option", {
                value: "CZ"
            }, "Czech Republic"), /*#__PURE__*/React.createElement("option", {
                value: "DE"
            }, "Germany"), /*#__PURE__*/React.createElement("option", {
                value: "DJ"
            }, "Djibouti"), /*#__PURE__*/React.createElement("option", {
                value: "DK"
            }, "Denmark"), /*#__PURE__*/React.createElement("option", {
                value: "DM"
            }, "Dominica"), /*#__PURE__*/React.createElement("option", {
                value: "DO"
            }, "Dominican Republic"), /*#__PURE__*/React.createElement("option", {
                value: "DZ"
            }, "Algeria"), /*#__PURE__*/React.createElement("option", {
                value: "EC"
            }, "Ecuador"), /*#__PURE__*/React.createElement("option", {
                value: "EE"
            }, "Estonia"), /*#__PURE__*/React.createElement("option", {
                value: "EG"
            }, "Egypt"), /*#__PURE__*/React.createElement("option", {
                value: "EH"
            }, "Western Sahara"), /*#__PURE__*/React.createElement("option", {
                value: "ER"
            }, "Eritrea"), /*#__PURE__*/React.createElement("option", {
                value: "ES"
            }, "Spain"), /*#__PURE__*/React.createElement("option", {
                value: "ET"
            }, "Ethiopia"), /*#__PURE__*/React.createElement("option", {
                value: "FI"
            }, "Finland"), /*#__PURE__*/React.createElement("option", {
                value: "FJ"
            }, "Fiji"), /*#__PURE__*/React.createElement("option", {
                value: "FK"
            }, "Falkland Islands (Malvinas)"), /*#__PURE__*/React.createElement("option", {
                value: "FM"
            }, "Micronesia, Federated States of"), /*#__PURE__*/React.createElement("option", {
                value: "FO"
            }, "Faroe Islands"), /*#__PURE__*/React.createElement("option", {
                value: "FR"
            }, "France"), /*#__PURE__*/React.createElement("option", {
                value: "GA"
            }, "Gabon"), /*#__PURE__*/React.createElement("option", {
                value: "GB"
            }, "United Kingdom"), /*#__PURE__*/React.createElement("option", {
                value: "GD"
            }, "Grenada"), /*#__PURE__*/React.createElement("option", {
                value: "GE"
            }, "Georgia"), /*#__PURE__*/React.createElement("option", {
                value: "GF"
            }, "French Guiana"), /*#__PURE__*/React.createElement("option", {
                value: "GG"
            }, "Guernsey"), /*#__PURE__*/React.createElement("option", {
                value: "GH"
            }, "Ghana"), /*#__PURE__*/React.createElement("option", {
                value: "GI"
            }, "Gibraltar"), /*#__PURE__*/React.createElement("option", {
                value: "GL"
            }, "Greenland"), /*#__PURE__*/React.createElement("option", {
                value: "GM"
            }, "Gambia"), /*#__PURE__*/React.createElement("option", {
                value: "GN"
            }, "Guinea"), /*#__PURE__*/React.createElement("option", {
                value: "GP"
            }, "Guadeloupe"), /*#__PURE__*/React.createElement("option", {
                value: "GQ"
            }, "Equatorial Guinea"), /*#__PURE__*/React.createElement("option", {
                value: "GR"
            }, "Greece"), /*#__PURE__*/React.createElement("option", {
                value: "GS"
            }, "South Georgia and the South Sandwich Islands"), /*#__PURE__*/React.createElement("option", {
                value: "GT"
            }, "Guatemala"), /*#__PURE__*/React.createElement("option", {
                value: "GU"
            }, "Guam"), /*#__PURE__*/React.createElement("option", {
                value: "GW"
            }, "Guinea-Bissau"), /*#__PURE__*/React.createElement("option", {
                value: "GY"
            }, "Guyana"), /*#__PURE__*/React.createElement("option", {
                value: "HK"
            }, "Hong Kong"), /*#__PURE__*/React.createElement("option", {
                value: "HM"
            }, "Heard Island and McDonald Islands"), /*#__PURE__*/React.createElement("option", {
                value: "HN"
            }, "Honduras"), /*#__PURE__*/React.createElement("option", {
                value: "HR"
            }, "Croatia"), /*#__PURE__*/React.createElement("option", {
                value: "HT"
            }, "Haiti"), /*#__PURE__*/React.createElement("option", {
                value: "HU"
            }, "Hungary"), /*#__PURE__*/React.createElement("option", {
                value: "ID"
            }, "Indonesia"), /*#__PURE__*/React.createElement("option", {
                value: "IE"
            }, "Ireland"), /*#__PURE__*/React.createElement("option", {
                value: "IL"
            }, "Israel"), /*#__PURE__*/React.createElement("option", {
                value: "IM"
            }, "Isle of Man"), /*#__PURE__*/React.createElement("option", {
                value: "IN"
            }, "India"), /*#__PURE__*/React.createElement("option", {
                value: "IO"
            }, "British Indian Ocean Territory"), /*#__PURE__*/React.createElement("option", {
                value: "IQ"
            }, "Iraq"), /*#__PURE__*/React.createElement("option", {
                value: "IR"
            }, "Iran, Islamic Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "IS"
            }, "Iceland"), /*#__PURE__*/React.createElement("option", {
                value: "IT"
            }, "Italy"), /*#__PURE__*/React.createElement("option", {
                value: "JE"
            }, "Jersey"), /*#__PURE__*/React.createElement("option", {
                value: "JM"
            }, "Jamaica"), /*#__PURE__*/React.createElement("option", {
                value: "JO"
            }, "Jordan"), /*#__PURE__*/React.createElement("option", {
                value: "JP"
            }, "Japan"), /*#__PURE__*/React.createElement("option", {
                value: "KE"
            }, "Kenya"), /*#__PURE__*/React.createElement("option", {
                value: "KG"
            }, "Kyrgyzstan"), /*#__PURE__*/React.createElement("option", {
                value: "KH"
            }, "Cambodia"), /*#__PURE__*/React.createElement("option", {
                value: "KI"
            }, "Kiribati"), /*#__PURE__*/React.createElement("option", {
                value: "KM"
            }, "Comoros"), /*#__PURE__*/React.createElement("option", {
                value: "KN"
            }, "Saint Kitts and Nevis"), /*#__PURE__*/React.createElement("option", {
                value: "KP"
            }, "Korea, Democratic People's Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "KR"
            }, "Korea, Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "KW"
            }, "Kuwait"), /*#__PURE__*/React.createElement("option", {
                value: "KY"
            }, "Cayman Islands"), /*#__PURE__*/React.createElement("option", {
                value: "KZ"
            }, "Kazakhstan"), /*#__PURE__*/React.createElement("option", {
                value: "LA"
            }, "Lao People's Democratic Republic"), /*#__PURE__*/React.createElement("option", {
                value: "LB"
            }, "Lebanon"), /*#__PURE__*/React.createElement("option", {
                value: "LC"
            }, "Saint Lucia"), /*#__PURE__*/React.createElement("option", {
                value: "LI"
            }, "Liechtenstein"), /*#__PURE__*/React.createElement("option", {
                value: "LK"
            }, "Sri Lanka"), /*#__PURE__*/React.createElement("option", {
                value: "LR"
            }, "Liberia"), /*#__PURE__*/React.createElement("option", {
                value: "LS"
            }, "Lesotho"), /*#__PURE__*/React.createElement("option", {
                value: "LT"
            }, "Lithuania"), /*#__PURE__*/React.createElement("option", {
                value: "LU"
            }, "Luxembourg"), /*#__PURE__*/React.createElement("option", {
                value: "LV"
            }, "Latvia"), /*#__PURE__*/React.createElement("option", {
                value: "LY"
            }, "Libya"), /*#__PURE__*/React.createElement("option", {
                value: "MA"
            }, "Morocco"), /*#__PURE__*/React.createElement("option", {
                value: "MC"
            }, "Monaco"), /*#__PURE__*/React.createElement("option", {
                value: "MD"
            }, "Moldova, Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "ME"
            }, "Montenegro"), /*#__PURE__*/React.createElement("option", {
                value: "MF"
            }, "Saint Martin (French part)"), /*#__PURE__*/React.createElement("option", {
                value: "MG"
            }, "Madagascar"), /*#__PURE__*/React.createElement("option", {
                value: "MH"
            }, "Marshall Islands"), /*#__PURE__*/React.createElement("option", {
                value: "MK"
            }, "Macedonia, the Former Yugoslav Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "ML"
            }, "Mali"), /*#__PURE__*/React.createElement("option", {
                value: "MM"
            }, "Myanmar"), /*#__PURE__*/React.createElement("option", {
                value: "MN"
            }, "Mongolia"), /*#__PURE__*/React.createElement("option", {
                value: "MO"
            }, "Macao"), /*#__PURE__*/React.createElement("option", {
                value: "MP"
            }, "Northern Mariana Islands"), /*#__PURE__*/React.createElement("option", {
                value: "MQ"
            }, "Martinique"), /*#__PURE__*/React.createElement("option", {
                value: "MR"
            }, "Mauritania"), /*#__PURE__*/React.createElement("option", {
                value: "MS"
            }, "Montserrat"), /*#__PURE__*/React.createElement("option", {
                value: "MT"
            }, "Malta"), /*#__PURE__*/React.createElement("option", {
                value: "MU"
            }, "Mauritius"), /*#__PURE__*/React.createElement("option", {
                value: "MV"
            }, "Maldives"), /*#__PURE__*/React.createElement("option", {
                value: "MW"
            }, "Malawi"), /*#__PURE__*/React.createElement("option", {
                value: "MX"
            }, "Mexico"), /*#__PURE__*/React.createElement("option", {
                value: "MY"
            }, "Malaysia"), /*#__PURE__*/React.createElement("option", {
                value: "MZ"
            }, "Mozambique"), /*#__PURE__*/React.createElement("option", {
                value: "NA"
            }, "Namibia"), /*#__PURE__*/React.createElement("option", {
                value: "NC"
            }, "New Caledonia"), /*#__PURE__*/React.createElement("option", {
                value: "NE"
            }, "Niger"), /*#__PURE__*/React.createElement("option", {
                value: "NF"
            }, "Norfolk Island"), /*#__PURE__*/React.createElement("option", {
                value: "NG"
            }, "Nigeria"), /*#__PURE__*/React.createElement("option", {
                value: "NI"
            }, "Nicaragua"), /*#__PURE__*/React.createElement("option", {
                value: "NL"
            }, "Netherlands"), /*#__PURE__*/React.createElement("option", {
                value: "NO"
            }, "Norway"), /*#__PURE__*/React.createElement("option", {
                value: "NP"
            }, "Nepal"), /*#__PURE__*/React.createElement("option", {
                value: "NR"
            }, "Nauru"), /*#__PURE__*/React.createElement("option", {
                value: "NU"
            }, "Niue"), /*#__PURE__*/React.createElement("option", {
                value: "NZ"
            }, "New Zealand"), /*#__PURE__*/React.createElement("option", {
                value: "OM"
            }, "Oman"), /*#__PURE__*/React.createElement("option", {
                value: "PA"
            }, "Panama"), /*#__PURE__*/React.createElement("option", {
                value: "PE"
            }, "Peru"), /*#__PURE__*/React.createElement("option", {
                value: "PF"
            }, "French Polynesia"), /*#__PURE__*/React.createElement("option", {
                value: "PG"
            }, "Papua New Guinea"), /*#__PURE__*/React.createElement("option", {
                value: "PH"
            }, "Philippines"), /*#__PURE__*/React.createElement("option", {
                value: "PK"
            }, "Pakistan"), /*#__PURE__*/React.createElement("option", {
                value: "PL"
            }, "Poland"), /*#__PURE__*/React.createElement("option", {
                value: "PM"
            }, "Saint Pierre and Miquelon"), /*#__PURE__*/React.createElement("option", {
                value: "PN"
            }, "Pitcairn"), /*#__PURE__*/React.createElement("option", {
                value: "PR"
            }, "Puerto Rico"), /*#__PURE__*/React.createElement("option", {
                value: "PS"
            }, "Palestine, State of"), /*#__PURE__*/React.createElement("option", {
                value: "PT"
            }, "Portugal"), /*#__PURE__*/React.createElement("option", {
                value: "PW"
            }, "Palau"), /*#__PURE__*/React.createElement("option", {
                value: "PY"
            }, "Paraguay"), /*#__PURE__*/React.createElement("option", {
                value: "QA"
            }, "Qatar"), /*#__PURE__*/React.createElement("option", {
                value: "RE"
            }, "R\xE9union"), /*#__PURE__*/React.createElement("option", {
                value: "RO"
            }, "Romania"), /*#__PURE__*/React.createElement("option", {
                value: "RS"
            }, "Serbia"), /*#__PURE__*/React.createElement("option", {
                value: "RU"
            }, "Russian Federation"), /*#__PURE__*/React.createElement("option", {
                value: "RW"
            }, "Rwanda"), /*#__PURE__*/React.createElement("option", {
                value: "SA"
            }, "Saudi Arabia"), /*#__PURE__*/React.createElement("option", {
                value: "SB"
            }, "Solomon Islands"), /*#__PURE__*/React.createElement("option", {
                value: "SC"
            }, "Seychelles"), /*#__PURE__*/React.createElement("option", {
                value: "SD"
            }, "Sudan"), /*#__PURE__*/React.createElement("option", {
                value: "SE"
            }, "Sweden"), /*#__PURE__*/React.createElement("option", {
                value: "SG"
            }, "Singapore"), /*#__PURE__*/React.createElement("option", {
                value: "SH"
            }, "Saint Helena, Ascension and Tristan da Cunha"), /*#__PURE__*/React.createElement("option", {
                value: "SI"
            }, "Slovenia"), /*#__PURE__*/React.createElement("option", {
                value: "SJ"
            }, "Svalbard and Jan Mayen"), /*#__PURE__*/React.createElement("option", {
                value: "SK"
            }, "Slovakia"), /*#__PURE__*/React.createElement("option", {
                value: "SL"
            }, "Sierra Leone"), /*#__PURE__*/React.createElement("option", {
                value: "SM"
            }, "San Marino"), /*#__PURE__*/React.createElement("option", {
                value: "SN"
            }, "Senegal"), /*#__PURE__*/React.createElement("option", {
                value: "SO"
            }, "Somalia"), /*#__PURE__*/React.createElement("option", {
                value: "SR"
            }, "Suriname"), /*#__PURE__*/React.createElement("option", {
                value: "SS"
            }, "South Sudan"), /*#__PURE__*/React.createElement("option", {
                value: "ST"
            }, "Sao Tome and Principe"), /*#__PURE__*/React.createElement("option", {
                value: "SV"
            }, "El Salvador"), /*#__PURE__*/React.createElement("option", {
                value: "SX"
            }, "Sint Maarten (Dutch part)"), /*#__PURE__*/React.createElement("option", {
                value: "SY"
            }, "Syrian Arab Republic"), /*#__PURE__*/React.createElement("option", {
                value: "SZ"
            }, "Swaziland"), /*#__PURE__*/React.createElement("option", {
                value: "TC"
            }, "Turks and Caicos Islands"), /*#__PURE__*/React.createElement("option", {
                value: "TD"
            }, "Chad"), /*#__PURE__*/React.createElement("option", {
                value: "TF"
            }, "French Southern Territories"), /*#__PURE__*/React.createElement("option", {
                value: "TG"
            }, "Togo"), /*#__PURE__*/React.createElement("option", {
                value: "TH"
            }, "Thailand"), /*#__PURE__*/React.createElement("option", {
                value: "TJ"
            }, "Tajikistan"), /*#__PURE__*/React.createElement("option", {
                value: "TK"
            }, "Tokelau"), /*#__PURE__*/React.createElement("option", {
                value: "TL"
            }, "Timor-Leste"), /*#__PURE__*/React.createElement("option", {
                value: "TM"
            }, "Turkmenistan"), /*#__PURE__*/React.createElement("option", {
                value: "TN"
            }, "Tunisia"), /*#__PURE__*/React.createElement("option", {
                value: "TO"
            }, "Tonga"), /*#__PURE__*/React.createElement("option", {
                value: "TR"
            }, "Turkey"), /*#__PURE__*/React.createElement("option", {
                value: "TT"
            }, "Trinidad and Tobago"), /*#__PURE__*/React.createElement("option", {
                value: "TV"
            }, "Tuvalu"), /*#__PURE__*/React.createElement("option", {
                value: "TW"
            }, "Taiwan, Province of China"), /*#__PURE__*/React.createElement("option", {
                value: "TZ"
            }, "Tanzania, United Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "UA"
            }, "Ukraine"), /*#__PURE__*/React.createElement("option", {
                value: "UG"
            }, "Uganda"), /*#__PURE__*/React.createElement("option", {
                value: "UM"
            }, "United States Minor Outlying Islands"), /*#__PURE__*/React.createElement("option", {
                value: "US"
            }, "United States"), /*#__PURE__*/React.createElement("option", {
                value: "UY"
            }, "Uruguay"), /*#__PURE__*/React.createElement("option", {
                value: "UZ"
            }, "Uzbekistan"), /*#__PURE__*/React.createElement("option", {
                value: "VA"
            }, "Holy See (Vatican City State)"), /*#__PURE__*/React.createElement("option", {
                value: "VC"
            }, "Saint Vincent and the Grenadines"), /*#__PURE__*/React.createElement("option", {
                value: "VE"
            }, "Venezuela, Bolivarian Republic of"), /*#__PURE__*/React.createElement("option", {
                value: "VG"
            }, "Virgin Islands, British"), /*#__PURE__*/React.createElement("option", {
                value: "VI"
            }, "Virgin Islands, U.S."), /*#__PURE__*/React.createElement("option", {
                value: "VN"
            }, "Viet Nam"), /*#__PURE__*/React.createElement("option", {
                value: "VU"
            }, "Vanuatu"), /*#__PURE__*/React.createElement("option", {
                value: "WF"
            }, "Wallis and Futuna"), /*#__PURE__*/React.createElement("option", {
                value: "WS"
            }, "Samoa"), /*#__PURE__*/React.createElement("option", {
                value: "YE"
            }, "Yemen"), /*#__PURE__*/React.createElement("option", {
                value: "YT"
            }, "Mayotte"), /*#__PURE__*/React.createElement("option", {
                value: "ZA"
            }, "South Africa"), /*#__PURE__*/React.createElement("option", {
                value: "ZM"
            }, "Zambia"), /*#__PURE__*/React.createElement("option", {
                value: "ZW"
            }, "Zimbabwe"))))));
        } else {
            return /*#__PURE__*/React.createElement(React.Fragment, null, loading);
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
            showForgotPassword: false,
            registerdto: {
                userName: '',
                password: '',
                userEmail: '',
                securityQuestion: '',
                securityAnswer: ''
            },
            logindto: {
                userName: '',
                password: ''
            },
            loading: false,
            message: '',
            bsstyle: '',
            loggedin: loggedin
        };
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegisterClickHere = this.handleRegisterClickHere.bind(this);
        this.handleLoginClickHere = this.handleLoginClickHere.bind(this);
    }
    handleLogin(e) {
        e.preventDefault();
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/Login', {
            method: 'post',
            body: JSON.stringify({
                UserName: this.state.logindto.userName,
                Password: this.state.logindto.password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            //console.log(response);
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    if (data.token !== undefined) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("myself", JSON.stringify(data.member));
                        this.setState({
                            bsstyle: '',
                            message: '',
                            loggedin: true,
                            loading: false
                        });
                        location.reload();
                        //if (this.props.onLogin !== undefined) {
                        //    this.props.onLogin();
                        //} else {
                        //    this.setState({ redirectto: '/' });
                        //}
                    }
                });
            } else if (response.status === 404) {
                response.json().then(data => {
                    //console.log(data);
                    this.setState({
                        bsstyle: 'danger',
                        message: data.error,
                        loading: false
                    });
                });
            }
        });
    }
    handleRegisterSubmit(e) {
        e.preventDefault();
        this.setState({
            loading: true
        });
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
        }).then(response => {
            console.log(response.status);
            if (response.status === 200) {
                this.setState({
                    loading: false,
                    bsstyle: 'success',
                    message: 'Your registration is complete.',
                    loggedin: false,
                    logindto: {
                        userName: this.state.registerdto.userName,
                        password: ''
                    },
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
            } else {
                this.setState({
                    loading: false,
                    bsstyle: 'danger',
                    message: 'Unable to process your request please try again.'
                });
            }
        });
        return false;
    }
    handleRegisterClickHere() {
        this.setState({
            showregisterform: true,
            message: ""
        });
    }
    handleLoginClickHere() {
        this.setState({
            showregisterform: false,
            message: ""
        });
    }
    renderLoginForm() {
        if (!this.state.showForgotPassword) {
            return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Login"), /*#__PURE__*/React.createElement("form", {
                onSubmit: this.handleLogin
            }, /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", null, "Username"), /*#__PURE__*/React.createElement("input", {
                type: "text",
                className: "form-control",
                required: true,
                name: "userName",
                value: this.state.logindto.userName,
                onChange: e => {
                    this.setState({
                        logindto: {
                            userName: e.target.value,
                            password: this.state.logindto.password
                        }
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "mb-3"
            }, /*#__PURE__*/React.createElement("label", null, "Password"), /*#__PURE__*/React.createElement("input", {
                className: "form-control",
                required: true,
                name: "password",
                type: "password",
                onChange: e => {
                    this.setState({
                        logindto: {
                            userName: this.state.logindto.userName,
                            password: e.target.value
                        }
                    });
                }
            })), /*#__PURE__*/React.createElement("div", {
                className: "row"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-4"
            }, /*#__PURE__*/React.createElement("button", {
                className: "btn btn-dark",
                type: "submit"
            }, "Login")), /*#__PURE__*/React.createElement("div", {
                className: "col text-end"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => {
                    this.setState({
                        showForgotPassword: true
                    });
                },
                className: "btn btn-link text-dark"
            }, "Forgot Password?")))));
        } else {
            return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ForgotPassword, null), /*#__PURE__*/React.createElement("p", {
                className: "my-2 text-center border-top py-2"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                onClick: () => {
                    this.setState({
                        showForgotPassword: false
                    });
                },
                className: "btn btn-link text-dark"
            }, "Try Login Again")));
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.beginWithRegister !== prevState.beginWithRegister) {
            return {
                someState: nextProps.beginWithRegister
            };
        } else return null;
    }
    render() {
        let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-valuenow": "75",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: "100%"
            }
        })) : null;
        let messagecontent = this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
            className: "mt-1 alert alert-" + this.state.bsstyle
        }, this.state.message) : null;
        let logincontents = this.state.GenerateOTPButton ? this.renderOTPForm() : this.renderLoginForm();
        let formcontents = this.state.showregisterform ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "float-end"
        }, /*#__PURE__*/React.createElement("span", {
            class: "text-danger"
        }, "*"), " Required"), /*#__PURE__*/React.createElement("h3", {
            className: "mb-2"
        }, "Register"), /*#__PURE__*/React.createElement("form", {
            autoComplete: "off",
            onSubmit: this.handleRegisterSubmit
        }, /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "fw-bold"
        }, "Username ", /*#__PURE__*/React.createElement("span", {
            className: "text-danger"
        }, "*")), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            minLength: "3",
            maxLength: "30",
            required: true,
            name: "username",
            value: this.state.registerdto.userName,
            onChange: e => {
                let rdto = this.state.registerdto;
                rdto.userName = e.target.value;
                this.setState({
                    registerdto: rdto
                });
            },
            "aria-describedby": "usernameHelp"
        }), /*#__PURE__*/React.createElement("div", {
            id: "usernameHelp",
            class: "form-text"
        }, "Username should be unique and creative, it will be your identity on the site.", /*#__PURE__*/React.createElement("br", null), "\u092E\u0928 \u091A\u093E\u0939\u093E Username \u091A\u0941\u0928\u0947, \u092F\u0939 Yocail \u092A\u0930 \u0906\u092A\u0915\u0940 \u092A\u0939\u091A\u093E\u0928 \u092C\u0928\u0947\u0917\u093E\u0964 Username \u0905\u0928\u094B\u0916\u093E \u0914\u0930 \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0930\u0916\u0947\u0964")), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "fw-bold"
        }, "Password ", /*#__PURE__*/React.createElement("span", {
            className: "text-danger"
        }, "*")), /*#__PURE__*/React.createElement("input", {
            className: "form-control",
            minLength: "8",
            required: true,
            name: "password",
            type: "password",
            onChange: e => {
                let rdto = this.state.registerdto;
                rdto.password = e.target.value;
                this.setState({
                    registerdto: rdto
                });
            }
        }), /*#__PURE__*/React.createElement("div", {
            id: "passwordHelp",
            class: "form-text"
        }, "Password should be at least 8 characters long, make it difficult to guess.", /*#__PURE__*/React.createElement("br", null), "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E \u0906\u0920 \u0905\u0915\u094D\u0937\u0930 \u0915\u093E \u0939\u094B, \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u0920\u093F\u0928 \u091A\u0941\u0928\u0947\u0964")), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "fw-bold"
        }, "Security Question ", /*#__PURE__*/React.createElement("span", {
            className: "text-danger"
        }, "*")), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            minLength: "10",
            required: true,
            maxlength: "300",
            name: "securityQuestion",
            value: this.state.registerdto.securityQuestion,
            onChange: e => {
                let rdto = this.state.registerdto;
                rdto.securityQuestion = e.target.value;
                this.setState({
                    registerdto: rdto
                });
            },
            "aria-describedby": "securityquestionHelp"
        }), /*#__PURE__*/React.createElement("div", {
            id: "securityquestionHelp",
            class: "form-text"
        }, "In case you forget your password, we will ask you this security question. Choose your security question wisely\u0964 ", /*#__PURE__*/React.createElement("br", null), "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u092D\u0942\u0932 \u091C\u093E\u0928\u0947 \u092A\u0930 \u092F\u0939\u0940 security question \u0906\u092A \u0938\u0947 \u092A\u0942\u091B\u093E \u091C\u093E\u090F\u0917\u093E\u0964 Security question \u0910\u0938\u093E \u0930\u0916\u0947 \u091C\u093F\u0938\u0915\u093E \u0909\u0924\u094D\u0924\u0930 \u0938\u093F\u0930\u094D\u092B \u0906\u092A\u0915\u094B \u092A\u0924\u093E \u0939\u094B\u0964")), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "fw-bold"
        }, "Security Answer ", /*#__PURE__*/React.createElement("span", {
            className: "text-danger"
        }, "*")), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            maxlength: "100",
            required: true,
            name: "securityAnswer",
            value: this.state.registerdto.securityAnswer,
            onChange: e => {
                let rdto = this.state.registerdto;
                rdto.securityAnswer = e.target.value;
                this.setState({
                    registerdto: rdto
                });
            },
            "aria-describedby": "securitypasswordHelp"
        }), /*#__PURE__*/React.createElement("div", {
            id: "securitypasswordHelp",
            class: "form-text"
        }, "You will be allowed to reset your password only if you provide this security answer. ", /*#__PURE__*/React.createElement("br", null), "\u0906\u092A \u0915\u094B \u0905\u092A\u0928\u093E \u092A\u093E\u0938\u0935\u0949\u0930\u094D\u0921 \u0924\u092D\u0940 \u092C\u0926\u0932\u0928\u0947 \u0926\u093F\u092F\u093E \u091C\u093E\u090F\u0917\u093E \u091C\u092C \u0906\u092A\u0915\u093E security question \u0909\u0924\u094D\u0924\u0930 \u0907\u0938 \u0938\u0947 \u092E\u0947\u0932 \u0916\u093E\u090F\u0917\u093E\u0964")), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "fw-bold"
        }, "Email ", /*#__PURE__*/React.createElement("span", {
            className: "text-danger"
        }, "*")), /*#__PURE__*/React.createElement("input", {
            className: "form-control",
            maxLength: "250",
            required: true,
            name: "userEmail",
            type: "email",
            value: this.state.registerdto.userEmail,
            onChange: e => {
                let rdto = this.state.registerdto;
                rdto.userEmail = e.target.value;
                this.setState({
                    registerdto: rdto
                });
            }
        })), /*#__PURE__*/React.createElement("button", {
            className: "btn btn-dark",
            type: "submit"
        }, "Register")), /*#__PURE__*/React.createElement("p", {
            className: "text-center mt-2"
        }, "Already a Member! ", /*#__PURE__*/React.createElement("a", {
            onClick: this.handleLoginClickHere,
            className: "link-success"
        }, "Login Here"), " "), messagecontent, loading) : /*#__PURE__*/React.createElement(React.Fragment, null, logincontents, /*#__PURE__*/React.createElement("p", {
            className: "text-center mt-3 p-3 border-top"
        }, "Register for FREE ", /*#__PURE__*/React.createElement("a", {
            onClick: this.handleRegisterClickHere,
            className: "link-success"
        }, "Click Here")), messagecontent, loading);
        return /*#__PURE__*/React.createElement(React.Fragment, null, formcontents);
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
            loading: false,
            loggedin: loggedin,
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
        let parts = text.split(/(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim); // re is a matching regular expression
        for (let i = 1; i < parts.length; i += 2) {
            parts[i] = /*#__PURE__*/React.createElement("a", {
                key: 'link' + i,
                href: parts[i]
            }, parts[i].split('\n').map((item, key) => {
                return /*#__PURE__*/React.createElement(React.Fragment, {
                    key: key
                }, item, /*#__PURE__*/React.createElement("br", null));
            }));
        }
        return parts;
    }
    render() {
        if (this.state.profile !== null) {
            var d = new Date();
            let pic = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
                src: "/images/nopic.jpg",
                style: {
                    width: "50px"
                },
                className: "rounded mx-auto d-block img-fluid",
                alt: ""
            }));
            if (this.state.profile.pic !== "") {
                pic = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
                    src: this.state.profile.pic,
                    className: "rounded mx-auto d-block img-fluid",
                    alt: ""
                }));
            }
            let age = this.state.profile.birthYear > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, d.getFullYear() - this.state.profile.birthYear, " Years Old") : null;
            let address = this.state.profile.city + ' ' + this.state.profile.state + ' ' + this.state.profile.country;
            if (address.trim() !== '') {
                address = 'From ' + address;
            }
            let config = [{
                regex: /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => /*#__PURE__*/React.createElement("span", {
                    key: key
                }, /*#__PURE__*/React.createElement("a", {
                    target: "_blank",
                    href: `${result[1]}://${result[2]}.${result[3]}${result[4]}`
                }, result[2], ".", result[3], result[4]), result[5])
            }, {
                regex: /\n/gim,
                fn: (key, result) => /*#__PURE__*/React.createElement("br", {
                    key: key
                })
            }, {
                regex: /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => /*#__PURE__*/React.createElement("span", {
                    key: key
                }, /*#__PURE__*/React.createElement("a", {
                    target: "_blank",
                    href: `http://${result[1]}.${result[2]}${result[3]}`
                }, result[1], ".", result[2], result[3]), result[4])
            }];
            var bio = /*#__PURE__*/React.createElement("p", null, this.processString(config)(this.state.profile.bio));
            return /*#__PURE__*/React.createElement("div", {
                className: "text-center"
            }, pic, /*#__PURE__*/React.createElement("h4", null, this.state.profile.name), /*#__PURE__*/React.createElement("p", null, bio), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("em", null, age, " ", address)));
        } else {
            return null;
        }
    }
}
class FollowRequestList extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "fetchRequests", () => {
            this.setState({
                loading: true
            });
            fetch('//' + window.location.host + '/api/Follow/Requests', {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        this.setState({
                            loading: false,
                            requests: data,
                            bsstyle: '',
                            message: ''
                        });
                    });
                } else if (response.status === 500) {
                    this.setState({
                        bsstyle: 'danger',
                        message: 'Unable to process this request',
                        loading: false
                    });
                }
            }).catch(() => {
                this.setState({
                    bsstyle: 'danger',
                    message: 'Unable to process this request, check your internet connection.',
                    loading: false
                });
            });
        });
        _defineProperty(this, "allowRequest", id => {
            this.setState({
                loading: true
            });
            fetch('//' + window.location.host + '/api/Follow/Allow/' + id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false,
                        requests: this.state.requests.filter(t => t.id !== id),
                        bsstyle: '',
                        message: ''
                    });
                } else if (response.status === 500) {
                    this.setState({
                        bsstyle: 'danger',
                        message: 'Unable to process this request',
                        loading: false
                    });
                }
            }).catch(() => {
                this.setState({
                    bsstyle: 'danger',
                    message: 'Unable to process this request, check your internet connection.',
                    loading: false
                });
            });
        });
        _defineProperty(this, "rejectRequest", id => {
            this.setState({
                loading: true
            });
            fetch('//' + window.location.host + '/api/Follow/Reject/' + id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + this.state.token
                }
            }).then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    this.setState({
                        loading: false,
                        requests: this.state.requests.filter(t => t.id !== id),
                        bsstyle: '',
                        message: ''
                    });
                } else if (response.status === 500) {
                    this.setState({
                        bsstyle: 'danger',
                        message: 'Unable to process this request',
                        loading: false
                    });
                }
            }).catch(() => {
                this.setState({
                    bsstyle: 'danger',
                    message: 'Unable to process this request, check your internet connection.',
                    loading: false
                });
            });
        });
        _defineProperty(this, "renderList", () => {
            var items = [];
            for (let k in this.state.requests) {
                let r = this.state.requests[k];
                items.push( /*#__PURE__*/React.createElement("div", {
                    key: r.id,
                    className: "row mx-0  justify-content-center align-items-center"
                }, /*#__PURE__*/React.createElement("div", {
                    className: "col px-0"
                }, /*#__PURE__*/React.createElement(MemberPicSmall, {
                    member: r
                }), /*#__PURE__*/React.createElement("a", {
                    href: '//' + window.location.host + '/profile?un=' + r.userName,
                    className: "fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none"
                }, r.userName)), /*#__PURE__*/React.createElement("div", {
                    className: "col-6"
                }, /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    "data-id": r.id,
                    onClick: e => {
                        this.allowRequest(e.target.getAttribute("data-id"));
                    },
                    className: "btn btn-primary"
                }, "Allow"), /*#__PURE__*/React.createElement("button", {
                    type: "button",
                    "data-id": r.id,
                    onClick: e => {
                        this.rejectRequest(e.target.getAttribute("data-id"));
                    },
                    className: "mx-2 btn btn-secondary"
                }, "Reject"))));
            }
            if (items.length === 0) {
                items.push( /*#__PURE__*/React.createElement("div", {
                    key: 0
                }, /*#__PURE__*/React.createElement("p", null, "No Follow Requests Here.")));
            }
            return items;
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            requests: []
        };
    }
    componentDidMount() {
        this.fetchRequests();
    }
    render() {
        return /*#__PURE__*/React.createElement(React.Fragment, null, this.renderList());
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
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            list: []
        };
        this.fetchRecommended = this.fetchRecommended.bind(this);
    }
    componentDidMount() {
        this.fetchRecommended();
    }
    fetchRecommended() {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Follow/Recommended', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false
                });
            } else if (response.status === 200) {
                response.json().then(data => {
                    console.log("recommended");
                    console.log(data);
                    this.setState({
                        loading: false,
                        list: data,
                        bsstyle: '',
                        message: ''
                    });
                });
            } else if (response.status === 500) {
                this.setState({
                    bsstyle: 'danger',
                    message: 'Unable to process this request',
                    loading: false
                });
            }
        }).catch(() => {
            this.setState({
                bsstyle: 'danger',
                message: 'Unable to process this request, check your internet connection.',
                loading: false
            });
        });
    }
    renderResult() {
        let items = [];
        for (let k in this.state.list) {
            items.push( /*#__PURE__*/React.createElement("li", {
                key: k,
                className: "list-group-item border-0 border-bottom p-2"
            }, /*#__PURE__*/React.createElement(MemberSmallRow, {
                member: this.state.list[k]
            })));
        }
        if (items.length > 0) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "row mb-1 mt-2"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-7 fw-bold"
            }, "Popular Accounts"), /*#__PURE__*/React.createElement("div", {
                className: "col text-end"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-light d-none btn-sm"
            }, "See all"))), /*#__PURE__*/React.createElement("ul", {
                className: "list-group list-group-flush"
            }, items));
        } else {
            return null;
        }
    }
    render() {
        if (this.state.loggedin) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, this.renderResult());
        } else {
            return null;
        }
    }
}
class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "loadSecurityQuestion", () => {
            this.setState({
                loading: true
            });
            fetch("//" + window.location.host + "/api/members/getsecurityquestion/" + this.state.username, {
                method: "get"
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({
                            loading: false,
                            securityQuestion: data.securityQuestion,
                            bsstyle: '',
                            message: ''
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        securityQuestion: '',
                        bsstyle: 'danger',
                        message: 'Incorrect username provided.'
                    });
                }
            }).catch(error => {
                this.setState({
                    loading: false,
                    securityQuestion: '',
                    bsstyle: 'danger',
                    message: 'Unable to contact server.'
                });
            });
        });
        _defineProperty(this, "savePassword", () => {
            if (this.state.password !== this.state.verifyPassword) {
                this.setState({
                    loading: false,
                    bsstyle: 'danger',
                    message: 'Verify password should match password.'
                });
                return;
            }
            this.setState({
                loading: true
            });
            let fd = new FormData();
            fd.append("username", this.state.username);
            fd.append("question", this.state.securityQuestion);
            fd.append("answer", this.state.securityAnswer);
            fd.append("password", this.state.password);
            fetch("//" + window.location.host + "/api/members/validatesecurityanswer", {
                method: "post",
                body: fd
            }).then(response => {
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        bsstyle: 'success',
                        message: 'Your password is successfully reset. You can try logging in now.'
                    });
                } else if (response.status == 500 || response.status === 400 || response.status === 404) {
                    response.json().then(data => {
                        this.setState({
                            loading: false,
                            bsstyle: 'danger',
                            message: data.error
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        securityQuestion: '',
                        bsstyle: 'danger',
                        message: 'Incorrect username provided.'
                    });
                }
            }).catch(error => {
                this.setState({
                    loading: false,
                    securityQuestion: '',
                    bsstyle: 'danger',
                    message: 'Unable to contact server.'
                });
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            username: '',
            securityQuestion: '',
            securityAnswer: '',
            password: '',
            verifyPassword: ''
        };
    }
    render() {
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Forgot Password"), /*#__PURE__*/React.createElement("p", null, "Provide your username or email address, you will be asked with security question."), /*#__PURE__*/React.createElement("form", {
            onSubmit: e => {
                e.preventDefault();
                this.loadSecurityQuestion();
            }
        }, /*#__PURE__*/React.createElement("label", {
            className: "form-label"
        }, "Username"), /*#__PURE__*/React.createElement("div", {
            className: "row g-0 mb-3"
        }, /*#__PURE__*/React.createElement("div", {
            className: "col-9"
        }, /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            style: {
                width: "210 px"
            },
            maxlength: "300",
            placeholder: "Username or Email",
            value: this.state.username,
            onChange: e => {
                this.setState({
                    username: e.target.value
                });
            },
            required: true
        })), /*#__PURE__*/React.createElement("div", {
            className: "col-3"
        }, /*#__PURE__*/React.createElement("button", {
            type: "submit",
            className: "btn btn-light btn-sm"
        }, "Load Member")))), this.state.securityQuestion !== "" ? /*#__PURE__*/React.createElement("form", {
            onSubmit: e => {
                e.preventDefault();
                this.savePassword();
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "form-label"
        }, "Security Question"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            readOnly: true,
            required: true,
            className: "form-control",
            value: this.state.securityQuestion
        })), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "form-label"
        }, "Security Answer"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            maxLength: "300",
            required: true,
            className: "form-control",
            value: this.state.securityAnswer,
            onChange: e => {
                this.setState({
                    securityAnswer: e.target.value
                });
            }
        }), /*#__PURE__*/React.createElement("div", {
            class: "form-text"
        }, "Your new password will set only if your security answer matches with our records.")), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "form-label"
        }, "New Password"), /*#__PURE__*/React.createElement("input", {
            type: "password",
            required: true,
            className: "form-control",
            minLength: "8",
            value: this.state.password,
            onChange: e => {
                this.setState({
                    password: e.target.value
                });
            }
        })), /*#__PURE__*/React.createElement("div", {
            className: "mb-3"
        }, /*#__PURE__*/React.createElement("label", {
            className: "form-label"
        }, "Verify New Password"), /*#__PURE__*/React.createElement("input", {
            type: "password",
            required: true,
            className: "form-control",
            value: this.state.verifyPassword,
            onChange: e => {
                this.setState({
                    verifyPassword: e.target.value
                });
            }
        })), /*#__PURE__*/React.createElement("button", {
            type: "submit",
            className: "btn btn-primary"
        }, "Save New Password")) : null, this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress my-2",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-label": "",
            "aria-valuenow": "100",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: "100%"
            }
        })) : null, this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
            className: "my-2 alert alert-" + this.state.bsstyle
        }, this.state.message) : null);
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
            loading: false,
            loggedin: loggedin,
            bsstyle: '',
            message: '',
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            post: this.props.post,
            members: [],
            memberid: null,
            search: ''
        };
    }
    render() {
        return /*#__PURE__*/React.createElement(MemberSmallList, {
            memberid: this.state.member.id,
            target: "share"
        });
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
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), ignore ? "gi" : "g"), typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2);
};
class Conversation extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            myself: null,
            bsstyle: '',
            message: '',
            selectedperson: null,
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            searchtext: '',
            dummy: new Date(),
            showsearch: true,
            showprofilemodal: false,
            profiletoshow: null
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
        };
    }
    componentDidMount() {
        this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
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
        this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/personchathub", {
            accessTokenFactory: () => this.state.token
        }).withAutomaticReconnect().build();
        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
        }).catch(err => console.log('Error while establishing connection :('));

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            var mi = {
                id: id,
                sender: sender,
                text: text,
                timestamp: timestamp,
                status: 2 /*Received*/
            };
            //if received message is from current person then show in ui else save in local storage
            this.handleReceivedMessage(mi);
        });

        //update local contact list when some contact updates their information
        //if member is logged changes will be reflected immediately 
        //other wise when member log in latest contact info wil be fetched from db
        this.hubConnection.on('ContactUpdated', dto => {
            if (this.contactlist.get(dto.id) !== undefined) {
                let p = this.contactlist.get(dto.id).person;
                if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) {
                    this.contactlist.get(dto.id).person = dto;
                    this.setState({
                        dummy: Date.now()
                    });
                }
            }
        });
        this.hubConnection.on('ContactSaved', dto => {
            if (this.contactlist.get(dto.id) === undefined) {
                this.contactlist.set(dto.person.id, dto);
                this.setState({
                    dummy: Date.now()
                });
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
        } else if (a[1].person.activity === 5 && b[1].person.activity !== 5) {
            // a should come after b in the sorted order
            return 1;
        } else {
            // a and b are the same
            return 0;
        }
    }

    //see if user is logged in
    validate(t) {
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        }).then(response => {
            if (response.status === 401) {
                //if token is not valid than remove token, set myself object with empty values
                localStorage.removeItem("token");
                this.setState({
                    loggedin: false,
                    loading: false,
                    token: null
                });
            } else if (response.status === 200) {
                //if token is valid vet user information from response and set "myself" object with member id and name.
                //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                //is set then start signalr hub
                response.json().then(data => {
                    //console.log(data);
                    this.setState({
                        loggedin: true,
                        loading: false,
                        myself: data
                    });
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
        }).then(response => {
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
                                    var mi = {
                                        id: data[k].messagesOnServer[i].id,
                                        sender: data[k].messagesOnServer[i].sentBy.id,
                                        text: data[k].messagesOnServer[i].message,
                                        timestamp: data[k].messagesOnServer[i].sentDate,
                                        status: 2 /*Received*/
                                    };
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
                    this.setState({
                        loading: false,
                        dummy: new Date()
                    });
                });
            } else {
                this.setState({
                    loading: false,
                    message: 'Unable to search.',
                    bsstyle: 'danger'
                });
            }
        });
    }

    //search for members
    search() {
        if (this.state.searchtext !== "") {
            this.setState({
                loading: true
            });
            fetch('//' + window.location.host + '/api/Members/search?s=' + this.state.searchtext, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        this.contactlist = new Map();
                        for (var k in data) {
                            this.contactlist.set(data[k].id, {
                                id: 0,
                                person: data[k],
                                createDate: null,
                                boloRelation: 3,
                                recentMessage: '',
                                recentMessageDate: ''
                            });
                        }
                        this.setState({
                            loading: false,
                            dummy: new Date()
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        message: 'Unable to search.',
                        bsstyle: 'danger'
                    });
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
                    this.setState({
                        dummy: Date.now()
                    });
                }
                break;
        }
    }
    handleShowSearch(show) {
        if (show) {
            this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        }
        this.setState({
            showsearch: show
        });
    }
    handleProfileSelect(e) {
        this.setState({
            selectedperson: e
        });
    }
    handleProfileModalClose() {
        this.setState({
            profiletoshow: null,
            showprofilemodal: false
        });
    }

    //handle profile menu item click
    handleProfileItemClick(e) {
        //should only move forward if there is memberid and there is some profileselect action provided
        if (e !== null && this.contactlist.get(e) !== undefined) {
            this.setState({
                profiletoshow: this.contactlist.get(e).person,
                showprofilemodal: true
            });
        }
    }

    //handle search result item click
    handleResultItemClick(e) {
        this.setState({
            selectedperson: null
        });
        if (this.state.loggedin) {
            //should only move forward if there is memberid and there is some profileselect action provided
            if (e !== null && this.contactlist.get(e) !== undefined) {
                this.setState({
                    selectedperson: this.contactlist.get(e).person,
                    showsearch: false,
                    showprofilemodal: false
                });
            }
        } else {
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
        if (usermsgs !== null) usermsgmap = new Map(JSON.parse(usermsgs)); else usermsgmap = new Map();
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
            this.setState({
                dummy: Date.now()
            });
        }
    }

    //the usual BS required for form fields to work in react
    handleChange(e) {
        switch (e.target.name) {
            case 'searchtext':
                if (e.target.value.trim() === "") {
                    this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                }
                this.setState({
                    searchtext: e.target.value
                });
                break;
            default:
        }
    }
    renderPeopleList() {
        const items = [];
        const hundred = {
            width: "100%"
        };
        var sortedcontacts = new Map([...this.contactlist.entries()].sort(this.compare_contact));
        for (const [key, contact] of sortedcontacts.entries()) {
            let obj = contact.person;
            if (this.state.myself === null || obj.id !== this.state.myself.id) {
                let thought = null;
                if (obj.thoughtStatus !== "") {
                    thought = /*#__PURE__*/React.createElement("p", {
                        className: "card-text"
                    }, /*#__PURE__*/React.createElement("small", null, obj.thoughtStatus));
                }
                let online = /*#__PURE__*/React.createElement("span", {
                    className: "offline"
                });
                if (obj.activity !== 5) {
                    online = /*#__PURE__*/React.createElement("span", {
                        className: "online"
                    });
                }
                let unseenmsgcount = contact.unseenMessageCount > 0 ? /*#__PURE__*/React.createElement("span", {
                    className: "badge bg-primary"
                }, contact.unseenMessageCount) : null;
                let blocked = contact.boloRelation === BoloRelationType.Blocked ? /*#__PURE__*/React.createElement("span", {
                    className: "badge bg-danger"
                }, "Blocked") : null;
                let pic = obj.pic !== "" ? /*#__PURE__*/React.createElement("img", {
                    src: obj.pic,
                    className: "card-img",
                    alt: ""
                }) : null;
                items.push( /*#__PURE__*/React.createElement("div", {
                    className: "card mb-1",
                    style: {
                        maxWidth: "400px",
                        cursor: "pointer"
                    },
                    onClick: () => this.handleResultItemClick(obj.id)
                }, /*#__PURE__*/React.createElement("div", {
                    className: "card-body p-1",
                    style: {
                        position: "relative"
                    }
                }, /*#__PURE__*/React.createElement("span", {
                    style: {
                        maxWidth: "30px",
                        display: "inline-block",
                        float: "right"
                    }
                }, pic), /*#__PURE__*/React.createElement("h5", {
                    className: "card-title"
                }, online, " ", obj.name, " ", unseenmsgcount, " ", blocked), thought)));
            }
        }
        if (items.length > 0) {
            return /*#__PURE__*/React.createElement("div", {
                className: "row searchresult p-1"
            }, items);
        } else {
            return /*#__PURE__*/React.createElement("div", {
                className: "row justify-content-center"
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-12"
            }, /*#__PURE__*/React.createElement("div", {
                className: "alert alert-light",
                role: "alert"
            }, "No profiles to show here.", /*#__PURE__*/React.createElement("br", null), "Search for people based on their name, location, profession or gender etc. Here are some examples of search phrases.", /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Raj Kiran Singh"), /*#__PURE__*/React.createElement("li", null, "Raj From India"), /*#__PURE__*/React.createElement("li", null, "Software Developer in Noida"), /*#__PURE__*/React.createElement("li", null, "Women in India"), /*#__PURE__*/React.createElement("li", null, "Men in India"), /*#__PURE__*/React.createElement("li", null, "Mumbai Maharashtra"), /*#__PURE__*/React.createElement("li", null, "Delhi Mumbai Kolkatta")))));
        }
    }
    render() {
        let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-valuenow": "75",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: "100%"
            }
        })) : null;
        let personchatorprofile = null;
        if (this.state.selectedperson !== null /*&& !this.state.showsearch*/) {
            personchatorprofile = /*#__PURE__*/React.createElement(PersonChat, {
                person: this.state.selectedperson,
                myself: this.state.myself,
                updateParent: this.handleUpdateParent,
                handleShowSearch: this.handleShowSearch
            });
        } else if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personchatorprofile = /*#__PURE__*/React.createElement("div", {
                className: "modal d-block",
                tabIndex: "-1",
                role: "dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-lg modal-dialog-scrollable"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, "Profile"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: this.handleProfileModalClose
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(ViewProfile, {
                profile: this.state.profiletoshow
            })))));
        } else {
            personchatorprofile = null; //<HeartBeat activity="1" interval="3000" />;
        }

        let searchhtml = null;
        if (true || this.state.showsearch) {
            searchhtml = /*#__PURE__*/React.createElement("div", {
                className: "col-sm-4 col-md-3 searchcont bg-light"
            }, /*#__PURE__*/React.createElement("form", {
                onSubmit: this.handleSearchSubmit,
                className: "searchform1 form-inline mt-1 mb-1"
            }, /*#__PURE__*/React.createElement("div", {
                className: "input-group mb-1"
            }, /*#__PURE__*/React.createElement("input", {
                type: "search",
                className: "form-control",
                onChange: this.handleChange,
                title: "Find People by Name, Location, Profession etc.",
                name: "searchtext",
                id: "search-input",
                placeholder: "Find People by Name, Location, Profession etc",
                "aria-label": "Search for...",
                autoComplete: "off",
                spellCheck: "false",
                "aria-describedby": "button-addon2"
            }), /*#__PURE__*/React.createElement("button", {
                className: "btn",
                type: "submit",
                id: "button-addon2"
            }, /*#__PURE__*/React.createElement("img", {
                src: "/icons/search.svg",
                alt: "",
                width: "24",
                height: "24",
                title: "Search People"
            })))), this.renderPeopleList());
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "container"
        }, /*#__PURE__*/React.createElement("div", {
            className: "row"
        }, searchhtml, loading, /*#__PURE__*/React.createElement("div", {
            className: "col-sm-8 col-md-9 p-0"
        }, personchatorprofile))));
    }
}
class PersonChat extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "scrollToBottom", () => {
            if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
                this.messagesEnd.scrollIntoView();
            }
        });
        let loggedin = true;
        let p = this.props.person;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            loading: false,
            loggedin: loggedin,
            myself: this.props.myself !== undefined ? this.props.myself : null,
            bsstyle: '',
            message: '',
            person: p,
            filestoupload: [],
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            textinput: '',
            dummy: Date.now(),
            videoCapable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            peerCapable: SimplePeer.WEBRTC_SUPPORT,
            videoplaying: false,
            audioplaying: false,
            showemojimodal: false,
            peerconnected: false,
            profiletoshow: null,
            showprofilemodal: false
        };
        this.mystream = null;
        this.otherstream = null;
        this.peer = null;
        this.checkPersonPulseInterval = null;
        this.messages = localStorage.getItem(p.id) !== null ? new Map(JSON.parse(localStorage.getItem(p.id))) : new Map();
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
        };
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
                    let contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
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
                            var mi = {
                                id: temp.id,
                                sender: temp.sentBy.id,
                                text: temp.message,
                                timestamp: temp.sentDate,
                                status: this.messageStatusEnum.Received
                            };
                            this.messages.set(mi.id, mi);
                            //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
                            //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({
                        dummy: Date.now()
                    }, () => {
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
                        var mi = {
                            id: temp.id,
                            sender: temp.sentBy.id,
                            text: temp.message,
                            timestamp: temp.sentDate,
                            status: this.messageStatusEnum.Received
                        };
                        this.messages.set(mi.id, mi);
                        if (temp.status != this.messageStatusEnum.Received) {
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({
                        dummy: Date.now()
                    }, () => {
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
        this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/personchathub", {
            accessTokenFactory: () => this.state.token
        }).withAutomaticReconnect().build();
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
            var mi = {
                id: id,
                sender: this.state.myself.id,
                text: text,
                timestamp: timestamp,
                status: this.messageStatusEnum.Sent
            };
            //try to add sent message to current message list
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase()) {
                this.messages.set(id, mi);
                this.setState({
                    dummy: Date.now()
                }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
                this.scrollToBottom();
            }
        });
        this.hubConnection.on('MessageStatus', (messageid, receiver, status) => {
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase() && this.messages.get(messageid) !== undefined) {
                this.messages.get(messageid).status = status;
                this.setState({
                    dummy: Date.now()
                }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
            }
        });
        this.hubConnection.on('ContactSaved', cdto => {
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
        this.hubConnection.on('SaysHello', caller => {
            console.log("SaysHello By : " + caller);
            this.saysHello(caller);
        });
        this.hubConnection.on('AnswerHello', responder => {
            console.log("Call Answered By : " + responder);
            this.answerHello(responder);
        });
        this.hubConnection.on('EndPeer', id => {
            if (this.state.person.id.toLowerCase() === id.toLowerCase()) {
                if (this.peer !== null) {
                    this.peer.destroy();
                    this.peer = null;
                    console.log("EndPeer By : " + id);
                }
            }
        });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ContactUpdated', dto => {
            if (this.state.person.id === dto.id) {
                this.setState({
                    person: dto
                });
            }
        });
    }
    receiveTextMessage(sender, text, timestamp, id) {
        var mi = {
            id: id,
            sender: sender,
            text: text,
            timestamp: timestamp,
            status: this.messageStatusEnum.Seen
        };
        //if received message is from current person then show in ui else save in localstorage
        if (sender.toLowerCase() === this.state.person.id.toLowerCase()) {
            this.messages.set(id, mi);
            this.setState({
                dummy: Date.now()
            }, () => {
                localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
            });
            this.scrollToBottom();
            this.props.updateParent("updatemessageseen", {
                id: sender
            });
            this.playmsgbeep();
            this.setMessageStatus(mi.id, "SetSeen");
        }
    }

    //say hello when hub connection is established, this will begin a handshake which will
    //eventually lead to rtc peer connection
    sayHello() {
        this.hubConnection.invoke("sayHello", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase()).catch(err => {
            console.log("Unable to say hello.");
            console.error(err);
        });
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
            }).then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({
                        loggedin: false,
                        loading: false
                    });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //if message is successfully saved in database then you will have id here 
                        console.log(data);
                        var mi = {
                            id: data.id,
                            sender: this.state.myself.id,
                            text: data.message,
                            timestamp: data.sentDate,
                            status: this.messageStatusEnum.Sent
                        };
                        //try to add sent message to current message list
                        this.messages.set(mi.id, mi);
                        this.setState({
                            dummy: Date.now()
                        }, () => {
                            localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                            this.updateTextInputHeight();
                        });
                        this.scrollToBottom();
                    });
                } else {
                    this.setState({
                        loading: false,
                        message: 'Unable to send message',
                        bsstyle: 'danger'
                    });
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
            this.setState({
                person: p
            });
        }
    }
    detectEdgeorIE() {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;
        return isIE || isEdge;
    }
    detectXtralargeScreen() {
        return window.matchMedia("(min-width: 1024px)").matches;
    }
    createPeer(initiater) {
        //RTC Peer configuration
        let configuration = {
            'iceServers': [{
                'urls': 'stun:stun.services.mozilla.com'
            }, {
                'urls': 'stun:stun.l.google.com:19302'
            }]
        };
        if (window.location.hostname.toLowerCase() === "localhost") {
            configuration = {};
        }
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        this.peer = new SimplePeer({
            initiator: initiater,
            config: configuration,
            stream: this.mystream
        });
        //this.peer["cid"] = u.connectionID;
        //this.peer["hubConnection"] = this.hubConnection;
        //this.peer["myself"] = this.myself;

        //set peer event handlers
        this.peer.on("error", this.onPeerError);
        this.peer.on("signal", this.onPeerSignal);
        this.peer.on("connect", this.onPeerConnect);
        this.peer.on("close", this.onPeerClose);
        this.peer.on("stream", stream => {
            this.onPeerStream(stream);
        });
        this.peer.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data);
        });
    }

    /**
     * Simple Peer events
     * 
     */
    onPeerSignal(data) {
        this.hubConnection.invoke('SendSignal', data, this.state.person.id, this.state.myself.id).catch(err => console.error('SendSignal ' + err));
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
        this.hubConnection.invoke("EndPeer", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase()).catch(err => console.error('Endpeer ' + err));
    }
    onPeerStream(stream) {
        console.log("received a stream");
        console.log(stream);
        this.otherstream = stream;
        //update state so that UI changes
        this.setState({
            dummydate: Date.now()
        }, () => {
            let v = document.getElementById('othervideo');
            if (v !== null) {
                if ('srcObject' in v) {
                    v.srcObject = this.otherstream;
                } else {
                    v.src = window.URL.createObjectURL(this.otherstream); // for older browsers
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
            audio: true,
            video: videoconst
        };
        //simple feature avialability check
        if (navigator.mediaDevices.getUserMedia) {
            //try to gain access and then take appropriate action
            navigator.mediaDevices.getUserMedia(constraints).then(this.addMedia).catch(this.userMediaError); // always check for errors at the end.
        }
    }

    //assign media stream received from getusermedia to my video 
    addMedia(stream) {
        //save stream in global variable 
        this.mystream = stream;
        //update state so that myvideo element can be added to dom and then manipulated
        this.setState({
            dummydate: new Date()
        }, () => {
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
        this.setState({
            videoplaying: false,
            audioplaying: false
        });
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
                return "Sent";
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
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10) + parseInt(computed.getPropertyValue('padding-top'), 10) + this.textinput.scrollHeight + parseInt(computed.getPropertyValue('padding-bottom'), 10) + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

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
                            msg.progresspercent = Math.floor(size_done / msg.filedata.size * 100);
                            cfile.progresspercent = msg.progresspercent;
                            if (next_slice > msg.filedata.size) {
                                flist.splice(i, 1);
                                msg.filedata = null;
                                //this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, 'https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname)
                                //    .catch(err => { console.log("Unable to send file to other person."); console.error(err); });
                                this.sendTextMessage('https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname, this.state.person.id);
                                this.setState({
                                    filestoupload: flist
                                });
                                this.generateVideoThumbnail(msg.serverfname);
                                this.processFileUpload();
                            } else {
                                this.setState({
                                    filestoupload: flist
                                });
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
        });
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
                this.setState({
                    filestoupload: flist
                });
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
            let f = {
                name: this.fileinput.files[i].name,
                filedata: this.fileinput.files[i],
                progresspercent: 0,
                serverfname: "",
                cancel: false
            };
            flist.push(f);
        }
        this.setState({
            filestoupload: flist
        });
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
        this.setState({
            showemojimodal: !this.state.showemojimodal
        });
    }
    handleVideoCancel() {
        this.closeVideo();
        this.hubConnection.invoke("EndCall", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase()).catch(err => {
            console.log("Unable to end call.");
            console.error(err);
        });
    }
    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({
                    textinput: e.target.value
                }, () => {
                    this.updateTextInputHeight();
                });
                break;
            default:
        }
    }
    handleSend(e) {
        e.preventDefault();
        this.sendTextMessage(this.state.textinput, this.state.person.id);
        this.setState({
            textinput: ''
        });
    }

    //enable or disable video track of my stream
    handleVideoToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getVideoTracks().length > 0) {
                this.mystream.getVideoTracks()[0].enabled = !this.state.videoplaying;
                this.setState({
                    videoplaying: !this.state.videoplaying
                }, () => {
                    this.attachMyStreamToVideo();
                });
            }
        } else {
            this.setState({
                videoplaying: true,
                audioplaying: true
            });
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
                this.setState({
                    audioplaying: !this.state.audioplaying
                }, () => {
                    this.attachMyStreamToVideo();
                });
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();
            this.setState({
                audioplaying: true
            });
        }
    }
    handleProfileModalClose() {
        this.setState({
            profiletoshow: null,
            showprofilemodal: false
        });
    }

    //handle search result item click
    handleProfileImageClick(e) {
        this.setState({
            profiletoshow: this.state.person,
            showprofilemodal: true
        });
    }
    handleContactRelationshipChange(e) { }
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
        let clist = localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (clist.get(this.state.person.id.toLowerCase()) !== undefined) {
            clist.get(this.state.person.id.toLowerCase()).unseenMessageCount = 0;
        }
        localStorage.setItem("contacts", JSON.stringify(Array.from(clist)));
    }
    componentDidUpdate(prevProps, prevState) {
        //console.log("componentDidUpdate");
        if (prevProps.person.id !== this.props.person.id) {
            this.messages = localStorage.getItem(this.props.person.id) !== null ? new Map(JSON.parse(localStorage.getItem(this.props.person.id))) : new Map();
            this.setState({
                dummy: Date.now(),
                person: this.props.person
            }, () => {
                this.fetchMessages();
                this.updateReceivedMessageStatusAll();
            });
            this.props.updateParent("updatemessageseen", {
                id: this.props.person.id
            });
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
            return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
                colSpan: "2"
            }, /*#__PURE__*/React.createElement(Emoji, {
                onSelect: this.handleEmojiSelect
            })));
        } else {
            return null;
        }
    }
    renderVideoCallModal() {
        return /*#__PURE__*/React.createElement("div", {
            className: "modal d-block",
            "data-backdrop": "static",
            "data-keyboard": "false",
            tabIndex: "-1",
            role: "dialog",
            "aria-labelledby": "staticBackdropLabel",
            "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-dialog"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-content"
        }, /*#__PURE__*/React.createElement("div", {
            className: "modal-body"
        }, /*#__PURE__*/React.createElement("h4", null, "Waiting For ", this.state.person.name), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-danger btn-lg",
            onClick: this.handleVideoCancel
        }, "Cancel")))));
    }
    renderLinksInMessage(msg) {
        var tempmid = msg.id;
        if (msg.text.startsWith('https://' + window.location.host + '/data/')) {
            if (msg.text.toLowerCase().endsWith(".jpg") || msg.text.toLowerCase().endsWith(".jpeg") || msg.text.toLowerCase().endsWith(".png") || msg.text.toLowerCase().endsWith(".gif") || msg.text.toLowerCase().endsWith(".bmp")) {
                return /*#__PURE__*/React.createElement("span", {
                    id: tempmid
                }, /*#__PURE__*/React.createElement("img", {
                    src: msg.text,
                    className: "img-fluid",
                    style: {
                        maxWidth: "260px"
                    }
                }));
            } else if (msg.text.toLowerCase().endsWith(".mp3")) {
                return /*#__PURE__*/React.createElement("span", {
                    id: tempmid
                }, /*#__PURE__*/React.createElement("audio", {
                    src: msg.text,
                    controls: true,
                    playsInline: true,
                    style: {
                        maxWidth: "260px"
                    }
                }));
            } else if (msg.text.toLowerCase().endsWith(".ogg") || msg.text.toLowerCase().endsWith(".mp4") || msg.text.toLowerCase().endsWith(".webm") || msg.text.toLowerCase().endsWith(".mov")) {
                return /*#__PURE__*/React.createElement("span", {
                    id: tempmid
                }, /*#__PURE__*/React.createElement("video", {
                    src: msg.text.toLowerCase(),
                    controls: true,
                    playsInline: true,
                    style: {
                        maxWidth: "260px"
                    }
                }));
            } else {
                return /*#__PURE__*/React.createElement("span", {
                    id: tempmid
                }, /*#__PURE__*/React.createElement("a", {
                    href: msg.text,
                    target: "_blank"
                }, this.getFileExtensionBasedName(msg.text.toLowerCase())));
            }
        } else if ((msg.text.startsWith('https://') || msg.text.startsWith('http://')) && msg.text.trim().indexOf(" ") === -1) {
            return /*#__PURE__*/React.createElement("span", {
                id: tempmid
            }, /*#__PURE__*/React.createElement("a", {
                href: msg.text.trim(),
                target: "_blank"
            }, msg.text));
        } else {
            return /*#__PURE__*/React.createElement("span", {
                id: tempmid
            }, msg.text.split('\n').map((item, key) => {
                return /*#__PURE__*/React.createElement(React.Fragment, {
                    key: key
                }, item, /*#__PURE__*/React.createElement("br", null));
            }));
        }
    }
    renderContactRelationChange() {
        let html = null;
        let contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        let style = {
            margin: "0 auto",
            maxWidth: "80%",
            width: "25rem",
            padding: "15px"
        };
        if (contactlist.get(this.state.person.id) !== undefined) {
            if (contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Temporary) {
                html = /*#__PURE__*/React.createElement("li", {
                    style: style
                }, /*#__PURE__*/React.createElement("div", {
                    className: "card bg-light mb-3"
                }, /*#__PURE__*/React.createElement("div", {
                    className: "card-header"
                }, "New Contact"), /*#__PURE__*/React.createElement("div", {
                    className: "card-body"
                }, /*#__PURE__*/React.createElement("h5", {
                    className: "card-title"
                }, "Take Action Here"), /*#__PURE__*/React.createElement("p", {
                    className: "card-text"
                }, "This person is not your contact list."), /*#__PURE__*/React.createElement("button", {
                    className: "btn btn-success me-2",
                    onClick: this.handleAddToContacts
                }, "Add to Contacts"), /*#__PURE__*/React.createElement("button", {
                    className: "btn btn-outline-dark",
                    onClick: this.handleBlockandRemove
                }, "Block and Remove"))));
            }
        }
        return html;
    }
    renderMessages() {
        let sentlistyle = {
            display: "block",
            textAlign: 'right'
        };
        let reclistyle = {
            display: "block",
            textAlign: 'left'
        };
        let sentmessagestyle = {
            marginBottom: "1px",
            maxWidth: "100%",
            position: "relative",
            fontSize: "1.2rem",
            //border: "none",
            borderRadius: "0rem",
            //color: "#000",
            //backgroundColor: "#DBF4FD",
            wordWrap: "break-word"
        };
        let recmessagestyle = {
            marginBottom: "1px",
            maxWidth: "100%",
            position: "relative",
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
                items.push( /*#__PURE__*/React.createElement("li", {
                    style: sentlistyle,
                    key: key
                }, /*#__PURE__*/React.createElement("div", {
                    style: sentmessagestyle,
                    className: "border-end border-5 border-primary m-1 pe-3 py-2"
                }, this.renderLinksInMessage(obj), /*#__PURE__*/React.createElement("span", {
                    className: "d-block"
                }, /*#__PURE__*/React.createElement("small", {
                    style: {
                        fontSize: "0.75rem"
                    }
                }, moment.utc(obj.timestamp).local().fromNow(true)), " ", /*#__PURE__*/React.createElement("small", {
                    style: {
                        fontSize: "0.75rem"
                    }
                }, this.showMessageStatus(obj.status))))));
            } else {
                items.push( /*#__PURE__*/React.createElement("li", {
                    style: reclistyle,
                    key: key
                }, /*#__PURE__*/React.createElement("div", {
                    style: recmessagestyle,
                    className: "border-start border-5 border-success m-1 ps-3 py-2"
                }, this.renderLinksInMessage(obj), /*#__PURE__*/React.createElement("span", {
                    className: "d-block"
                }, /*#__PURE__*/React.createElement("small", {
                    style: {
                        fontSize: "0.75rem"
                    }
                }, moment.utc(obj.timestamp).local().fromNow(true))))));
            }
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, items, this.renderContactRelationChange(), /*#__PURE__*/React.createElement("li", {
            style: {
                float: "left",
                clear: "both"
            },
            ref: el => {
                this.messagesEnd = el;
            }
        }));
    }
    renderVideo() {
        let myvideoclassname = "full";
        let othervideo = null,
            myvideo = null;
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
                othervideo = /*#__PURE__*/React.createElement("video", {
                    id: "othervideo",
                    muted: "muted",
                    volume: "0",
                    playsInline: true,
                    style: {
                        maxWidth: "100%",
                        maxHeight: "70vh"
                    }
                });
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
                myvideo = /*#__PURE__*/React.createElement("video", {
                    id: "myvideo",
                    className: myvideoclassname,
                    muted: "muted",
                    volume: "0",
                    playsInline: true,
                    style: {
                        maxWidth: "100%",
                        maxHeight: "70vh"
                    }
                });
            }
        }
        if (othervideo !== null || myvideo !== null) {
            return /*#__PURE__*/React.createElement("div", {
                className: "col col-sm-7 videochatcolumn",
                style: {
                    padding: "0px 5px",
                    textAlign: "center"
                }
            }, othervideo, myvideo);
        } else {
            return null;
        }
    }
    renderFileUploadProcessModal() {
        let items = [];
        for (var i = 0; i < this.state.filestoupload.length; i++) {
            let f = this.state.filestoupload[i];
            items.push( /*#__PURE__*/React.createElement("div", {
                className: "row",
                key: i
            }, /*#__PURE__*/React.createElement("div", {
                className: "col-9 col-xl-10 col-sm-10"
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress"
            }, /*#__PURE__*/React.createElement("div", {
                className: "progress-bar progress-bar-animated",
                role: "progressbar",
                "aria-valuenow": f.progresspercent,
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                style: {
                    width: f.progresspercent + "%"
                }
            }))), /*#__PURE__*/React.createElement("div", {
                className: "col-3 col-xl-2 col-sm-2"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-sm btn-light",
                onClick: e => this.handleFileUploadCancel(e, f.name)
            }, "Cancel"))));
        }
        if (this.state.filestoupload.length > 0) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal d-block",
                "data-backdrop": "static",
                "data-keyboard": "false",
                tabIndex: "-1",
                role: "dialog",
                "aria-labelledby": "staticBackdropLabel",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, items)))));
        } else {
            return null;
        }
    }
    render() {
        if (this.messages.length == 0) {
            profile = /*#__PURE__*/React.createElement(ViewProfile, {
                profile: this.state.person
            });
        }
        let pic = /*#__PURE__*/React.createElement("img", {
            src: "/images/nopic.jpg",
            className: "mx-auto d-block img-fluid",
            alt: "No Pic",
            style: {
                cursor: "pointer"
            },
            onClick: this.handleProfileImageClick
        });
        if (this.state.person !== null) {
            if (this.state.person.pic !== "") {
                pic = /*#__PURE__*/React.createElement("img", {
                    src: this.state.person.pic,
                    className: "mx-auto d-block img-fluid",
                    alt: "",
                    style: {
                        cursor: "pointer"
                    },
                    onClick: this.handleProfileImageClick
                });
            }
        }
        let personprofile = null;
        if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personprofile = /*#__PURE__*/React.createElement("div", {
                className: "modal d-block",
                tabIndex: "-1",
                role: "dialog"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-scrollable"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h5", {
                className: "modal-title"
            }, "Profile"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                "data-bs-dismiss": "modal",
                "aria-label": "Close",
                onClick: this.handleProfileModalClose
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement(ViewProfile, {
                profile: this.state.person
            })))));
        }
        let videotoggleele = this.state.videoplaying ? /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-sm btn-primary ms-1 me-1 videoctrl",
            onClick: this.handleVideoToggle,
            onMouseDown: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/video.svg",
            alt: "",
            width: "24",
            height: "24",
            title: "Video On"
        })) : /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-secondary btn-sm ms-1 me-1 videoctrl",
            onClick: this.handleVideoToggle,
            onMouseDown: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/video.svg",
            alt: "",
            width: "24",
            height: "24",
            title: "Video Off"
        }));
        let audiotoggleele = this.state.audioplaying ? /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-primary btn-sm ms-1 me-1 audioctrl",
            onClick: this.handleAudioToggle,
            onMouseDown: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/mic.svg",
            alt: "",
            width: "24",
            height: "24",
            title: "Microphone On"
        })) : /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-secondary btn-sm ms-1 me-1 audioctrl",
            onClick: this.handleAudioToggle,
            onMouseDown: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/mic.svg",
            alt: "",
            width: "24",
            height: "24",
            title: "Microphone Off"
        }));
        //if browser is edge or ie no need to show video or audio control button
        if (this.detectEdgeorIE()) {
            audiotoggleele = null;
            videotoggleele = null;
        }
        let online = /*#__PURE__*/React.createElement("span", {
            className: "offline"
        });
        if (this.state.person.activity !== 5) {
            online = /*#__PURE__*/React.createElement("span", {
                className: "online"
            });
        }
        let videohtml = this.renderVideo();
        let chatmsgcontstyle = {};
        if (videohtml === null && this.detectXtralargeScreen()) {
            chatmsgcontstyle = {
                padding: "0px"
            };
        }
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
            className: "personalchatcont"
        }, /*#__PURE__*/React.createElement("table", {
            className: "chatpersoninfocont sticky-top"
        }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
            width: "40px",
            className: "p-1"
        }, pic), /*#__PURE__*/React.createElement("td", {
            className: "noPadding"
        }, /*#__PURE__*/React.createElement("h5", {
            className: "ml-1",
            style: {
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            },
            title: this.state.person.name
        }, online, " ", this.state.person.name)), /*#__PURE__*/React.createElement("td", {
            width: "50px",
            style: {
                paddingRight: "10px"
            }
        }, /*#__PURE__*/React.createElement(BlockContact, {
            myself: this.state.myself,
            person: this.state.person,
            onRelationshipChange: this.handleContactRelationshipChange
        })), /*#__PURE__*/React.createElement("td", {
            width: "37px"
        }, videotoggleele), /*#__PURE__*/React.createElement("td", {
            width: "37px"
        }, audiotoggleele)))), /*#__PURE__*/React.createElement("div", {
            className: "videochatcont "
        }, videohtml, /*#__PURE__*/React.createElement("div", {
            className: "chatmsgcont",
            style: chatmsgcontstyle
        }, /*#__PURE__*/React.createElement("ul", {
            className: "list-unstyled"
        }, this.renderMessages()))), /*#__PURE__*/React.createElement("div", {
            style: {
                position: "absolute",
                bottom: "0px",
                width: "100%"
            }
        }, /*#__PURE__*/React.createElement("form", {
            onSubmit: this.handleSend
        }, /*#__PURE__*/React.createElement("table", {
            style: {
                "width": "100%",
                backgroundColor: "#fff"
            }
        }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
            style: {
                width: "37px",
                paddingLeft: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "dropdown"
        }, /*#__PURE__*/React.createElement("a", {
            className: "btn btn-light btn-sm dropdown-toggle",
            href: "#",
            role: "button",
            id: "navbarDropdown",
            "data-bs-toggle": "dropdown",
            "aria-haspopup": "true",
            "aria-expanded": "false"
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/file-plus.svg",
            alt: "",
            width: "24",
            height: "24",
            title: "Share Files"
        })), /*#__PURE__*/React.createElement("ul", {
            className: "dropdown-menu dropdown-menu-right",
            "aria-labelledby": "navbarDropdown"
        }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
            className: "dropdown-item",
            href: "#",
            onClick: this.handlePhotoClick,
            title: "20 Files at a time, max files size 10 MB"
        }, "Photos and Videos")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
            className: "dropdown-item",
            href: "#",
            onClick: this.handleDocClick,
            title: "20 Files at a time, max files size 10 MB"
        }, "Documents"), /*#__PURE__*/React.createElement("input", {
            type: "file",
            style: {
                display: "none"
            },
            ref: el => {
                this.fileinput = el;
            },
            accept: ".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*",
            onChange: this.handleFileInput,
            multiple: "multiple"
        }))))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("textarea", {
            ref: input => {
                this.textinput = input;
            },
            name: "textinput",
            autoComplete: "off",
            accessKey: "t",
            title: "Keyboard Shortcut ALT + t",
            className: "form-control",
            value: this.state.textinput,
            onChange: this.handleChange,
            width: "100%",
            style: {
                height: "40px",
                overflow: "hidden",
                resize: "none",
                maxHeight: "200px"
            }
        })), /*#__PURE__*/React.createElement("td", {
            style: {
                "width": "100px"
            }
        }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: this.state.showemojimodal ? "btn btn-sm btn-warning ms-1" : "btn btn-sm btn-light ms-1",
            onClick: this.handleEmojiModal,
            accessKey: "o",
            title: "Keyboard Shortcut ALT + o"
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/smile.svg",
            alt: "",
            width: "24",
            height: "24"
        })), /*#__PURE__*/React.createElement("button", {
            type: "submit",
            id: "msgsubmit",
            className: "btn btn-sm btn-dark ms-1",
            title: "Send Message",
            title: "Keyboard Shortcut ALT + s",
            accessKey: "s"
        }, /*#__PURE__*/React.createElement("img", {
            src: "/icons/send.svg",
            alt: "",
            width: "24",
            height: "24"
        })))), this.renderEmojiModal()))))), personprofile, this.renderFileUploadProcessModal(), /*#__PURE__*/React.createElement("audio", {
            id: "chatbeep",
            muted: "muted",
            volume: "0"
        }, /*#__PURE__*/React.createElement("source", {
            src: "/media/swiftly.mp3"
        }), /*#__PURE__*/React.createElement("source", {
            src: "/media/swiftly.m4r"
        }), /*#__PURE__*/React.createElement("source", {
            src: "/media/swiftly.ogg"
        })), /*#__PURE__*/React.createElement(HeartBeat, {
            activity: "4",
            interval: "3000"
        }));
    }
}
class SendInvite extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "removeSuccessMessage", () => {
            this.setState({
                success: ""
            });
        });
        _defineProperty(this, "copyInviteText", () => {
            // Get the text field
            //var copyText = this.state.text;

            if (this.textarea !== null) {
                // Select the text field
                this.textarea.select();
                this.textarea.setSelectionRange(0, 99999); // For mobile devices
            }
            // Copy the text inside the text field
            navigator.clipboard.writeText(this.state.text);
            this.setState({
                success: "Message copied to clibboard."
            }, () => {
                setTimeout(this.removeSuccessMessage, 2000);
            });
        });
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.textarea = null;
        let myself = localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself"));
        let inviteText = "Check this new website I found, http://yocail.com\r\n\r\nYou can post your pictures here, connect with people.";
        if (myself !== null) inviteText = inviteText + "\r\n\r\nMy profile on Yocail is http://yocail.com/profile?un=" + myself.userName;
        this.state = {
            loading: false,
            loggedin: loggedin,
            success: '',
            error: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            showModal: false,
            text: inviteText
        };
    }
    renderModal() {
        if (this.state.showModal) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "modal fade show d-block",
                tabIndex: "-1",
                "aria-hidden": "true"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-dialog modal-dialog-centered modal-dialog-scrollable"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-content"
            }, /*#__PURE__*/React.createElement("div", {
                className: "modal-header"
            }, /*#__PURE__*/React.createElement("h1", {
                className: "modal-title fs-5",
                id: "exampleModalLabel"
            }, "Spread The Word"), /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: () => {
                    this.setState({
                        showModal: false
                    });
                },
                "aria-label": "Close"
            })), /*#__PURE__*/React.createElement("div", {
                className: "modal-body"
            }, /*#__PURE__*/React.createElement("textarea", {
                ref: el => {
                    this.textarea = el;
                },
                rows: "7",
                className: "form-control",
                value: this.state.text,
                onChange: e => {
                    this.setState({
                        text: e.target.value
                    });
                }
            }), /*#__PURE__*/React.createElement("p", null, "You can use this text to invite your friends to yocail.", /*#__PURE__*/React.createElement("br", null), " Share this text over whatsapp or email."), this.state.success !== "" ? /*#__PURE__*/React.createElement("div", {
                className: "text-success my-1"
            }, this.state.success) : null), /*#__PURE__*/React.createElement("div", {
                className: "modal-footer"
            }, /*#__PURE__*/React.createElement("button", {
                type: "button",
                className: "btn btn-primary me-2",
                onClick: this.copyInviteText
            }, "Copy Invite Text"))))), /*#__PURE__*/React.createElement("div", {
                className: "modal-backdrop fade show"
            }));
        } else return null;
    }
    render() {
        if (this.state.loggedin) {
            return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
                className: "text-center mb-2 p-2 rounded-2 bg-white"
            }, /*#__PURE__*/React.createElement("div", {
                className: "my-1"
            }, "Invite your friends and build your followers."), /*#__PURE__*/React.createElement("button", {
                onClick: () => {
                    this.setState({
                        showModal: true
                    });
                },
                type: "button",
                className: "btn btn-outline-dark my-2"
            }, /*#__PURE__*/React.createElement("i", {
                className: "bi bi-heart-fill text-danger"
            }), " Tell a Friend")), this.renderModal());
        } else {
            return null;
        }
    }
}
class AutoAdjustTextArea extends React.Component {
    constructor(props) {
        super(props);
        _defineProperty(this, "valueChanged", val => {
            let newlines = val.split("\n").length;
            if (newlines > this.state.maxRows) newlines = this.state.maxRows; else if (newlines < this.state.minRows) newlines = this.state.minRows;
            this.setState({
                value: val,
                rows: newlines
            }, () => {
                this.props.onChange(this.state.value);
            });
        });
        this.state = {
            cssclass: this.props.cssclass,
            htmlattr: this.props.htmlattr,
            maxlength: this.props.maxlength,
            value: this.props.value,
            rows: this.props.minRows,
            maxRows: this.props.maxRows,
            minRows: this.props.minRows
        };
    }
    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }
    render() {
        return /*#__PURE__*/React.createElement("textarea", _extends({
            maxLength: this.state.maxlength
        }, this.state.htmlattr, {
            rows: this.state.rows,
            className: this.props.cssclass,
            value: this.state.value,
            onChange: e => {
                this.valueChanged(e.target.value);
            }
        }));
    }
}
class UserInfo {
    constructor() {
        //this guid used by bolo to publicly identify a user
        _defineProperty(this, "memberID", void 0);
        //this is connection id generated by signalr
        _defineProperty(this, "connectionID", void 0);
        //name of the user its provided by user.
        _defineProperty(this, "name", void 0);
        _defineProperty(this, "lastpulse", void 0);
        //has video capability
        _defineProperty(this, "videoCapable", void 0);
        //has rtcpeer capability
        _defineProperty(this, "peerCapable", void 0);
        _defineProperty(this, "stream", void 0);
        _defineProperty(this, "pic", void 0);
        _defineProperty(this, "bio", void 0);
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
};
var BoloRelationType = {
    Temporary: 1,
    Confirmed: 2,
    Search: 3,
    Blocked: 4
};
var MessageStatusEnum = {
    notify: 0,
    inqueue: 1,
    inprogress: 2,
    ready: 5,
    sent: 3,
    error: 4
};
class MessageInfo {
    constructor() {
        //user info of who sent the message
        _defineProperty(this, "sender", void 0);
        //when it was sent
        _defineProperty(this, "timeStamp", void 0);
        //type of message info, MessageEnum
        _defineProperty(this, "type", void 0);
        //message body 
        _defineProperty(this, "text", void 0);
        _defineProperty(this, "status", void 0);
        _defineProperty(this, "progresspercent", void 0);
        _defineProperty(this, "file", void 0);
        this.progresspercent = 0;
        this.status = MessageStatusEnum.inprogress;
        this.file = null;
    }
}
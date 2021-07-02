
class NavMenu extends React.Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);
        const token = localStorage.getItem("token");
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            loggedin: loggedin,
            collapsed: true,
            registermodal: this.props.register === undefined ? false : this.props.register,
            showinvite: this.props.onInvite === undefined ? false : true,
            showleavemeeting: this.props.onLeaveMeeting === undefined ? false : true,
            onProfileChange: this.props.onProfileChange === undefined ? null : this.props.onProfileChange,
            registerFormBeginWith: this.props.registerFormBeginWith === undefined ? true : this.props.registerFormBeginWith,
            membername: (localStorage.getItem("membername") !== null) ? localStorage.getItem("membername") : '',
            memberpic: (localStorage.getItem("memberpic") !== null) ? localStorage.getItem("memberpic") : '',
            memberid: '',
            fixed: this.props.fixed === undefined ? true : this.props.fixed,
            showprofilemodal: false
        };

        if (token !== null) {
            this.fetchData(token);
        }
        this.loginHandler = this.loginHandler.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        //this.handleOnInvite = this.handleOnInvite.bind(this);
        this.closeRegisterModal = this.closeRegisterModal.bind(this);
        //this.handleLeaveMeeting = this.handleLeaveMeeting.bind(this);
        this.toggleProfileModal = this.toggleProfileModal.bind(this);
        this.handleProfileChange = this.handleProfileChange.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.fetchData(localStorage.getItem("token"));
            this.setState({ loggedin: true, registermodal: false, registerFormBeginWith: false });
            if (this.props.onLogin !== undefined) {
                this.props.onLogin();
            }
        }
    }

    handleProfileChange() {
        if (this.state.onProfileChange !== null) {
            this.state.onProfileChange();
        }
        if (localStorage.getItem("token") !== null) {
            this.fetchData(localStorage.getItem("token"));
        }

    }

    //handleOnInvite(e) {
    //    if (this.props.onInvite !== undefined) {
    //        this.props.onInvite();
    //    }
    //}

    //handleLeaveMeeting(e) {
    //    if (this.props.onLeaveMeeting !== undefined) {
    //        this.props.onLeaveMeeting();
    //    }
    //}

    handleRegister(e) {
        e.preventDefault();
        this.setState({ registermodal: true, registerFormBeginWith: true });
    }

    handleLogin(e) {
        e.preventDefault();
        this.setState({ registermodal: true, registerFormBeginWith: false });
    }

    handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("membername");
        localStorage.removeItem("memberpic");
        location.reload();
    }

    toggleProfileModal() {
        this.setState({ showprofilemodal: !this.state.showprofilemodal });
    }

    closeRegisterModal() {
        this.setState({ registermodal: false });
    }

    fetchData(t) {
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.setItem("membername", "");
                    localStorage.setItem("memberpic", "");
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false, loading: false, membername: '' });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        localStorage.setItem("membername", data.name);
                        localStorage.setItem("memberpic", data.pic);
                        this.setState({ bsstyle: '', message: "", loggedin: true, loading: false, membername: data.name, memberid: data.id, memberpic: data.pic });
                    });
                }
            });
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.register !== prevState.register) {
            return { registermodal: nextProps.register };
        }
        else return null;
    }

    renderRegisterModal() {
        if (this.state.registermodal) {
            return (
                <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <button type="button" class="btn-close float-end" data-bs-dismiss="modal" aria-label="Close" onClick={this.closeRegisterModal}></button>
                                <RegisterForm onLogin={this.loginHandler} beginWithRegister={this.state.registerFormBeginWith} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    renderProfileModal() {
        if (this.state.showprofilemodal) {
            return (
                <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Profile Information</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.toggleProfileModal}></button>
                            </div>
                            <ManageProfile onProfileChange={this.handleProfileChange} />
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const token = localStorage.getItem("token");
        let linkitems = [];
        let loggedin = true;
        let navclassnames = "navbar navbar-expand-lg navbar-dark bg-dark " + (this.state.fixed ? "fixed-top" : "");
        if (token === null) {
            loggedin = false;
        }
        //if (this.state.showinvite) {
        //    linkitems.push(<li className="nav-item" key={"showinviteli"}><button type="button" className="btn btn-link text-light bg-info mr-2 ml-2 nav-link" onClick={this.handleOnInvite}>Invite <img src="/icons/plus-circle.svg" alt="" width="24" height="24" title="Invite" /></button></li>);
        //}
        //if (this.state.showleavemeeting) {
        //    linkitems.push(<li className="nav-item" key={"showleavemeetingli"}><button type="button" className="btn btn-link text-light bg-danger mr-2 ml-2 nav-link" onClick={this.handleLeaveMeeting}>Leave <img src="/icons/user-minus.svg" alt="" width="24" height="24" title="Leave Meeting" /></button></li>);
        //}
        let profilepic = null;
        if (loggedin && this.state.memberpic !== "") {
            profilepic = <img src={this.state.memberpic} width="20" height="20" className="rounded-circle" />
        }
        
        if (loggedin) {
            linkitems.push(<button key={"memberlinkli"} type="button" className="btn btn-dark me-2 membernavlink" onClick={this.toggleProfileModal}>{profilepic} {this.state.membername}</button>);
            linkitems.push(<button key={"logoutlinkli"} type="button" className="btn btn-dark" title="Sign out" onClick={this.handleLogout}><i className="bi bi-power"></i></button>);
        } else {
            linkitems.push(<button key={"loginlinkli"} type="button" className="btn btn-dark me-2" onClick={this.handleLogin}>Login</button>);
            linkitems.push(<button key={"registerlinkli"} type="button" className="btn btn-dark" onClick={this.handleRegister}>Register</button>);
        }

        return (
            <React.Fragment>
                <div className="container-fluid bg-dark">
                    <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-1 ">
                        <a href="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-white text-decoration-none">
                            Waarta
                        </a>
                        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
                            <li><a className="nav-link px-2 text-white" href="/faq" title="Frequently Asked Questions"><i className="bi bi-patch-question"></i></a></li>
                            <li><a className="nav-link px-2 text-white" href="/privacy" title="Privacy"><i className="bi bi-eye-slash-fill"></i></a></li>
                            <li><a className="nav-link px-2 text-white" href="/Chat" title="Chat"><i className="bi bi-chat-dots"></i></a></li>
                            <li><a className="nav-link px-2 text-white" href="/Meetings" title="Discussion"><i className="bi bi-people-fill"></i></a></li>
                        </ul>
                        <div className="col-md-3 text-end">
                            {linkitems}
                        </div>
                    </header>
                </div>
                {this.renderProfileModal()}
                {this.renderRegisterModal()}

            </React.Fragment>
        );
    }
}

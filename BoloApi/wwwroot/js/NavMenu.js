
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
            membername: '',
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
                    this.setState({ bsstyle: 'danger', message: "Authorization has been denied for this request.", loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
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
                                <button type="button" className="close pull-right" data-dismiss="modal" aria-label="Close" onClick={this.closeRegisterModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
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
                    <div className="modal-dialog modal-dialog-scrollable modal-lg">
                        <div className="modal-content">
                            <div className="modal-body">
                                <button type="button" className="close float-right" data-dismiss="modal" aria-label="Close" onClick={this.toggleProfileModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <ManageProfile onProfileChange={this.handleProfileChange} />
                            </div>
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
            profilepic = <img src={this.state.memberpic} width="20" height="20" className="rounded-circle"  />
        }
        if (loggedin) {
            linkitems.push(<li className="nav-item" key={"memberlinkli"}><button type="button" className="btn btn-link text-light nav-link membernavlink" onClick={this.toggleProfileModal}>{profilepic} {this.state.membername}</button></li>);
            linkitems.push(<li className="nav-item" key={"logoutlinkli"}><button type="button" className="btn btn-link text-light nav-link" onClick={this.handleLogout}>Logout</button></li>);
        } else {
            linkitems.push(<li className="nav-item" key={"loginlinkli"}><button type="button" className="btn btn-link text-light nav-link" onClick={this.handleLogin}>Login</button></li>);
            linkitems.push(<li className="nav-item" key={"registerlinkli"}><button type="button" className="btn btn-link text-light nav-link" onClick={this.handleRegister}>Register</button></li>);
        }

        return (
            <React.Fragment>
                <header>
                    <nav className={navclassnames}>
                        <div className="container-fluid">
                            <a className="navbar-brand" href="/">Waarta</a>
                            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMainMenu" aria-controls="navbarMainMenu"
                                aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse " id="navbarMainMenu">
                                <ul className="nav navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <a className="nav-link text-light" href="/Chat">Conversations</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link text-light" href="/Meetings">Meetings</a>
                                    </li>
                                    {linkitems}
                                </ul>
                            </div>
                        </div>
                    </nav>
                </header>
                {this.renderProfileModal()}
                {this.renderRegisterModal()}

            </React.Fragment>
        );
    }
}

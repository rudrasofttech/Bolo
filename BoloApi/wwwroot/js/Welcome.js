class Welcome extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            registermodal: false, showprofilemodal: false, memberpic: ''
        };
        this.loginHandler = this.loginHandler.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.toggleProfileModal = this.toggleProfileModal.bind(this);
        this.closeRegisterModal = this.closeRegisterModal.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
            this.setState({ loggedin: true, registermodal: false, registerFormBeginWith: false });
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
                        this.setState({ loggedin: true, loading: false, myself: data, memberpic: data.pic });
                    });
                }
            });
    }

    handleLogin(e) {
        e.preventDefault();
        this.setState({ registermodal: true, registerFormBeginWith: false });
    }

    toggleProfileModal() {
        this.setState({ showprofilemodal: !this.state.showprofilemodal });
    }

    closeRegisterModal() {
        this.setState({ registermodal: false });
    }

    renderRegisterModal() {
        if (this.state.registermodal) {
            return (
                <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg" style={{ color: '#000', textShadow: 'none', textAlign: 'left', borderRadius: '5px' }}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <button type="button" className="close pull-right" data-dismiss="modal" aria-label="Close" onClick={this.closeRegisterModal}>
                                    <span aria-hidden="true">X</span>
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
                    <div className="modal-dialog modal-dialog-scrollable modal-xl" style={{ color: '#000', textShadow: 'none', textAlign: 'left', borderRadius: '5px' }}>
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
        let profilepic = null;
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let profileinfo = null;
        if (this.state.myself === null) {
            profileinfo = <button className="btn btn-lg btn-link m-2" style={{ color: '#fff' }} onClick={this.handleLogin}>Sign In / Register</button>
        } else {
            if (this.state.loggedin && this.state.memberpic !== "") {
                profilepic = <img src={this.state.memberpic} style={{ border: '2px solid #fff', marginRight: '10px' }} width="40" height="40" className="rounded-circle" />
            }
            profileinfo = <button className="btn btn-lg btn-link m-2" style={{ color: '#fff' }} onClick={this.toggleProfileModal}>{profilepic}Welcome, {this.state.myself.name}</button>

        }
        let welcomehtml = <p className="lead">
            {profileinfo}<br />
            <a href="/discussions" className="btn btn-lg btn-secondary m-2">Discussions</a>
            <a href="/chat" className="btn btn-lg btn-secondary m-2">Conversations</a>
        </p>;
        return (
            <React.Fragment>
                {loading}
                {welcomehtml}
                {this.renderRegisterModal()}
                {this.renderProfileModal()}
            </React.Fragment>
        );
    }
}
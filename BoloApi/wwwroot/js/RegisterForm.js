class RegisterForm extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }

        this.state = {
            showregisterform: props.beginWithRegister,
            registerdto: { userName: '', password: '', verifyPassword: '' },
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
                            localStorage.setItem("myself",JSON.stringify(data.member));
                            this.setState({ bsstyle: '', message: '', loggedin: true });
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
            body: JSON.stringify({ UserName: this.state.registerdto.userName, Password: this.state.registerdto.password, VerifyPassword: this.state.registerdto.verifyPassword }),
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
                        logindto: { userName: this.state.registerdto.userName, password: this.state.logindto.password },
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
                            <label>Username</label>
                            <input type="text" className="form-control" required name="username" value={this.state.registerdto.userName} onChange={(e) => { this.setState({ registerdto: { userName: e.target.value, password: this.state.registerdto.password, verifyPassword: this.state.registerdto.verifyPassword } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Password</label>
                            <input className="form-control" minLength="8" required name="password" type="password" onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: e.target.value, verifyPassword: this.state.registerdto.verifyPassword } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Verify Password</label>
                            <input className="form-control" minLength="8" required name="verifypassword" type="password" onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: this.state.registerdto.password, verifyPassword: e.target.value } }) }} />
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
        return <div className="row align-items-center justify-content-center" style={{ minHeight: "90vh" }}><div className="col-md-5">
            {formcontents}
        </div></div>;
    }
}


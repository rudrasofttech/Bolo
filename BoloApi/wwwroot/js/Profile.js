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
            member: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
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
                        this.setState({ loggedin: true, loading: false, member: data });
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

        let me = null; let pic = null; let settings = null;
        if (this.state.myself !== null) {
            pic = this.state.myself.pic !== "" ? <img src={this.state.myself.pic} className="img-fluid rounded profile-thumb" alt="" />
                : <img src="/images/nopic.jpg" className="img-fluid profile-thumb rounded" alt="" />;
            let name = null, thought = null, email = null, phone = null;
            if (this.state.myself.name !== "") {
                name = <div className="fs-6 fw-bold text-center">{this.state.myself.name}</div>;
            }
            if (this.state.myself.thoughtStatus !== "") {
                thought = <p>{this.state.myself.thoughtStatus}</p>;
            }
            if (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) {
                settings = <div><a className="text-dark text-decoration-none" href="/updateprofile"><i className="bi bi-gear"></i> Settings</a></div>;
            }
            me = <div className="pt-2">
                <div className="row">
                    <div className="col-5 col-md-3 text-end">
                        {pic}
                        {name}
                    </div>
                    <div className="col-7 col-md-9">
                        <div className="fs-4 fw-bold">@{this.state.myself.userName}</div>
                        <div className="py-1">{this.state.myself.postCount} Posts</div>
                        <div className="py-1">{this.state.myself.followingCount} Following</div>
                        <div className="py-1">{this.state.myself.followerCount} Followers</div>
                        {settings}
                    </div>
                </div>
                {thought}
                <div className="row my-2">

                </div>
                <p>{this.state.myself.bio}</p>
            </div>;
        }

        return <React.Fragment>{me}</React.Fragment>;
    }
}
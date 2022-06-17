class Profile extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
        };
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
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
                        console.log(data);
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    render() {
        let me = null; let pic = null;
        if (this.state.myself !== null) {
            pic = this.state.myself.pic !== "" ? <img src={this.state.myself.pic} className="img-fluid px-md-0 px-5" style={{ maxHeight: "300px", maxWidth: "300px" }} alt="" />
                : null;
            //<img src="/images/nopic.jpg" className="img-fluid" alt="" style={{ maxHeight: "300px", maxWidth: "300px" }} />;
            let name = null, thought = null, email = null, phone = null;
            if (this.state.myself.name !== "") {
                name = <h2>{this.state.myself.name}</h2>;
            }
            if (this.state.myself.thoughtStatus !== "") {
                thought = <p>{this.state.myself.thoughtStatus}</p>;
            }
            if (this.state.myself.email !== "") {
                email = <div>{this.state.myself.email}</div>;
            }
            if (this.state.myself.phone !== "") {
                phone = <div>{this.state.myself.phone}</div>;
            }
            me = <div className="text-center py-2">
                {pic}
                <h1>{this.state.myself.userName}</h1>
                {name}{thought}{email}{phone}
                <span className="fw-bold">{this.state.myself.followingCount} Following</span>
                <span className="fw-bold ms-5">{this.state.myself.followerCount} Followers</span>
                <button type="button" className="btn btn-light text-dark btn-lg ms-5" onClick={() => { this.props.onSettingClick() }}><i className="bi bi-gear"></i> Update Profile</button>
                <p>{this.state.myself.bio}</p>
            </div>;
        }

        return <div className="container">
            {me}
        </div>;
    }
}
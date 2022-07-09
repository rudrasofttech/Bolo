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
            showfollowers: false, showfollowing: false
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
                        this.setState({ loggedin: true, loading: false, member: data }, () => {
                            this.loadFollowStatus(localStorage.getItem("token"), this.state.member.id);
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
            return <div className="modal fade show" style={{ display: "block" }} id="followersModal" tabindex="-1" aria-labelledby="followersModalLabel" aria-hidden="true">
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
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabindex="-1" aria-labelledby="followingModalLabel" aria-hidden="true">
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
        var followlist = null;
        if (this.state.showfollowing) {
            followlist = <React.Fragment>{this.renderFollowing()}</React.Fragment>;
        }
        else if (this.state.showfollowers) {
            followlist = <React.Fragment>{this.renderFollowers()}</React.Fragment>;
        }

        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>
        }
        let me = null, pic = null, settings = null, followhtml = null;
        if (this.state.member !== null) {
            pic = this.state.member.pic !== "" ? <img src={this.state.member.pic} className="img-fluid rounded profile-thumb" alt="" />
                : <img src="/images/nopic.jpg" className="img-fluid profile-thumb rounded" alt="" />;
            let name = null, thought = null, email = null, phone = null;
            if (this.state.member.name !== "") {
                name = <div className="fs-6 p-1 ms-2 fw-bold">{this.state.member.name}</div>;
            }
            if (this.state.member.thoughtStatus !== "") {
                thought = <p>{this.state.member.thoughtStatus}</p>;
            }
            if (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) {
                settings = <div className="p-1 ms-2"><a className="text-dark text-decoration-none" href="/updateprofile"><i className="bi bi-gear"></i> Settings</a></div>;
            } else {
                followhtml = this.renderFollowHtml();
            }
            me = <React.Fragment><div className="pt-2 border-bottom mb-1">
                <div className="row mx-0">
                    <div className="col-5 p-1 col-md-3 text-end">
                        {pic}
                    </div>
                    <div className="col-7 col-md-9 p-1">
                        <div className="fs-6 p-1 ms-2 fw-bold">@{this.state.member.userName}</div>
                        {name}
                        {settings}
                        {followhtml}
                    </div>
                </div>
                <div className="row mx-0">
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none">{this.state.member.postCount} Posts</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({showfollowing : true}) } }>{this.state.member.followingCount} Following</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({ showfollowers: true }) }}>{this.state.member.followerCount} Followers</button></div>
                </div>
                {thought}
                <p>{this.state.member.bio}</p>
            </div>
                <MemberPostList search={this.state.member.userName} viewMode={2} viewModeAllowed="true" />
                {followlist}
            </React.Fragment>;
        }

        return <React.Fragment>
            {loading}
            {me}
        </React.Fragment>;
    }
}
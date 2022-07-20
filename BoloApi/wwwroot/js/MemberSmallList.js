class MemberSmallList extends React.Component {
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
            model: null, q: '', p: 0, reactions: [], followList: []
        };
        if (this.props.target === 'reaction') {
            this.url = '//' + window.location.host + '/api/post/reactionlist/' + this.props.postid;
        } else if (this.props.target === 'follower') {
            this.url = '//' + window.location.host + '/api/Follow/Follower/' + this.props.memberid;
        }
        else if (this.props.target === 'following') {
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
        this.setState({ followList: items });
    }

    loadFeed() {
        this.setState({ loading: true });
        fetch(this.url + "?q=" + this.state.q + "&p=" + this.state.p, {
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
                        if (this.props.target === 'reaction') {
                            console.log(data);
                            var temp = this.state.reactions;
                            for (var k in data.reactions) {
                                temp.push(data.reactions[k]);
                            }
                            this.setState({
                                loggedin: true, loading: false,
                                model: {
                                    current: data.current,
                                    pageSize: data.pageSize,
                                    total: data.total,
                                    totalPages: data.totalPages
                                },
                                reactions: temp
                            });
                        } else if (this.props.target === 'follower' || this.props.target === 'following') {
                            var temp = this.state.followList;
                            for (var k in data.followList) {
                                temp.push(data.followList[k]);
                            }
                            this.setState({
                                loggedin: true, loading: false,
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
                items.push(<MemberSmallRow key={p.member.id} member={p.member} status={p.status} />);
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
        else if (this.props.target === 'follower') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                items.push(<MemberSmallRow key={p.follower.id} member={p.follower} status={p.status}
                    showRemove={this.state.myself.id === this.props.memberid ? true : false}
                    removed={(id) => { this.followerRemoved(id);  } }
                />);
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
        else if (this.props.target === 'following') {
            var items = [];
            for (var k in this.state.followList) {
                var p = this.state.followList[k];
                if (p.tag !== null && p.tag !== "") {
                } else {
                    items.push(<MemberSmallRow key={p.following.id} member={p.following} status={p.status} />);
                }
            }
            return <React.Fragment>{items}</React.Fragment>;
        }
    }

    render() {
        var loadmore = null;
        if (this.state.model !== null) {
            if ((this.state.model.current + 1) < this.state.model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { this.setState({ p: this.state.model.current + 1 }, () => { this.loadFeed(); }) }}>Load More</button>
                </div>;
            }
        }

        return <div style={{ minHeight: "50vh" }}>
            {this.renderPosts()}
            {loadmore}
        </div>;
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
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member, status: this.props.status, showRemove: this.props.showRemove, showRemoveConfirm: false
        };

        this.removeFollow = this.removeFollow.bind(this);
    }

    removeFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/remove/' + this.state.member.id, {
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
                    this.setState({ status: 0, showRemove: false, loading: false });
                    if (this.props.removed) {
                        this.props.removed(this.state.member.id);
                    }
                }
            });
    }

    render() {
        var followbtn = <FollowButton member={this.state.member} status={this.state.status} />;
        if (this.state.showRemove) {
            followbtn = <button type="button" className="btn btn-light text-dark" onClick={() => { this.setState({ showRemoveConfirm: true }) }}>Remove</button>;
        }
        var removeConfirmBox = null;
        if (this.state.showRemoveConfirm) {
            removeConfirmBox = <ConfirmBox cancel={() => { this.setState({ showRemoveConfirm: false }) }}
                ok={() => { this.setState({ showRemoveConfirm: false }); this.removeFollow(); }}
                message="Are you sure you want to remove this member from your followers?" />;
        }
        return <div className="row mx-0  justify-content-center align-items-center">
            <div className="col px-0">
                <MemberPicSmall member={this.state.member} />
                <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="fs-6 ms-2 fw-bold pointer d-inline-block text-dark text-decoration-none">
                    {this.state.member.userName}
                </a>
            </div>
            <div className="col-3 col-md-3 px-0 text-end pe-2">
                {followbtn}
                {removeConfirmBox}
            </div>
        </div>
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
        var memberpic = this.state.member.pic !== "" ? <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="border-0">
            <img src={this.state.member.pic} className="d-inline-block p-1 img-fluid pointer rounded-3 owner-thumb-small" alt="" /></a>
            : <a href={'//' + window.location.host + '/profile?un=' + this.state.member.userName} className="border-0">
                <img src="/images/nopic.jpg" className="img-fluid p-1 owner-thumb-small d-inline-block rounded-3" alt="" /></a>;


        return <React.Fragment>{memberpic}</React.Fragment>;
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
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            member: this.props.member, status: null, notify: this.props.notify
        };

        this.askToFollow = this.askToFollow.bind(this);
        this.unFollow = this.unFollow.bind(this);
        this.loadStatus = this.loadStatus.bind(this);
    }

    componentDidMount() {
        this.loadStatus();
    }

    loadStatus() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/Status/' + this.state.member.id, {
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
                        this.setState({ status: data.status, loading: false })
                    });
                }
            });
    }

    askToFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/ask/' + this.state.member.id, {
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
                        this.setState({ status: data.status, loading: false })
                        if (this.props.notify) {
                            this.props.notify(this.state.member.id, this.state.status);
                        }
                    });
                }
            });
    }

    unFollow() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/follow/unfollow/' + this.state.member.id, {
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
                        //console.log(data);
                        this.setState({ status: data.status, loading: false })
                        if (this.props.notify) {
                            this.props.notify(this.state.member.id, this.state.status);
                        }
                    });
                }
            });
    }

    render() {
        var followbtn = null;
        if (this.state.status === 0) {
            if (this.state.member.id !== this.state.myself.id) {
                followbtn = <button type="button" className="btn btn-primary fw-bold" onClick={this.askToFollow}>Follow</button>;
            }
        } else if (this.state.status === 1) {
            followbtn = <button type="button" className="btn btn-light fw-bold" onClick={this.unFollow}>Unfollow</button>;
        }
        else if (this.state.status === 2) {
            followbtn = <button type="button" className="btn btn-light fw-bold" onClick={this.unFollow}>Requested</button>;
        }

        return <React.Fragment>{followbtn}</React.Fragment>;
    }
}

class ConfirmBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Confirm</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.props.cancel(); }}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-center">{this.props.message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={() => { this.props.ok(); }}>Yes</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

class ExpandableTextLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text, expand: false, showexpand: false,
            maxlength: parseInt(this.props.maxlength, 10),
            cssclass: this.props.cssclass !== undefined ? this.props.cssclass : ""
        };
    }
    componentDidMount() {
        if (this.state.text.length > this.state.maxlength || (this.state.text.match(/\n/g) || []).length > 3) {
            this.setState({ showexpand: true });
        }

    }

    render() {
        var length = (this.state.text.length < this.state.maxlength) ? this.state.text.length : this.state.maxlength;
        var text = null, expandbtn = null;
        if (this.state.expand) {
            text = <React.Fragment>
                {this.state.text.split('\n').map((item, key) => {
                    return <React.Fragment key={key}>{item}<br /></React.Fragment>
                })}
            </React.Fragment>;
        } else {
            text = <div style={{ maxHeight: "28px", overflowY: "hidden", display: "inline-flex" }}>
                {this.state.text.substring(0, length).split('\n').map((item, key) => {
                    return <React.Fragment key={key}>{item}<br /></React.Fragment>
                })}</div>;
        }

        if (this.state.showexpand) {
            expandbtn = <button type="button" onClick={() => { this.setState({ expand: !this.state.expand }) }} className="btn btn-link d-inline-block py-0" >{(!this.state.expand) ? "More" : "Less"}</button>
        }

        return <div className={this.state.cssclass}>{text}{expandbtn}</div>;
    }
}
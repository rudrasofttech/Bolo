class MemberPostList extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: null, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            model: null, q: this.props.search, p: 0, posts: [],
            viewMode: parseInt(this.props.viewMode, 10),
            viewModeAllowed: this.props.viewModeAllowed === "true" ? true : false,
            post: null
        };

        this.selectPost = this.selectPost.bind(this);
        this.addReaction = this.addReaction.bind(this);
    }

    selectPost(id) {
        this.setState({ viewMode: 2 }, () => { document.getElementById(id).scrollIntoView({ behavior: "auto", block: "center", inline: "center" }); })
    }

    addReaction(id) {
        fetch('//' + window.location.host + '/api/Post/addreaction/' + id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
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
                        this.setState({ loading: false, message: '', bsstyle: '', posts: temp });
                    });
                } else if (response.status === 400) {
                    try {
                        response.json().then(data => {
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }
                } else {
                    try {
                        response.json().then(data => {
                            //console.log(data);
                            this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                        });
                    } catch (err) {
                        this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                    }
                }
            });
    }

    componentDidMount() {
        this.loadFeed();
    }

    loadFeed() {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/post?q=' + this.state.q + '&p=' + this.state.p;

        if (this.state.q === "userfeed")
            url = '//' + window.location.host + '/api/post/feed?p=' + this.state.p;
        
        fetch(url, {
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
                        var temp = this.state.posts;
                        for (var k in data.posts) {
                            temp.push(data.posts[k]);
                        }
                        this.setState({
                            loggedin: true, loading: false,
                            model: {
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            },
                            posts: temp
                        });
                    });
                }
            });
    }

    renderPosts() {
        var empty = <div key={0}>
            <p className="text-center fs-3 mt-5"><i className="bi bi-emoji-dizzy me-2"></i>Nothing to see here</p>
        </div>;
        if (this.state.viewMode === 2) {
            var items = []
            if (this.state.model !== null) {
                for (var k in this.state.posts) {
                    items.push(<MemberPost key={this.state.posts[k].id} post={this.state.posts[k]} />);
                }
            }
            if (items.length == 0) {
                items.push(empty);
            }
            return items;
        } else if (this.state.viewMode === 1) {
            var items = [];
            for (var k in this.state.posts) {
                var p = this.state.posts[k];
                if (p.videoURL !== "") { } else {
                    items.push(<div className="col" key={p.id}><div className="card border-0 rounded-0 pointer">
                        <img src={p.photos[0].photo} data-postid={p.id} onClick={(e) => { this.selectPost(e.target.getAttribute("data-postid")) } } className="card-img border-0 rounded-0" style={{ padding: "1px" }} />
                    </div></div>);
                }
            }
            if (items.length == 0) {
                items.push(empty);
                return items;
            }
            return <div className="row row-cols-3 row-cols-md-4 g-0">{items}</div>;
        }
    }

    render() {
        var html = (this.state.loading === false) ? this.renderPosts() : null;
        var loadmore = null;
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        
        if (this.state.model !== null) {
            if ((this.state.model.current + 1) < this.state.model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { this.setState({ p: this.state.model.current + 1 }, () => { this.loadFeed(); }) }}>Load More</button>
                </div>;
            }
        }
        var viewmodetabhtml = null;
        if (this.state.viewModeAllowed && this.state.posts.length > 0) {
            viewmodetabhtml = <div>
                <nav className="nav nav-pills nav-fill">
                    <a onClick={() => { this.setState({ viewMode: 1 }); }} className={this.state.viewMode === 1 ? "nav-link fs-4 active bg-white text-success rounded-0" : "nav-link fs-4 bg-white text-dark rounded-0"}><i className="bi bi-grid-3x3-gap-fill"></i></a>
                    <a onClick={() => { this.setState({ viewMode: 2 }); }} className={this.state.viewMode === 2 ? "nav-link fs-4 active bg-white text-success rounded-0" : "nav-link fs-4 bg-white text-dark rounded-0"}><i className="bi bi-view-list"></i></a>
                </nav>
            </div>;
        }
        return <React.Fragment>
            {viewmodetabhtml}
            {html}
            {loadmore}
        </React.Fragment>;
    }
}
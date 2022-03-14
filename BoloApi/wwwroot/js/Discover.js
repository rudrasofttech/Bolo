class Discover extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            posts: [], total: 0, p: 0, totalPages: 0, ps: 100, members: [], searchtext: ""
        };

        this.fetchPosts = this.fetchPosts.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        this.fetchPosts();
    }

    //search for members
    search() {
        if (this.state.searchtext !== "") {
            this.setState({ loading: true });
            fetch('//' + window.location.host + '/api/Members/search?s=' + this.state.searchtext, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            console.log(data);
                            this.setState({ loading: false, members: data });
                        });
                    } else {
                        this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                    }
                });
        }
    }

    fetchPosts() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/photo/discover', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
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
                        this.setState({ loading: false, posts: data.posts, total: data.total, p: data.current, totalPages: data.totalPages, ps: data.pageSize });
                    });
                }
            });
    }

    renderMembers() {
        var items = [];
        for (var i = 0; i < this.state.members.length; i++) {
            var p = this.state.members[i];
            let pic = p.pic !== "" ? <img src={this.state.myself.pic} className="card-img-top" alt=""  /> : <img src="/images/nopic.jpg" className="card-img-top" alt="" />;
            items.push(<div className="col">
                <div className="card rounded-0">
                    <div className="row g-0">
                        <div className="col-2">
                            {pic}
                        </div>
                        <div className="col-10">
                            <div className="card-body">
                                <h5 className="card-title">{p.name}</h5>
                                
                            </div>
                        </div>
                    </div></div></div>);
        }
        return <div className='row row-cols-1 row-cols-md-5 g-1'>{items}</div>;

    }

    renderPosts() {
        if (this.state.members.length == 0) {
            var items = [];
            for (var i = 0; i < this.state.posts.length; i++) {
                var p = this.state.posts[i];
                items.push(<div className="col"><div className="card rounded-0 h-100" style={{ backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center", backgroundImage: "url(" + p.photo + ")" }}><img className="card-img-top" src={p.photo} style={{ opacity: 0 }} /></div></div>);
            }
            return <div className='row row-cols-3 row-cols-md-5 g-1'>{items}</div>;
        } else {
            return null;
        }
    }

    render() {
        return <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="input-group my-2">
                        <input type="search" className="form-control" placeholder="Name or Username" aria-label="Recipient's username" aria-describedby="basic-addon2" value={this.state.searchtext} onChange={(e) => { this.setState({ searchtext: e.target.value }) }} />
                        <button className="input-group-text" id="basic-addon2" onClick={() => { this.search(); }}><i className="bi bi-search"></i></button>
                    </div>
                </div>
            </div>
            {this.renderMembers()}
            {this.renderPosts()}
        </div>;
    }
}
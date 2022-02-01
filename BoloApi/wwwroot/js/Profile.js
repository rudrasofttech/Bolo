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
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            posts: [], total: 0, p: 0, totalPages: 0, ps: 100
        };

        this.fetchPosts = this.fetchPosts.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    fetchPosts() {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Photo', {
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
                        this.setState({ loggedin: true, loading: false, myself: data }, () => { this.fetchPosts(); });
                    });
                }
            });
    }

    renderPosts() {
        var items = [];
        for (var i = 0; i < this.state.posts.length; i++) {
            var p = this.state.posts[i];
            items.push(<div className="col"><div className="card rounded-0 h-100" style={{ backgroundRepeat : "no-repeat", backgroundSize : "cover", backgroundPosition:"center", backgroundImage : "url(" + p.photo + ")" }}><img className="card-img-top" src={p.photo} style={{ opacity : 0}} /></div></div>);
        }
        return <div className='row row-cols-3 row-cols-md-5 g-1 border-top'>{items}</div>;
    }

    render() {
        let me = null; let pic = null;
        if (this.state.myself !== null) {
            pic = this.state.myself.pic !== "" ? <React.Fragment><img src={this.state.myself.pic} className="img-fluid px-md-0 px-5" alt="" />
            </React.Fragment> : <img src="/images/nopic.jpg" className="img-fluid" alt="" />;
            let name = null;
            if (this.state.myself.name !== "") {
                name = <div>{this.state.myself.name}</div>;
            }
            me = <div className="row my-2">
                <div className="col-md-3 text-center">
                    {pic}</div>
                <div className="col-md-9 text-center text-md-start">
                    <h1>{this.state.myself.channelName} <button type="button" className="btn btn-link text-dark btn-lg" onClick={() => { this.props.onSettingClick() } }><i class="bi bi-gear"></i></button></h1>
                    {name}
                    <p>{this.state.myself.bio}</p>
                </div>
            </div>;
        }

        return <div className="container">
            {me}
            {this.renderPosts()}
        </div>;
    }
}
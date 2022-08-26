class Search extends React.Component {
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
            q: '', items: [], eitems: new Map(), emodel: null, searchactivetab: 'people'
        };

        this.search = this.search.bind(this);
    }

    search() {
        this.setState({ loading: true });
        let url = '//' + window.location.host + '/api/search?q=' + this.state.q.replace("#", "");

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
                        this.setState({
                            loggedin: true, loading: false, items: data
                        }, () => { });
                    });
                }
            });
    }

    explore() {
        let url = '//' + window.location.host + '/api/search/explore?p=' + this.state.p;

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
                        var temp = this.state.eitems;
                        for (var k in data.posts) {
                            if (!temp.has(data.posts[k].id)) {
                                temp.set(data.posts[k].id, data.posts[k]);
                            }
                        }
                        this.setState({
                            loading: false,
                            emodel: {
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            },
                            eposts: temp
                        });
                    });
                }
            });
    }

    renderSearchResult() {
        var items = [];
        var i = 1;
        for (var k in this.state.items) {
            var p = this.state.items[k];
            if (p.member) {
                items.push(<li key={i} className="list-group-item border-0 border-bottom p-2"><MemberSmallRow member={p.member} /></li>)
            } else if (p.hashtag) {
                items.push(<li key={i} className="list-group-item border-0 border-bottom p-2">
                    <div>
                        <a className="text-dark fw-bold text-decoration-none" href={'//' + window.location.host + '/post?q=%23' + p.hashtag.tag}>#{p.hashtag.tag}</a>
                        <div>{p.hashtag.postCount} Posts</div>
                    </div>
                </li>);
            }
            i++;
        }
        if (items.length > 0) {
            return <div>
                {items}
            </div>;
        }
        else {
            return null;
        }
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
        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>
        }
        let clearsearchhtml = <div className="col-md-1 col-2 p-0 text-center">
            <button type="button" className="btn btn-light" aria-label="Close" onClick={() => { this.setState({ q: '', items: [] }) }}><i className="bi bi-trash"></i></button>
        </div>;
        if (this.state.q === '') {
            clearsearchhtml = null;
        }
        return <React.Fragment>
            {loading}
            <div className="row mx-0">
                <div className="col p-0">
                    <input type="text" className="form-control" value={this.state.q} onChange={(e) => { this.setState({ q: e.target.value }); }} placeholder="Search People, Topics, Hashtags" maxLength="150" onKeyUp={(e) => {
                        if (e.keyCode === 13) {
                            this.search();
                        }
                    }} />
                </div>
                {clearsearchhtml}
            </div>
            {this.renderSearchResult()}
        </React.Fragment>;
    }
}
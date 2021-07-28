class Meetings extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            loading: false, loggedin: loggedin,
            bsstyle: '', message: '', meetingid: '', name: '', purpose: '',
            showcreateform: false, meetinglist: []
        };

        this.loginHandler = this.loginHandler.bind(this);
        this.handleStartMeeting = this.handleStartMeeting.bind(this);
        this.handleCreateDiscussionButton = this.handleCreateDiscussionButton.bind(this);
        this.handleCloseCreateDiscussionButton = this.handleCloseCreateDiscussionButton.bind(this);
        this.handleGotoMeeting = this.handleGotoMeeting.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getMeetings = this.getMeetings.bind(this);
        this.handleShowDiscussions = this.handleShowDiscussions.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.getMeetings();
            this.setState({ loggedin: true });
        }
    }

    getMeetings() {

        this.setState({ loading: true });
        let token = localStorage.getItem("token");
        if (token === null) {
            token = "";
        }
        fetch('//' + window.location.host + '/api/Discussions', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    this.setState({ loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ loading: false, meetinglist: data });
                    });
                } else {
                    this.setState({ loading: false });
                }
            });

    }

    handleShowDiscussions(refresh) {
        this.setState({ meetingid: '' });
        if (refresh) {
            this.getMeetings();
        }

    }

    handleGotoMeeting(id, e) {
        this.setState({ meetingid: id });
    }

    handleCreateDiscussionButton(e) {
        this.setState({ showcreateform: !this.state.showcreateform });
    }

    handleCloseCreateDiscussionButton(e) {
        this.setState({ showcreateform: false });
    }

    handleStartMeeting(e) {
        e.preventDefault();
        fetch('api/Discussions', {
            method: 'post',
            body: JSON.stringify({ Name: this.state.name, Purpose: this.state.purpose }),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                this.setState({ loading: false });
                if (response.status === 200) {
                    response.json().then(data => {
                        //window.location.href = "/m/" + data.id;
                        this.getMeetings();
                        this.setState({ showcreateform: false });
                    });
                } else {
                    this.setState({ bsstyle: 'danger', message: 'Unable to create a meeting. Please try again.' });
                }
            });
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'name':
                this.setState({ name: e.target.value });
                break;
            case 'purpose':
                this.setState({ purpose: e.target.value });
                break;
            default:
                break;
        }
    }

    componentDidMount() {
        this.getMeetings();
    }

    renderCreateDiscussionForm() {
        if (this.state.showcreateform) {
            return <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">New Discussion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleCloseCreateDiscussionButton}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="meetingnametxt">Name</label>
                                <input type="text" className="form-control" id="meetingnametxt" placeholder="Friendly name" name="name" maxLength="50" onChange={this.handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="purposetxt">Purpose</label>
                                <input type="text" className="form-control" id="purposetxt" placeholder="Ellaborate on the purpose of discussion" maxLength="250" name="purpose" onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-primary my-2 me-2 startmeeting" onClick={this.handleStartMeeting}>Create</button>
                        </div>
                    </div>
                </div>
            </div>;
        }
        else {
            return null;
        }
    }

    renderMeetingList() {
        var items = [];
        items.push(<div className="col-12 col-sm-3 col-md-3 col-lg-3"><div key={0} className="card border-dark mb-1">
            <div className="card-header">
                New Discussion
            </div>
            <div className="card-body text-dark">
                <p className="card-text">Invite friends and share ideas.</p>
            </div>
            <div className="card-footer bg-transparent border-success"><button className="btn btn-sm btn-success" onClick={this.handleCreateDiscussionButton}>Create</button></div>
        </div>
        </div>);

        for (var k in this.state.meetinglist) {
            var obj = this.state.meetinglist[k];
            if (obj.name !== null && obj.name !== "") {
                items.push(<div className="col-12 col-sm-3 col-md-3 col-lg-3"><div key={obj.id} className="card border-dark mb-1">
                    <div className="card-header">
                        {obj.name}
                        <span style={{ "float": "right" }}>{moment(obj.createDate.replace(" UTC", "")).fromNow(true)}</span>
                    </div>
                    <div className="card-body text-dark">
                        <p className="card-text" style={{ "textOverflow": "ellipsis", "overflow": "hidden", "whiteSpace": "nowrap" }}>{obj.purpose}</p>
                    </div>
                    <div className="card-footer bg-transparent border-success">
                        <a className="btn btn-sm btn-primary" onClick={this.handleGotoMeeting.bind(this, obj.id)}>Go To</a></div>
                </div>
                </div>);
            }
        }
        return <div className="row">{items}</div>;
    }

    render() {
        let loading = this.state.loading ? <div className="progress">
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}></div>
        </div> : null;
        if (!this.state.loggedin) {
            return <div>
                <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} fixed={false} />
                <main role="main" className="inner cover meetingsmain m-5">
                    <h1 className="cover-heading">Discussions</h1>
                    <p className="lead">Connect with people for quick status updates, important discussions, future planning or interviews. <strong>Login to start a discussion.</strong></p>
                </main>
                <HeartBeat activity="1" interval="20000" />
            </div>;

        }
        else if (this.state.meetingid != '') {
            var d = null;
            for (var k in this.state.meetinglist) {
                if (this.state.meetinglist[k].id === this.state.meetingid) {
                    d = this.state.meetinglist[k];
                    break;
                }
            }
            return (
                <React.Fragment><Discussion discussion={d} handleShowDiscussions={this.handleShowDiscussions} /></React.Fragment>);
        }
        else {
            let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
                <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
            </div> : null;
            return (
                <React.Fragment>
                    <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} fixed={false} />
                    <div className="container-fluid">
                        <main role="main" className="inner cover meetingsmain mr-5 ml-5">
                            {this.renderMeetingList()}
                            {this.renderCreateDiscussionForm()}
                        </main>
                        <HeartBeat activity="1" interval="3000" />
                        {messagecontent}
                    </div>
                </React.Fragment>);
        }
    }

}


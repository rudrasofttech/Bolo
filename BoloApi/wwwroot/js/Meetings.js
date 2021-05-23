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
            showmeetinglistmodal: false, meetinglist: []
        };

        this.loginHandler = this.loginHandler.bind(this);
        this.handleStartMeeting = this.handleStartMeeting.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePrevMeeting = this.handlePrevMeeting.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
        }
    }

    handlePrevMeeting() {
        if (this.state.showmeetinglistmodal) {
            this.setState({ showmeetinglistmodal: false });
        } else {
            this.setState({ loading: true });
            let token = localStorage.getItem("token");
            if (token === null) {
                token = "";
            }
            fetch('//' + window.location.host + '/api/Meetings', {
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
                            this.setState({ loading: false, meetinglist: data, showmeetinglistmodal: true });
                        });
                    } else {
                        this.setState({ loading: false });
                    }
                });
        }
    }

    handleStartMeeting(e) {
        e.preventDefault();
        fetch('api/Meetings', {
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
                        console.log(data);
                        window.location.href = "/m/" + data.id;
                        //this.setState({ meetingid: data.id });
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

    renderMeetingList() {
        if (this.state.showmeetinglistmodal) {
            var items = [];
            for (var k in this.state.meetinglist) {
                var obj = this.state.meetinglist[k];
                if (obj.name !== null && obj.name !== "") {
                    items.push(<tr key={obj.id}>
                        <td>
                            <strong>{obj.name}</strong><br />
                            <span>{moment(obj.createDate.replace(" UTC", "")).fromNow(true)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                            <a className="btn btn-sm btn-info" href={"//" + window.location.host + "/m/" + obj.id}>
                                Start Meeting
                            </a>
                        </td>
                    </tr>);
                }
            }
            return <div className="modal d-block" id="meetingModal" tabindex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" >Previous Meetings</h5>
                            <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={this.handlePrevMeeting}>
                                
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table table-borderless">
                                    <tbody>
                                        {items}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            return null;
        }
    }

    render() {
        let loading = this.state.loading ? <div className="progress">
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}></div>
        </div> : null;
        if (!this.state.loggedin) {
            return <div>
                <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} fixed={false} />
                <main role="main" className="inner cover meetingsmain mr-5 ml-5">
                    <h1 className="cover-heading">Online Meetings</h1>
                    <p className="lead">Online meetings are the need of the hour. Connect with people for quick status updates,
                    important discussions, future planning or interviews. Salient Features-</p>
                    <ul>
                        <li>Text, Audio and Video Chat Enabled</li>
                        <li>No need to install any special software, works on chrome, mozilla, safari and edge.</li>
                        <li>Peer to Peer technlogy</li>
                        <li>Secured with SSL</li>
                        <li>Free to use</li>
                    </ul>

                    <p className="lead">
                        <button type="button" className="btn btn-lg btn-secondary">Login to start a Meeting</button>
                    </p>

                </main>
                <HeartBeat activity="1" interval="20000" />
            </div>;

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
                            <h1 className="cover-heading">Online Meetings</h1>
                            <p className="lead">Online meetings are the need of the hour. Connect with people for quick status updates,
                    important discussions, future planning or interviews. Salient Features-</p>

                            <div className="row">
                                <div className="col-md-6">
                                    <form onSubmit={this.handleStartMeeting}>
                                        <div className="form-group">
                                            <label htmlFor="meetingnametxt">Name</label>
                                            <input type="text" className="form-control" id="meetingnametxt" placeholder="Friendly name of your meeting" name="name" maxLength="50" onChange={this.handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="purposetxt">Purpose</label>
                                            <input type="text" className="form-control" id="purposetxt" placeholder="What is the agenda of the meeting" maxLength="250" name="purpose" onChange={this.handleChange} />
                                        </div>
                                        <div>
                                            <button type="submit" className="btn btn-primary my-2 me-2 startmeeting" >Start</button>
                                            <button type="button" className="btn btn-link float-right startmeeting" onClick={this.handlePrevMeeting}>Previous Meetings</button>
                                        </div>
                                    </form>
                                    {loading}
                                </div>
                            </div>
                        </main>
                        <HeartBeat activity="1" interval="3000" />

                        {messagecontent}
                        {this.renderMeetingList()}
                    </div>
                </React.Fragment>);
        }
    }

}


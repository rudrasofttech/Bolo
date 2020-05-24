import React, { Component } from 'react';
import { MessageStrip } from './MessageStrip';
import { Redirect } from 'react-router-dom';
import { NavMenu } from './NavMenu';
import { Progress } from 'reactstrap';

export class Meetings extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = { loading: false, loggedin: loggedin, bsstyle: '', message: '', meetingid: '', name:'', purpose:'' };

        this.loginHandler = this.loginHandler.bind(this);
        this.handleStartMeeting = this.handleStartMeeting.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
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
                        this.setState({ meetingid: data.id });
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

    render() {
        let loading = this.state.loading ? <div> <Progress animated color="info" value="100" className="loaderheight" /> </div> : <></>;
        if (!this.state.loggedin) {
            return (<><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
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

                </main></>);
        } else if (this.state.meetingid !== "") {
            return <Redirect to={'/m/' + this.state.meetingid} />;
        }
        else {
            let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
                <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
            </div> : <></>;
            return (
                <>
                    <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
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
                        <div className="row">
                            <div className="col-md-6">
                                <form onSubmit={this.handleStartMeeting}>
                                    <div className="form-group">
                                        <label for="meetingnametxt">Name</label>
                                        <input type="text" className="form-control" id="meetingnametxt" placeholder="Friendly name of your meeting" name="name" maxLength="50" onChange={this.handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label for="purposetxt">Purpose</label>
                                        <input type="text" className="form-control" id="purposetxt" placeholder="What is the agenda of the meeting" maxLength="250" name="purpose" onChange={this.handleChange} />
                                    </div>
                                    <h1><button type="submit" className="btn btn-primary my-2 startmeeting" >Start a Meeting</button></h1>
                                </form>
                                </div>
                        </div>
                        
                    </main>
                    {loading}
                    {messagecontent}
                </>);
        }
    }

}
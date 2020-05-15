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
        this.state = { loading: false, loggedin: loggedin, bsstyle: '', message: '', meetingid: '' };

        this.loginHandler = this.loginHandler.bind(this);
        this.handleStartMeeting = this.handleStartMeeting.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
        }
    }

    handleStartMeeting(e) {
        fetch('api/Meetings', {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
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

    render() {
        let loading = this.state.loading ? <div> <Progress animated color="info" value="100" className="loaderheight" /> </div> : <></>;
        if (!this.state.loggedin) {
            return (<><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
                <main role="main" className="inner cover meetingsmain mr-5 ml-5">
                    <h1 className="cover-heading">Online Meetings</h1>
                    <p className="lead">Online meetings are the need of the hour. Connect with people for quick status updates,
                    important discussions, future planning or interviews. Salient Features-</p>
                    <ul>
                        <li>Unlimited participants</li>
                        <li>Audio, Video and Text Chat Enabled</li>
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
                            <li>Unlimited participants</li>
                            <li>Audio, Video and Text Chat Enabled</li>
                            <li>No need to install any special software, works on chrome, mozilla, safari and edge.</li>
                            <li>Peer to Peer technlogy</li>
                            <li>Secured with SSL</li>
                            <li>Free to use</li>
                        </ul>
                        <h1><button className="btn btn-primary my-2 startmeeting" onClick={this.handleStartMeeting}>Start a Meeting</button></h1>
                    </main>
                    {loading}
                    {messagecontent}
                </>);
        }
    }

}
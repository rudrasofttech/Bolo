import React, { Component } from 'react';
import { MessageStrip } from './MessageStrip';
import { RegisterForm } from './RegisterForm';
import { Redirect } from 'react-router-dom';
import { NavMenu } from './NavMenu';

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

        if (!this.state.loggedin) {
            return(<><NavMenu /><RegisterForm onLogin={this.loginHandler} /></>);
        } else if (this.state.meetingid !== "") {
            return <Redirect to={'/meeting/' + this.state.meetingid} />;
        }
        else {
            let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
                <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
            </div> : <></>;
            return (
                <>
                    <NavMenu />
                    <div id="fullheight" className="row align-items-center justify-content-center">
                        <div className="col-3">
                            <h1><button className="btn btn-primary my-2 startmeeting" onClick={this.handleStartMeeting}>Start a Meeting</button></h1>
                        </div>
                        {messagecontent}
                    </div>
                </>);
        }
    }

}
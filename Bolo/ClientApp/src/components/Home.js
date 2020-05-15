import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Link } from 'react-router-dom';

export class Home extends Component {
    static displayName = Home.name;
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
        };
        this.loginHandler = this.loginHandler.bind(this);
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
        }
    }

    render() {
        return (
            <>
                <NavMenu onLogin={this.loginHandler} fixed={false} />
                <div className="position-relative overflow-hidden p-2 p-md-2 m-md-3 text-center bg-dark text-light">
                    <div className="col-md-5 p-lg-5 mx-auto my-5">
                        <h1 className="display-4 font-weight-normal">Online Meetings</h1>
                        <p className="lead font-weight-normal">Organize audio/video meetings online with unlimited number of participants. Text chat enabled, fully secure and based on
                            peer to peer technology.</p>
                        <Link className="btn btn-outline-secondary" to="/meetings">Get Started</Link>
                    </div>
                </div>
                <div className="position-relative overflow-hidden p-2 p-md-2 m-md-3 text-center bg-light">
                    <div className="col-md-5 p-lg-5 mx-auto my-5">
                        <h1 className="display-4 font-weight-normal">Random Chat</h1>
                        <p className="lead font-weight-normal">Chat one to one with people from all over the world. Text, Audio and Video Support. Secured with SSL. </p>
                        <Link className="btn btn-outline-secondary" to="">Coming Soon</Link>
                    </div>
                </div>
            </>
        );
    }
}

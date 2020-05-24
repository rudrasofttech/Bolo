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
                        <p className="lead font-weight-normal">Organize audio/video meetings online. Text chat enabled, fully secure and based on peer to peer technology.</p>
                        <Link className="btn btn-success" to="/meetings">Get Started</Link>
                    </div>
                    <div className="col-md-7 mx-auto my-5">
                        <h1 className="display-4 mt-5 font-weight-normal">Made in India</h1>
                        <h1 className="display-4 mt-5 font-weight-normal">Made for India</h1>
                    </div>
                </div>

            </>
        );
    }
}

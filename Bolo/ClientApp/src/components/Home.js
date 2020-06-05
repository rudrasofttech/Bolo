import React, { Component } from 'react';
import { NavMenu } from './NavMenu';
import { Link } from 'react-router-dom';
import { HeartBeat } from './HeartBeat';
import nopic from "../assets/nopic.jpg";

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
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            myself: null
        };
        this.loginHandler = this.loginHandler.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveData = this.saveData.bind(this);
    }
    componentDidMount() {
        if (this.state.token !== null) {
            this.validate(this.state.token);
        }
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch('api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false, token: null });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);

                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    handleChange(e) {
        let m = this.state.myself;
        switch (e.target.name) {
            case 'thoughtStatus':
                m.thoughtStatus = e.target.value;
                break;
            default:
                break;
        }

        this.setState({ myself: m });
    }

    saveData(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ loading: true });

        const fd = new FormData();
        fd.set("d", value);
        fetch('api/Members/savethoughtstatus', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    this.setState({ loading: false });

                } else {
                    this.setState({ loading: false, message: 'Unable to save data', bsstyle: 'danger' });
                }
            });

    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    renderUser() {
        if (this.state.myself !== null) {
            
            let pic = this.state.myself.pic !== "" ? <><img src={this.state.myself.pic} className="rounded-lg mx-auto d-block img-fluid" alt="" />
            </> : <img src={nopic} className="rounded mx-auto d-block img-fluid" alt="" />;

            let userwelcome = <><div className="position-relative overflow-hidden p-2 m-md-2 mt-md-5 text-center">
                {pic}
                <h1 className="m-2 mb-3">Welcome {this.state.myself.name}!</h1>
                <input type="text" class="form-control mx-auto col-md-6 border-0 text-center" name="thoughtStatus" value={this.state.myself.thoughtStatus} placeholder="What's on your mind? Write here." maxLength="200" onChange={this.handleChange} onBlur={this.saveData} />
                <Link className="btn btn-success btn-lg m-4" to="/meetings">Start A Meeting</Link>
                <Link className="btn btn-primary btn-lg m-4" to="/">Start A Conversation</Link>
            </div>
            </>;

            return userwelcome;
        } else {
            return null;
        }
    }

    render() {
        let welcome = !this.state.loggedin ? <><div className="position-relative overflow-hidden p-2 p-md-2 m-md-3 text-center">
            <div className="col-md-6 p-lg-5 mx-auto my-5">
                <h1 className="display-3 font-weight-normal">Waarta</h1>
                <p className="lead font-weight-normal">Connecting with people, having meaningful conversation, free exchange of Idea, getting things done.</p>
                <Link className="btn btn-success btn-lg m-2" to="/meetings">Quick Meeting</Link>
                <Link className="btn btn-primary btn-lg m-2" to="/">Find People</Link>
            </div>
        </div></> : <></>;

        return (
            <>
                <NavMenu onLogin={this.loginHandler} fixed={false} />
                {welcome}
                {this.renderUser()}
                <HeartBeat activity="1" interval="20000" />
            </>
        );

    }
}

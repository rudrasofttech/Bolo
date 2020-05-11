﻿import React, { Component } from 'react';
import { MessageStrip } from './MessageStrip';
import { Redirect } from 'react-router-dom';
import { Progress } from 'reactstrap';

export class RegisterForm extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        
        this.state = { showregisterform: props.beginWithRegister , GenerateOTPButton: true, loginemail: '', OTP: '', registername: '', registeremail: '', loading: false, message: '', bsstyle: '', loggedin: false, redirectto: '' };
        this.handleChange = this.handleChange.bind(this);
        this.handleGenerateOTP = this.handleGenerateOTP.bind(this);
        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegisterClickHere = this.handleRegisterClickHere.bind(this);
        this.handleLoginClickHere = this.handleLoginClickHere.bind(this);
    }


    handleChange(e) {
        switch (e.target.name) {
            case 'loginemail':
                this.setState({ loginemail: e.target.value });
                break;
            case 'OTP':
                this.setState({ OTP: e.target.value });
                break;
            case 'registeremail':
                this.setState({ registeremail: e.target.value });
                break;
            case 'registername':
                this.setState({ registername: e.target.value });
                break;
            default:
                break;
        }
    }

    handleLogin(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('api/Members/Login', {
            method: 'post',
            body: JSON.stringify({ ID: this.state.loginemail, Passcode: this.state.OTP }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                //console.log(response);
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        if (data.token !== undefined) {
                            localStorage.setItem("token", data.token);
                            this.setState({ bsstyle: '', message: '', loggedin: true });
                            if (this.props.onLogin !== undefined) {
                                this.props.onLogin();
                            } else {
                                this.setState({ redirectto: '/' });
                            }
                        }
                    });
                }
                else if (response.status === 404) {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ bsstyle: 'warning', message: data.error, loading: false });
                    });

                }
            });
    }

    handleGenerateOTP(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('api/Members/OTP?id=' + this.state.loginemail, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                //console.log(response);
                if (response.status === 200) {
                    this.setState({
                        GenerateOTPButton: false,
                        loading: false,
                        bsstyle: 'success',
                        message: 'An OTP has been sent to your email address. Please verify and login.'
                    });

                }
                else {
                    this.setState({ bsstyle: '', message: '', loading: false });
                }
            });
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('api/Members', {
            method: 'post',
            body: JSON.stringify({ Name: this.state.registername, Email: this.state.registeremail, Phone: '', CountryCode: '' }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log(response.status);
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        bsstyle: 'success',
                        message: 'Your registration is complete, an OTP has been sent to your email address. Please verify and login.',
                        loggedin: false,
                        loginemail: this.state.registeremail,
                        showregisterform: false
                    });
                }
                else {
                    this.setState({
                        loading: false,
                        bsstyle: 'warning',
                        message: 'Unable to process your request please try again.',
                    });
                }
            });

        return false;
    }
    handleRegisterClickHere() {
        this.setState({ showregisterform: true });
    }
    handleLoginClickHere() {
        this.setState({ showregisterform: false });
    }

    renderOTPForm() {
        return (<form autoComplete="off" onSubmit={this.handleGenerateOTP}>
            <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" required name="loginemail" value={this.state.loginemail} onChange={this.handleChange} placeholder="Your email" />
            </div>
            <button className="btn btn-primary" type="submit">Generate OTP</button>
        </form>);
    }

    renderLoginForm() {
        return (<form onSubmit={this.handleLogin}>
            <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" required name="loginemail" value={this.state.loginemail} onChange={this.handleChange} placeholder="Registered email" />
            </div>
            <div className="form-group">
                <label>OTP</label>
                <input className="form-control" required name="OTP" type="password" onChange={this.handleChange} />
            </div>
            <button className="btn btn-primary" type="submit">Verify</button>
        </form>);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.beginWithRegister !== prevState.beginWithRegister) {
            return { someState: nextProps.beginWithRegister };
        }
        else return null;
    }

    render() {
        let loading = this.state.loading ?<div> <Progress animated color="info" value="100" className="loaderheight" /> </div>: <></>;
        if (this.state.redirectto !== "") {
            return <Redirect to={this.state.redirectto} />;
        }
        let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
            <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
        </div> : <></>;

        let logincontents = this.state.GenerateOTPButton ?
            this.renderOTPForm()
            : this.renderLoginForm();
        
        let formcontents = this.state.showregisterform ?
            <div>
                <h3>Register</h3>
                <div >
                    <form autoComplete="off" onSubmit={this.handleRegisterSubmit}>
                        <div className="form-group">
                            <label>Your Name</label>
                            <input type="text" className="form-control" required name="registername" value={this.state.registername} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Your Email</label>
                            <input type="email" className="form-control" required name="registeremail" value={this.state.registeremail} onChange={this.handleChange} placeholder="me@bolo.com" />
                            <small className="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>
                        <button className="btn btn-primary" type="submit">Submit</button>
                    </form>
                    <p className="text-center">
                        Already Registered! <a onClick={this.handleLoginClickHere} className="badge badge-light">Login Here</a> </p>
                    {loading}
                </div>
            </div> :
            <div>
                <h3>Login</h3>
                <div >
                    {logincontents}
                    <p className="text-center">
                        Register for FREE <a onClick={this.handleRegisterClickHere} className="badge badge-light">Click Here</a></p>
                    {loading}
                </div>
            </div>;
        return (
            <>
                {formcontents}
                {messagecontent}
            </>
        );
    }
}
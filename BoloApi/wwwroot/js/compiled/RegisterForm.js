﻿"use strict";

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;

        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }

        this.state = {
            showregisterform: props.beginWithRegister,
            GenerateOTPButton: true,
            loginemail: '',
            OTP: '',
            registername: '',
            registeremail: '',
            loading: false,
            message: '',
            bsstyle: '',
            loggedin: loggedin
        };
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
                this.setState({
                    loginemail: e.target.value
                });
                break;

            case 'OTP':
                this.setState({
                    OTP: e.target.value
                });
                break;

            case 'registeremail':
                this.setState({
                    registeremail: e.target.value
                });
                break;

            case 'registername':
                this.setState({
                    registername: e.target.value
                });
                break;

            default:
                break;
        }
    }

    handleLogin(e) {
        e.preventDefault();
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/Login', {
            method: 'post',
            body: JSON.stringify({
                ID: this.state.loginemail,
                Passcode: this.state.OTP
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            //console.log(response);
            if (response.status === 200) {
                response.json().then(data => {
                    //console.log(data);
                    if (data.token !== undefined) {
                        localStorage.setItem("token", data.token);
                        this.setState({
                            bsstyle: '',
                            message: '',
                            loggedin: true
                        });

                        if (this.props.onLogin !== undefined) {
                            this.props.onLogin();
                        } else {
                            this.setState({
                                redirectto: '/'
                            });
                        }
                    }
                });
            } else if (response.status === 404) {
                response.json().then(data => {
                    //console.log(data);
                    this.setState({
                        bsstyle: 'danger',
                        message: data.error,
                        loading: false
                    });
                });
            }
        });
    }

    handleGenerateOTP(e) {
        e.preventDefault();
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members/OTP?id=' + this.state.loginemail, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            //console.log(response);
            if (response.status === 200) {
                this.setState({
                    GenerateOTPButton: false,
                    loading: false,
                    bsstyle: 'success',
                    message: 'An OTP has been sent to your email address from waarta@rudrasofttech.com. Please verify and login. Please do check SPAM folder of your email.'
                });
            } else {
                this.setState({
                    bsstyle: 'danger',
                    message: 'Email is not registered with us.',
                    loading: false
                });
            }
        });
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        this.setState({
            loading: true
        });
        fetch('//' + window.location.host + '/api/Members', {
            method: 'post',
            body: JSON.stringify({
                Name: this.state.registername,
                Email: this.state.registeremail,
                Phone: '',
                CountryCode: ''
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log(response.status);

            if (response.status === 200) {
                this.setState({
                    loading: false,
                    bsstyle: 'success',
                    message: 'Your registration is complete, an OTP has been sent to your email address from waarta@rudrasofttech.com. Please verify and login. Please do check SPAM folder of your email.',
                    loggedin: false,
                    loginemail: this.state.registeremail,
                    showregisterform: false
                });
            } else if (response.status === 400) {
                response.json().then(data => {
                    this.setState({
                        loading: false,
                        bsstyle: 'danger',
                        message: data.Error[0]
                    });
                });
            } else {
                this.setState({
                    loading: false,
                    bsstyle: 'danger',
                    message: 'Unable to process your request please try again.'
                });
            }
        });
        return false;
    }

    handleRegisterClickHere() {
        this.setState({
            showregisterform: true,
            message: ""
        });
    }

    handleLoginClickHere() {
        this.setState({
            showregisterform: false,
            message: ""
        });
    }

    renderOTPForm() {
        return /*#__PURE__*/React.createElement("form", {
            autoComplete: "off",
            onSubmit: this.handleGenerateOTP
        }, /*#__PURE__*/React.createElement("div", {
            className: "form-group"
        }, /*#__PURE__*/React.createElement("label", null, "Mobile or Email"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            required: true,
            name: "loginemail",
            value: this.state.loginemail,
            onChange: this.handleChange,
            placeholder: "Mobile or Email"
        })), /*#__PURE__*/React.createElement("button", {
            className: "btn btn-primary",
            type: "submit"
        }, "Generate OTP"));
    }

    renderLoginForm() {
        return /*#__PURE__*/React.createElement("form", {
            onSubmit: this.handleLogin
        }, /*#__PURE__*/React.createElement("div", {
            className: "form-group"
        }, /*#__PURE__*/React.createElement("label", null, "Mobile or Email"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            required: true,
            name: "loginemail",
            value: this.state.loginemail,
            onChange: this.handleChange,
            placeholder: "Mobile or Email"
        })), /*#__PURE__*/React.createElement("div", {
            className: "form-group"
        }, /*#__PURE__*/React.createElement("label", null, "OTP"), /*#__PURE__*/React.createElement("input", {
            className: "form-control",
            required: true,
            name: "OTP",
            type: "password",
            onChange: this.handleChange
        })), /*#__PURE__*/React.createElement("button", {
            className: "btn btn-primary",
            type: "submit"
        }, "Verify"));
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.beginWithRegister !== prevState.beginWithRegister) {
            return {
                someState: nextProps.beginWithRegister
            };
        } else return null;
    }

    render() {
        let loading = this.state.loading ? /*#__PURE__*/React.createElement("div", {
            className: "progress",
            style: {
                height: "5px"
            }
        }, /*#__PURE__*/React.createElement("div", {
            className: "progress-bar progress-bar-striped progress-bar-animated",
            role: "progressbar",
            "aria-valuenow": "75",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            style: {
                width: "100%"
            }
        })) : null;
        let messagecontent = this.state.message !== "" ? /*#__PURE__*/React.createElement("div", {
            className: "mt-1 alert alert-" + this.state.bsstyle
        }, this.state.message) : null;
        let logincontents = this.state.GenerateOTPButton ? this.renderOTPForm() : this.renderLoginForm();
        let formcontents = this.state.showregisterform ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Register"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
            autoComplete: "off",
            onSubmit: this.handleRegisterSubmit
        }, /*#__PURE__*/React.createElement("div", {
            className: "form-group"
        }, /*#__PURE__*/React.createElement("label", null, "Your Name"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            className: "form-control",
            required: true,
            name: "registername",
            value: this.state.registername,
            onChange: this.handleChange
        })), /*#__PURE__*/React.createElement("div", {
            className: "form-group"
        }, /*#__PURE__*/React.createElement("label", null, "Your Email"), /*#__PURE__*/React.createElement("input", {
            type: "email",
            className: "form-control",
            required: true,
            name: "registeremail",
            value: this.state.registeremail,
            onChange: this.handleChange,
            placeholder: "me@bolo.com"
        }), /*#__PURE__*/React.createElement("small", {
            className: "form-text text-muted"
        }, "We'll never share your email with anyone else.")), /*#__PURE__*/React.createElement("button", {
            className: "btn btn-primary",
            type: "submit"
        }, "Submit")), /*#__PURE__*/React.createElement("p", {
            className: "text-center mt-2"
        }, "Already a Member! ", /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: this.handleLoginClickHere,
            className: "btn btn-success btn-sm"
        }, "Login Here"), " "), messagecontent, loading)) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Login"), /*#__PURE__*/React.createElement("div", null, logincontents, /*#__PURE__*/React.createElement("p", {
            className: "text-center mt-2"
        }, "Register for FREE ", /*#__PURE__*/React.createElement("button", {
            type: "button",
            onClick: this.handleRegisterClickHere,
            className: "btn btn-success btn-sm"
        }, "Click Here")), messagecontent, loading));
        return /*#__PURE__*/React.createElement("div", null, formcontents);
    }

}
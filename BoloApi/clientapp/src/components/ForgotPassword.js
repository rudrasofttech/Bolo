import { useState } from "react";
import ShowMessage from "./shared/ShowMessage";
import { Link } from "react-router-dom";

function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [bsstyle, setBsstyle] = useState('');

    //const [token, setToken] = useState(localStorage.getItem("token") == null ? '' : localStorage.getItem("token"));
    const [username, setUserName] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');


    const loadSecurityQuestion = () => {
        setLoading(true);
        fetch("//" + window.location.host + "/api/members/getsecurityquestion/" + username, {
            method: "get"
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        setSecurityQuestion(data.securityQuestion);
                        setBsstyle('');
                        setMessage('');
                    });
                } else {
                    setSecurityQuestion('');
                    setBsstyle('danger');
                    setMessage('Incorrect username provided.');
                }
            }).catch(error => {
                console.log(error);
                setSecurityQuestion('');
                setBsstyle('danger');
                setMessage('Unable to contact server.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const savePassword = () => {
        if (password !== verifyPassword) {
            setBsstyle('danger');
            setMessage('Verify password should match password.');
            return;
        }
        setLoading(true);
        let fd = new FormData();
        fd.append("username", username);
        fd.append("question", securityQuestion);
        fd.append("answer", securityAnswer);
        fd.append("password", password);
        fetch("//" + window.location.host + "/api/members/validatesecurityanswer", {
            method: "post",
            body: fd
        })
            .then(response => {
                if (response.status === 200) {
                    setBsstyle('success');
                    setMessage('Your password is successfully reset. You can try logging in now.');
                } else if (response.status === 500 || response.status === 400 || response.status === 404) {
                    response.json().then(data => {
                        setBsstyle('danger');
                        setMessage(data.error);
                    });
                } else {
                    setSecurityQuestion('');
                    setBsstyle('danger');
                    setMessage('Incorrect username provided.');
                }
            }).catch(error => {
                console.log(error);
                setSecurityQuestion('');
                setBsstyle('danger');
                setMessage('Unable to contact server.');
            })
            .finally(() => { setLoading(false); });
    };

    return <div className="wrapper sign-up pt-5" style={{ minHeight: "100vh" }}>
        <div className="banner-image d-none d-md-block">
            <img src={"//" + window.location.host + "/theme1/images/banner-login.svg"} alt="Banner" />
        </div>
        <div className="container mt-5">
            <main>
                <div className="row">
                    <div className="intro-slide col-md-6">
                        <header className="site-header">
                            <Link to="/" title="Yocail">
                                <img src={"//" + window.location.host + "/theme1/images/Yocail-logo.svg"} alt="Yocail Logo" />
                            </Link>
                        </header>
                        <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
                            <ol className="carousel-indicators">
                                <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
                            </ol>
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <p>Safely share pictures with your friends and family.</p>
                                </div>
                            </div>
                            <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-wrap">
                            <div className="right-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="79" height="106" viewBox="0 0 79 106" fill="none">
                                    <circle cx="75" cy="31" r="75" fill="url(#paint0_linear_9_99)" fillOpacity="0.3" />
                                    <defs>
                                        <linearGradient id="paint0_linear_9_99" x1="75" y1="-44" x2="75" y2="106" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#FE8F75" />
                                            <stop offset="1" stopColor="#CF0606" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span></span>
                            <h2>Forgot Password</h2>
                            <p className="my-2" style={{ lineHeight: "25px" }}>Provide your username or email address, you will be asked with security question.</p>
                            <form onSubmit={(e) => { e.preventDefault(); loadSecurityQuestion(); }}>
                                <div className="row g-2">
                                    <div className="col-8">
                                        <div className="form-group ic-input">
                                            <img src={"//" + window.location.host + "/theme1/images/ic-user.svg"} className="input-icon" alt="" />
                                            <input type="text" className="form-control" style={{ minWidth: "210px" }} maxLength="300" placeholder="Username or Email" value={username}
                                                onChange={(e) => { setUserName(e.target.value); }} required />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <button type="submit" disabled={loading} className="btn btn-secondary">{loading ? 
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div> : "Load Member"}</button></div>
                                </div>
                            </form>
                            {securityQuestion !== "" ?
                                <form onSubmit={(e) => { e.preventDefault(); savePassword(); }}>
                                    <div className="mb-3">
                                        <label className="form-label">Security Question</label>
                                        <input type="text" readOnly required className="form-control" value={securityQuestion} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Security Answer</label>
                                        <input type="text" maxLength="300" className="form-control" value={securityAnswer}
                                            onChange={(e) => { setSecurityAnswer(e.target.value); }} />
                                        <div className="form-text my-2">Your new password will be set only if your security answer matches with our record.</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input type="password" required className="form-control" minLength="8" value={password}
                                            onChange={(e) => { setPassword(e.target.value); }} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Verify New Password</label>
                                        <input type="password" required className="form-control" value={verifyPassword}
                                            onChange={(e) => { setVerifyPassword(e.target.value); }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save New Password</button>
                                </form>
                                : null
                            }
                            <p className="haveaccount mt-3">
                                <Link to="/login" title="Login Again">Try Login Again</Link></p>
                            <ShowMessage bsstyle={bsstyle} message={message} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>;
}

export default ForgotPassword;
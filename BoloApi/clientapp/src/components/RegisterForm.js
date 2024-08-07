import { useState } from "react";
import ShowMessage from "./shared/ShowMessage";
import SecurityQuestionSampleList from "./SecurityQuestionSampleList";
import { Link, useNavigate } from "react-router-dom";
import { MessageModel } from "./shared/Model";
import bannerimage from "../theme1/images/banner-image.svg";
import yocailogo from "../theme1/images/yocail-logo.svg";
import icuser from "../theme1/images/ic-user.svg";
import iclock from "../theme1/images/ic-lock.svg";
import icemail from "../theme1/images/ic-email.svg";
import icsheild from "../theme1/images/ic-shield.svg";
import icsheildyes from "../theme1/images/ic-shield-yes.svg";
import { Utility } from "./Utility";

function RegisterForm() {
    const navigate = useNavigate();
    const [registerdto, setRegisterdTo] = useState({ userName: '', password: '', userEmail: '', securityQuestion: '', securityAnswer: '' });
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [showSecurityQuestionSampleModal, setShowSecurityQuestionSampleModal] = useState(false);

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/members/register`, {
            method: 'post',
            body: JSON.stringify({
                UserName: userName,
                Password: password,
                Email: userEmail,
                SecurityQuestion: securityQuestion,
                SecurityAnswer: securityAnswer
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setMessage(new MessageModel('success', 'Your registration is complete.'));
                    navigate('/login/:' + userName)
                } else if (response.status === 400) {
                    response.json().then(data => {
                        setMessage(new  MessageModel('danger',data.error));
                    });
                }
                else {
                    setMessage(new MessageModel('danger','Unable to process your request please try again.'));
                }
            }).finally(() => {
                setLoading(false);
            });

        return false;
    }

    const renderSecurityQuestionSampleModal = () => {
        if (showSecurityQuestionSampleModal) {
            return <div>
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Security Questions Hints</h1>
                                <button type="button" className="btn-close" onClick={() =>
                                    setShowSecurityQuestionSampleModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <SecurityQuestionSampleList onQuestionSelect={e => {
                                    setSecurityQuestion(e);
                                    setShowSecurityQuestionSampleModal(false);
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </div>;
        }
    }

    return <div className="wrapper sign-up pt-5" style={{ minHeight: "100vh" }}>
        <div className="banner-image d-none d-md-block">
            <img src={bannerimage} alt="Banner" />
        </div>
        <div className="container mt-5">
            <main>
                <div className="row">
                    <div className="intro-slide col-md-6">
                        <header className="site-header">
                            <Link to="/" title="Yocail">
                                <img src={yocailogo} alt="Yocail Logo" />
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
                            <div>
                                <span>LET'S GET YOU STARTED</span>
                                <h2>Create an Account</h2>
                                <form autoComplete="off" onSubmit={handleRegisterSubmit}>
                                    <div className="form-group ic-input">
                                        <img src={icuser} className="input-icon" alt="" />
                                        <input type="text" className="form-control" required maxLength="30" minLength="2" name="username"
                                            value={userName}
                                            placeholder="Unique username"
                                            onChange={(e) => { setUserName(e.target.value); }} />
                                    </div>
                                    <div className="form-group ic-input">
                                        <img src={iclock} className="input-icon" alt="" />
                                        <input placeholder="Password" required type="password" minLength="8" className="form-control" onChange={(e) => {
                                            setPassword(e.target.value);
                                        }} />
                                    </div>
                                    <div className="form-group ic-input">
                                        <img src={icemail} className="input-icon" alt="" />
                                        <input type="email" className="form-control" maxLength="250" placeholder="Email" value={userEmail}
                                            onChange={(e) => { setUserEmail(e.target.value); }} required />

                                    </div>
                                    <div className="form-group ic-input">
                                        <img src={icsheild} className="input-icon" alt="" />
                                        <input list="sqlist" type="text" placeholder="Security Question" className="form-control" minLength="10" required maxLength="300" name="securityQuestion" value={securityQuestion}
                                            onChange={(e) => { setSecurityQuestion(e.target.value); }} aria-describedby="securityquestionHelp" />
                                        <datalist id="sqlist">
                                            <option value="What is the name of your first friend?" />
                                            <option value="What was the make and model of your first car?" />
                                            <option value="In what city did your parents meet?" />
                                            <option value="What is your birth place?" />
                                            <option value="What is your favourite place to visit?" />
                                            <option value="What was the name of the first school you remember attending?" />
                                        </datalist>
                                    </div>
                                    <div id="securityquestionHelp" className="form-text text-center mb-3 py-1">Security Question is required to recover forgotten password.
                                        <div onClick={() =>
                                            setShowSecurityQuestionSampleModal(true)} className="fw-bold mx-1 pointer my-2" style={{ color: "#30235B" }}>Sample Questions List</div></div>
                                    <div className="form-group ic-input">
                                        <img src={icsheildyes} className="input-icon" alt="" />
                                        <input type="text" className="form-control" maxLength="100" placeholder="Security Answer" required name="securityAnswer" value={securityAnswer}
                                            onChange={(e) => { setSecurityAnswer(e.target.value); }} />
                                    </div>
                                    <div id="securitypasswordHelp" className="form-text mb-3 text-center d-none"> Correct answer to your security question.</div>
                                    <button className="btn btn-dark" type="submit">
                                        {loading ? <div className="spinner-border spinner-border-sm text-light" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div> : "Register"}</button>
                                </form>
                                <ShowMessage messagemodal={message} />
                                {renderSecurityQuestionSampleModal()}
                            </div>
                            <div className="alternateoption">
                                <span>Or</span>
                            </div>
                            <p className="haveaccount">
                                Already a Member? <Link to="/login/">LOGIN HERE</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>;
}

export default RegisterForm;
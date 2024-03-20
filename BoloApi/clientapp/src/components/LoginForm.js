import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShowMessage from "./shared/ShowMessage";

function LoginForm(props) {
    const navigate = useNavigate();
    const [logindto, setLoginTo] = useState({ userName: props.username, password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [bsstyle, setBsstyle] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        setLoading(true);
        fetch('//' + window.location.host + '/api/Members/Login', {
            method: 'post',
            body: JSON.stringify({ UserName: logindto.userName, Password: logindto.password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        if (data.token !== undefined) {
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("myself", JSON.stringify(data.member));
                            setBsstyle('');
                            setMessage('');
                            navigate('/');
                        }
                    });
                }
                else if (response.status === 404) {
                    response.json().then(data => {
                        setBsstyle('danger');
                        setMessage(data.error);
                    });
                }
            }).finally(() => {
                setLoading(false);
            });
    }
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
                            <h2>Login</h2>
                            <form onSubmit={handleLogin}>
                                <div className="form-group ic-input">
                                    <img src={"//" + window.location.host + "/theme1/images/ic-user.svg"} className="input-icon" alt="" />
                                    <input type="text" placeholder="Username" className="form-control" required name="userName" value={logindto.userName}
                                        onChange={(e) => {
                                            setLoginTo({ userName: e.target.value, password: logindto.password });
                                        }} />
                                </div>
                                <div className="form-group ic-input">
                                    <img src={"//" + window.location.host + "/theme1/images/ic-lock.svg"} className="input-icon" alt="" />
                                    <input className="form-control" required placeholder="Password" name="password" type="password"
                                        onChange={(e) => {
                                            setLoginTo({ userName: logindto.userName, password: e.target.value });
                                        }} />
                                </div>
                                <div className="d-flex justify-content-between pb-3">
                                    <div className="custom-control custom-checkbox">
                                        {/*<input type="checkbox" className="custom-control-input" id="customCheck1">*/}
                                        {/*    <label className="custom-control-label" for="customCheck1">Remember me</label>*/}
                                    </div>
                                    <Link to="/forgotpassword" title="Forgot Password?" className="forgot-pass">Forgot Password?</Link>
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-blue">{loading ? <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div> : "Login"}</button>
                            </form>
                            <div className="alternateoption">
                                <span>Or</span>
                            </div>
                            <p className="haveaccount">Don’t have an account?
                                <Link to="/register" title="SIGN UP HERE">SIGN UP HERE</Link></p>
                            <ShowMessage bsstyle={bsstyle} message={message} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>;
}

export default LoginForm;
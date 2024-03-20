import { Link } from "react-router-dom";

function NavBar(props) {
    const member = localStorage.getItem("myself") != null ? JSON.parse(localStorage.getItem("myself")) : null;
    return <div id="mainmenubar">
        <div className="container py-2 px-2">
            <div className="row g-0 align-items-center">
                <div className="col-md-2 d-none d-md-block  py-2">
                    <Link to="/">
                        <img src={`//${window.location.host}/theme1/images/yocail-logo.svg`} className="img-fluid logo" alt="Yocail logo" />
                    </Link>
                </div>
                <div className="col-md-10 text-center text-md-end">
                    <div className="bg-white pt-lg-3 d-md-inline-block">
                        <div className="row g-1 align-items-center justify-items-center">
                            <div className="col-3 text-start d-md-none">
                                <Link to="/">
                                    <img src={`//${window.location.host}/theme1/images/yocail-sign-logo.svg`} className="img-fluid logo" alt="Yocail logo" />
                                </Link>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-link text-primary fs-4 mx-md-4" title="Search" onClick={() => { props.onSearchClick(); }}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                            <div className="col">
                                <Link className="btn btn-link text-primary fs-4 mx-md-4" to="/discover" title="Discover">
                                    <i className="bi bi-globe-central-south-asia"></i>
                                </Link>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-link text-primary fs-4 mx-md-4" onClick={() => { props.onAddPostClick(); }} title="Add Post">
                                    <i className="bi bi-file-plus"></i>
                                </button>
                            </div>
                            <div className="col">
                                <button type="button" onClick={() => { props.onNotificationClick(); }} className="position-relative fs-4 mx-md-4 text-primary btn btn-link">
                                    <i className="bi bi-bell"></i>
                                    <span style={{ fontSize: "0.8rem", top: "10px" }} className="position-absolute start-100 translate-middle badge rounded-pill bg-danger">
                                    </span>
                                </button>
                            </div>
                            <div className="col">
                                <div className="dropdown me-2">
                                    <button type="button" className="btn btn-link text-primary fs-4 mx-md-4 position-relative" >
                                        {member != null && member.pic !== "" ? <img alt="" src={`//${window.location.host}/${member.pic}`} className='profile-icon profile-pic-border' /> : <img src={`//${window.location.host}/theme1/images/person-fill.svg`} className='profile-icon profile-pic-border' alt="" />}
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li className="py-2 border-bottom">
                                            <Link className="dropdown-item py-1" to="/profile"><i className="bi bi-person-lines-fill"></i> Profile</Link>
                                        </li>
                                        {/*<li className="py-2 border-bottom">*/}
                                        {/*    <a className="dropdown-item py-1" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#ignoredMembersModal"><i className="bi bi-sign-stop"></i> Ignored</a>*/}
                                        {/*</li>*/}
                                        {/*<li className="py-2">*/}
                                        {/*    <a className="dropdown-item py-1" href="javascript:void(0);" onclick="localStorage.clear();location.href = '//' + location.host;"><i className="bi bi-box-arrow-left"></i> Logout</a>*/}
                                        {/*</li>*/}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default NavBar;
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import yocailogo from "../../theme1/images/yocail-logo.svg";
import yocailsignlogo from "../../theme1/images/yocail-sign-logo.svg";
import personfill from "../../theme1/images/person-fill.svg";
function NavBar(props) {
    const auth = useAuth();
    return <div id="mainmenubar" className="d-block d-md-none">
        <div className="container px-2">
            <div className="row g-0 align-items-center">
                <div className="col-md-2 d-none d-md-block py-2">
                    <Link to="/">
                        <img src={yocailogo} className="img-fluid logo" alt="Yocail logo" />
                    </Link>
                </div>
                <div className="col-md-10 text-center text-md-end">
                    <div className="bg-white pt-lg-3 d-md-inline-block">
                        <div className="row g-1 align-items-center justify-items-center">
                            <div className="col d-md-none">
                                <Link to="/">
                                    <img src={yocailsignlogo} className="img-fluid logo" alt="Yocail logo" />
                                </Link>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-link text-primary fs-1 my-2 my-md-1 mx-md-4" title="Search" onClick={() => { props.onSearchClick(); }}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                            <div className="col">
                                <Link className="btn btn-link text-primary fs-1 my-2 my-md-1 mx-md-4" to="/explore" title="Explore">
                                    <i className="bi bi-globe-central-south-asia"></i>
                                </Link>
                            </div>
                            <div className="col">
                                <Link type="button" className="btn btn-link text-primary fs-1 my-2 my-md-1 mx-md-4" to="/add" title="Add Post">
                                    <i className="bi fs-2 bi-file-plus"></i>
                                </Link>
                            </div>
                            <div className="col">
                                <button type="button" onClick={() => { props.onNotificationClick(); }} className="position-relative fs-1 my-2 my-md-1 mx-md-4 text-primary btn btn-link">
                                    <i className="bi bi-bell"></i>
                                    {props.unseennotificationcount > 0 ? <span style={{ fontSize: "0.8rem", top: "10px" }} className="position-absolute start-100 translate-middle badge rounded-pill bg-danger">
                                        {props.unseennotificationcount}
                                    </span> : null }
                                </button>
                            </div>
                            <div className="col">
                                <Link className="btn btn-link text-primary fs-1 my-2 my-md-1 mx-md-4" to="/profile" title="Profile">
                                    {auth.myself != null && auth.myself.pic !== "" ? <img alt="" src={`//${window.location.host}/${auth.myself.pic}`} className='profile-icon profile-pic-border' /> : <img src={personfill} className='profile-icon profile-pic-border' alt="" />}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default NavBar;
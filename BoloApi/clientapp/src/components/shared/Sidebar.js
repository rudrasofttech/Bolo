import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import yocailsignlogo from "../../theme1/images/yocail-sign-logo.svg";
import personfill from "../../theme1/images/person-fill.svg";

function Sidebar(props) {
    const auth = useAuth();

    return <>
        <div className="item d-flex align-items-center justify-content-center">
            <Link to="/">
                <img src={yocailsignlogo} className="img-fluid" alt="Yocail logo" style={{maxWidth:"60px"} } />
            </Link>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <button type="button" className="btn btn-link text-decoration-none text-primary fs-6" title="Search" onClick={() => { props.onSearchClick(); }}>
                <i className="bi fs-2 bi-search"></i>
            </button>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <Link className="btn btn-link text-decoration-none text-primary fs-6" to="/explore" title="Explore">
                <i className="bi fs-2 bi-globe-central-south-asia"></i> 
            </Link>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <Link type="button" className="btn btn-link text-decoration-none text-primary fs-6" to="/add" title="Add Post">
                <i className="bi fs-2 bi-file-plus"></i>
            </Link>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <Link type="button" className="btn btn-link text-decoration-none text-primary fs-6" to="/conversation" title="Conversations">
                <i className="bi fs-2 bi-chat-square-text"></i>
            </Link>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <button type="button" onClick={() => { props.onNotificationClick(); }} className="position-relative fs-6 text-primary btn btn-link text-decoration-none">
                <i className="bi fs-2 bi-bell"></i>
                {props.unseennotificationcount > 0 ? <span style={{ fontSize: "0.8rem", top: "10px" }} className="position-absolute start-100 translate-middle badge rounded-pill bg-danger">
                    {props.unseennotificationcount}
                </span> : null}
            </button>
        </div>
        <div className="item d-flex align-items-center justify-content-center">
            <Link className="btn btn-link text-decoration-none text-decoration-none text-primary fs-6" to="/profile" title="Profile">
                {auth.myself != null && auth.myself.pic !== "" ? <img alt="" src={`//${window.location.host}/${auth.myself.pic}`} className='profile-icon profile-pic-border' /> :
                    <img src={personfill} className='profile-icon profile-pic-border' alt="" />}
            </Link>
        </div>
    </>;
}

export default Sidebar;
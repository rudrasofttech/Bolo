import { Link } from "react-router-dom";

function MemberPicSmall(props) {
        let memberpic = props.member.pic !== "" ? <Link to={`//${window.location.host}/profile/${props.member.userName}`} className="border-0">
            <img src={`//${window.location.host}/${props.member.pic}`} className="img-fluid pointer profile-pic-border rounded-circle owner-thumb-small" alt="" />
        </Link>
            : <Link to={`//${window.location.host}/profile/${props.member.userName}`} className="border-0 text-secondary">
                <img src={`//${window.location.host}/theme1/images/person-fill.svg`} alt="No Pic" className=" img-fluid pointer profile-pic-border owner-thumb-small" />
            </Link>;

        return <>{memberpic}</>;
    
}
export default MemberPicSmall;
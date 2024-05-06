import { Link } from "react-router-dom";
import personfill from "../../theme1/images/person-fill.svg";

function MemberPicSmall(props) {
        let memberpic = props.member.pic !== "" ? <Link to={`//${window.location.host}/profile/${props.member.userName}`} className="border-0">
            <img src={`//${window.location.host}/${props.member.pic}`} className="img-fluid pointer profile-pic-border rounded-circle owner-thumb-small" alt="" />
        </Link>
            : <Link to={`//${window.location.host}/profile/${props.member.userName}`} className="border-0 text-secondary">
                <img src={personfill} alt="No Pic" className=" img-fluid pointer profile-pic-border owner-thumb-small w-100" />
            </Link>;

        return <>{memberpic}</>;
    
}
export default MemberPicSmall;
import { useState } from "react";
import { Link } from "react-router-dom";
import MemberPicSmall from "./MemberPicSmall";
import ConfirmBox from "./ConfirmBox";
import FollowButton from "./FollowButton";

function MemberSmallRow(props) {
    const [loading, setLoading] = useState(false);
    const token = props.token;
    const member = props.member;
    const [status, setStatus] = useState(props.status);
    const [showRemove, setShowRemove] = useState(props.showRemove);
    const showShare = (props.showShare === undefined || props.showShare === null) ? false : props.showShare;
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);


    const removeFollow = () => {
        setLoading(true);
        fetch('//' + window.location.host + '/api/follow/remove/' + member.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                 if (response.status === 200) {
                    setStatus(0);
                    setShowRemove(false);
                    if (props.removed) {
                        props.removed(member.id);
                    }
                }
            }).finally(() => {
                setLoading(false);
            });
    }

    const renderFollowButton = () => {
        let followbtn = <FollowButton token={token} member={member} status={status} />;
        if (showRemove) {
            //replace follow button with remmove
            followbtn = <button type="button" disabled={loading} className="btn btn-secondary" onClick={() => { setShowRemoveConfirm(true); }}>Remove</button>;
        }
        if (showShare)
            followbtn = <button type="button" disabled={loading} data-id={props.member.id} className="btn btn-blue" onClick={(e) => {
                props.onShare(e.target.getAttribute("data-id"));
            }}>Share</button>;

        return followbtn;
    }

    return <div className="row g-0 align-items-center justify-items-center">
        <div className="col-2 p-2">
            <MemberPicSmall member={member} />
        </div>
        <div className="col px-1">
            <Link to={`//${window.location.host}/@${member.userName}`} >
                {member.name !== "" ? <div className="fs-20 text-secondary fw-semibold text-capitalize">{member.name}</div> : null}
                <div className={member.name !== "" ? "text-primary fs-small mt-2" : "fs-20 text-secondary fw-semibold"}>{member.userName}</div>
            </Link>
        </div>
        <div className="col text-end">
            {renderFollowButton()}
            {showRemoveConfirm ? <ConfirmBox cancel={() => { setShowRemoveConfirm(false); }}
                ok={() => { setShowRemove(false); removeFollow(); }}
                message="Are you sure you want to remove this member from your followers?" /> : null}
        </div>
    </div>;

}
export default MemberSmallRow;
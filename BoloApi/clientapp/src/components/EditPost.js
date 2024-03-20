import { useState } from "react";

function EditPost(props) {
    const [describe, setDescribe] = useState(props.post.describe);
    const [acceptComment, setAcceptComment] = useState(props.post.acceptComment);
    const [allowShare, setAllowShare] = useState(props.post.allowShare);
    const rows = 7;
    

    const acceptCommentChanged = () => {
        setAcceptComment(!acceptComment);
        props.onchange(describe, acceptComment, allowShare);
    }

    const allowShareChanged = () => {
        setAllowShare(!allowShare);
        props.onchange(describe, acceptComment, allowShare);
    }

    const renderContent = () => {
        let chk = <input className="form-check-input" type="checkbox" id="acceptcommentchk" role="switch" onChange={acceptCommentChanged} />;
        if (acceptComment)
            chk = <input className="form-check-input" checked type="checkbox" id="acceptcommentchk" role="switch" onChange={acceptCommentChanged} />;

        let chk2 = <input className="form-check-input" type="checkbox" id="allowsharechk" role="switch" onChange={allowShareChanged} />;
        if (allowShare)
            chk2 = <input className="form-check-input" checked type="checkbox" id="allowsharechk" role="switch" onChange={allowShareChanged} />;
        return <div>
            <div className="mb-3">
                <textarea className="form-control border shadow-none" onChange={(e) => {
                    setDescribe(e.target.value);
                    props.onchange(describe, acceptComment, allowShare);
                }} value={describe} rows={rows} placeholder="Add some description to your photo..." maxlength="7000"></textarea>
            </div>
            <div className="mb-3 ps-3">
                <div className="form-check form-switch">
                    {chk}
                    <label className="form-check-label" htmlFor="acceptcommentchk">Accept comment On Post</label>
                </div>
            </div>
            <div className="mb-3 ps-3">
                <div className="form-check form-switch">
                    {chk2}
                    <label className="form-check-label" htmlFor="allowsharechk">Allow sharing of Post</label>
                </div>
            </div>
        </div>
    }

    return <>{renderContent()}</>;
}
export default EditPost;
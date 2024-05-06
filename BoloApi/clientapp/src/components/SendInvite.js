import { useState } from "react";
import { MessageModel } from "./shared/Model";
import ShowMessage from "./shared/ShowMessage";

function SendInvite(props) {
    let textarea = null;
    let inviteText = "Check this new website I found, https://yocail.com\r\n\r\nYou can post your pictures here, connect with people.\r\n\r\nMy profile on Yocail is https://yocail.com/profile?un=" + props.myself.userName;
    const [showModal, setShowModal] = useState(false);
    const [text, setText] = useState(inviteText);
    const [message, setMessage] = useState(new MessageModel());

    const copyInviteText = () => {
        // Get the text field
        //var copyText = text;

        if (textarea !== null) {
            // Select the text field
            textarea.select();
            textarea.setSelectionRange(0, 99999); // For mobile devices
        }
        // Copy the text inside the text field
        navigator.clipboard.writeText(text);
        setMessage(new MessageModel("success", "Message copied to clibboard.", 2000));
    }

    const renderModal = () => {
        if (showModal) {
            return <>
                <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Spread The Word</h1>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(false); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <textarea ref={(el) => { textarea = el; }} rows="7" className="form-control border shadow-none" value={text}
                                    onChange={(e) => { setText(e.target.value); }}></textarea>
                                <p className="pt-3 fw-lighter lh-base fs-6 p-2">You can use this text to invite your friends to yocail.<br /> Share this text over whatsapp or email.</p>
                                <ShowMessage messagemodal={message} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-blue me-2" onClick={copyInviteText}>Copy Invite Text</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        else return null;
    }

    return <>
        <div className="text-center p-3 py-2 border rounded-4">
            <h4 className="text-primary my-3 fs-24 ff-righteous">Invite a Friend</h4>
            <div className="my-1 lh-base fs-20 mb-4">Invite your friends and build<br /> your followers.</div>
            <button onClick={() => { setShowModal(true); }} type="button" className="btn btn-blue">Invite <i class="ms-2 bi bi-send-fill"></i></button>
        </div>
        {renderModal()}
    </>;
}
export default SendInvite;
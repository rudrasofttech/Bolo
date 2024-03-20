import { useState } from "react";

function ConfirmBox(props) {
    const [open, setOpen] = useState(true);
    return <>{open ? <>
        < div className="modal fade show" style={{ display: "block" }
        } tabIndex="-1" >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    {props.title.length !== 0 ? <div className="modal-header">
                        <h5 className="modal-title">{props.title}</h5>
                        <button type="button" className="btn-close" onClick={() => {
                            setOpen(false);
                            props.cancel();
                        }}></button>
                    </div> : null}
                    <div className="modal-body">
                        <p className="text-center">{props.message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" style={{ minWidth: "60px" }} onClick={() => { props.ok(); }}>Yes</button>
                        <button type="button" className="btn btn-secondary" style={{ minWidth: "60px" }} onClick={() => {
                            setOpen(false);
                            props.cancel();
                        }}>No</button>
                    </div>
                </div>
            </div>
        </div >
        <div className="modal-backdrop fade show"></div>
    </> : null}</>;


}
export default ConfirmBox;
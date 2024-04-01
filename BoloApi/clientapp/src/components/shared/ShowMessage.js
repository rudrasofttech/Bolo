import { useEffect, useState } from "react";

function ShowMessage({ toast = true, messagemodal = null}) {
    const [obj, setMessage] = useState(messagemodal);

    useEffect(() => {
        setMessage(messagemodal);
        if (messagemodal.disappear) {
            if (messagemodal.disappear > 0) {
                const timer = setTimeout(() => {
                    setMessage(null);
                }, messagemodal.disappear);
                return () => clearTimeout(timer);
            }
        }
    }, [messagemodal]);

    if (toast && (obj !== null && obj.message !== "")) {
        return <div className="toast-container p-3 bottom-0 end-0"><div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <strong className="me-auto">Attention</strong>
                <button type="button" className="btn-close" onClick={() => { setMessage(null); }} aria-label="Close"></button>
            </div>
            <div className={`toast-body text-${obj.style}`}>
                {obj.message}
            </div>
        </div></div>;
    } else {
        if ((obj !== null && obj.message !== ""))
            return <div className={"mt-2 text-center text-" + obj.style}>
                {obj.message}
            </div>;
        else
            return null;
    }
}

export default ShowMessage;
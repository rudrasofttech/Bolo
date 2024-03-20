import { useEffect, useState } from "react";

function ShowMessage(props) {
    const [message, setMessage] = useState(props.message);
    const [disappear, setDisappear] = useState(props.disappear);

    useEffect(() => {
        if (disappear) {
            if (disappear > 0) {
                const timer = setTimeout(() => {
                    setMessage("");
                }, disappear);
                return () => clearTimeout(timer);
            }
        }
    }, [disappear,message]);

    if (message !== "")
        return <div className={"mt-2 text-center text-" + props.bsstyle}>
            {message}
        </div>;
    else
        return null;
}

export default ShowMessage;
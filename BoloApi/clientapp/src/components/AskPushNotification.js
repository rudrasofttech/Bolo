import { useEffect, useState } from "react";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";

function AskPushNotification(props) {
    let reg = null;
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [permission, setPermission] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("none");


    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then((r) => {
                    reg = r;
                    if (Notification.permission === "granted") {
                        setPermission(Notification.permission);
                        getSubscription();
                    } else if (Notification.permission === "blocked" || Notification.permission === "denied") {
                        setMode("blocked");
                    } else {
                        setMode("ask");
                        let lanopmd = localStorage.getItem("lastasknotpermissionmodaldate") == null ? null : Date.parse(localStorage.getItem("lastasknotpermissionmodaldate"));
                        if (lanopmd === null || getDateDiff(Date.now(), lanopmd, "hours") > 1) {
                            setTimeout(() => {
                                setShowModal(true);
                                localStorage.setItem("lastasknotpermissionmodaldate", Date.now());
                            }, 10000);
                        }
                    }
                });
        } else {
            setMode("nosupport");
        }
    }, []);


    const getDateDiff = (tar, src, difftype) => {
        /* difftype = milliseconds | days | hours | minutes | seconds*/
        //const date1 = new Date('7/13/2010');
        //const date2 = new Date('12/15/2010');
        const diffTime = Math.abs(tar - src);
        //const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (difftype === "milliseconds")
            return diffTime;
        else if (difftype === "days")
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        else if (difftype === "hours")
            return Math.ceil(diffTime / (1000 * 60 * 60));
        else if (difftype === "minutes")
            return Math.ceil(diffTime / (1000 * 60));
        else if (difftype === "seconds")
            return Math.ceil(diffTime / 1000);
        else
            return diffTime;
    }

    const getSubscription = () => {
        reg.pushManager.getSubscription().then((sub) => {
            if (sub === null) {
                reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: "BASWJ1rjpkuNXNGWd0eJ49ZO5y2jCIwU-XdfVqomefHFa1YrgKiYPncNtezdkNIhtloySBXcnWQbWrdYW4e7-p8"
                }).then((sub) => {
                    sendSubscriptionData(sub);
                }).catch(function (e) {
                    console.error("Unable to subscribe to push", e);
                    setMode("ask");
                    setMessage(new MessageModel("error", "Unable to subscribe to push. Try again."));
                });
            } else {
                sendSubscriptionData(sub);
            }
        });
    }

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    const sendSubscriptionData = (sub) => {
        const frm = new FormData();
        frm.append("endpoint", sub.endpoint);
        frm.append("p256dh", arrayBufferToBase64(sub.getKey("p256dh")));
        frm.append("auth", arrayBufferToBase64(sub.getKey("auth")));
        fetch("//" + window.location.host + "/api/Members/subscribenotification", {
            method: 'post',
            body: frm,
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(data => {
            setMode("done");
        }).catch(err => {
            setMode("ask");
            setMessage(new MessageModel("error", "Unable to contact server. No internet connection."));
            console.log(err);
        });
    }

    const requestNotificationAccess = () => {
        Notification.requestPermission().then((status) => {
            if (status === "granted") {
                setPermission(status);
                getSubscription();
            } else if (status === "blocked" || status === "denied") {
                setPermission(status);
                setMode("ask");
            } else {
                setPermission("");
                setMode("ask");
            }
        });
    }

    const renderModal = (message) => {
        return <>
            <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fw-semibold fs-5">Get Yocail Notifications</h1>
                            <button type="button" className="btn-close" onClick={() => { setShowModal(false); }}></button>
                        </div>
                        <div className="modal-body">
                            {message !== "" ? <div className="my-1 lh-sm">{message}</div> : null}
                            <button onClick={requestNotificationAccess} className="btn btn-blue my-2">Allow Notification</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>;

    };

    const renderComponent = () => {
        if (mode === "nosupport" || mode === "done") {
            return null;
        }
        let message = <>Remain up to date with<br /> latest comments, reactions and content.</>;
        if (permission === "blocked") {
            message = <>You have blocked the notification.</>;
        } else if (permission === "denied") {
            message = <>Notification permission is denied.<br /> Please allow yocail browser notifications.</>;
        }
        if (mode === "ask") {
            if (showModal) {
                return <>{renderModal(message)}</>
            } else {
                return <div className="p-3 py-2 rounded-4 border my-3 bg-white text-center">
                    <h4 className="text-primary my-3 fs-24 ff-righteous">Yocail Notifications</h4>
                    <div className="my-2 lh-sm">{message}</div>
                    <button type="button" onClick={requestNotificationAccess} className="btn btn-blue my-2">Get Notifications</button>
                </div>;
            }
        }
        return null;
    }
    return <>{renderComponent()}</>;
}

export default AskPushNotification;
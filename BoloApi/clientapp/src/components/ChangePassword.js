import { useState } from "react";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";
import Spinner from "./shared/Spinner";
import ShowMessage from "./shared/ShowMessage";

function ChangePassword() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const savePassword = () => {
        if (password !== confirmPassword) {
            setMessage(new MessageModel("danger", "Confirm password should match password."));
            return;
        }
        setLoading(true);
        fetch('//' + window.location.host + '/api/Members/SavePassword?d=' + password, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logout();
            } else if (response.status === 200) {
                setMessage(new MessageModel("success", "Account password is reset."));
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error));
                }).catch(err => {
                    setMessage(new MessageModel("danger", 'Unable to reset password.'));
                    console.log(err);
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    }

    return <>
        <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" autoComplete={false} className="form-control shadow-none border" maxLength="100" minLength="8"
                value={password} onChange={(e) => { setPassword(e.target.value); }} />
        </div>
        <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" autoComplete={false} className="form-control shadow-none border" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); }} />
        </div>
        <div className="mb-3">
            <button type="button" disabled={loading} className="btn btn-primary" onClick={savePassword}><Spinner show={loading} sm={true} /> Save Password</button>
        </div>
        <ShowMessage messagemodal={message} />
    </>;
}
export default ChangePassword;
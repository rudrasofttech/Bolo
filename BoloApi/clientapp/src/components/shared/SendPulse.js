import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

function SendPulse() {
    const auth = useAuth();

    useEffect(() => {
        const timer = setInterval(() => {
            fetch(`https://${window.location.host}/api/members/savepulse?s=1`, {
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })
        }, 5000);
        return () => clearInterval(timer);
    });

    return null;
}

export default SendPulse;
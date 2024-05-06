import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Utility } from "../Utility";

function SendPulse() {
    const auth = useAuth();

    useEffect(() => {
        const timer = setInterval(() => {
            fetch(`${Utility.GetAPIURL()}/api/members/savepulse?s=1`, {
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
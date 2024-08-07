import { createContext, useContext, useEffect, useState } from "react";
import { AppStorage } from "./storage";
import { MessageModel } from "./model";
import { Utility } from "./utility";

const AuthContext = createContext();

const AuthProvider = ({ children, onAuthenticated, onLogout }) => {
    const store = new AppStorage();
    const [myself, setMyself] = useState(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        //
        (async () => {
            setToken(await store.getItem("token") || "");
            let temp = await store.getItem("myself");
            setMyself(temp !== null ? JSON.parse(temp) : null)
            if(temp === null)
                onLogout();
            else
            {
                validate();
             
            }
        })();

    }, []);

    const loginAction = async (data) => {
        try {
            //console.log("Login Action");
            const response = await fetch(`${Utility.GetAPIURL()}/api/Members/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            //console.log("Response");

            if (response.status === 200) {
                const data = await response.json();
                if (data) {
                    store.setItem("token", data.token);
                    store.setItem("myself", JSON.stringify(data.member));
                    setMyself(data.member);
                    setToken(data.token);
                    onAuthenticated();
                    return new MessageModel();
                } else {
                    return new MessageModel("danger", "Unable to validate credentials", 0);
                }
            } else {
                //console.log(response.status);
                const err = await response.json();
                console.log(err);
                return new MessageModel("danger", err.error, 0);
            }
        } catch (err) {
            //console.log(response.status);
            console.log(err);
            return new MessageModel("danger", err, 0);
        }
    };

    const validate = () => {
        fetch(`${Utility.GetAPIURL()}/api/Members/Validate`, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                //console.log(response.status);
                if (response.status === 401) {
                    logOut();
                }
                else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        store.setItem("myself", JSON.stringify(data));
                        setMyself(data);
                        onAuthenticated(token);
                    });
                }
            });
    }

    const logOut =  () => {
        (async () => {await store.clear();})();
        setMyself(null);
        setToken("");
        onLogout();
    };

    const updateMyself = async (obj) => {
        await store.setItem("myself", JSON.stringify(obj));
        setMyself(obj);
    }
    
    return (
        <AuthContext.Provider value={{ token, myself, loginAction, logOut, validate, updateMyself }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};

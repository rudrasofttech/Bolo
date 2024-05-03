import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageModel } from "./Model";
import { Utility } from "../Utility";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [myself, setMyself] = useState(localStorage.getItem("myself") !== null ? JSON.parse(localStorage.getItem("myself")) : null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const navigate = useNavigate();
    
    const loginAction = async (data) => {
        try {
            const response = await fetch(`${Utility.GetAPIURL()}/api/Members/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.status === 200) {
                const data = await response.json();
                if (data) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("myself", JSON.stringify(data.member));
                    setMyself(data.member);
                    setToken(data.token);
                    navigate("/");
                    return new MessageModel();
                } else {
                    return new MessageModel("danger", "Unable to validate credentials", 0);
                }
            } else {
                const err = response.json();
                return new MessageModel("danger", err.error, 0);
            }
        } catch (err) {
            return new MessageModel("danger", err, 0);
        }
    };

    const validate = () => {
        fetch(`${Utility.GetAPIURL()}/api/Members/Validate`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    logOut();
                }
                else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        localStorage.setItem("myself", JSON.stringify(data));
                        setMyself(data);
                    });
                }
            });
    }

    const logOut = () => {
        setMyself(null);
        setToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("myself");
        localStorage.clear();
        navigate("/login");
    };

    const updateMyself = (obj) => {
        localStorage.setItem("myself", JSON.stringify(obj));
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


//Auth Context
const AuthContext = React.createContext({
    token: null,
    setToken: (data) => { },
    data: null,
    setData: (data) => { },
})

//Use Auth Context
function useAuthContext() {
    return useContext(AuthContext);
}


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

class Layout extends React.Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token: localStorage.getItem("token"),
            data: localStorage.getItem("user")
        }
    }

    setToken = (data) => {
        this.setState({ token: data });
    }

    setData = (data) => {
        this.setState({ data: data });
    }

    render() {
        return (
            <AuthContext.Provider value={{
                data: this.state.data,
                token: this.state.token,
                setToken: this.setToken,
                setData: this.setData
            }}>
                <Layout>
                    <React.Route exact path='/' component={Welcome} />
                </Layout>
            </AuthContext.Provider>
        );
    }
}
class HeartBeat extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            activity: this.props.activity === undefined ? 1 : this.props.activity,
            interval: this.props.interval === undefined ? 3000 : this.props.interval
        };

        this.pulseinterval = null;
        this.sendHeartbeat = this.sendHeartbeat.bind(this);
    }

    componentDidMount() {
        this.sendHeartbeat();
        if (this.pulseinterval === null) {
            this.pulseinterval = setInterval(this.sendHeartbeat, this.state.interval);
        }
    }

    componentWillUnmount() {
        if (this.pulseinterval !== null) {
            clearInterval(this.pulseinterval);
        }
    }

    sendHeartbeat() {
        if (this.state.loggedin) {
            fetch('//' + window.location.host + '/api/Members/savepulse?s=' + this.state.activity, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                });
        }
    }

    render() {
        return null;
    }
}
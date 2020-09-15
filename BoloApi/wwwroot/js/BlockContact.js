class BlockContact extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: this.props.myself, person: this.props.person,
            bsstyle: '', message: '',
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            blocked: null
        };

        this.fetchContactDetail = this.fetchContactDetail.bind(this);
        this.handleUnblockClick = this.handleUnblockClick.bind(this);
        this.handleBlockClick = this.handleBlockClick.bind(this);
        this.setContactRelation = this.setContactRelation.bind(this);
    }

    componentDidMount() {
        this.fetchContactDetail();
    }

    handleUnblockClick() {
        this.setContactRelation(BoloRelationType.Confirmed);
    }

    handleBlockClick() {
        this.setContactRelation(BoloRelationType.Blocked);
    }

    setContactRelation(relationship) {
        fetch('//' + window.location.host + '/api/Contacts/ChangeRelation/' + this.state.person.id + '?t=' + relationship, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.boloRelation === BoloRelationType.Blocked) {
                        this.setState({ blocked: true });
                        alert("Contact blocked from sending you messages.");
                    } else {
                        this.setState({ blocked: false });
                        alert("Contact is free to send you messages.");
                    }
                });
            }
        });
    }

    fetchContactDetail() {
        fetch('//' + window.location.host + '/api/Contacts/' + this.state.person.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.boloRelation === BoloRelationType.Blocked) {
                        this.setState({ blocked: true });
                    } else {
                        this.setState({ blocked: false });
                    }
                    if (this.props.onRelationshipChange !== undefined) {
                        this.props.onRelationshipChange(data.boloRelation);
                    }
                });
            }
        });
    }

    render() {
        if (this.state.blocked === true) {
            return <button className="btn mr-1 ml-1 btn-dark" onClick={this.handleUnblockClick}>Unblock</button>;
        } else if (this.state.blocked === false) {
            return <button className="btn mr-1 ml-1 btn-secondary" onClick={this.handleBlockClick}>Block</button>;
        } else {
            return null;
        }
    }
}
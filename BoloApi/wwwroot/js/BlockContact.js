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
        this.contactlist = new Map();
        this.fetchContactDetail = this.fetchContactDetail.bind(this);
        this.handleUnblockClick = this.handleUnblockClick.bind(this);
        this.handleBlockClick = this.handleBlockClick.bind(this);
        this.setContactRelation = this.setContactRelation.bind(this);
    }

    componentDidMount() {
        this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
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
                    } else {
                        this.setState({ blocked: false });
                    }
                    if (this.contactlist.get(this.state.person.id) !== undefined) {
                        this.contactlist.get(this.state.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                    }
                });
            }
        });
    }

    fetchContactDetail() {
        try {
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
                        } else if (data.boloRelation === BoloRelationType.Confirmed) {
                            this.setState({ blocked: false });
                        } else {
                            this.setState({ blocked: null });
                        }
                        if (this.props.onRelationshipChange !== undefined) {
                            this.props.onRelationshipChange(data.boloRelation);
                        }
                    });
                }
            });
        } catch (err) {
            if (this.contactlist.get(this.state.person.id) !== undefined) {
                this.setState({ blocked: this.contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Blocked });
            }
        }
    }

    render() {
        if (this.state.blocked === true) {
            return <button className="btn mr-1 ml-1 btn-danger" onClick={this.handleUnblockClick}>Unblock</button>;
        } else if (this.state.blocked === false) {
            return <button className="btn mr-1 ml-1 btn-secondary" onClick={this.handleBlockClick}>Block</button>;
        } else {
            return null;
        }
    }
}
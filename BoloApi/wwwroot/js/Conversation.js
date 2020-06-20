class Conversation extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '', selectedperson: null,
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            searchtext: '', dummy: new Date(), showsearch: true
        };
        this.contactupdateinterval = null;
        this.contactlist = new Map();
        this.loginHandler = this.loginHandler.bind(this);
        this.handleProfileSelect = this.handleProfileSelect.bind(this);
        this.validate = this.validate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this);
        this.fetchContacts = this.fetchContacts.bind(this);
        this.handleShowSearch = this.handleShowSearch.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    componentWillUnmount() {
        if (this.contactupdateinterval !== null) {
            clearInterval(this.contactupdateinterval);
        }
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false, token: null });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });

                    //fetch contacts after validation is done
                    this.fetchContacts();
                    this.contactupdateinterval = setInterval(this.fetchContacts, 5000);
                }
            });
    }

    handleShowSearch(show) {
        this.setState({ showsearch: show });
    }

    handleProfileSelect(e) {
        this.setState({ selectedperson: e })
    }

    //handle search result item click
    handleResultItemClick(e) {
        //should only move forward if there is memberid and there is some profileselect action provided
        if (e !== null && this.contactlist.get(e) !== undefined) {
            this.setState({ selectedperson: this.contactlist.get(e).person, showsearch : false })
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        this.search();
    }

    handleReceivedMessage(mi) {
        let usermsgs = localStorage.getItem(mi.sender.toLowerCase());
        let usermsgmap = null;
        if (usermsgs !== null)
            usermsgmap = new Map(JSON.parse(usermsgs));
        else
            usermsgmap = new Map();

        usermsgmap.set(mi.id, mi);
        localStorage.setItem(mi.sender.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries())));

        if (this.contactlist.get(mi.sender.toLowerCase()) !== undefined) {
            //this.contactlist.get(mi.sender.toLowerCase()).recentMessage = mi.text;
            this.contactlist.get(mi.sender.toLowerCase()).recentMessageDate = mi.timestamp;
            if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
            } else {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
            }
            localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
        }
    }

    //the usual BS requied for form fields to work in react
    handleChange(e) {
        switch (e.target.name) {
            case 'searchtext':
                if (e.target.value.trim() === "") {
                    this.contactlist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                }
                this.setState({ searchtext: e.target.value });
                break;
            default:
        }
    }

    fetchContacts() {
        //if (localStorage.getItem("contacts") === null) {
        fetch('//' + window.location.host + '/api/Contacts/Member', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        for (var k in data) {
                            if (this.contactlist.get(data[k].person.id) === undefined) {
                                this.contactlist.set(data[k].person.id, data[k]);
                            } else {
                                this.contactlist.get(data[k].person.id).recentMessage = data[k].recentMessage;
                                this.contactlist.get(data[k].person.id).recentMessageDate = data[k].recentMessageDate;
                                this.contactlist.get(data[k].person.id).person.activity = data[k].person.activity;
                            }
                        }
                        localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                        this.setState({ loading: false, dummy: new Date() });
                    });
                } else {
                    this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                }
            });
        //} 
    }

    //search for members
    search() {
        fetch('//' + window.location.host + '/api/Members/search?s=' + this.state.searchtext, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        this.contactlist = new Map();
                        for (var k in data) {
                            this.contactlist.set(data[k].id, { id: 0, person: data[k], createDate: null, boloRelation: 3, recentMessage: '', recentMessageDate: '' });
                        }

                        this.setState({ loading: false, dummy: new Date() });
                    });
                } else {
                    this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                }
            });
    }

    renderPeopleList() {
        const items = [];
        const hundred = { width: "100%" };
        for (const [key, contact] of this.contactlist.entries()) {
            let obj = contact.person;
            let online = <span className="offline"></span>;
            if (obj.activity !== 5) {
                online = <span className="online"></span>;
            }
            let unseenmsgcount = contact.unseenMessageCount > 0 ? <span className="badge badge-primary">{contact.unseenMessageCount}</span> : null;
            let pic = obj.pic !== "" ? <img src={obj.pic} className="card-img-top" alt="" />
                : <img src="/images/nopic.jpg" className="card-img-top" alt="" />;

            items.push(<li className="list-inline-item" key={key} onClick={() => this.handleResultItemClick(obj.id)}>
                <div className="card " style={{ width: "13rem" }}>
                    {pic}
                    <div className="card-body">
                        <h6 className="card-title">{online} {obj.name} {unseenmsgcount}</h6>
                        <p className="card-text"><small>{obj.city} {obj.state} {obj.country}</small></p>
                    </div>
                </div>
            </li>);
        }

        if (items.length > 0) {
            return <ul className="list-inline searchresult">{items}</ul>;
        } else {
            return null;
        }
    }

    render() {
        let personchat = null;
        if (this.state.selectedperson !== null && !this.state.showsearch) {
            personchat = <div className="col-12 p-0">
                <PersonChat person={this.state.selectedperson} myself={this.state.myself} receivedMessage={this.handleReceivedMessage} handleShowSearch={this.handleShowSearch}/></div>
        } else {
            personchat = <HeartBeat activity="1" interval="3000" />;
        }

        let searchhtml = null;
        if (this.state.showsearch) {
            searchhtml = <div className="col-12 searchcont">
                <form onSubmit={this.handleSearchSubmit} className="searchform1 mt-2 mb-2">
                    <input type="search" className="form-control rounded-0" name="searchtext" id="search-input" onChange={this.handleChange} title="Find People by Name, Location, Profession etc." placeholder="Find People by Name, Location, Profession etc" aria-label="Search for..." autoComplete="off" spellCheck="false" />
                </form>
                {this.renderPeopleList()}
            </div>;
        }

        return (
            <React.Fragment>
                <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
                <div className="container-fluid">
                    <div className="row">
                        {searchhtml}
                        {personchat}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
﻿class Conversation extends React.Component {
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
            searchtext: '', dummy: new Date(), showsearch: true, showprofilemodal: false, profiletoshow: null
        };
        this.hubConnection = null;
        this.contactupdateinterval = null;
        this.contactlist = new Map();
        this.loginHandler = this.loginHandler.bind(this);
        this.handleProfileSelect = this.handleProfileSelect.bind(this);
        this.validate = this.validate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleReceivedMessage = this.handleReceivedMessage.bind(this);
        this.handleUpdateParent = this.handleUpdateParent.bind(this);
        this.fetchContacts = this.fetchContacts.bind(this);
        this.handleShowSearch = this.handleShowSearch.bind(this);
        this.checkContactPulse = this.checkContactPulse.bind(this);
        this.search = this.search.bind(this);
        this.startHub = this.startHub.bind(this);
        this.handleProfileModalClose = this.handleProfileModalClose.bind(this);
        this.handleProfileItemClick = this.handleProfileItemClick.bind(this);
        this.setMessageStatus = this.setMessageStatus.bind(this);
        this.messageStatusEnum = {
            Pending: 0,
            Sent: 1,
            Received: 2,
            Seen: 3
        }
    }

    componentDidMount() {
        this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
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

    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();
        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
        }).catch(err => console.log('Error while establishing connection :('));


        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: 2 /*Received*/ };
            //if received message is from current person then show in ui else save in local storage
            this.handleReceivedMessage(mi);
        });

        //update local contact list when some contact updates their information
        //if member is logged changes will be reflected immediately 
        //other wise when member log in latest contact info wil be fetched from db
        this.hubConnection.on('ContactUpdated', (dto) => {
            if (this.contactlist.get(dto.id) !== undefined) {
                let p = this.contactlist.get(dto.id).person
                if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city
                    || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) {
                    this.contactlist.get(dto.id).person = dto;
                    this.setState({ dummy: Date.now() });
                }
            }
        });

        this.hubConnection.on('ContactSaved', (dto) => {
            if (this.contactlist.get(dto.id) === undefined) {
                this.contactlist.set(dto.person.id, dto);
                this.setState({ dummy: Date.now() });
            }
        });
    }

    compare_contact(a, b) {
        // a should come before b in the sorted order
        //console.log(a);
        if (a[1].unseenMessageCount > b[1].unseenMessageCount) {
            return -1;

        } else if (a[1].person.activity !== 5 && b[1].person.activity === 5) {
            return -1;
        }
        else if (a[1].person.activity === 5 && b[1].person.activity !== 5) {
            // a should come after b in the sorted order
            return 1;
        }
        else {
            // a and b are the same
            return 0;
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
                    this.contactupdateinterval = setInterval(this.checkContactPulse, 5000);
                    if (this.hubConnection === null) {
                        this.startHub();
                    }
                }
            });
    }

    //function checks if any contact has not send pulse for last 5 seconds then deem them off-line
    checkContactPulse() {
        for (const [key, contact] of this.contactlist.entries()) {
            var dt = new Date(contact.lastPulse);
            dt.setSeconds(dt.getSeconds() + 5);
            if (dt < Date.now()) {
                contact.activity = 5;
            }
        }
    }

    fetchContacts() {

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
                                this.contactlist.set(data[k].person.id.toLowerCase(), data[k]);
                            } else {
                                //this.contactlist.get(data[k].person.id).recentMessage = data[k].recentMessage;
                                //this.contactlist.get(data[k].person.id).recentMessageDate = data[k].recentMessageDate;
                                //this.contactlist.get(data[k].person.id).person = data[k].person;
                                this.contactlist.set(data[k].person.id, data[k]);
                            }

                            if (data[k].messagesOnServer.length > 0) {
                                var msgs = localStorage.getItem(data[k].person.id) !== null ? new Map(JSON.parse(localStorage.getItem(data[k].person.id))) : new Map();
                                for (var i in data[k].messagesOnServer) {
                                    if (msgs.get(data[k].messagesOnServer[i].id) === undefined) {
                                        var mi = { id: data[k].messagesOnServer[i].id, sender: data[k].messagesOnServer[i].sentBy.id, text: data[k].messagesOnServer[i].message, timestamp: data[k].messagesOnServer[i].sentDate, status: 2 /*Received*/ };
                                        msgs.set(mi.id, mi);
                                        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
                                        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                                        this.setMessageStatus(mi.id, "SetReceived");
                                        this.contactlist.get(data[k].person.id).recentMessageDate = mi.timestamp;
                                        if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                                            this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
                                        } else {
                                            this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
                                        }
                                    }
                                }
                                localStorage.setItem(data[k].person.id, JSON.stringify(Array.from(msgs)));
                            }
                        }
                        localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                        this.setState({ loading: false, dummy: new Date() });
                    });
                } else {
                    this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                }
            });
    }

    //search for members
    search() {
        this.setState({ loading: true });
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

    setMessageStatus(mid, action) {
        fetch('//' + window.location.host + '/api/ChatMessages/' + action + '?mid=' + mid, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        });
    }

    handleUpdateParent(action, data) {
        switch (action) {
            case "updatemessageseen":
                if (this.contactlist.get(data.id.toLowerCase()) !== undefined) {
                    this.contactlist.get(data.id.toLowerCase()).unseenMessageCount = 0;
                    localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
                    this.setState({ dummy: Date.now() });
                }
                break;
        }
    }

    handleShowSearch(show) {
        if (show) {
            this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        }
        this.setState({ showsearch: show });
    }

    handleProfileSelect(e) {
        this.setState({ selectedperson: e })
    }

    handleProfileModalClose() {
        this.setState({ profiletoshow: null, showprofilemodal: false });
    }

    //handle profile menu item click
    handleProfileItemClick(e) {
        //should only move forward if there is memberid and there is some profileselect action provided
        if (e !== null && this.contactlist.get(e) !== undefined) {
            this.setState({ profiletoshow: this.contactlist.get(e).person, showprofilemodal: true });
        }
    }

    //handle search result item click
    handleResultItemClick(e) {
        this.setState({ selectedperson: null });
        if (this.state.loggedin) {
            //should only move forward if there is memberid and there is some profileselect action provided
            if (e !== null && this.contactlist.get(e) !== undefined) {
                this.setState({ selectedperson: this.contactlist.get(e).person, showsearch: false, showprofilemodal: false })
            }
        }
        else {
            alert("Please log in to gain full access.");
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        this.search();
    }

    //if user is not chating to receiver  at present than add received message to message list and increase unseen message count of the contact
    handleReceivedMessage(mi) {
        let usermsgs = localStorage.getItem(mi.sender.toLowerCase());
        let usermsgmap = null;
        if (usermsgs !== null)
            usermsgmap = new Map(JSON.parse(usermsgs));
        else
            usermsgmap = new Map();

        usermsgmap.set(mi.id, mi);
        localStorage.setItem(mi.sender.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries())));

        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
        this.setMessageStatus(mi.id, "SetReceived");
        if (this.contactlist.get(mi.sender.toLowerCase()) !== undefined) {

            if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
            } else {
                this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
            }
            localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist)));
            this.setState({ dummy: Date.now() });
        }

    }

    //the usual BS required for form fields to work in react
    handleChange(e) {
        switch (e.target.name) {
            case 'searchtext':
                if (e.target.value.trim() === "") {
                    this.contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                }
                this.setState({ searchtext: e.target.value });
                break;
            default:
        }
    }

    renderPeopleList() {
        const items = [];
        const hundred = { width: "100%" };
        var sortedcontacts = new Map([...this.contactlist.entries()].sort(this.compare_contact));
        for (const [key, contact] of sortedcontacts.entries()) {
            let obj = contact.person;
            if (this.state.myself === null || obj.id !== this.state.myself.id) {
                let thought = null;
                if (obj.thoughtStatus !== "") {
                    thought = <p className="card-text"><small>{obj.thoughtStatus}</small></p>
                }
                let online = <span className="offline"></span>;
                if (obj.activity !== 5) {
                    online = <span className="online"></span>;
                }
                let unseenmsgcount = contact.unseenMessageCount > 0 ? <span className="badge bg-primary">{contact.unseenMessageCount}</span> : null;
                let blocked = contact.boloRelation === BoloRelationType.Blocked ? <span className="badge bg-danger">Blocked</span> : null;
                let pic = obj.pic !== "" ? <img src={obj.pic} className="card-img" alt="" />
                    : null;

                items.push(<div className="col-12" key={key} >
                    <div className="card mb-1" style={{ maxWidth: "400px", cursor: "pointer" }} onClick={() => this.handleResultItemClick(obj.id)}>

                        <div className="card-body" style={{ position: "relative" }}>
                            <span style={{ maxWidth: "30px", display: "inline-block", float: "right" }} >{pic}</span>
                            <h5 className="card-title">{online} {obj.name} {unseenmsgcount} {blocked}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">{obj.city} {obj.state} {obj.country}</h6>
                            {thought}
                        </div>
                    </div>
                </div>);
            }
        }

        if (items.length > 0) {
            return <div className="row searchresult">{items}</div>;
        } else {
            return <div className="row justify-content-center">
                <div className="col-12">
                    <div className="alert alert-light" role="alert">
                        No profiles to show here.
                        <br />
                        Search for people based on their name, location, profession or gender etc.
                        Here are some examples of search phrases.
                        <ul>
                            <li>Raj Kiran Singh</li>
                            <li>Raj From India</li>
                            <li>Software Developer in Noida</li>
                            <li>Women in India</li>
                            <li>Men in India</li>
                            <li>Mumbai Maharashtra</li>
                            <li>Delhi Mumbai Kolkatta</li>
                        </ul>
                    </div>
                </div>
            </div>;
        }
    }

    render() {
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let personchatorprofile = null;
        if (this.state.selectedperson !== null /*&& !this.state.showsearch*/) {
            personchatorprofile = <PersonChat person={this.state.selectedperson} myself={this.state.myself} updateParent={this.handleUpdateParent} handleShowSearch={this.handleShowSearch} />
        }
        else if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personchatorprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={this.state.profiletoshow} />
                        </div>
                    </div>
                </div>
            </div>;
        }
        else {
            personchatorprofile = <HeartBeat activity="1" interval="3000" />;
        }

        let searchhtml = null;
        if (true || this.state.showsearch) {
            searchhtml = <div className="col-3 searchcont">
                <form onSubmit={this.handleSearchSubmit} className="searchform1 form-inline mt-1 mb-1">
                    <div className="input-group mb-1">
                        <input type="search" className="form-control" onChange={this.handleChange} title="Find People by Name, Location, Profession etc." name="searchtext" id="search-input" placeholder="Find People by Name, Location, Profession etc" aria-label="Search for..."
                            autoComplete="off" spellCheck="false" aria-describedby="button-addon2" />
                        <button className="btn" type="submit" id="button-addon2"><img src="/icons/search.svg" alt="" width="24" height="24" title="Search People" /></button>
                    </div>

                </form>
                {this.renderPeopleList()}
            </div>;
        }

        return (
            <React.Fragment>
                <NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} fixed={false} />
                <div className="container-fluid">
                    <div className="row">
                        {searchhtml}
                        {loading}
                        <div className="col-9 p-0">
                            {personchatorprofile}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
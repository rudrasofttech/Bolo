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
        if (this.state.searchtext !== "") {
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

                items.push(<div className="card mb-1" style={{ maxWidth: "400px", cursor: "pointer" }} onClick={() => this.handleResultItemClick(obj.id)}>
                        <div className="card-body p-1" style={{ position: "relative" }}>
                            <span style={{ maxWidth: "30px", display: "inline-block", float: "right" }} >{pic}</span>
                            <h5 className="card-title">{online} {obj.name} {unseenmsgcount} {blocked}</h5>
                            {thought}
                        </div>
                    </div>);
            }
        }

        if (items.length > 0) {
            return <div className="row searchresult p-1">{items}</div>;
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
            searchhtml = <div className="col-sm-4 col-md-3 searchcont bg-light">
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
                <div className="container">
                    <div className="row">
                        {searchhtml}
                        {loading}
                        <div className="col-sm-8 col-md-9 p-0">
                            {personchatorprofile}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

class PersonChat extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        let p = this.props.person;

        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: this.props.myself !== undefined ? this.props.myself : null, bsstyle: '', message: '', person: p, filestoupload: [],
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"), textinput: '', dummy: Date.now(),
            videoCapable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            peerCapable: SimplePeer.WEBRTC_SUPPORT, videoplaying: false, audioplaying: false, showemojimodal: false, peerconnected: false,
            profiletoshow: null, showprofilemodal: false
        };
        this.mystream = null;
        this.otherstream = null;
        this.peer = null;
        this.checkPersonPulseInterval = null;
        this.messages = (localStorage.getItem(p.id) !== null) ? new Map(JSON.parse(localStorage.getItem(p.id))) : new Map();
        this.hubConnection = null;
        this.freader = new FileReader();
        this.handleChange = this.handleChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.startHub = this.startHub.bind(this);
        this.createPeer = this.createPeer.bind(this);
        this.onPeerSignal = this.onPeerSignal.bind(this);
        this.onPeerConnect = this.onPeerConnect.bind(this);
        this.onPeerClose = this.onPeerClose.bind(this);
        this.onPeerError = this.onPeerError.bind(this);
        this.onPeerStream = this.onPeerStream.bind(this);
        this.handleVideoToggle = this.handleVideoToggle.bind(this);
        this.handleAudioToggle = this.handleAudioToggle.bind(this);
        this.getUserCam = this.getUserCam.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.sayHello = this.sayHello.bind(this);
        this.answerHello = this.answerHello.bind(this);
        this.saysHello = this.saysHello.bind(this);
        this.updateReceivedMessageStatusAll = this.updateReceivedMessageStatusAll.bind(this);
        this.handleVideoCancel = this.handleVideoCancel.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
        this.handleEmojiModal = this.handleEmojiModal.bind(this);
        this.handleEmojiSelect = this.handleEmojiSelect.bind(this);
        this.handlePhotoClick = this.handlePhotoClick.bind(this);
        this.handleDocClick = this.handleDocClick.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleFileChunkUpload = this.handleFileChunkUpload.bind(this);
        this.processFileUpload = this.processFileUpload.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.checkPersonPulse = this.checkPersonPulse.bind(this);
        this.attachMyStreamToVideo = this.attachMyStreamToVideo.bind(this);
        this.attachOtherStreamToVideo = this.attachOtherStreamToVideo.bind(this);
        this.hubConnectionClosed = this.hubConnectionClosed.bind(this);
        this.hubConnectionReconnecting = this.hubConnectionReconnecting.bind(this);
        this.hubConnectionReconnected = this.hubConnectionReconnected.bind(this);
        this.handleProfileModalClose = this.handleProfileModalClose.bind(this);
        this.handleProfileImageClick = this.handleProfileImageClick.bind(this);
        this.deleteMyMessagesFromServer = this.deleteMyMessagesFromServer.bind(this);
        this.updateTextInputHeight = this.updateTextInputHeight.bind(this);
        this.fetchSentMessages = this.fetchSentMessages.bind(this);
        this.setMessageStatus = this.setMessageStatus.bind(this);
        this.setContactRelation = this.setContactRelation.bind(this);
        this.handleAddToContacts = this.handleAddToContacts.bind(this);
        this.handleBlockandRemove = this.handleBlockandRemove.bind(this);
        this.messageStatusEnum = {
            Pending: 0,
            Sent: 1,
            Received: 2,
            Seen: 3
        }
    }

    hubConnectionClosed(err) {
        console.log("Hub connection is closed");

        //this.hubConnection.start().then(() => {
        //    console.log('Hub Connection started!');
        //    //join meeting room
        //    //this.sayHello();
        //}).catch(err => console.log('Error while establishing connection :('));
    }

    hubConnectionReconnecting(err) {
        console.log("Hub connection is reconnecting");
    }

    hubConnectionReconnected(connectionid) {
        console.log("Hub Connection Reconnected, Check for sent messages on server");
        this.fetchSentMessages();
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
                    let contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ?
                        new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    if (contactlist.get(this.state.person.id) !== undefined) {
                        contactlist.get(this.state.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    }

                    if (data.boloRelation === BoloRelationType.Blocked) {
                        try {
                            this.props.handleShowSearch(true);
                        } catch (err) {
                            console.log("Error in blocking and removing contact. " + err);
                        }
                    }
                });
            }
        });
    }

    //
    //Function fetches sent messages from server
    //can be called when signarl hub reconnects or the component is loaded for first time
    //
    fetchSentMessages() {
        fetch('//' + window.location.host + '/api/ChatMessages/SentMessages?sender=' + this.state.person.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    for (var k in data) {
                        if (!this.messages.has(data[k].id)) {
                            var temp = data[k];
                            var mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: this.messageStatusEnum.Received };
                            this.messages.set(mi.id, mi);
                            //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, this.state.myself.id, this.messageStatusEnum.Received)
                            //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({ dummy: Date.now() }, () => {
                        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                    });
                });
            }
        });
    }

    fetchMessages() {
        fetch('//' + window.location.host + '/api/ChatMessages?sender=' + this.state.person.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    this.messages = new Map();
                    for (var k in data) {
                        var temp = data[k];
                        var mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: this.messageStatusEnum.Received };
                        this.messages.set(mi.id, mi);
                        if (temp.status != this.messageStatusEnum.Received) {
                            this.setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    this.setState({ dummy: Date.now() }, () => {
                        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                        this.scrollToBottom();

                    });
                    this.updateReceivedMessageStatusAll();
                });
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

    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //send a hello
            this.sayHello();
        }).catch(err => console.log('Error while establishing connection :('));

        this.hubConnection.onclose(this.hubConnectionClosed);

        this.hubConnection.onreconnecting(this.hubConnectionReconnecting);

        this.hubConnection.onreconnected(this.hubConnectionReconnected);

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            this.receiveTextMessage(sender, text, timestamp, id);
        });

        this.hubConnection.on('MessageSent', (receiver, text, timestamp, id) => {
            var mi = { id: id, sender: this.state.myself.id, text: text, timestamp: timestamp, status: this.messageStatusEnum.Sent };
            //try to add sent message to current message list
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase()) {
                this.messages.set(id, mi);
                this.setState({ dummy: Date.now() }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
                this.scrollToBottom();
            }

        });

        this.hubConnection.on('MessageStatus', (messageid, receiver, status) => {
            if (receiver.toLowerCase() === this.state.person.id.toLowerCase() && this.messages.get(messageid) !== undefined) {
                this.messages.get(messageid).status = status;
                this.setState({ dummy: Date.now() }, () => {
                    localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                });
            }
        });

        this.hubConnection.on('ContactSaved', (cdto) => {
            let contactmap = new Map();
            if (localStorage.getItem("contacts") !== null) {
                contactmap = new Map(JSON.parse(localStorage.getItem("contacts")));
            }
            contactmap.set(cdto.person.id, cdto);
            localStorage.setItem("contacts", JSON.stringify(Array.from(contactmap)));
        });

        //this function is strictly call by server to transfer webrtc peer data
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            //console.log("receivesignal sender : " + sender);
            //console.log("receivesignal data : " + data);
            if (this.peer !== null) {
                this.peer.signal(data);
            }
        });

        this.hubConnection.on('SaysHello', (caller) => {
            console.log("SaysHello By : " + caller);
            this.saysHello(caller);
        });

        this.hubConnection.on('AnswerHello', (responder) => {
            console.log("Call Answered By : " + responder);
            this.answerHello(responder);
        });

        this.hubConnection.on('EndPeer', (id) => {
            if (this.state.person.id.toLowerCase() === id.toLowerCase()) {
                if (this.peer !== null) {
                    this.peer.destroy();
                    this.peer = null;
                    console.log("EndPeer By : " + id);
                }
            }
        });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ContactUpdated', (dto) => {
            if (this.state.person.id === dto.id) {
                this.setState({ person: dto });
            }
        });
    }

    receiveTextMessage(sender, text, timestamp, id) {
        var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: this.messageStatusEnum.Seen };
        //if received message is from current person then show in ui else save in localstorage
        if (sender.toLowerCase() === this.state.person.id.toLowerCase()) {
            this.messages.set(id, mi);
            this.setState({ dummy: Date.now() }, () => {

                localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
            });

            this.scrollToBottom();
            this.props.updateParent("updatemessageseen", { id: sender });
            this.playmsgbeep();

            this.setMessageStatus(mi.id, "SetSeen");

        }
    }

    //say hello when hub connection is established, this will begin a handshake which will
    //eventually lead to rtc peer connection
    sayHello() {
        this.hubConnection.invoke("sayHello", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => { console.log("Unable to say hello."); console.error(err); })
    }

    //catch the hello other user sent and answer it.
    //main purpose of this function is to notify that your are here to 
    //receive peer connection
    saysHello(caller) {
        if (caller.toLowerCase() === this.state.person.id.toLowerCase()) {
            this.createPeer(true);
            //answer hello by provided your id
            this.hubConnection.invoke("AnswerHello", caller, this.state.myself.id.toLowerCase());
        }
    }

    answerHello(responder) {
        //check if answer to your hello came from the person your are chating at present
        if (this.state.person.id === responder.toLowerCase()) {

            //try create a peer connection
            this.createPeer(false);
        }
    }

    sendTextMessage(text, sendto) {
        if (text.trim() !== "") {
            //this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, this.state.textinput)
            //    .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            const fd = new FormData();
            fd.set("Text", text);
            fd.set("SentTo", sendto);
            fd.set("PublicID", "00000000-0000-0000-0000-000000000000");
            fetch('//' + window.location.host + '/api/ChatMessages', {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        //if token is not valid than remove token, set myself object with empty values
                        localStorage.removeItem("token");
                        this.setState({ loggedin: false, loading: false });
                    } else if (response.status === 200) {
                        response.json().then(data => {
                            //if message is successfully saved in database then you will have id here 
                            console.log(data);
                            var mi = { id: data.id, sender: this.state.myself.id, text: data.message, timestamp: data.sentDate, status: this.messageStatusEnum.Sent };
                            //try to add sent message to current message list
                            this.messages.set(mi.id, mi);
                            this.setState({ dummy: Date.now() }, () => {
                                localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
                                this.updateTextInputHeight();
                            });
                            this.scrollToBottom();
                        });

                    } else {
                        this.setState({ loading: false, message: 'Unable to send message', bsstyle: 'danger' });
                    }
                });

            if (this.detectXtralargeScreen()) {
                this.textinput.focus();
            }

        }
    }

    //function checks if person has not send pulse for last 5 seconds then deem person offline
    checkPersonPulse() {
        var dt = new Date(this.state.person.lastPulse);
        dt.setSeconds(dt.getSeconds() + 5);
        if (dt < Date.now()) {
            let p = this.state.person;
            p.activity = 5;
            this.setState({ person: p })
        }
    }

    detectEdgeorIE() {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        return (isIE || isEdge);
    }

    detectXtralargeScreen() {
        return window.matchMedia("(min-width: 1024px)").matches;
    }

    createPeer(initiater) {
        //RTC Peer configuration
        let configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        if (window.location.hostname.toLowerCase() === "localhost") {
            configuration = {};
        }
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        this.peer = new SimplePeer({ initiator: initiater, config: configuration, stream: this.mystream });
        //this.peer["cid"] = u.connectionID;
        //this.peer["hubConnection"] = this.hubConnection;
        //this.peer["myself"] = this.myself;

        //set peer event handlers
        this.peer.on("error", this.onPeerError);
        this.peer.on("signal", this.onPeerSignal);
        this.peer.on("connect", this.onPeerConnect);
        this.peer.on("close", this.onPeerClose);
        this.peer.on("stream", stream => { this.onPeerStream(stream); });
        this.peer.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data)
        });
    }

    /**
     * Simple Peer events
     * 
     */
    onPeerSignal(data) {
        this.hubConnection
            .invoke('SendSignal', data, this.state.person.id, this.state.myself.id)
            .catch(err => console.error('SendSignal ' + err));
    }

    onPeerConnect() {
        this.peer.send(this.state.myself.name + ' peer connected.');
    }

    onPeerError(err) {
        console.log(this.state.person.name + " peer gave error. ");
        console.error(err);
    }

    onPeerClose() {
        console.log("Peer Closed");
        this.hubConnection.invoke("EndPeer", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => console.error('Endpeer ' + err));
    }

    onPeerStream(stream) {
        console.log("received a stream"); console.log(stream);
        this.otherstream = stream;
        //update state so that UI changes
        this.setState({ dummydate: Date.now() }, () => {
            let v = document.getElementById('othervideo');
            if (v !== null) {
                if ('srcObject' in v) {
                    v.srcObject = this.otherstream
                } else {
                    v.src = window.URL.createObjectURL(this.otherstream) // for older browsers
                }
                v.muted = false;
                v.volume = 0.8;
                v.play();
            }
        });
    }
    //simple peer events end here

    playmsgbeep() {
        try {
            let cb = document.getElementById("chatbeep");
            if (cb != null) {
                cb.currentTime = 0;
                cb.volume = 0.15;
                //we have to unmute the audio since it  is muted at time of loading
                cb.muted = false;
                cb.play();
            }
        } catch (err) {
            console.error(err);
        }
    }

    //call this function to gain access to camera and microphone
    getUserCam() {
        //config 
        var videoconst = true;
        //if (window.matchMedia("(max-width: 414px) and (orientation: portrait)").matches) {
        //    videoconst = {
        //        width: {
        //            min: 375
        //        },
        //        height: {
        //            min: 740
        //        }
        //    };
        //}
        var constraints = {
            audio: true, video: videoconst
        };
        //simple feature avialability check
        if (navigator.mediaDevices.getUserMedia) {
            //try to gain access and then take appropriate action
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(this.addMedia)
                .catch(this.userMediaError); // always check for errors at the end.
        }
    }

    //assign media stream received from getusermedia to my video 
    addMedia(stream) {
        //save stream in global variable 
        this.mystream = stream;
        //update state so that myvideo element can be added to dom and then manipulated
        this.setState({ dummydate: new Date() }, () => {
            this.attachMyStreamToVideo();
        });

        //based on initial state enable or disable video and audio
        //initially video will be disabled or micrphone will broadcast
        if (this.mystream.getVideoTracks().length > 0) {
            this.mystream.getVideoTracks()[0].enabled = this.state.videoplaying;
        }
        if (this.mystream.getAudioTracks().length > 0) {
            this.mystream.getAudioTracks()[0].enabled = this.state.audioplaying;
        }

        //set stream to all existing peers
        if (this.peer !== null) {
            this.peer.addStream(this.mystream);
        }
    }

    attachMyStreamToVideo() {
        if (this.state.videoplaying || this.state.audioplaying) {
            var video = document.getElementById('myvideo');
            if (video !== null) {
                video.srcObject = this.mystream;
                //only play when meta data is loaded from stream
                video.onloadedmetadata = function (e) {
                    if (video !== undefined) {
                        //provision to reduce echoe
                        //mute the self video
                        video.volume = 0;
                        video.muted = 0;

                        //start playing the video
                        video.play();
                    }
                };
            }
        }
    }

    attachOtherStreamToVideo() {
        var video = document.getElementById('othervideo');
        if (video !== null) {
            video.srcObject = this.otherstream;
            //only play when meta data is loaded from stream
            video.onloadedmetadata = function (e) {
                if (video !== undefined) {
                    //provision to reduce echoe
                    //mute the self video
                    video.volume = 0;
                    video.muted = 0;

                    //start playing the video
                    video.play();
                }
            };
        }
    }

    //handle error when trying to get usermedia. This may be raised when user does not allow access to camera and microphone
    userMediaError(err) {
        console.log("Unable to access user media");
        console.error(err);
        if (err.name !== undefined && err.name !== null) {
            if (err.name.toLowerCase() === "notallowederror") {
                alert("You have specifically denied access to camera and microphone. Please check browser title or address bar to see the notification.");
            } else {
                alert("Unable to access camera.");
            }
        }
        this.setState({ videoplaying: false, audioplaying: false });
        //dont know if user should be updated or not
        //this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
    }

    closeVideo() {
        if (this.mystream !== null) {
            //const tracks = this.mystream.getTracks()
            //for(var i = 0; i < tracks.length; i++) {
            //    tracks[i].stop();
            //}
        }
    }

    showMessageStatus(status) {
        switch (status) {
            case this.messageStatusEnum.Received:
                return "Received";
            case this.messageStatusEnum.Sent:
                return "Sent"
            case this.messageStatusEnum.Seen:
                //return "Received";
                return "Seen";
            default:
                return "";
        }
    }

    //function only update message status of any messages from the sender with sent status to received in localstorage
    //it will be responsbility of sender to get updated status from received
    updateReceivedMessageStatusAll() {
        for (const [key, mi] of this.messages.entries()) {
            if (mi.sender !== this.state.myself.id && mi.status !== this.messageStatusEnum.Seen) {
                this.messages.get(key).status = this.messageStatusEnum.Seen;
                this.setMessageStatus(mi.id, "SetSeen");
            }
        }
        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
    }

    deleteMyMessagesFromServer() {
        fetch('//' + window.location.host + '/api/chatmessages/MemberMessages/' + this.state.person.id, {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {
                console.log("messages deleted from server");
            }
        });
    }

    processFileUpload() {
        let m = null;
        if (this.state.filestoupload.length > 0) {
            m = this.state.filestoupload[0];
        }


        if (m !== null) {
            this.freader = new FileReader();
            this.freader.uploadFile = this.uploadFile;
            this.uploadFile(this.state.id, m, 0);
        }
    }

    uploadFile(meetingid, msg, start) {
        const slice_size = 1000 * 1024;
        var next_slice = start + slice_size + 1;
        var blob = msg.filedata.slice(start, next_slice);
        var mid = meetingid;
        this.freader.onloadend = event => {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }
            this.handleFileChunkUpload(event.target.result, msg, start, next_slice, slice_size);
        };

        this.freader.readAsDataURL(blob);
    }

    updateTextInputHeight() {
        if (this.state.textinput !== "") {
            // Reset field height
            //this.textinput.style.height = 'inherit';

            // Get the computed styles for the element
            const computed = window.getComputedStyle(this.textinput);

            // Calculate the height
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + this.textinput.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

            //this.textinput.style.height = `${height}px`;

            this.textinput.style.height = `${this.textinput.scrollHeight}px`;
        } else {
            this.textinput.style.height = "40px";
            this.textinput.style.minHeight = "40px";
        }
    }

    handleFileChunkUpload(data, msg, start, next_slice, slice_size) {

        const fd = new FormData();
        fd.set("f", data);
        fd.set("filename", msg.name);
        fd.set("gfn", false);
        //no need to change file name on server
        //fd.set("filename", start === 0 ? msg.name : msg.serverfname);
        //fd.set("gfn", start === 0 ? true : false);
        fetch('//' + window.location.host + '/api/members/uploadfile', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        }).then(response => {
            if (response.status === 200) {

                response.json().then(data => {
                    msg.serverfname = data.filename;
                    let flist = this.state.filestoupload;
                    for (var i = 0; flist.length > i; i++) {
                        let cfile = flist[i];
                        if (cfile.name === msg.name) {
                            var size_done = start + slice_size;
                            msg.progresspercent = Math.floor((size_done / msg.filedata.size) * 100);
                            cfile.progresspercent = msg.progresspercent;
                            if (next_slice > msg.filedata.size) {
                                flist.splice(i, 1);
                                msg.filedata = null;
                                //this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, 'https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname)
                                //    .catch(err => { console.log("Unable to send file to other person."); console.error(err); });
                                this.sendTextMessage('https://' + window.location.host + '/data/' + this.state.myself.id + '/' + msg.serverfname, this.state.person.id);
                                this.setState({ filestoupload: flist });
                                this.generateVideoThumbnail(msg.serverfname);

                                this.processFileUpload();
                            } else {
                                this.setState({ filestoupload: flist });
                                //if there is more to file than call upload file again
                                this.uploadFile(this.state.id, msg, next_slice);
                            }
                            break;
                        }
                    }
                });

            }
        });
    }

    generateVideoThumbnail(filename) {
        fetch('//' + window.location.host + '/api/members/GenerateThumbnail?filename=' + filename, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
    }

    handlePhotoClick(e) {
        e.preventDefault();
        if (!this.state.loggedin) {
            alert("Log in to use this feature. Share files upto 300 MB in size.");
        } else {
            this.fileinput.click();
        }
    }

    handleDocClick(e) {
        e.preventDefault();
        if (!this.state.loggedin) {
            alert("Log in to use this feature. Share files upto 300 MB in size.");
        } else {
            this.fileinput.click();
        }
    }

    handleFileUploadCancel(event, fname) {
        //remove the targeted file
        let flist = this.state.filestoupload;
        for (var i = 0; flist.length > i; i++) {
            let cfile = flist[i];
            if (cfile.name === fname) {
                flist.splice(i, 1);
                //cfile.cancel = true;
                this.setState({ filestoupload: flist });
                break;
            }
        }
    }

    handleFileInput(e) {

        //alert("Soon you will be able to share files.");
        //return;
        if (this.fileinput.files.length > 10) {
            alert("Only 10 files at a time.");
            return;
        }
        for (var i = 0; i < this.fileinput.files.length; i++) {
            if ((this.fileinput.files[i].size / 1048576).toFixed(1) > 300) {
                alert("File size cannot exceed 300 MB");
                return;
            }
        }

        let flist = this.state.filestoupload;
        for (var i = 0; i < this.fileinput.files.length; i++) {
            let f = { name: this.fileinput.files[i].name, filedata: this.fileinput.files[i], progresspercent: 0, serverfname: "", cancel: false };
            flist.push(f);
        }
        this.setState({ filestoupload: flist });

        this.fileinput.value = "";
        this.processFileUpload();
    }

    handleEmojiSelect(value) {
        this.setState({
            textinput: this.state.textinput + value
        });

        this.textinput.focus();
    }

    handleEmojiModal() {
        this.setState({ showemojimodal: !this.state.showemojimodal });
    }

    handleVideoCancel() {
        this.closeVideo();
        this.hubConnection.invoke("EndCall", this.state.myself.id.toLowerCase(), this.state.person.id.toLowerCase())
            .catch(err => { console.log("Unable to end call."); console.error(err); })
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({
                    textinput: e.target.value
                }, () => { this.updateTextInputHeight(); });

                break;
            default:
        }
    }

    handleSend(e) {
        e.preventDefault();
        this.sendTextMessage(this.state.textinput, this.state.person.id);
        this.setState({ textinput: '' });
    }

    //enable or disable video track of my stream
    handleVideoToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getVideoTracks().length > 0) {
                this.mystream.getVideoTracks()[0].enabled = !this.state.videoplaying;
                this.setState({ videoplaying: !this.state.videoplaying }, () => { this.attachMyStreamToVideo(); });
            }
        } else {
            this.setState({ videoplaying: true, audioplaying: true });
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();

        }
    }
    //enable or disable audio track of my stream
    handleAudioToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getAudioTracks().length > 0) {
                this.mystream.getAudioTracks()[0].enabled = !this.state.audioplaying;
                this.setState({ audioplaying: !this.state.audioplaying }, () => { this.attachMyStreamToVideo(); });
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();
            this.setState({ audioplaying: true });
        }
    }

    scrollToBottom = () => {

        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView();
        }
    }

    handleProfileModalClose() {
        this.setState({ profiletoshow: null, showprofilemodal: false });
    }

    //handle search result item click
    handleProfileImageClick(e) {
        this.setState({ profiletoshow: this.state.person, showprofilemodal: true });
    }

    handleContactRelationshipChange(e) {

    }

    handleAddToContacts() {
        this.setContactRelation(BoloRelationType.Confirmed);
    }

    handleBlockandRemove() {
        this.setContactRelation(BoloRelationType.Blocked);
    }

    componentDidMount() {
        //

        this.fetchMessages();

        this.startHub();

        //this.deleteMyMessagesFromServer();
        this.checkPersonPulseInterval = setInterval(this.checkPersonPulse, 5000);
        //set unseenmessage count of person to zero and save
        let clist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (clist.get(this.state.person.id.toLowerCase()) !== undefined) {
            clist.get(this.state.person.id.toLowerCase()).unseenMessageCount = 0;
        }
        localStorage.setItem("contacts", JSON.stringify(Array.from(clist)));
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log("componentDidUpdate");
        if (prevProps.person.id !== this.props.person.id) {
            this.messages = (localStorage.getItem(this.props.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(this.props.person.id))) : new Map();
            this.setState({ dummy: Date.now(), person: this.props.person }, () => {

                this.fetchMessages();

                this.updateReceivedMessageStatusAll()
            });
            this.props.updateParent("updatemessageseen", { id: this.props.person.id });
            //each time compoment updates scroll to bottom
            //this can be improved by identifying if new messages added
            this.scrollToBottom();
        }

    }

    componentWillUnmount() {

        //destroy peer and signalr connection since the component will unmount
        if (this.peer !== null) {
            this.peer.destroy();
            this.peer = null;
        }
        this.hubConnection.stop();
        if (this.checkPersonPulseInterval !== null) {
            clearInterval(this.checkPersonPulseInterval);
        }
    }

    getFileExtensionBasedName(filename) {
        return filename.substring(61, filename.length);
    }

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <tr><td colSpan="2"><Emoji onSelect={this.handleEmojiSelect} /></td></tr>;
        } else {
            return null;
        }
    }

    renderVideoCallModal() {
        return <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <h4>Waiting For {this.state.person.name}</h4>
                        <button type="button" className="btn btn-danger btn-lg" onClick={this.handleVideoCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>;
    }

    renderLinksInMessage(msg) {
        var tempmid = msg.id;
        if (msg.text.startsWith('https://' + window.location.host + '/data/')) {
            if (msg.text.toLowerCase().endsWith(".jpg") || msg.text.toLowerCase().endsWith(".jpeg") || msg.text.toLowerCase().endsWith(".png") || msg.text.toLowerCase().endsWith(".gif") || msg.text.toLowerCase().endsWith(".bmp")) {
                return <span id={tempmid}>
                    <img src={msg.text} className='img-fluid' style={{ maxWidth: "260px" }} />
                </span>;
            }
            else if (msg.text.toLowerCase().endsWith(".mp3")) {
                return <span id={tempmid}>
                    <audio src={msg.text} controls playsInline style={{ maxWidth: "260px" }} />
                </span>;
            }
            else if (msg.text.toLowerCase().endsWith(".ogg") || msg.text.toLowerCase().endsWith(".mp4") || msg.text.toLowerCase().endsWith(".webm") || msg.text.toLowerCase().endsWith(".mov")) {
                return <span id={tempmid}>
                    <video src={msg.text.toLowerCase()} controls playsInline style={{ maxWidth: "260px" }} />
                </span>;
            }
            else {
                return <span id={tempmid}>
                    <a href={msg.text} target="_blank">
                        {this.getFileExtensionBasedName(msg.text.toLowerCase())}
                    </a>
                </span>;
            }
        }
        else if ((msg.text.startsWith('https://') || msg.text.startsWith('http://')) && msg.text.trim().indexOf(" ") === -1) {
            return <span id={tempmid}>
                <a href={msg.text.trim()} target="_blank">
                    {msg.text}
                </a>
            </span>;
        }
        else {
            return <span id={tempmid}>{msg.text.split('\n').map((item, key) => {
                return <React.Fragment key={key}>{item}<br /></React.Fragment>
            })}</span>
        }
    }

    renderContactRelationChange() {
        let html = null;
        let contactlist = (localStorage.getItem("contacts") !== null && this.state.loggedin) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        let style = {
            margin: "0 auto", maxWidth: "80%", width: "25rem", padding: "15px"
        };
        if (contactlist.get(this.state.person.id) !== undefined) {
            if (contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Temporary) {
                html = <li style={style} >
                    <div className="card bg-light mb-3">
                        <div className="card-header">New Contact</div>
                        <div className="card-body">
                            <h5 className="card-title">Take Action Here</h5>
                            <p className="card-text">This person is not your contact list.</p>
                            <button className="btn btn-success me-2" onClick={this.handleAddToContacts}>Add to Contacts</button>
                            <button className="btn btn-outline-dark" onClick={this.handleBlockandRemove}>Block and Remove</button>
                        </div>
                    </div>
                </li>;
            }
        }

        return html;
    }

    renderMessages() {
        let sentlistyle = { display: "block", textAlign: 'right' };
        let reclistyle = { display: "block", textAlign: 'left' };
        let sentmessagestyle = {
            marginBottom: "1px", maxWidth: "100%", position: "relative",

            fontSize: "1.2rem",
            //border: "none",
            borderRadius: "0rem",
            //color: "#000",
            //backgroundColor: "#DBF4FD",
            wordWrap: "break-word"
        };
        let recmessagestyle = {
            marginBottom: "1px", maxWidth: "100%", position: "relative",
            //border: "none",
            borderRadius: "0rem",
            fontSize: "1.2rem",
            //color: "#000",
            //backgroundColor: "#F2F6F9",
            wordWrap: "break-word"
        };
        const items = [];
        for (const [key, obj] of this.messages.entries()) {
            if (obj.sender === this.state.myself.id) {
                items.push(<li style={sentlistyle} key={key}>
                    <div style={sentmessagestyle} className="border-end border-5 border-primary m-1 pe-3 py-2">
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment.utc(obj.timestamp).local().fromNow(true)}</small> <small style={{ fontSize: "0.75rem" }}>{this.showMessageStatus(obj.status)}</small></span>
                    </div>
                </li>);
            } else {
                items.push(<li style={reclistyle} key={key}>
                    <div style={recmessagestyle} className="border-start border-5 border-success m-1 ps-3 py-2">
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment.utc(obj.timestamp).local().fromNow(true)}</small></span>
                    </div>
                </li>);
            }
        }

        return <React.Fragment>
            {items}
            {this.renderContactRelationChange()}
            <li style={{ float: "left", clear: "both" }}
                ref={(el) => { this.messagesEnd = el; }}>
            </li>
        </React.Fragment>;
    }

    renderVideo() {
        let myvideoclassname = "full";
        let othervideo = null, myvideo = null;
        let hasstream = false;
        if (this.otherstream !== null) {
            for (var i = 0; i < this.otherstream.getTracks().length; i++) {
                if (this.otherstream.getTracks()[i].enabled) {
                    hasstream = true;
                    break;
                }
            }
            if (hasstream) {
                myvideoclassname = "docked";
                othervideo = <video id="othervideo" muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight: "70vh" }}></video>;
            }
        }
        if (this.mystream !== null) {
            hasstream = false;
            for (var i = 0; i < this.mystream.getTracks().length; i++) {
                if (this.mystream.getTracks()[i].enabled) {
                    hasstream = true;
                    break;
                }
            }
            if (hasstream) {
                myvideo = <video id="myvideo" className={myvideoclassname} muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight: "70vh" }}></video>;
            }
        }

        if (othervideo !== null || myvideo !== null) {
            return <div className="col col-sm-7 videochatcolumn" style={{ padding: "0px 5px", textAlign: "center" }}>
                {othervideo}
                {myvideo}
            </div>;
        } else {
            return null;
        }
    }

    renderFileUploadProcessModal() {
        let items = [];
        for (var i = 0; i < this.state.filestoupload.length; i++) {
            let f = this.state.filestoupload[i];
            items.push(
                <div className="row" key={i}>
                    <div className="col-9 col-xl-10 col-sm-10">
                        <div className="progress">
                            <div className="progress-bar progress-bar-animated" role="progressbar" aria-valuenow={f.progresspercent} aria-valuemin="0" aria-valuemax="100" style={{ width: f.progresspercent + "%" }}></div>
                        </div>
                    </div>
                    <div className="col-3 col-xl-2 col-sm-2"><button type="button" className="btn btn-sm btn-light" onClick={(e) => this.handleFileUploadCancel(e, f.name)}>Cancel</button></div>
                </div>
            );
        }
        if (this.state.filestoupload.length > 0) {
            return (
                <React.Fragment>
                    <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    {items}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        } else {
            return null;
        }
    }

    render() {
        if (this.messages.length == 0) { profile = <ViewProfile profile={this.state.person} />; }
        let pic = <img src="/images/nopic.jpg" className="mx-auto d-block img-fluid" alt="No Pic" style={{ cursor: "pointer" }} onClick={this.handleProfileImageClick} />;
        if (this.state.person !== null) {
            if (this.state.person.pic !== "") {
                pic = <img src={this.state.person.pic} className="mx-auto d-block img-fluid" alt="" style={{ cursor: "pointer" }} onClick={this.handleProfileImageClick} />;
            }
        }

        let personprofile = null;
        if (this.state.profiletoshow !== null && this.state.showprofilemodal) {
            personprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={this.state.person} />
                        </div>
                    </div>
                </div>
            </div>;
        }

        let videotoggleele = this.state.videoplaying ? <button type="button" className="btn btn-sm btn-primary ms-1 me-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video On" />
        </button> : <button type="button" className="btn btn-secondary btn-sm ms-1 me-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video Off" />
        </button>;
        let audiotoggleele = this.state.audioplaying ?
            <button type="button" className="btn btn-primary btn-sm ms-1 me-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()}>
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone On" />
            </button>
            : <button type="button" className="btn btn-secondary btn-sm ms-1 me-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()} >
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone Off" />
            </button>;
        //if browser is edge or ie no need to show video or audio control button
        if (this.detectEdgeorIE()) {
            audiotoggleele = null;
            videotoggleele = null;
        }
        let online = <span className="offline"></span>;
        if (this.state.person.activity !== 5) {
            online = <span className="online"></span>;
        }
        let videohtml = this.renderVideo();
        let chatmsgcontstyle = {};
        if (videohtml === null && this.detectXtralargeScreen()) {
            chatmsgcontstyle = { padding: "0px" };
        }
        return (
            <React.Fragment>
                <div className="personalchatcont">
                    <table className="chatpersoninfocont sticky-top">
                        <tbody>
                            <tr>
                                <td width="40px" className="p-1">
                                    {pic}
                                </td>
                                <td className="noPadding">
                                    <h5 className="ml-1" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={this.state.person.name}>{online} {this.state.person.name}</h5>
                                </td>
                                <td width="50px" style={{ paddingRight: "10px" }}>
                                    <BlockContact myself={this.state.myself} person={this.state.person} onRelationshipChange={this.handleContactRelationshipChange} />
                                </td>
                                <td width="37px">
                                    {videotoggleele}
                                </td><td width="37px">
                                    {audiotoggleele}
                                </td>

                            </tr>
                        </tbody>
                    </table>
                    <div className="videochatcont ">

                        {videohtml}
                        <div className="chatmsgcont" style={chatmsgcontstyle}>
                            <ul className="list-unstyled">{this.renderMessages()}</ul>
                        </div>

                    </div>
                    <div style={{ position: "absolute", bottom: "0px", width: "100%" }}>
                        <form onSubmit={this.handleSend}>
                            <table style={{ "width": "100%", backgroundColor: "#fff" }}>
                                <tbody>
                                    <tr>
                                        <td style={{
                                            width: "37px", paddingLeft: "5px"
                                        }}>
                                            <div className="dropdown">
                                                <a className="btn btn-light btn-sm dropdown-toggle" href="#" role="button" id="navbarDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <img src="/icons/file-plus.svg" alt="" width="24" height="24" title="Share Files" />
                                                </a>
                                                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                                    <li>
                                                        <a className="dropdown-item" href="#" onClick={this.handlePhotoClick} title="20 Files at a time, max files size 10 MB">Photos and Videos</a>
                                                    </li>
                                                    <li><a className="dropdown-item" href="#" onClick={this.handleDocClick} title="20 Files at a time, max files size 10 MB">Documents</a>
                                                        <input type="file" style={{ display: "none" }} ref={(el) => { this.fileinput = el; }} accept=".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*" onChange={this.handleFileInput} multiple="multiple" />
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                        <td >
                                            <textarea ref={(input) => { this.textinput = input; }} name="textinput" autoComplete="off" accessKey="t" title="Keyboard Shortcut ALT + t"
                                                className="form-control" value={this.state.textinput} onChange={this.handleChange} width="100%"
                                                style={{ height: "40px", overflow: "hidden", resize: "none", maxHeight: "200px" }}></textarea>
                                        </td><td style={{ "width": "100px" }}>
                                            <button type="button" className={this.state.showemojimodal ? "btn btn-sm btn-warning ms-1" : "btn btn-sm btn-light ms-1"} onClick={this.handleEmojiModal} accessKey="o" title="Keyboard Shortcut ALT + o" ><img src="/icons/smile.svg" alt="" width="24" height="24" /></button>
                                            <button type="submit" id="msgsubmit" className="btn btn-sm btn-dark ms-1" title="Send Message" title="Keyboard Shortcut ALT + s" accessKey="s"><img src="/icons/send.svg" alt="" width="24" height="24" /></button>
                                        </td>
                                    </tr>
                                    {this.renderEmojiModal()}
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>
                {personprofile}
                {this.renderFileUploadProcessModal()}
                <audio id="chatbeep" muted="muted" volume="0">
                    <source src="/media/swiftly.mp3"></source>
                    <source src="/media/swiftly.m4r"></source>
                    <source src="/media/swiftly.ogg"></source>
                </audio>
                <HeartBeat activity="4" interval="3000" />
            </React.Fragment >
        );
    }
}

class UserInfo {
    //this guid used by bolo to publicly identify a user
    memberID;
    //this is connection id generated by signalr
    connectionID;
    //name of the user its provided by user.
    name;
    lastpulse;
    //has video capability
    videoCapable;
    //has rtcpeer capability
    peerCapable;
    stream;
    pic;
    bio;

    constructor() {
        this.memberID = "00000000-0000-0000-0000-000000000000";
        this.connectionID = "";
        this.name = "";
        this.lastpulse = Date.now();
        this.videoCapable = true;
        this.peerCapable = true;
        this.stream = null;
        this.pic = "";
    }

    isAlive() {
        var dt = new Date(this.lastpulse);
        dt.setSeconds(dt.getSeconds() + 40);

        if (dt < Date.now()) {
            return false;
        } else {
            return true;
        }
    }
}

var MessageEnum = {
    Text: 1,
    MemberAdd: 2,
    MemberLeave: 3,
    File: 4
}

var BoloRelationType =
{
    Temporary: 1,
    Confirmed: 2,
    Search: 3,
    Blocked: 4
}

var MessageStatusEnum = {
    notify: 0,
    inqueue: 1,
    inprogress: 2,
    ready: 5,
    sent: 3,
    error: 4
}

class MessageInfo {
    //user info of who sent the message
    sender;
    //when it was sent
    timeStamp;
    //type of message info, MessageEnum
    type;
    //message body 
    text;
    status;
    progresspercent;
    file;

    constructor() {
        this.progresspercent = 0;
        this.status = MessageStatusEnum.inprogress;
        this.file = null;
    }
}
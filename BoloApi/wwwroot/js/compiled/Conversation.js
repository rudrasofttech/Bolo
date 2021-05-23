﻿"use strict"; class Conversation extends React.Component { constructor(props) { super(props); let loggedin = true; if (localStorage.getItem("token") === null) { loggedin = false } this.state = { loading: false, loggedin: loggedin, myself: null, bsstyle: '', message: '', selectedperson: null, token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"), searchtext: '', dummy: new Date(), showsearch: true, showprofilemodal: false, profiletoshow: null }; this.hubConnection = null; this.contactupdateinterval = null; this.contactlist = new Map(); this.loginHandler = this.loginHandler.bind(this); this.handleProfileSelect = this.handleProfileSelect.bind(this); this.validate = this.validate.bind(this); this.handleChange = this.handleChange.bind(this); this.handleSearchSubmit = this.handleSearchSubmit.bind(this); this.handleReceivedMessage = this.handleReceivedMessage.bind(this); this.fetchContacts = this.fetchContacts.bind(this); this.handleShowSearch = this.handleShowSearch.bind(this); this.checkContactPulse = this.checkContactPulse.bind(this); this.search = this.search.bind(this); this.startHub = this.startHub.bind(this); this.handleProfileModalClose = this.handleProfileModalClose.bind(this); this.handleProfileItemClick = this.handleProfileItemClick.bind(this); this.setMessageStatus = this.setMessageStatus.bind(this); this.messageStatusEnum = { Pending: 0, Sent: 1, Received: 2, Seen: 3 } } componentDidMount() { this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map(); if (localStorage.getItem("token") != null) { this.validate(localStorage.getItem("token")) } } componentWillUnmount() { if (this.contactupdateinterval !== null) { clearInterval(this.contactupdateinterval) } } loginHandler() { if (localStorage.getItem("token") != null) { this.validate(localStorage.getItem("token")) } } startHub() { this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/personchathub", { accessTokenFactory: () => this.state.token }).withAutomaticReconnect().build(); this.hubConnection.start().then(() => { console.log('Hub Connection started!') }).catch(err => console.log('Error while establishing connection :(')); this.hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => { var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: 2 }; this.handleReceivedMessage(mi) }); this.hubConnection.on('ContactUpdated', dto => { if (this.contactlist.get(dto.id) !== undefined) { let p = this.contactlist.get(dto.id).person; if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) { this.contactlist.get(dto.id).person = dto; this.setState({ dummy: Date.now() }) } } }); this.hubConnection.on('ContactSaved', dto => { if (this.contactlist.get(dto.id) === undefined) { this.contactlist.set(dto.person.id, dto); this.setState({ dummy: Date.now() }) } }) } compare_contact(a, b) { if (a[1].unseenMessageCount > b[1].unseenMessageCount) { return -1 } else if (a[1].person.activity !== 5 && b[1].person.activity === 5) { return -1 } else if (a[1].person.activity === 5 && b[1].person.activity !== 5) { return 1 } else { return 0 } } validate(t) { this.setState({ loading: true }); fetch('//' + window.location.host + '/api/Members/Validate', { method: 'get', headers: { 'Authorization': 'Bearer ' + t } }).then(response => { if (response.status === 401) { localStorage.removeItem("token"); this.setState({ loggedin: false, loading: false, token: null }) } else if (response.status === 200) { response.json().then(data => { this.setState({ loggedin: true, loading: false, myself: data }) }); this.fetchContacts(); this.contactupdateinterval = setInterval(this.checkContactPulse, 5000); if (this.hubConnection === null) { this.startHub() } } }) } checkContactPulse() { for (const [key, contact] of this.contactlist.entries()) { var dt = new Date(contact.lastPulse); dt.setSeconds(dt.getSeconds() + 5); if (dt < Date.now()) { contact.activity = 5 } } } fetchContacts() { fetch('//' + window.location.host + '/api/Contacts/Member', { method: 'get', headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") } }).then(response => { if (response.status === 200) { response.json().then(data => { for (var k in data) { if (this.contactlist.get(data[k].person.id) === undefined) { this.contactlist.set(data[k].person.id.toLowerCase(), data[k]) } else { this.contactlist.set(data[k].person.id, data[k]) } if (data[k].messagesOnServer.length > 0) { var msgs = localStorage.getItem(data[k].person.id) !== null ? new Map(JSON.parse(localStorage.getItem(data[k].person.id))) : new Map(); for (var i in data[k].messagesOnServer) { if (msgs.get(data[k].messagesOnServer[i].id) === undefined) { var mi = { id: data[k].messagesOnServer[i].id, sender: data[k].messagesOnServer[i].sentBy.id, text: data[k].messagesOnServer[i].message, timestamp: data[k].messagesOnServer[i].sentDate, status: 2 }; msgs.set(mi.id, mi); this.setMessageStatus(mi.id, "SetReceived"); this.contactlist.get(data[k].person.id).recentMessageDate = mi.timestamp; if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) { this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1 } else { this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1 } } } localStorage.setItem(data[k].person.id, JSON.stringify(Array.from(msgs))) } } localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist))); this.setState({ loading: false, dummy: new Date() }) }) } else { this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' }) } }) } search() { this.setState({ loading: true }); fetch('//' + window.location.host + '/api/Members/search?s=' + this.state.searchtext, { method: 'get', headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") } }).then(response => { if (response.status === 200) { response.json().then(data => { this.contactlist = new Map(); for (var k in data) { this.contactlist.set(data[k].id, { id: 0, person: data[k], createDate: null, boloRelation: 3, recentMessage: '', recentMessageDate: '' }) } this.setState({ loading: false, dummy: new Date() }) }) } else { this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' }) } }) } setMessageStatus(mid, action) { fetch('//' + window.location.host + '/api/ChatMessages/' + action + '?mid=' + mid, { method: 'get', headers: { 'Authorization': 'Bearer ' + this.state.token } }) } handleShowSearch(show) { if (show) { this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map() } this.setState({ showsearch: show }) } handleProfileSelect(e) { this.setState({ selectedperson: e }) } handleProfileModalClose() { this.setState({ profiletoshow: null, showprofilemodal: false }) } handleProfileItemClick(e) { if (e !== null && this.contactlist.get(e) !== undefined) { this.setState({ profiletoshow: this.contactlist.get(e).person, showprofilemodal: true }) } } handleResultItemClick(e) { if (this.state.loggedin) { if (e !== null && this.contactlist.get(e) !== undefined) { this.setState({ selectedperson: this.contactlist.get(e).person, showsearch: false, showprofilemodal: false }) } } else { alert("Please log in to gain full access.") } } handleSearchSubmit(e) { e.preventDefault(); this.search() } handleReceivedMessage(mi) { let usermsgs = localStorage.getItem(mi.sender.toLowerCase()); let usermsgmap = null; if (usermsgs !== null) { usermsgmap = new Map(JSON.parse(usermsgs)) } else { usermsgmap = new Map() } usermsgmap.set(mi.id, mi); console.log(mi); localStorage.setItem(mi.sender.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries()))); this.setMessageStatus(mi.id, "SetReceived"); if (this.contactlist.get(mi.sender.toLowerCase()) !== undefined) { this.contactlist.get(mi.sender.toLowerCase()).recentMessageDate = mi.timestamp; if (this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) { this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount += 1 } else { this.contactlist.get(mi.sender.toLowerCase()).unseenMessageCount = 1 } localStorage.setItem("contacts", JSON.stringify(Array.from(this.contactlist))); this.setState({ dummy: Date.now() }) } } handleChange(e) { switch (e.target.name) { case 'searchtext': if (e.target.value.trim() === "") { this.contactlist = localStorage.getItem("contacts") !== null && this.state.loggedin ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map() } this.setState({ searchtext: e.target.value }); break; default: } } renderPeopleList() { const items = []; const hundred = { width: "100%" }; var sortedcontacts = new Map([...this.contactlist.entries()].sort(this.compare_contact)); for (const [key, contact] of sortedcontacts.entries()) { let obj = contact.person; if (this.state.myself === null || obj.id !== this.state.myself.id) { let thought = null; if (obj.thoughtStatus !== "") { thought = React.createElement("p", { className: "card-text mb-0" }, React.createElement("small", null, obj.thoughtStatus)) } let online = React.createElement("span", { className: "offline" }); if (obj.activity !== 5) { online = React.createElement("span", { className: "online" }) } let unseenmsgcount = contact.unseenMessageCount > 0 ? React.createElement("span", { className: "badge badge-primary" }, contact.unseenMessageCount) : null; let blocked = contact.boloRelation === BoloRelationType.Blocked ? React.createElement("span", { className: "badge badge-danger" }, "Blocked") : null; let pic = obj.pic !== "" ? React.createElement("img", { src: obj.pic, className: "card-img", alt: "" }) : React.createElement("img", { src: "/images/nopic.jpg", className: "card-img", alt: "" }); items.push(React.createElement("div", { className: "col-12 col-sm-6 col-md-4 col-lg-3", key: key }, React.createElement("div", { className: "card mb-3", style: { maxWidth: "540px", cursor: "pointer" }, onClick: () => this.handleResultItemClick(obj.id) }, React.createElement("div", { className: "row no-gutters" }, React.createElement("div", { className: "col-4" }, pic), React.createElement("div", { className: "col-8" }, React.createElement("div", { className: "card-body p-1", style: { position: "relative" } }, React.createElement("div", { className: "btn-group", style: { position: "absolute", right: "5px", top: "5px" }, onClick: e => e.stopPropagation() }, React.createElement("button", { className: "btn btn-sm btn-light dropdown-toggle", type: "button", id: "dropdownMenuButton", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" }), React.createElement("div", { className: "dropdown-menu dropdown-menu-right ", "aria-labelledby": "dropdownMenuButton" }, React.createElement("a", { className: "dropdown-item", href: "#", onClick: () => this.handleProfileItemClick(obj.id) }, "Profile"), React.createElement("a", { className: "dropdown-item", href: "#", onClick: () => this.handleResultItemClick(obj.id) }, "Chat"))), React.createElement("h6", { className: "card-title mb-0" }, online, " ", obj.name, " ", unseenmsgcount, " ", blocked), React.createElement("p", { className: "card-text mb-0" }, React.createElement("small", null, obj.city, " ", obj.state, " ", obj.country)), thought)))))) } } if (items.length > 0) { return React.createElement("div", { className: "row searchresult" }, items) } else { return React.createElement("div", { className: "row justify-content-center" }, React.createElement("div", { className: "col-12" }, React.createElement("div", { className: "alert alert-light", role: "alert" }, "No profiles to show here.", React.createElement("br", null), "Search for people based on their name, location, profession or gender etc. Here are some examples of search phrases.", React.createElement("ul", null, React.createElement("li", null, "Raj Kiran Singh"), React.createElement("li", null, "Raj From India"), React.createElement("li", null, "Software Developer in Noida"), React.createElement("li", null, "Women in India"), React.createElement("li", null, "Men in India"), React.createElement("li", null, "Mumbai Maharashtra"), React.createElement("li", null, "Delhi Mumbai Kolkatta"))))) } } render() { let loading = this.state.loading ? React.createElement("div", { className: "progress", style: { height: "5px" } }, React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated", role: "progressbar", "aria-valuenow": "75", "aria-valuemin": "0", "aria-valuemax": "100", style: { width: "100%" } })) : null; let personchatorprofile = null; if (this.state.selectedperson !== null && !this.state.showsearch) { personchatorprofile = React.createElement("div", { className: "col-12 p-0" }, React.createElement(PersonChat, { person: this.state.selectedperson, myself: this.state.myself, receivedMessage: this.handleReceivedMessage, handleShowSearch: this.handleShowSearch })) } else if (this.state.profiletoshow !== null && this.state.showprofilemodal) { personchatorprofile = React.createElement("div", { className: "modal d-block", tabIndex: "-1", role: "dialog" }, React.createElement("div", { className: "modal-dialog modal-dialog-scrollable" }, React.createElement("div", { className: "modal-content" }, React.createElement("div", { className: "modal-body" }, React.createElement("button", { type: "button", className: "close float-right", "data-dismiss": "modal", "aria-label": "Close", onClick: this.handleProfileModalClose }, React.createElement("span", { "aria-hidden": "true" }, "x")), React.createElement(ViewProfile, { profile: this.state.profiletoshow }))))) } else { personchatorprofile = React.createElement(HeartBeat, { activity: "1", interval: "3000" }) } let searchhtml = null; if (this.state.showsearch) { searchhtml = React.createElement("div", { className: "col-12 searchcont" }, React.createElement("form", { onSubmit: this.handleSearchSubmit, className: "searchform1 form-inline mt-2 mb-2" }, React.createElement("div", { className: "input-group mb-3" }, React.createElement("input", { type: "search", className: "form-control", onChange: this.handleChange, title: "Find People by Name, Location, Profession etc.", name: "searchtext", id: "search-input", placeholder: "Find People by Name, Location, Profession etc", "aria-label": "Search for...", autoComplete: "off", spellCheck: "false", "aria-describedby": "button-addon2" }), React.createElement("button", { className: "btn btn-light", type: "submit", id: "button-addon2" }, React.createElement("img", { src: "/icons/search.svg", alt: "", width: "24", height: "24", title: "Search People" })))), this.renderPeopleList()) } return React.createElement(React.Fragment, null, React.createElement(NavMenu, { onLogin: this.loginHandler, registerFormBeginWith: false, fixed: false }), React.createElement("div", { className: "container-fluid" }, React.createElement("div", { className: "row" }, searchhtml, loading, personchatorprofile))) } }
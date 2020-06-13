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
            myself: this.props.myself !== undefined ? this.props.myself : null, bsstyle: '', message: '', person: p,
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"), textinput: '', dummy: Date.now()
        };

        this.messages = (localStorage.getItem(p.id) !== null) ? new Map(JSON.parse(localStorage.getItem(p.id))) : new Map();
        this.hubConnection = null;
        this.handleChange = this.handleChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.startHub = this.startHub.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.person.id !== state.person.id) {
            return {
                person: props.person
            };
        }
        return null
    }

    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/personchathub", { accessTokenFactory: () => this.state.token }).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
        }).catch(err => console.log('Error while establishing connection :('));

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp, id) => { this.receiveTextMessage(ui, text, timestamp, id); });

        this.hubConnection.on('ContactSaved', (cdto) => {
            let contactmap = new Map();
            if (localStorage.getItem("contacts") !== null) {
                contactmap = new Map(JSON.parse(localStorage.getItem("contacts")));
            }
            contactmap.set(cdto.person.id, cdto);
            localStorage.setItem("contacts", JSON.stringify(Array.from(contactmap)));
        });
    }

    sendTextMessage() {
        if (this.state.textinput.trim() !== "") {
            
            //check if receiver is in contact list
            //if (this.messages.size === 0 && localStorage.getItem("contacts") !== null) {
            //    let cl = localStorage.getItem("contacts");
            //    for (var k in cl) {

            //    }
            //}
            this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, this.state.textinput)
                .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            this.setState({ textinput: '' });
        }
    }

    receiveTextMessage(sender, text, timestamp, id) {
        var mi = { id: id, sender: sender, text: text, timestamp: timestamp + " UTC" };
        this.messages.set(id, mi);
        this.setState({ dummy: Date.now() }, () => {
            localStorage.setItem(this.state.person.id, JSON.stringify(Array.from(this.messages.entries())));
        });
        this.playmsgbeep();


    }

    playmsgbeep() {
        let cb = document.getElementById("chatbeep");
        if (cb != null) {
            cb.currentTime = 0;
            cb.volume = 0.15;
            //we have to unmute the audio since it  is muted at time of loading
            cb.muted = false;
            cb.play();
        }
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({ textinput: e.target.value });
                break;
            default:
        }
    }

    handleSend(e) {
        e.preventDefault();
        this.sendTextMessage();
    }

    scrollToBottom = () => {
        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }

    componentDidMount() {
        this.startHub();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.person.id !== this.state.person.id) {
            this.messages = (localStorage.getItem(this.state.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(this.state.person.id))) : new Map();
            this.setState({ dummy: Date.now() });
        }
        //each time compoment updates scroll to bottom
        //this can be improved by identifying if new messages added
        this.scrollToBottom();
    }

    renderMessages() {
        let sentlistyle = { display: "block", textAlign: 'right' };
        let reclistyle = { display: "block", textAlign: 'left' };
        let sentmessagestyle = { margin: "2px", maxWidth: "300px", display: "inline-block", padding: "4px", background: "#fff", borderRadius: "4px" };
        let recmessagestyle = { margin: "2px", maxWidth: "300px", display: "inline-block", background: "#F2F6F9", padding: "4px", borderRadius: "4px" };
        const items = [];
        for (const [key, obj] of this.messages.entries()) {
            if (obj.sender === this.state.myself.id) {
                items.push(<li style={sentlistyle} key={key}>
                    <div style={sentmessagestyle}>
                        {obj.text}
                        <span className="d-block"><small className="time">{moment(obj.timestamp, "YYYYMMDD").fromNow()}</small></span>
                    </div>
                </li>);
            } else {
                items.push(<li style={reclistyle} key={key}>
                    <div style={recmessagestyle}>
                        {obj.text}
                        <span className="d-block"><small className="time">{moment(obj.timestamp, "YYYYMMDD").fromNow()}</small></span>
                    </div>
                </li>);
            }
        }


        return <React.Fragment>
            {items}
            <li style={{ float: "left", clear: "both" }}
                ref={(el) => { this.messagesEnd = el; }}>
            </li>
        </React.Fragment>;
    }


    render() {
        let chatcontainerstyle = { position: "relative", height: "100%" };
        let chatpersoninfocontstyle = { position: "absolute", top: "0px", left: "0px", height: "40px", width: "100%", margin: 0, padding: 0, background: "#F0F4F8" };
        let chatinputcontainerstyle = { position: "absolute", bottom: "0px", left: "0px", height: "30px", width: "100%", margin: 0, padding: 0 };
        let chatinputctrlcontstyle = { width: "40px" };
        let chatmsgcontstyle = { width: "100%", margin: "0px", padding: "40px 5px", maxHeight: "calc(100vh - 100px)", overflow: "auto" };

        let profile = null;
        if (this.messages.length == 0) { profile = <ViewProfile profile={this.state.person} />; }
        let pic = <img src="/images/nopic.jpg" className="mx-auto d-block img-fluid" alt="" />;
        if (this.state.person !== null) {
            if (this.state.person.pic !== "") {
                pic = <img src={this.state.person.pic} className="mx-auto d-block img-fluid" alt="" />;
            }
        }
        return (
            <React.Fragment>
                <div style={chatcontainerstyle}>
                    <table style={chatpersoninfocontstyle} className="border-bottom">
                        <tbody>
                            <tr>
                                <td width="40px" className="noPadding">
                                    {pic}
                                </td>
                                <td className="noPadding">
                                    <h5>{this.state.person.name}</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={chatmsgcontstyle}>
                        <ul className="list-unstyled">{this.renderMessages()}</ul>
                    </div>
                    <table style={chatinputcontainerstyle} className="border-top">
                        <tbody>
                            <tr>
                                <td>
                                    <form onSubmit={this.handleSend}>
                                        <input type="text" name="textinput" className="form-control" value={this.state.textinput} onChange={this.handleChange} width="100%" />
                                    </form>
                                </td><td style={chatinputctrlcontstyle}>
                                    <button type="button" id="msgsubmit" className="btn btn-primary" title="Send Message"><img src="/icons/send.svg" alt="" width="24" height="24" title="Send Message" /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <audio id="chatbeep" muted="muted" volume="0">
                    <source src="/media/swiftly.mp3"></source>
                    <source src="/media/swiftly.m4r"></source>
                    <source src="/media/swiftly.ogg"></source>
                </audio>
            </React.Fragment>
        );


    }
}
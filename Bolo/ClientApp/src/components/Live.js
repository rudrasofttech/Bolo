import React, { Component } from 'react';
import Moment from 'react-moment';
import { IoMdSend } from 'react-icons/io';
import { Redirect } from 'react-router-dom';
import { NavMenu } from './NavMenu';
import { Progress, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { MessageStrip } from './MessageStrip';
import { UserInfo, MessageInfo, MessageEnum } from './Models';
const Peer = require("simple-peer");

export class Live extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            dummydate: new Date(), loading: false, loggedin: loggedin,
            channel: this.props.match.params.channel === null ? '' : this.props.match.params.channel, myself: null, bsstyle: '', message: '', messages: [],
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
        };
        this.hubConnection = null;
        this.peer = null;
        this.broadcaster = null;
        this.pulseInterval = null;
        this.loginHandler = this.loginHandler.bind(this);
        this.sendPulse = this.sendPulse.bind(this);
        this.broadcasterSentHello = this.broadcasterSentHello.bind(this);
        this.createPeer = this.createPeer.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.sendTextMessage = this.sendTextMessage.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
        this.scrollToTop();
    }

    //react function
    componentWillUnmount() {
        if (this.pulseInterval !== null) {
            clearInterval(this.pulseInterval);
        }
    }

    //scroll to bottom of chat window when a new message is added.
    //important feature to have.
    scrollToTop = () => {
        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }


    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch('api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");

                    this.setState({ loggedin: false, loading: false, myself: null });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);
                        let u = new UserInfo();
                        u.name = data.name;
                        u.memberID = data.id;
                        u.videoCapable = false;
                        u.peerCapable = Peer.WEBRTC_SUPPORT;
                        this.setState({ loggedin: true, loading: false, myself: u }, () => { this.startHub() });
                    });
                }
            });
    }

    //start signalr hub invoke preliminary functions and set on event handlers
    startHub() {
        this.hubConnection = new HubConnectionBuilder().withUrl("/broadcasthub", { accessTokenFactory: () => this.state.token }).configureLogging(LogLevel.Debug).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //join broadcast
            this.hubConnection
                .invoke('JoinBroadcast', this.state.channel, this.state.myself.id, this.state.myself.name, Peer.WEBRTC_SUPPORT)
                .catch(err => console.error(err));

            //set pulse interval, this will call the function that will send 
            //pulse to other in meeting about current users existance
            this.pulseInterval = setInterval(this.sendPulse, 3000);
        }).catch(err => console.log('Error while establishing connection :('));

        //userleft is called by server when a user invokes leavemeeting function
        //use this function to perform cleanup of peer object and user object
        this.hubConnection.on('UserLeft', (cid) => {
            //console.log(cid);
            this.userLeft(cid);
        });
        this.hubConnection.on('BroadcasterSentHello', (u) => { console.log("BroadcasterSentHello"); this.broadcasterSentHello(u); });
        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp) => { this.receiveTextMessage(ui, text, timestamp); });

        //this function is strictly call by server to transfer webrtc peer data
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            console.log("receivesignal sender : " + sender);
            console.log("receivesignal data : " + data);
            if (this.peer !== null) {
                this.peer.signal(data);
            }
        })
    }

    broadcasterSentHello(u) {
        this.broadcaster = u;

        if (Peer.WEBRTC_SUPPORT) {
            try {
                this.createPeer(u);
            } catch (err) {
                console.log("Unable to create a new peer when broadcasterSentHello");
            }
        }
    }

    receiveTextMessage(sender, text, timestamp) {
        var mi = new MessageInfo();
        mi.sender = sender;
        mi.text = text;
        mi.type = MessageEnum.Text;
        mi.timeStamp = timestamp;
        let mlist = this.state.messages;
        mlist.push(mi);
        this.setState({ messages: mlist });
    }

    //send your pulse to other clients
    //this will indicate that you are still alive in
    //meeting
    sendPulse() {
        this.hubConnection.invoke('SendPulse', this.state.channel, this.broadcaster).catch(err => console.error('sendPulse ' + err));
    }

    createPeer(u) {
        //RTC Peer configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        this.peer = new Peer({ initiator: true, config: configuration });
        this.peer["cid"] = u;
        this.peer["myself"] = this.state.myself;
        this.peer["channel"] = this.state.channel;
        this.peer["hubConnection"] = this.hubConnection;
        //set peer event handlers
        this.peer.on("error", this.onPeerError);
        this.peer.on("signal", this.onPeerSignal);
        this.peer.on("connect", this.onPeerConnect);
        this.peer.on("stream", this.onPeerStream);
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
            .invoke('SendSignal', data, this.myself.id, this.cid, this.channel)
            .catch(err => console.error('SendSignal ' + err));
    }

    onPeerConnect() {
        this.send(this.myself.name + ' peer connected to ' + this.cid);
    }

    onPeerError(err) {
        console.log(this.cid + " peer gave error. ");
        console.error(err);
    }

    onPeerStream(stream) {
        console.log("received a stream"); console.log(stream);
        // got remote video stream, now let's show it in a video tag
        var video = document.getElementById('livevideo');
        console.log(video);
        if ('srcObject' in video) {
            video.srcObject = stream
        } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
        }

        video.play();
    }
    //simple peer events end here

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
        }
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        this.sendTextMessage();
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({ textinput: e.target.value });
                break;
            default:
        }
    }

    sendTextMessage() {
        if (this.state.textinput.trim() !== "") {
            this.hubConnection.invoke("SendTextMessage", this.state.channel, this.state.myself, this.state.textinput)
                .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            this.setState({ textinput: '' });
        }
    }

    renderMessageList() {
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];
            if (obj.sender !== null) {
                items.splice(0, 0, <li className="sent" key={k}>
                    <span class="badge badge-light">{obj.sender.name} says</span>
                    <span>
                        {obj.text}
                        <small className="time"><Moment fromNow ago>{obj.timeStamp}</Moment></small>
                    </span>
                </li>);
            }
        }

        if (items.length > 0) {
            return (<>
                <div id="broadcastmsgcont">
                    <ul className="pt-1">
                        <li style={{ float: "left", clear: "both" }}
                            ref={(el) => { this.messagesEnd = el; }}>
                        </li>
                        {items}
                    </ul>
                </div>
            </>);
        } else {
            return null;
        }
    }

    render() {
        if (!this.state.loggedin) {
            return <><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} /></>;
        }
        else {
            return <><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={true} />
                <div className="container-fluid mt-5 mb-5">
                    <div className="row">
                        <div className="col-12 col-lg-9 text-center">
                            <video id="livevideo" autoPlay muted playsInline></video>
                        </div>
                        <div className="col-12 col-lg-3 d-none d-md-block d-lg-block d-xl-block">
                            {this.renderMessageList()}
                        </div>
                    </div>
                </div>
                <footer className="footer fixed-bottom py-2">
                    <form className="form-inline" onSubmit={this.handleMessageSubmit}>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <input type="text" placeholder="Type a text message..." name="textinput" value={this.state.textinput} autoComplete="off" autoCorrect="On" autoFocus="On"
                                        onChange={this.handleChange} className="form-control form-control-sm mr-2 livetextinput" />
                                    <button type="submit" id="msgsubmit" className="btn btn-primary" title="Send Message"><IoMdSend /></button>
                                </div>
                            </div>
                        </div>
                    </form>
                </footer>
            </>;
        }
    }
}
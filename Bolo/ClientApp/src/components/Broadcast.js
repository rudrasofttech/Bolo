import React, { Component } from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router-dom';
import { NavMenu } from './NavMenu';
import { Progress, Modal, ModalHeader, ModalBody, Badge } from 'reactstrap';
import { MessageStrip } from './MessageStrip';
import { BsFillChatDotsFill, BsCameraVideoFill, BsMicFill, BsCameraVideo, BsMic } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { UserInfo, MessageInfo, MessageEnum } from './Models';
import swiftly from '../assets/swiftly.mp3';
import swiftlym4r from '../assets/swiftly.m4r';
import swiftlyogg from '../assets/swiftly.ogg';
import userleftmp3 from '../assets/get-outta-here.mp3';
import userleftm4r from '../assets/get-outta-here.m4r';
import userleftogg from '../assets/get-outta-here.ogg';
import joinedmp3 from '../assets/got-it-done.mp3';
import joinedm4r from '../assets/got-it-done.m4r';
import joinedogg from '../assets/got-it-done.ogg';

const Peer = require("simple-peer");
const MaxPeers = 50;

export class Broadcast extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }
        this.state = {
            dummydate: new Date(), loading: false, loggedin: loggedin, channelname: '', myself: null, connectionId: '', bsstyle: '', message: '',
            videoplaying: false, audioplaying: false, messages: [], showinvite: false,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            textinput: ''
        };
        this.hubConnection = null;
        this.mystream = null;
        this.aliveInterval = null;
        this.users = new Map()
        this.peers = new Map();
        this.loginHandler = this.loginHandler.bind(this);
        this.handleChannelFormSubmit = this.handleChannelFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleVideoToggle = this.handleVideoToggle.bind(this);
        this.handleAudioToggle = this.handleAudioToggle.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.viewerJoined = this.viewerJoined.bind(this);
        this.receivePulse = this.receivePulse.bind(this);
        this.createPeer = this.createPeer.bind(this);
        this.collectDeadUsers = this.collectDeadUsers.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.receiveTextMessage = this.receiveTextMessage.bind(this);
        this.inviteHandler = this.inviteHandler.bind(this);
        this.closeInviteModal = this.closeInviteModal.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
            this.aliveInterval = setInterval(this.collectDeadUsers, 5000);
        }

        this.scrollToTop();
    }

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
                        this.setState({ loggedin: true, loading: false, myself: data }, () => { this.startHub() });
                    });
                }
            });
    }

    inviteHandler() {
        this.setState({ showinvite: true });
    }

    closeInviteModal() {
        this.setState({ showinvite: false });
    }

    receiveTextMessage(sender, text, timestamp) {
        var mi = new MessageInfo();
        mi.sender = sender;
        mi.text = text;
        mi.type = MessageEnum.Text;
        mi.timeStamp = timestamp;
        let mlist = this.state.messages;
        mlist.push(mi);
        this.setState({ messages: mlist, showalert: !this.state.showchatlist });
    }

    //call this function to gain access to camera and microphone
    getUserCam() {
        //config 
        var constraints = {
            audio: true, video: {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 400, ideal: 1080 },
                aspectRatio: 1.777777778
            }
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
            var video = document.getElementById('broadcastvideo');

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
        for (const [key, value] of this.peers) {
            value.addStream(this.mystream);
        }
    }

    //handle error when trying to get usermedia. This may be raised when user does not allow access to camera and microphone
    userMediaError(err) {
        console.log("Unable to access user media");
        console.error(err);
        if (err.name !== undefined && err.name !== null) {
            if (err.name.toLowerCase() === "notallowederror") {
                alert("You have specifically denied access to camera and microphone. Please check browser title or address bar to see the notification.");
            }
        }
        this.setState({ videoplaying: false, audioplaying: false });

    }

    //start signalr hub invoke preliminary functions and set on event handlers
    startHub() {
        this.hubConnection = new HubConnectionBuilder().withUrl("/broadcasthub", { accessTokenFactory: () => this.state.token }).configureLogging(LogLevel.Debug).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //join meeting room
            this.hubConnection
                .invoke('StartBroadcast', this.state.myself.channelName)
                .catch(err => console.error(err));

        }).catch(err => console.log('Error while establishing connection :('));

        //Handle New User Arrived server call
        //userinfo paramt will be sent by server as provided by other
        //user
        this.hubConnection.on('ViewerJoined', (userid, name, pc) => {
            console.log('ViewerJoined');
            this.viewerJoined(userid, name, pc);
        });


        //userleft is called by server when a user invokes leavemeeting function
        //use this function to perform cleanup of peer object and user object
        this.hubConnection.on('UserLeft', (cid) => {
            //console.log(cid);
            this.userLeft(cid);
        });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp) => { this.receiveTextMessage(ui, text, timestamp); });

        //this function is strictly call by server to transfer webrtc peer data
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            console.log("receivesignal sender : " + sender);
            console.log("receivesignal data : " + data);
            if (this.peers.get(sender) !== undefined) {
                this.peers.get(sender).signal(data);
            }
        });

        this.hubConnection.on('SetConnectionID', (u) => {
            console.log("Connection ID");
            console.log(u);
            this.setState({ connectionId: u });
        });

        //function is called by server in response to sendpulse server call
        this.hubConnection.on('ReceivePulse', (cid) => {
            //console.log(cid);
            this.receivePulse(cid);
        });
    }

    //call this function when on receivepulse call from server 
    //and set the lastpulse date of the target user
    receivePulse(cid) {
        if (this.users.get(cid) !== undefined) {
            this.users.get(cid).lastpulse = Date.now();
        }
    }

    //call this function at regular interval to clean up dead users.
    //dead users are those whose last pulse date is older by 5 seconds
    collectDeadUsers() {
        for (const [key, u] of this.users.entries()) {
            var dt = new Date(u.lastpulse);
            dt.setSeconds(dt.getSeconds() + 5);

            if (dt < Date.now()) {
                if (this.peers.get(u.id) !== null) {
                    console.log(u.id + " peer about to be destoryed");
                    if (this.peers.get(u.id) !== undefined && this.peers.get(u.id) !== null) {
                        this.peers.get(u.id).destroy();
                        this.peers.delete(u.id);
                    }
                }
            }
        }
    }


    //call this function when hub says new user has arrived
    //u is user info sent by the server
    viewerJoined(userid, name, peercapable) {
        var u = { id: userid, name: name, peercapable: peercapable, lastpulse: Date.now() };
        //create a user object for the new user that has arrived
        this.users.set(userid, u);

        //add a message
        let msg = new MessageInfo();
        msg.sender = null;
        msg.text = u.name + " is viewing the broadcast.";
        msg.type = MessageEnum.MemberAdd;
        let mlist = this.state.messages;
        mlist.push(msg);

        this.setState({ messages: mlist });

        if (u.peercapable && this.peers.size < MaxPeers) {
            try {
                this.createPeer(u);
            } catch (err) {
                console.log("Unable to create a new peer when newuserarrived");
            }
        }
        //this.playjoinbeep();
        this.hubConnection.invoke("HelloUser", this.state.myself.channelName, this.state.myself.id, u.id)
            .catch(err => { console.log("Unable to say hello to new user."); console.error(err); });
    }

    createPeer(u) {
        //RTC Peer configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        console.log(this.mystream);
        let p = new Peer({ initiator: false, config: configuration, stream: this.mystream });
        p["cid"] = u.id;
        p["connectionid"] = this.state.connectionId;
        p["channel"] = this.state.myself.channelName;
        p["hubConnection"] = this.hubConnection;
        //set peer event handlers
        p.on("error", this.onPeerError);
        p.on("signal", this.onPeerSignal);
        p.on("connect", this.onPeerConnect);
        //p.on("stream", this.onPeerStream);
        p.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data)
        });
        this.peers.set(u.id, p);
    }

    /**
     * Simple Peer events
     * 
     */
    onPeerSignal(data) {
        this.hubConnection
            .invoke('SendSignal', data, this.connectionid, this.cid, this.channel)
            .catch(err => console.error('SendSignal ' + err));
    }

    onPeerConnect() {
        this.send(this.connectionid + ' peer connected to ' + this.cid);
    }

    onPeerError(err) {
        console.log(this.cid + " peer gave error. ");
        console.error(err);
        if (err.code === "ERR_CONNECTION_FAILURE") {

        }
    }
    //simple peer events end here

    //enable or disable video track of my stream
    handleVideoToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getVideoTracks().length > 0) {
                this.mystream.getVideoTracks()[0].enabled = !this.state.videoplaying;
                this.setState({ videoplaying: !this.state.videoplaying });
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();
            this.setState({ videoplaying: true });
        }
    }

    //enable or disable audio track of my stream
    handleAudioToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getAudioTracks().length > 0) {
                this.mystream.getAudioTracks()[0].enabled = !this.state.audioplaying;
                this.setState({ audioplaying: !this.state.audioplaying });
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            this.getUserCam();
            this.setState({ audioplaying: true });
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

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
        }
    }

    handleChannelFormSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('api/Members/SaveChannel?channel=' + this.state.channelname, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let user = this.state.myself;
                    user.channelName = this.state.channelname;
                    this.setState({ loading: false, myself: user });
                } else if (response.status === 400) {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ bsstyle: 'warning', message: data.message, loading: false });
                    });

                } else {
                    this.setState({ loading: false, message: "Unable to process request.", bsstyle: 'warning' });
                }
            });
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'channelname':
                this.setState({ channelname: e.target.value });
                break;
            default:
                break;
        }
    }

    renderInviteModal() {
        return <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <Modal isOpen={true} centered>
                        <ModalHeader toggle={this.closeInviteModal}>Invite Viewers</ModalHeader>
                        <ModalBody>
                            <p className="mt-10">You can share this URL with anyone who wants to watch your broadcast. There is limit of {MaxPeers} viewers at a time.</p>
                            <input type="text" value={'https://waarta.com/live/' + this.state.myself.channelName.toLowerCase()} autoFocus="on" className="form-control" />
                            <p className="mb-10"></p>
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        </div>;
    }

    renderChannelFormModal() {
        let loading = this.state.loading ? <div> <Progress animated color="info" value="100" className="loaderheight" /> </div> : <></>;
        let messagecontent = this.state.message !== "" ? <div className="mt-1"><MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} /></div> : <></>;
        return <><NavMenu onLogin={this.loginHandler} />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <Modal isOpen={true} centered>
                            <ModalHeader>Channel Name</ModalHeader>
                            <ModalBody>
                                <form onSubmit={this.handleChannelFormSubmit}>
                                    <div className="form-group">
                                        <input type="text" name="channelname" pattern="^[a-zA-Z][a-zA-Z0-9]*$" title="Name can only have english alphabets and number. Try to keep it under 100 characters." required maxLength="100" className="form-control" onChange={this.handleChange} aria-describedby="channelnameHelp" />
                                        <small id="channelnameHelp" className="form-text text-muted">Channel name can only have english alphabets and numbers.</small>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                    {messagecontent}
                                    {loading}
                                </form>
                            </ModalBody>
                        </Modal>
                    </div>
                </div>
            </div></>;
    }

    renderAudioVideoControl() {
        let videotoggleele = this.state.videoplaying ? (
            <button
                type="button"
                className="btn btn-primary  videoctrl"
                onClick={this.handleVideoToggle}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <BsCameraVideoFill />
            </button>
        ) : (
                <button
                    type="button"
                    className="btn btn-light videoctrl"
                    onClick={this.handleVideoToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <BsCameraVideo />
                </button>
            );
        let audiotoggleele = this.state.audioplaying ? (
            <button
                type="button"
                className="btn btn-primary audioctrl"
                onClick={this.handleAudioToggle}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <BsMicFill />
            </button>
        ) : (
                <button
                    type="button"
                    className="btn btn-light audioctrl"
                    onClick={this.handleAudioToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <BsMic />
                </button>
            );

        return <><div className="btn-group" role="group" aria-label="Basic example">{videotoggleele}{audiotoggleele}</div></>;
    }

    renderMessageList() {
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];

            if (obj.sender === null) {
                items.splice(0, 0, <li className="notify" key={k}>
                    <span>{obj.text}</span>
                </li>);
            } else {
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
        else if (this.state.myself !== null && (this.state.myself.channelName === null || this.state.myself.channelName === '')) {
            return this.renderChannelFormModal();
        }
        else {
            let invite = this.state.showinvite ? this.renderInviteModal() : <></>;
            return <><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} onInvite={this.inviteHandler} register={!this.state.loggedin} fixed={true} />
                <div className="container-fluid mt-5 mb-5">
                    <div className="row">
                        <div className="col-12 col-lg-9 text-center">
                            <video id="broadcastvideo" playsInline autoPlay muted></video>
                        </div>
                        <div className="col-12 col-lg-3 d-none d-md-block d-lg-block d-xl-block">
                            {this.renderMessageList()}
                        </div>
                    </div>
                </div>
                <footer className="footer fixed-bottom py-2">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                {this.renderAudioVideoControl()}
                                <Badge color="info" className="ml-1">Viewers {this.users.size}</Badge>
                            </div>
                        </div>
                    </div>
                </footer>
                {invite}
            </>;
        }
    }
}
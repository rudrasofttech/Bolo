import React, { Component } from 'react';
import Moment from 'react-moment';
import { UserInfo, MessageInfo, MessageEnum } from './Models';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { MessageStrip } from './MessageStrip';
import { NavMenu } from './NavMenu';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Link } from 'react-router-dom';

const Peer = require("simple-peer");

export class Meeting extends Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            joinmeeting: false, myname: '', textinput: '', messages: [],
            showinvite: false,
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            id: this.props.match.params.id === null ? '' : this.props.match.params.id,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            dummydate: new Date(),
            idvalid: false
        };
        this.pulseInterval = null;
        this.aliveInterval = null;
        this.users = new Map();
        this.peers = new Map();
        this.myself = null;
        this.mystream = null;
        this.hubConnection = null;
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.leaveMeeting = this.leaveMeeting.bind(this);
        this.getUserCam = this.getUserCam.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.newUserArrived = this.newUserArrived.bind(this);
        this.userSaidHello = this.userSaidHello.bind(this);
        this.sendPulse = this.sendPulse.bind(this);
        this.receivePulse = this.receivePulse.bind(this);
        this.collectDeadUsers = this.collectDeadUsers.bind(this);
        this.hasVideoAudioCapability = this.hasVideoAudioCapability.bind(this);
        this.createPeer = this.createPeer.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
        this.handleMyName = this.handleMyName.bind(this);
        this.handleJoinMeeting = this.handleJoinMeeting.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.inviteHandler = this.inviteHandler.bind(this);
        this.closeInviteModal = this.closeInviteModal.bind(this);
    }

    validateMeeting(t) {
        if (this.state.id !== undefined && this.state.id !== null) {
            this.setState({ idvalid : false });
        } else {
            this.setState({ loggedin: true });
            fetch('api/Meetings/' + this.state.id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + t
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            this.setState({ idvalid: true, loading: false }, () => { this.validate(this.state.token); });
                        });
                    } else {
                        this.setState({ idvalid: false });
                    }
                });
        }
    }


    closeInviteModal() {
        this.setState({ showinvite: false });
    }

    inviteHandler() {
        this.setState({ showinvite: true });
    }

    handleMyName(e) {
        this.setState({ myname: e.target.value });
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.setState({ loggedin: true });
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

    handleJoinMeeting(e) {
        e.preventDefault();
        this.myself.name = this.state.myname;
        this.setState({ joinmeeting: true }, () => { this.startHub(); });
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        this.sendTextMessage();
    }

    //check if browser supports access to camera and microphone
    hasVideoAudioCapability() {
        console.log(Peer.WEBRTC_SUPPORT);
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loggedin: true });
        fetch('api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.myself = new UserInfo();
                    this.myself.name = "";

                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        this.myself = new UserInfo();
                        this.myself.memberID = data.id;
                        this.myself.name = data.name;
                        this.setState({ loggedin: true, loading: false, joinmeeting: true }, () => { this.startHub(); });
                    });
                }
            });
    }

    startHub() {
        this.hubConnection = new HubConnectionBuilder().withUrl("/meetinghub", { accessTokenFactory: () => this.state.token }).configureLogging(LogLevel.Debug).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //join meeting room
            this.hubConnection
                .invoke('JoinMeeting', this.state.id, this.myself.name)
                .catch(err => console.error(err));

            this.pulseInterval = setInterval(this.sendPulse, 3000);
        }).catch(err => console.log('Error while establishing connection :('));


        this.hubConnection.on('NewUserArrived', (u) => {
            console.log(u);
            this.newUserArrived(u);
        });

        this.hubConnection.on('UpdateUser', (u) => {
            this.updateUser(u);
        });

        this.hubConnection.on('UserLeft', (cid) => { console.log(cid); this.userLeft(cid); });
        this.hubConnection.on('UserSaidHello', (u) => { this.userSaidHello(u); });

        this.hubConnection.on('SetMySelf', (u) => { this.setMySelf(u); });
        this.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp) => { this.receiveTextMessage(ui, text, timestamp); });
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            console.log("receivesignal sender : " + sender);
            console.log("receivesignal data : " + data);
            if (this.peers.get(sender.connectionID) !== undefined) {
                this.peers.get(sender.connectionID).signal(data);
            }
        })
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

        //console.log(this.users.get(cid));
    }

    //call this function at regular interval to clean up dead users.
    //dead users are those whose last pulse date is older by 5 seconds
    collectDeadUsers() {
        for (const [key, u] of this.users.entries()) {
            if (!u.isAlive()) {
                if (this.peers.get(u.connectionID) !== null) {
                    console.log(u.connectionID + " peer about to be destoryed");
                    if (this.peers.get(u.connectionID) !== undefined && this.peers.get(u.connectionID) !== null) {
                        this.peers.get(u.connectionID).destroy();
                        this.peers.delete(u.connectionID);
                    }
                }

                //add a message
                let msg = new MessageInfo();
                msg.sender = null;
                msg.text = u.name + " has left the meeting.";
                msg.type = MessageEnum.MemberLeave;
                let mlist = this.state.messages;
                mlist.push(msg);
                this.users.delete(u.connectionID);
                this.setState({ messages: mlist }, () => { });
            }
        }
    }

    setMySelf(u) {
        //set your connection id
        this.myself.connectionID = u.connectionID;
        this.myself.videoCapable = this.hasVideoAudioCapability();
        this.myself.peerCapable = Peer.WEBRTC_SUPPORT;
        this.hubConnection
            .invoke('NotifyPresence', this.state.id, this.myself)
            .catch(err => console.error(err));
        if (this.myself.videoCapable) {
            this.getUserCam();
        }
    }

    //send your pulse to other clients
    //this will indicate that you are still alive in 
    //meeting
    sendPulse() {
        this.hubConnection.invoke('SendPulse', this.state.id).catch(err => console.error('sendPulse ' + err));
    }

    createPeer(initiater, u) {
        //RTC Peer configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        let p = new Peer({ initiator: initiater, config: configuration, stream: this.mystream });
        p["cid"] = u.connectionID;
        p["hubConnection"] = this.hubConnection;
        p["myself"] = this.myself;
        p["meetingid"] = this.state.id;
        //set peer event handlers
        p.on("error", this.onPeerError);
        p.on("signal", this.onPeerSignal);
        p.on("connect", this.onPeerConnect);
        p.on("stream", this.onPeerStream);
        p.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data)
        });
        this.peers.set(u.connectionID, p);
    }

    /**
     * Simple Peer events
     * 
     */
    onPeerSignal(data) {
        this.hubConnection
            .invoke('SendSignal', data, this.cid, this.myself, this.meetingid)
            .catch(err => console.error('SendSignal ' + err));
    }

    onPeerConnect() {
        this.send(this.myself.name + ' peer connected.');
    }

    onPeerError(err) {
        console.log(this.cid + " peer gave error. " + err);
    }

    onPeerStream(stream) {
        console.log("received a stream"); console.log(stream);
        // got remote video stream, now let's show it in a video tag
        var video = document.getElementById('video' + this.cid);
        console.log(video);
        if ('srcObject' in video) {
            video.srcObject = stream
        } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
        }

        video.play();
    }
    //simple peer events end here


    //call this function when hub says new user has arrived
    //u is user info sent by the server
    newUserArrived(u) {
        //create a user object for the new user that has arrived
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        temp.videoCapable = u.videoCapable;
        temp.peerCapable = u.peerCapable;
        this.users.set(u.connectionID, temp);

        //add a message
        let msg = new MessageInfo();
        msg.sender = null;
        msg.text = temp.name + " has joined the meeting.";
        if (!temp.videoCapable && !temp.peerCapable) {
            msg.text = msg.text + " No Video/Audio Capability.";
        }
        msg.type = MessageEnum.MemberAdd;
        let mlist = this.state.messages;
        mlist.push(msg);

        this.setState({ messages: mlist });

        this.hubConnection.invoke("HelloUser", this.state.id, this.myself, u.connectionID)
            .catch(err => { console.log("Unable to say hello to new user."); console.error(err); });

        if (this.myself.peerCapable && temp.peerCapable) {
            this.createPeer(true, u);
        }
    }

    sendTextMessage() {
        if (this.state.textinput.trim() !== "") {
            this.hubConnection.invoke("SendTextMessage", this.state.id, this.myself, this.state.textinput)
                .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            this.setState({ textinput: '' });
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

    userLeft(cid) {
        var u = this.users.get(cid);
        let msg = new MessageInfo();
        msg.sender = null;
        msg.text = u.name + " has left.";
        msg.type = MessageEnum.MemberLeave;
        let mlist = this.state.messages;
        mlist.push(msg);
        this.users.delete(cid);
        if (this.peers.get(cid) !== null || this.peers.get(cid) !== undefined) {
            this.peers.get(cid).destroy();
        }
        this.peers.delete(cid);
        this.setState({ messages: mlist });
    }

    updateUser(u) {
        if (this.users.get(u.connectionID) !== undefined) {
            var oldname = this.users.get(u.connectionID).name;
            if (oldname !== u.name) {
                this.users.get(u.connectionID).name = u.name;

                var msg = new MessageInfo();
                msg.sender = null;
                msg.text = oldname + " has changed name to " + u.name + ".";
                msg.type = MessageEnum.Text;
                var mlist = this.state.messages;
                mlist.push(msg);
                this.setState({ messages: mlist });
            }
            let eitherchanged = false;
            if (this.users.get(u.connectionID).videoCapable !== u.videoCapable) {
                this.users.get(u.connectionID).videoCapable = u.videoCapable;
                eitherchanged = true;
            }

            if (this.users.get(u.connectionID).peerCapable !== u.peerCapable) {
                this.users.get(u.connectionID).peerCapable = u.peerCapable;
                eitherchanged = true;
            }

            if (eitherchanged) {
                //change state so that UI can be updated
                this.setState({ dummydate: new Date() });
            }
        }
    }

    userSaidHello(u) {
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        this.users.set(u.connectionID, temp);

        var mi = new MessageInfo();
        mi.sender = null;
        mi.text = u.name + ' is here.';
        if (!temp.videoCapable && !temp.peerCapable) {
            mi.text = mi.text + " No Video/Audio Capability.";
        }
        mi.type = MessageEnum.Text;

        let mlist = this.state.messages;
        mlist.push(mi);

        this.setState({ messages: mlist });
        if (this.myself.peerCapable && temp.peerCapable) {
            this.createPeer(false, u);
        }
    }

    leaveMeeting() {
        this.hubConnection
            .invoke('LeaveMeeting', this.state.id)
            .catch(err => console.error(err));
    }

    getUserCam() {
        var constraints = {
            audio: true, video: true
        };
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(this.addMedia)
                .catch(this.userMediaError); // always check for errors at the end.
        }
    }
    //assign media stream received from getusermedia to my video 
    addMedia(stream) {
        //peer1.addStream(stream) // <- add streams to peer dynamically
        var video = document.getElementById('myvideo');

        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
            if (video !== undefined) {
                video.play();
            }
        };

        this.mystream = stream;
        this.myself.videoCapable = true;
        for (const [key, value] of this.peers) {
            value.addStream(this.mystream);
        }
    }
    //handle error when trying to get usermedia. This may be raised when user does not allow access to camera and microphone
    userMediaError(err) {
        this.myself.videoCapable = false;
        console.log(err.name + ": " + err.message);
        this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
    }

    //react function
    componentDidMount() {
        this.validateMeeting(this.state.token);
        this.aliveInterval = setInterval(this.collectDeadUsers, 5000);
        this.scrollToBottom();
    }

    //react function
    componentWillUnmount() {
        if (this.aliveInterval !== null) {
            clearInterval(this.aliveInterval);
        }

        if (this.pulseInterval !== null) {
            clearInterval(this.pulseInterval);
        }
    }

    scrollToBottom = () => {
        if (this.messagesEnd !== undefined) {
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    renderValidateModal() {
        return <><NavMenu onLogin={this.loginHandler} onInvite={this.inviteHandler} /><div className="container-fluid">
            <div className="row">
                <div className="col-md-12">
                    <Modal isOpen={true} centered>
                        <ModalHeader>Not Found</ModalHeader>
                        <ModalBody>
                            <p className="m-2">This meeting id cannot be found. Please recheck with the meeting organizer.</p>
                            <p className="m-2">Alternatively you can organize your own meeting. <Link to="/meetings">Organize a Meeting</Link></p>
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        </div></>;
    }

    renderInviteModal() {
        return <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <Modal isOpen={true} centered>
                        <ModalHeader toggle={this.closeInviteModal}>Send Meeting Invites</ModalHeader>
                        <ModalBody>
                            <p className="mt-10">You can share this URL with anyone who wants to join the meeting.</p>
                            <input type="text" value={window.location.href} autoFocus="on" className="form-control" />
                            <p className="mb-10"></p>
                        </ModalBody>
                    </Modal>
                </div>
            </div>
        </div>;
    }

    renderNameForm() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <Modal isOpen={true} centered>
                            <ModalBody>
                                <form onSubmit={this.handleJoinMeeting}>
                                    <input type="text" value={this.state.myname} autoFocus="on" className="form-control" maxLength="20" onChange={this.handleMyName} placeholder="Your Name Here" />
                                    <br /><button type="submit" className="btn btn-primary">Join Meeting</button>
                                </form>
                            </ModalBody>
                        </Modal>
                    </div>
                </div>
            </div>);
    }

    renderMessageList() {
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];
            if (obj.sender === null) {
                items.push(<li className="notify" key={k}><span>{obj.text}</span></li>);
            } else if (obj.sender.connectionID === this.myself.connectionID) {
                items.push(<li className="sent" key={k}>
                    <span>{obj.text}
                        <small className="time"><Moment fromNow ago>{obj.timeStamp}</Moment></small>
                    </span>
                </li>);
            } else {
                items.push(<li className="receive" key={k}>
                    <span>
                        <small className="name">{obj.sender.name} says</small>
                        {obj.text}
                        <small className="time"><Moment fromNow ago>{obj.timeStamp}</Moment></small>
                    </span>
                </li>);
            }
        }

        return (<><ul id="msglist">
            {items}
            <li style={{ float: "left", clear: "both" }}
                ref={(el) => { this.messagesEnd = el; }}>
            </li>
        </ul></>);
    }

    renderVideoTags() {
        let classname = "";
        const items = [];
        let myvclass = "";

        this.users.forEach(function (value, key) {
            if (value.videoCapable && value.peerCapable) {
                items.push(<li className="video" key={key}>
                    <video id={'video' + value.connectionID} autoPlay={true} controls playsInline></video>
                </li>);
            }
        });
        if (items.length < 13) {
            classname = "video" + items.length;
        }
        else {
            classname = "video13";
        }
        if (items.length === 0) {
            myvclass = "full";
        } else {
            myvclass = "smalldocked"
        }

        let myv = this.myself.videoCapable ? <video id="myvideo" muted="muted" className={myvclass} autoPlay={true} controls playsInline></video> : <></>;
        if (items.length > 0 || this.myself.videoCapable) {
            return <div className="col-md-9 border-right">
                <div id="videocont">
                    {myv}
                    <ul id="videolist" className={classname}>
                        {items}</ul>
                </div>
            </div>;
        } else { return <></>; }
    }


    render() {
        if (!this.state.idvalid) {
            return this.renderValidateModal();
        }
        else if (this.myself !== null && this.myself.name.trim() === "") {
            return this.renderNameForm();
        }
        else if (this.state.joinmeeting) {
            let messagecontent = this.myselfssage !== "" ? <div className="fixedBottom ">
                <MessageStrip message={this.myselfssage} bsstyle={this.state.bsstyle} />
            </div> : <></>;
            let invite = this.state.showinvite ? this.renderInviteModal() : <></>;
            let mhtml = this.renderMessageList();
            let vhtml = this.renderVideoTags();
            let chatcolclassname = "col-md-3 align-self-end";
            if (vhtml === <></>) {
                chatcolclassname = "col-md-12 align-self-end";
            }
            return (<>
                <NavMenu onLogin={this.loginHandler} onInvite={this.inviteHandler} />
                <div className="container-fluid">
                    <div className="row fullheight">
                        {vhtml}
                        <div className={chatcolclassname}><div id="msgcont">
                            {mhtml}
                            <div id="inputcont">
                                <form className="form-inline" onSubmit={this.handleMessageSubmit}>
                                    <input type="text" name="textinput" value={this.state.textinput} autoComplete="off" autoCorrect="On" autoFocus="On" onChange={this.handleChange} className="form-control mr-sm-2" id="msginput" />
                                    <button type="submit" className="btn btn-primary">Send</button>
                                </form>
                            </div>
                        </div></div>
                    </div>
                    {messagecontent}
                    {invite}
                </div></>);
        } else {
            return (<></>);
        }
    }
}
import React, { Component } from 'react';
import Moment from 'react-moment';
import { UserInfo, MessageInfo, MessageEnum } from './Models';
import { HubConnectionBuilder, LogLevel, MessageType } from '@aspnet/signalr';
import { MessageStrip } from './MessageStrip';
import { NavMenu } from './NavMenu';
//import { Webcam } from './Webcam';
const Peer = require("simple-peer");

export class Meeting extends Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            textinput: '',
            messages: [],
            loading: false, loggedin: loggedin,
            bsstyle: '', message: '',
            id: this.props.match.params.id === null ? '' : this.props.match.params.id,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
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
        this.streamCamVideo = this.streamCamVideo.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.newUserArrived = this.newUserArrived.bind(this);
        this.userSaidHello = this.userSaidHello.bind(this);
        this.sendPulse = this.sendPulse.bind(this);
        this.receivePulse = this.receivePulse.bind(this);
        this.collectDeadUsers = this.collectDeadUsers.bind(this);
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({ textinput: e.target.value });
                break;
        }
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        this.sendTextMessage();
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
                    this.myself.name = window.prompt("Your Name?");

                    this.setState({ loggedin: false, loading: false }, () => { this.startHub(); });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        this.myself = new UserInfo();
                        this.myself.memberID = data.id;
                        this.myself.name = window.prompt("Your Name?", data.name);
                        this.setState({ loggedin: true, loading: false }, () => { this.startHub(); });
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

        this.hubConnection.on('UpdateName', (u) => {
            this.updateName(u);
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
            console.log(cid);
            this.receivePulse(cid);
        });
    }

    receivePulse(cid) {
        this.users.get(cid).lastpulse = Date.now();

        console.log(this.users.get(cid));
    }

    collectDeadUsers() {
        for (const [key, u] of this.users.entries()) {
            if (!u.isAlive()) {
                if (this.peers.get(u.connectionID) !== null) {
                    this.peers.get(u.connectionID).destroy();
                    this.peers.delete(u.connectionID);
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

        this.hubConnection
            .invoke('NotifyPresence', this.state.id, this.myself.name)
            .catch(err => console.error(err));

        this.streamCamVideo();
    }

    sendPulse() {
        this.hubConnection.invoke('SendPulse', this.state.id).catch(err => console.error('sendPulse ' + err));
    }

    //called when peer signal is received from another user
    receiveSignal(sender, data) {
        
    }

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


    //call this function when hub says new user has arrived
    //u is user info sent by the server
    newUserArrived(u) {
        //create a user object for the new user that has arrived
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        this.users.set(u.connectionID, temp);

        
        //add a message
        let msg = new MessageInfo();
        msg.sender = null;
        msg.text = temp.name + " have joined the meeting.";
        msg.type = MessageEnum.MemberAdd;
        let mlist = this.state.messages;
        mlist.push(msg);

        this.setState({ messages: mlist }, () => { });

        this.hubConnection.invoke("HelloUser", this.state.id, this.myself, u.connectionID)
            .catch(err => {
                console.log("Unable to say hello to new user."); console.error(err);

            });
        //RTC Peer configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        let p = new Peer({initiator: true, config: configuration, stream: this.mystream });
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

    updateName(cid, name) {
        var oldname = this.users.get(cid).name;
        this.users.get(cid).name = name;

        var msg = new MessageInfo();
        msg.sender = null;
        msg.text = oldname + " has changed name to " + name + ".";
        msg.type = MessageEnum.Text;
        var mlist = this.state.messages;
        mlist.push(msg);
        this.setState({ messages: mlist });
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
        mi.type = MessageEnum.Text;

        let mlist = this.state.messages;
        mlist.push(mi);

        this.setState({ messages: mlist });

        //start a peer for new user that has arrived
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        console.log("usersaidhello stream : " + this.mystream);
        let p = new Peer({ config: configuration, stream: this.mystream });

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

    leaveMeeting() {
        this.hubConnection
            .invoke('LeaveMeeting', this.state.id)
            .catch(err => console.error(err));
    }

    //assign media stream received from getusermedia to my video 
    addMedia(stream) {
        //peer1.addStream(stream) // <- add streams to peer dynamically
        var video = document.getElementById('myvideo');

        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
            video.play();
        };

        this.mystream = stream;
        for (const p of this.peers) {
            p.addStream(this.mystream);
        }
    }

    streamCamVideo() {
        var constraints = { audio: false, video: true };
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(this.addMedia)
                .catch(function (err) {
                    console.log(err.name + ": " + err.message);
                }); // always check for errors at the end.
        }
    }

    //react function
    componentDidMount() {
        this.validate(this.state.token);
        this.aliveInterval = setInterval(this.collectDeadUsers, 5000);
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

    renderMessageList() {
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];
            if (obj.sender === null) {
                items.push(<li className="notify" key={k}>{obj.text}</li>);
            } else if (obj.sender.connectionID == this.myself.connectionID) {
                items.push(<li className="sent" key={k}>
                    {obj.text}
                    <small><Moment fromNow ago>{obj.timeStamp}</Moment></small>
                </li>);
            } else {
                items.push(<li className="receive" key={k}>
                    <small>{obj.name}</small>
                    {obj.text}
                    <small><Moment fromNow ago>{obj.timeStamp}</Moment></small>
                </li>);
            }
        }

        return (<ul id="msglist">
            {items}
        </ul>);
    }

    renderVideoTags() {
        const items = [];

        this.users.forEach(function (value, key) {
            items.push(<li className="video" key={key}>
                <video id={'video' + value.connectionID} autoPlay={true} controls ></video>
            </li>);
        });

        return (<ul id="videolist">
            <li className="video">
                <video id="myvideo" autoPlay={true} controls></video>
            </li>
            {items}
        </ul>);
    }


    render() {
        let messagecontent = this.myselfssage !== "" ? <div className="fixedBottom ">
            <MessageStrip message={this.myselfssage} bsstyle={this.state.bsstyle} />
        </div> : <></>;
        let mhtml = this.renderMessageList();
        let vhtml = this.renderVideoTags();
        return (<>
            <NavMenu />
            <div id="fullheight">
                <div id="videocont">
                    {vhtml}</div>
                <div id="msgcont">
                    {mhtml}
                    <div id="inputcont" className="p-2">
                        <form className="form-inline" onSubmit={this.handleMessageSubmit}>
                            <input type="text" name="textinput" value={this.state.textinput} onChange={this.handleChange} className="form-control mr-sm-2" id="msginput" />
                            <button type="submit" className="btn btn-primary">Send</button>
                        </form>
                    </div>
                </div>
                {messagecontent}
            </div></>);
    }
}
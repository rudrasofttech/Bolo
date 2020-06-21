﻿class Meeting extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            joinmeeting: false, redirectto: '', myname: '', textinput: '', messages: [],
            showinvite: false, videoplaying: false, audioplaying: false,
            loading: false, loggedin: loggedin, bsstyle: '', message: '',
            id: this.props.meetingid === null ? '' : this.props.meetingid,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            dummydate: new Date(), idvalid: true, showchatlist: this.detectXtralargeScreen(), showalert: !this.detectXtralargeScreen(), showemojimodal: false
        };

        this.validateMeeting(this.state.token);
        this.beep = null;
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
        this.handleNameForm = this.handleNameForm.bind(this);
        this.handleJoinMeeting = this.handleJoinMeeting.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.inviteHandler = this.inviteHandler.bind(this);
        this.closeInviteModal = this.closeInviteModal.bind(this);
        this.handleVideoToggle = this.handleVideoToggle.bind(this);
        this.handleAudioToggle = this.handleAudioToggle.bind(this);
        this.onAlertDismiss = this.onAlertDismiss.bind(this);
        this.showChatList = this.showChatList.bind(this);
        this.hideChatList = this.hideChatList.bind(this);
        this.onPeerStream = this.onPeerStream.bind(this);
        this.handleEmojiModal = this.handleEmojiModal.bind(this);
        this.handleEmojiSelect = this.handleEmojiSelect.bind(this);
    }

    validateMeeting(t) {
        if (this.state.id === undefined || this.state.id === null) {
            this.setState({ idvalid: false });
        } else {
            fetch('/api/Meetings/' + this.state.id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + t
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            let mlist = this.state.messages;
                            if (data.purpose !== null && data.purpose !== '') {
                                var mi = new MessageInfo();
                                mi.sender = null;
                                mi.text = data.purpose;
                                mi.type = MessageEnum.Text;
                                mi.timeStamp = new Date();
                                mlist.push(mi);
                            }
                            this.setState({ idvalid: true, loading: false, messages: mlist });
                            if (data.name !== null && data.name !== '') {
                                document.title = data.name;
                            }
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

    handleMyName(e) {
        this.setState({ myname: e.target.value });
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            //this.setState({ loggedin: true });
            this.validate(localStorage.getItem("token"));
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

    handleNameForm(e) {
        e.preventDefault();
        this.myself.name = this.state.myname;
        this.setState({ joinmeeting: true }, () => { this.startHub(); });
    }

    handleJoinMeeting(e) {
        this.setState({ joinmeeting: true });
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        this.sendTextMessage();
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

    onAlertDismiss() {
        this.setState({ showalert: false });
    }

    showChatList(e) {
        e.preventDefault();
        this.setState({ showchatlist: true, showalert: false });
    }

    hideChatList(e) {
        e.preventDefault();
        this.setState({ showchatlist: false });
    }

    //check if browser supports access to camera and microphone
    hasVideoAudioCapability() {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch('/api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.myself = new UserInfo();
                    this.myself.name = "";
                    this.myself.videoCapable = this.hasVideoAudioCapability() && !this.detectEdgeorIE() && !this.detectMobileorTablet();
                    this.myself.peerCapable = SimplePeer.WEBRTC_SUPPORT && !this.detectEdgeorIE() && !this.detectMobileorTablet();
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);
                        this.myself = new UserInfo();
                        this.myself.memberID = data.id;
                        this.myself.name = data.name;
                        this.myself.videoCapable = this.hasVideoAudioCapability() && !this.detectEdgeorIE() && !this.detectMobileorTablet();
                        this.myself.peerCapable = SimplePeer.WEBRTC_SUPPORT && !this.detectEdgeorIE() && !this.detectMobileorTablet();
                        this.myself.pic = data.pic;
                        this.setState({ loggedin: true, loading: false, joinmeeting: false }, () => { this.startHub(); });
                    });
                }
            });
    }

    //start signalr hub invoke preliminary functions and set on event handlers
    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/meetinghub", { accessTokenFactory: () => this.state.token }).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //join meeting room
            this.hubConnection
                .invoke('JoinMeeting', this.state.id, this.myself.name)
                .catch(err => console.error(err));

            //set pulse interval, this will call the function that will send 
            //pulse to other in meeting about current users existance
            this.pulseInterval = setInterval(this.sendPulse, 3000);
        }).catch(err => console.log('Error while establishing connection :('));

        //Handle New User Arrived server call
        //userinfo paramt will be sent by server as provided by other
        //user
        this.hubConnection.on('NewUserArrived', (u) => {
            //console.log(u);
            this.newUserArrived(u);
        });

        //receive updated user object from target
        //this can be any thing user name, video capability, audio capability or
        //peer capability and status of target user
        this.hubConnection.on('UpdateUser', (u) => {
            this.updateUser(u);
        });

        //userleft is called by server when a user invokes leavemeeting function
        //use this function to perform cleanup of peer object and user object
        this.hubConnection.on('UserLeft', (cid) => {
            //console.log(cid);
            this.userLeft(cid);
        });

        //this function is called by server when client invoke HelloUser server function
        //this is called in response to newuserarrived function
        //so that new user can add existing users to its list
        this.hubConnection.on('UserSaidHello', (u) => { this.userSaidHello(u); });

        //this function is called by server when user invokes joinmeting function on server
        //setmyself recieves userinfo from server, like if user is logged then its public id, name and signalr connection id
        this.hubConnection.on('SetMySelf', (u) => { this.setMySelf(u); });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp) => { this.receiveTextMessage(ui, text, timestamp); });

        //this function is strictly call by server to transfer webrtc peer data
        this.hubConnection.on('ReceiveSignal', (sender, data) => {
            console.log("receivesignal sender : " + sender);
            console.log("receivesignal data : " + data);
            if (this.peers.get(sender.connectionID) !== undefined) {
                this.peers.get(sender.connectionID).signal(data);
            }
        })

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
                this.setState({ messages: mlist, showalert: !this.state.showchatlist });
                this.playmsgbeep();
            }
        }
    }

    setMySelf(u) {
        //set your connection id
        this.myself.connectionID = u.connectionID;
        this.myself.videoCapable = this.hasVideoAudioCapability();
        this.myself.peerCapable = SimplePeer.WEBRTC_SUPPORT;
        //support for video and peer to peer on IE, Edge, Mobile and Tablets is dicy it
        //is better to forbid it altogether.
        if (this.detectEdgeorIE() || this.detectMobileorTablet()) {
            this.myself.videoCapable = false;
            this.myself.peerCapable = false;
        }
        this.hubConnection
            .invoke('NotifyPresence', this.state.id, this.myself)
            .catch(err => console.error(err));
        if (this.myself.videoCapable) {
            //this.getUserCam();
        }
    }

    //send your pulse to other clients
    //this will indicate that you are still alive in 
    //meeting
    sendPulse() {
        console.log("SendPulse Hubconnection State:" + this.hubConnection.connectionState);
        if (this.hubConnection.connectionState === 1) {
            this.hubConnection.invoke('SendPulse', this.state.id).catch(err => console.error('sendPulse ' + err));
        }
    }

    createPeer(initiater, u) {
        //RTC Peer configuration
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        console.log("newuserarrived stream : ");
        console.log(this.mystream);
        let p = new SimplePeer({ initiator: initiater, config: configuration, stream: this.mystream });
        p["cid"] = u.connectionID;
        p["hubConnection"] = this.hubConnection;
        p["myself"] = this.myself;
        p["meetingid"] = this.state.id;
        //set peer event handlers
        p.on("error", this.onPeerError);
        p.on("signal", this.onPeerSignal);
        p.on("connect", this.onPeerConnect);
        p.on("stream", stream => { this.onPeerStream(stream, p.cid); });
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
        console.log(this.cid + " peer gave error. ");
        console.error(err);
    }

    onPeerStream(stream, connectionid) {
        console.log("received a stream"); console.log(stream);
        if (this.users.get(connectionid) !== undefined) {
            this.users.get(connectionid).stream = stream;
            //update state so that UI changes
            this.setState({ dummydate: Date.now() }, () => {
                this.users.forEach(function (value, key) {
                    let v = document.getElementById('video' + value.connectionID);
                    if (v !== null) {
                        if ('srcObject' in v) {
                            v.srcObject = value.stream
                        } else {
                            v.src = window.URL.createObjectURL(value.stream) // for older browsers
                        }
                        v.muted = false;
                        v.volume = 0.8;
                        v.play();
                    }
                });
            });

        }

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
        temp.pic = u.pic;
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

        this.setState({ messages: mlist, showalert: !this.state.showchatlist });
        this.playjoinbeep();
        this.hubConnection.invoke("HelloUser", this.state.id, this.myself, u.connectionID)
            .catch(err => { console.log("Unable to say hello to new user."); console.error(err); });

        if (this.myself.peerCapable && temp.peerCapable) {
            try {
                this.createPeer(true, u);
            } catch (err) {
                console.log("Unable to create a new peer when newuserarrived");
                //disable capability
                this.myself.peerCapable = false;
                //notify other about my capability change
                this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
            }
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
        this.setState({ messages: mlist, showalert: !this.state.showchatlist });
        this.playmsgbeep();
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
        this.setState({ messages: mlist, showalert: !this.state.showchatlist });
        this.playleftbeep();
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
                this.setState({ messages: mlist, showalert: !this.state.showchatlist });
                this.playjoinbeep();
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
                this.playjoinbeep();
            }
        }
    }

    userSaidHello(u) {
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        temp.pic = u.pic;
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

        this.setState({ messages: mlist, showalert: !this.state.showchatlist });
        this.playmsgbeep();
        if (this.myself.peerCapable && temp.peerCapable) {
            try {
                this.createPeer(false, u);
            } catch (err) {
                console.log("Unable to create a new peer when userSaidHello");
                //disable capability
                this.myself.peerCapable = false;
                //notify other about my capability change
                this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
            }
        }
    }

    leaveMeeting() {
        this.hubConnection
            .invoke('LeaveMeeting', this.state.id)
            .catch(err => console.error(err));
        try {
            if (this.mystream !== null) {
                for (var i = 0; i < this.mystream.getTracks().length; i++) {
                    this.mystream.getTracks()[i].stop();
                }
            }
        } catch (err2) {
            console.log("Error while stoping video and audio.");
            console.error(err2);
        }
        for (const [key, u] of this.users.entries()) {
            try {
                if (this.peers.get(u.connectionID) !== null) {
                    if (this.peers.get(u.connectionID) !== undefined && this.peers.get(u.connectionID) !== null) {
                        this.peers.get(u.connectionID).destroy();
                        this.peers.delete(u.connectionID);
                    }
                }
                this.users.delete(u.connectionID);
            } catch (err) {
                console.log("Error while deleting peer and deleting user");
                console.error(err);
            }
        }

        window.location.href = "//" + window.location.host;
    }

    detectEdgeorIE() {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        return (isIE || isEdge);
    }

    detectMobileorTablet() {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        //return check;
        //return check || window.matchMedia("(max-width: 768px)").matches;
        return false;
    }

    detectXtralargeScreen() {
        return window.matchMedia("(min-width: 1200px)").matches;
    }

    //call this function to gain access to camera and microphone
    getUserCam() {
        //config 
        var videoconst = true;
        if (window.matchMedia("(max-width: 414px) and (orientation: portrait)").matches) {
            videoconst = {
                width: {
                    min: 375
                },
                height: {
                    min: 740
                }
            };
        }
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
            var video = document.getElementById('myvideo');

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

                    console.log(video.width + " " + video.height);
                }
            };
        });

        for (var i = 0; i < document.getElementsByClassName("sample").length; i++) {
            document.getElementsByClassName("sample")[i].srcObject = this.mystream;
        }

        //based on initial state enable or disable video and audio
        //initially video will be disabled or micrphone will broadcast
        if (this.mystream.getVideoTracks().length > 0) {
            this.mystream.getVideoTracks()[0].enabled = this.state.videoplaying;
        }
        if (this.mystream.getAudioTracks().length > 0) {
            this.mystream.getAudioTracks()[0].enabled = this.state.audioplaying;
        }
        //set the videocapability toggle of self
        this.myself.videoCapable = true;

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
            } else {
                alert("Unable to access camera.");
            }
        }
        this.setState({ videoplaying: false, audioplaying: false });
        //dont know if user should be updated or not
        //this.hubConnection.invoke("UpdateUser", this.state.id, this.myself);
    }

    /*Sounds and Notifications */
    //play sound when receive a new message
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

    //play sound when participant joins a meeting
    playjoinbeep() {
        let jb = document.getElementById("joinedbeep");
        if (jb != null) {
            jb.currentTime = 0;
            jb.volume = 0.15;
            //we have to unmute the audio since it  is muted at time of loading
            jb.muted = false;
            jb.play();
        }
    }

    //play sound when participant leaves meeting
    playleftbeep() {
        let ulb = document.getElementById("userleftbeep");
        if (ulb != null) {
            ulb.currentTime = 0;
            ulb.volume = 0.15;
            //we have to unmute the audio since it  is muted at time of loading
            ulb.muted = false;
            ulb.play();
        }
    }

    //react function
    componentDidMount() {

        this.validate(this.state.token);
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

    //scroll to bottom of chat window when a new message is added.
    //important feature to have.
    scrollToBottom = () => {
        if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }

    componentDidUpdate() {
        //each time compoment updates scroll to bottom
        //this can be improved by identifying if new messages added
        this.scrollToBottom();
    }

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <div style={{ position: "fixed", bottom: "42px", left: "0px", zIndex: '10' }}><Emoji onSelect={this.handleEmojiSelect} /></div>;
        } else {
            return null;
        }
    }

    renderJoinMeetingModal() {
        return (
            <React.Fragment>
                <NavMenu onLogin={this.loginHandler} onInvite={this.inviteHandler} />
                <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="text-center">
                                    <button type="button" className="btn btn-primary btn-lg" onClick={this.handleJoinMeeting}>Join Meeting</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    //modal to show if meeting id is valid, when this is shown user cannot do anything else on the page execpt move to meetings page
    renderValidateModal() {
        return (
            <React.Fragment>
                <NavMenu onLogin={this.loginHandler} onInvite={this.inviteHandler} /><div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-body">
                                            <p className="m-2">This meeting id cannot be found. Please recheck with the meeting organizer.</p>
                                            <p className="m-2">Alternatively you can organize your own meeting. <Link to="/meetings">Organize a Meeting</Link></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    renderInviteModal() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Send Meeting Invites</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeInviteModal}>
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="mt-10">You can share this URL with anyone who wants to join the meeting.</p>
                                        <input type="text" value={window.location.href} autoFocus="on" className="form-control" />
                                        <p className="mb-10"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderNameForm() {
        let browserinfo = this.detectEdgeorIE() ? <p>You are using either EDGE or INTERNET EXPLORER.
            Your access is <strong>restricted</strong> to text chat only. You will have full feature access on <strong>chrome, firefox or safari</strong>.</p> : null;
        let mobilebrowserinfo = this.detectMobileorTablet() ? <p>You can join meeting on Mobile and Tablet device in <strong>Text Chat</strong> mode only. Please open the meeting
            link in a laptop or desktop computer or other bigger screen device.</p> : null;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-body">
                                        {browserinfo}
                                        {mobilebrowserinfo}
                                        <form onSubmit={this.handleNameForm}>
                                            <input type="text" required value={this.state.myname} autoFocus="on" className="form-control" maxLength="20" onChange={this.handleMyName} placeholder="Your Name Here" />
                                            <br /><button type="submit" className="btn btn-primary">Join Meeting</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderMessageList(hasVideos) {
        let alert = <React.Fragment></React.Fragment>;
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];
            if (obj.sender === null) {
                items.push(<li className="notify" key={k}><span>{obj.text}</span></li>);
            } else if (obj.sender.connectionID === this.myself.connectionID) {
                items.push(<li className="sent" key={k}>
                    <span>{obj.text}
                        <small className="time">{moment(obj.timeStamp, "YYYYMMDD").fromNow()}</small>
                    </span>
                </li>);
            } else {
                let userpic = obj.sender.pic !== "" ? <img src={obj.sender.pic} width="20" height="20" className="rounded img-fluid" /> : null;
                items.push(<li className="receive" key={k}>
                    <span>
                        <small className="name">{userpic} {obj.sender.name} says</small>
                        {obj.text}
                        <small className="time">{moment(obj.timeStamp, "YYYYMMDD").fromNow()}</small>
                    </span>
                </li>);
            }
        }
        if (this.state.showalert && this.state.messages.length > 0) {
            if (this.state.messages[this.state.messages.length - 1].sender === null) {
                alert = this.state.showalert ? <div className="alert alert-light meetingalert" role="alert">
                    {this.state.messages[this.state.messages.length - 1].text}
                </div> : null;
            } else {
                let userpic = this.state.messages[this.state.messages.length - 1].sender.pic !== "" ? <img src={this.state.messages[this.state.messages.length - 1].sender.pic} width="20" height="20" className="rounded img-fluid" /> : null;
                alert = this.state.showalert ? <div className="alert alert-light meetingalert" role="alert">
                    {userpic} {this.state.messages[this.state.messages.length - 1].sender.name} sent a message. <a href="#" className="alert-link" onClick={this.showChatList}>See Here</a>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close" onClick={this.onAlertDismiss}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div> : null;
            }
        }
        let cn = "col-md-12";
        //if browser is edge or ie let chat window have full width
        if (this.detectEdgeorIE()) {
            cn = "col-md-12";
        } else if (hasVideos) {
            cn = "col-xl-3";
        }
        if (this.state.showchatlist) {
            return (
                <React.Fragment>
                    {alert}
                    <div id="msgcont" className={cn}>
                        <p className="h5 text-left pl-1">Chat <button onClick={this.hideChatList} type="button" className="btn btn-sm float-right btn-dark rounded-0">Close</button></p>
                        <ul id="msglist" className="pt-1">
                            {items}
                            <li style={{ float: "left", clear: "both" }}
                                ref={(el) => { this.messagesEnd = el; }}>
                            </li>
                        </ul>
                    </div>
                </React.Fragment>
            );
        } else {
            return <React.Fragment>{alert}</React.Fragment>;
        }
    }

    renderVideoTags() {
        //this cssclass will decide who to place user videos
        let videocontcss = "";
        const items = [];
        let myvclass = "";

        this.users.forEach(function (value, key) {
            if (value.stream !== null) {
                let userpic = value.pic !== "" ? <img src={value.pic} width="20" height="20" className="rounded ml-1 mb-1 mt-1" /> : null;
                items.push(<li className="video" key={key}>
                    <video id={'video' + value.connectionID} autoPlay={true} playsInline muted="muted" volume="0"></video>
                    <span className="ctrl">
                        {userpic} <span className="name p-1">{value.name}</span>
                    </span>
                </li>);
            }
        });
        //beyond thirteen participant will all have same dimensions, 
        //less than 13 will change dimension based on number of participants
        videocontcss = (items.length < 13) ? "video" + items.length : "video13"

        //myvideo css class, if no participant show full screen else small docked on bottom left
        myvclass = (items.length === 0) ? "full" : "smalldocked";

        const myvstyle = (items.length === 0) ? { left: 0, top: 0 } : {};

        let myvcontainer =
            this.mystream !== null ? <div className={myvclass} id="myvideocont" style={myvstyle} >
                <video id="myvideo" muted="muted" volume="0" playsInline onMouseDown={this.handleDrag}></video>
            </div> : null;

        //Video should only be show if participants have a stream or myself have a stream
        if (items.length > 0 || this.mystream !== null) {
            return <div className="col-lg-12 col-xl-9 meetingvideocol">
                <div id="videocont">
                    {myvcontainer}
                    <ul id="videolist" className={videocontcss}>
                        {items}</ul>
                </div>
            </div>;
        } else { return null; }
    }

    handleDrag = (event) => {
        const target = document.querySelector("#myvideocont.smalldocked");
        const { clientX, clientY } = event;
        const { left, top } = target !== null ? target.getBoundingClientRect() : { left: 0, top: 0 };
        const shiftX = clientX - left;
        const shiftY = clientY - top;
        console.log("mousedown");
        function moveAt(pageX, pageY) {
            if (target !== null) {
                target.style.left = pageX - shiftX + "px";
                target.style.top = pageY - shiftY + "px";
            }
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        function onMouseUp(e) {
            document.removeEventListener("mousemove", onMouseMove);
            document.body.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp);
    }

    render() {
        /*if (!this.state.loggedin) {
            return <React.Fragment><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
                <div>
                    <h3>Login to Join Meeting</h3>
                </div>
                <HeartBeat activity="2" interval="3000" />
            </React.Fragment>;
        }
        else*/ if (!this.state.idvalid) {
            return <React.Fragment> {this.renderValidateModal()}
                <HeartBeat activity="2" interval="3000" /></React.Fragment>;
        }
        else if (this.myself !== null && this.myself.name.trim() === "") {
            return <React.Fragment>{this.renderNameForm()}
                <HeartBeat activity="2" interval="3000" />
            </React.Fragment>;
        }
        else if (!this.state.joinmeeting) {
            return <React.Fragment>{this.renderJoinMeetingModal()}
                <HeartBeat activity="2" interval="3000" />
            </React.Fragment>;
        }
        else if (this.state.joinmeeting) {
            let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
                <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
            </div> : null;
            let invite = this.state.showinvite ? this.renderInviteModal() : null;

            let vhtml = this.renderVideoTags();
            let mhtml = this.renderMessageList(vhtml == null ? false : true);
            let videotoggleele = this.state.videoplaying ? (
                <button
                    type="button"
                    className="btn btn-primary mr-1 ml-2 videoctrl"
                    onClick={this.handleVideoToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <img src="/icons/video.svg" alt="" width="24" height="24" title="Video On" />
                </button>
            ) : (
                    <button
                        type="button"
                        className="btn btn-light mr-1 ml-2 videoctrl"
                        onClick={this.handleVideoToggle}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <img src="/icons/video-off.svg" alt="" width="24" height="24" title="Video Off" />
                    </button>
                );
            let audiotoggleele = this.state.audioplaying ? (
                <button
                    type="button"
                    className="btn btn-primary mr-1 audioctrl"
                    onClick={this.handleAudioToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone On" />
                </button>
            ) : (
                    <button
                        type="button"
                        className="btn btn-light mr-1 audioctrl"
                        onClick={this.handleAudioToggle}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <img src="/icons/mic-off.svg" alt="" width="24" height="24" title="Microphone Off" />
                    </button>
                );
            //if browser is edge or ie no need to show video or audio control button
            if (this.detectEdgeorIE()) {
                audiotoggleele = null;
                videotoggleele = null;
            }
            return (
                <React.Fragment>
                    <NavMenu onLogin={this.loginHandler} onInvite={this.inviteHandler} onLeaveMeeting={this.leaveMeeting} fixed={true} />
                    <div className="container-fluid">
                        <div className="row">
                            {vhtml}
                            {mhtml}
                        </div>
                        {messagecontent}
                        {invite}
                        <audio id="chatbeep" muted="muted" volume="0">
                            <source src="/media/swiftly.mp3"></source>
                            <source src="/media/swiftly.m4r"></source>
                            <source src="/media/swiftly.ogg"></source>
                        </audio>
                        <audio id="joinedbeep" muted="muted" volume="0">
                            <source src="/media/got-it-done.mp3"></source>
                            <source src="/media/got-it-done.m4r"></source>
                            <source src="/media/got-it-done.ogg"></source>
                        </audio>
                        <audio id="userleftbeep" muted="muted" volume="0">
                            <source src="/media/get-outta-here.mp3"></source>
                            <source src="/media/get-outta-here.m4r"></source>
                            <source src="/media/get-outta-here.ogg"></source>
                        </audio>
                    </div>
                    <footer className="footer fixed-bottom">
                        <form className="form-inline" onSubmit={this.handleMessageSubmit}>
                            <table style={{ width : "100%", padding: 0}}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: "45px" }}>
                                            <button type="button" className={this.state.showemojimodal ? "btn btn-success" : "btn btn-outline-success"} onClick={this.handleEmojiModal}>😀</button>
                                        </td>
                                        <td>
                                            <input type="text" ref={(input) => { this.textinput = input; }} placeholder="Type a text message..." name="textinput" value={this.state.textinput} autoComplete="off" autoCorrect="On" autoFocus="On"
                                                onChange={this.handleChange} className="form-control mb-1" id="msginput" />
                                        </td>
                                        <td align="center" style={{ width: "170px", padding: 0 }}>
                                            <button type="submit" id="msgsubmit" className="btn btn-primary" title="Send Message"><img src="/icons/send.svg" alt="" width="24" height="24" title="Send Message" /></button>
                                            {videotoggleele}
                                            {audiotoggleele}
                                            <button type="button" className="btn btn-primary d-xl-none" title="Show Chat Window" onClick={this.showChatList}><img src="/icons/message-square.svg" alt="" width="24" height="24" title="Chat Window" /></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </footer>
                    {this.renderEmojiModal()}
                    <HeartBeat activity="2" interval="3000" />
                </React.Fragment>
            );
        } else {
            return null;
        }
    }
}


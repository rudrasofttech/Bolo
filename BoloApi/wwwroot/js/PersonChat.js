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
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"), textinput: '', dummy: Date.now(),
            videoCapable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            peerCapable: SimplePeer.WEBRTC_SUPPORT, videoplaying: false, audioplaying: false, showemojimodal: false, peerconnected: false
        };
        this.mystream = null;
        this.otherstream = null;
        this.peer = null;
        this.checkPersonPulseInterval = null;
        this.messages = (localStorage.getItem(p.id) !== null) ? new Map(JSON.parse(localStorage.getItem(p.id))) : new Map();
        this.hubConnection = null;
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
        this.checkPersonPulse = this.checkPersonPulse.bind(this);
        this.attachMyStreamToVideo = this.attachMyStreamToVideo.bind(this);
        this.attachOtherStreamToVideo = this.attachOtherStreamToVideo.bind(this);
        this.hubConnectionClosed = this.hubConnectionClosed.bind(this);
        this.hubConnectionReconnecting = this.hubConnectionReconnecting.bind(this);
        this.hubConnectionReconnected = this.hubConnectionReconnected.bind(this);

        this.messageStatusEnum = {
            Sent: 1,
            Received: 2,
            Seen: 3
        }
    }

    //since this component is destroyed everytime this static method is not needed each time constructor will be called
    //static getDerivedStateFromProps(props, state) {
    //    if (props.person.id !== state.person.id) {
    //        return {
    //            person: props.person
    //        };
    //    }
    //    return null;
    //}

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
        console.log("Hub Connection Reconnected");
        //this.sayHello();
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
            if (this.messages.get(messageid) !== undefined) {
                this.messages.get(messageid).status = status;
                localStorage.setItem(receiver.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries())));
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

    sendTextMessage() {
        if (this.state.textinput.trim() !== "") {
            this.hubConnection.invoke("SendTextMessage", this.state.person.id, this.state.myself.id, this.state.textinput)
                .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            this.setState({ textinput: '' });
        }
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
            this.playmsgbeep();

        } else {
            if (this.props.receivedMessage !== undefined) {
                this.props.receivedMessage(mi);
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
            //var video = document.getElementById('myvideo');

            //video.srcObject = this.mystream;
            ////only play when meta data is loaded from stream
            //video.onloadedmetadata = function (e) {
            //    if (video !== undefined) {
            //        //provision to reduce echoe
            //        //mute the self video
            //        video.volume = 0;
            //        video.muted = 0;

            //        //start playing the video
            //        video.play();

            //        //console.log(video.width + " " + video.height);
            //    }
            //};
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
            }
        }
        localStorage.setItem(this.state.person.id.toLowerCase(), JSON.stringify(Array.from(this.messages.entries())));
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
                });
                break;
            default:
        }
    }

    handleSend(e) {
        e.preventDefault();
        this.sendTextMessage();
    }

    //enable or disable video track of my stream
    handleVideoToggle(e) {
        if (this.mystream !== null) {
            if (this.mystream.getVideoTracks().length > 0) {
                this.mystream.getVideoTracks()[0].enabled = !this.state.videoplaying;
                this.setState({ videoplaying: !this.state.videoplaying }, () => { this.attachMyStreamToVideo(); });
            }
        } else {
            this.setState({ videoplaying: true, audioplaying : true });
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

    componentDidMount() {
        this.startHub();
        this.updateReceivedMessageStatusAll();
        this.scrollToBottom();
        this.checkPersonPulseInterval = setInterval(this.checkPersonPulse, 5000);
        //set unseenmessage count of person to zero and save
        let clist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (clist.get(this.state.person.id.toLowerCase()) !== undefined) {
            clist.get(this.state.person.id.toLowerCase()).unseenMessageCount = 0;
        }
        localStorage.setItem("contacts", JSON.stringify(Array.from(clist)));
    }

    //componentDidUpdate(prevProps, prevState) {
    //    if (prevState.person.id !== this.state.person.id) {
    //        this.messages = (localStorage.getItem(this.state.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(this.state.person.id))) : new Map();
    //        this.updateReceivedMessageStatusAll();
    //        this.setState({ dummy: Date.now() });
    //        //each time compoment updates scroll to bottom
    //        //this can be improved by identifying if new messages added
    //        this.scrollToBottom();
    //    }

    //}

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

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <div style={{ position: "fixed", bottom: "42px", left: "0px" }}><Emoji onSelect={this.handleEmojiSelect} /></div>;
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

    renderMessages() {
        let sentlistyle = { display: "block", textAlign: 'right' };
        let reclistyle = { display: "block", textAlign: 'left' };
        let sentmessagestyle = {
            margin: "4px", maxWidth: "80%", position: "relative",
            padding: ".2rem",
            fontSize: "1rem",
            border: "none",
            borderRadius: ".25rem",
            display: "inline-block",
            color: "#000",
            backgroundColor: "#DBF4FD",
            wordWrap: "break-word"
        };
        let recmessagestyle = {
            margin: "4px", maxWidth: "80%", position: "relative",
            padding: ".2rem",
            border: "none",
            borderRadius: ".25rem",
            fontSize: "1rem",
            display: "inline-block",
            color: "#000",
            backgroundColor: "#F2F6F9",
            wordWrap: "break-word"
        };
        const items = [];
        for (const [key, obj] of this.messages.entries()) {
            if (obj.sender === this.state.myself.id) {
                items.push(<li style={sentlistyle} key={key}>
                    <div style={sentmessagestyle} >
                        <span dangerouslySetInnerHTML={{ __html: transformMessage(obj.text) }}></span>
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment(obj.timestamp.replace(" UTC", "")).fromNow(true)}</small></span>
                    </div>
                </li>);
            } else {
                items.push(<li style={reclistyle} key={key}>
                    <div style={recmessagestyle} className="alert alert-info">
                        <span dangerouslySetInnerHTML={{ __html: transformMessage(obj.text) }}></span>
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment(obj.timestamp.replace(" UTC", "")).fromNow(true)}</small></span>
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
                othervideo = <video id="othervideo" muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight:"70vh" }}></video>;
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
            return <div className="col col-sm-7 videochatcolumn" style={{ padding: "0px 5px",textAlign : "center" }}>
                {othervideo}
                {myvideo}
            </div>;
        } else {
            return null;
        }
    }

    render() {

        if (this.messages.length == 0) { profile = <ViewProfile profile={this.state.person} />; }

        let pic = <img src="/images/nopic.jpg" className="mx-auto d-block img-fluid" alt="" />;
        if (this.state.person !== null) {
            if (this.state.person.pic !== "") {
                pic = <img src={this.state.person.pic} className="mx-auto d-block img-fluid" alt="" />;
            }
        }

        let videotoggleele = this.state.videoplaying ? <button type="button" className="btn btn-primary mr-1 ml-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video On" />
        </button> : <button type="button" className="btn btn-secondary mr-1 ml-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
                <img src="/icons/video.svg" alt="" width="24" height="24" title="Video Off" />
            </button>;
        let audiotoggleele = this.state.audioplaying ?
            <button type="button" className="btn btn-primary mr-1 ml-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()}>
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone On" />
            </button>
            : <button type="button" className="btn btn-secondary mr-1 ml-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()} >
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
        return (
            <React.Fragment>
                <div className="personalchatcont">
                    <table className="chatpersoninfocont sticky-top">
                        <tbody>
                            <tr>
                                <td width="40px" align="right">
                                    <button type="button" className="btn btn-light" onClick={() => this.props.handleShowSearch(true)}>⇐</button>
                                </td>
                                <td width="40px" className="noPadding">
                                    {pic}
                                </td>
                                <td className="noPadding">
                                    <h5 className="ml-1" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={this.state.person.name}>{online} {this.state.person.name}</h5>
                                </td>
                                <td width="37px">
                                    {videotoggleele}
                                </td><td width="37px">
                                    {audiotoggleele}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="videochatcont container-fluid">
                        <div className="row">
                            {this.renderVideo()}
                            <div className="col-sm border-left" style={{ padding: "0px 5px" }}>
                                <div className="chatmsgcont">
                                    <ul className="list-unstyled">{this.renderMessages()}</ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={this.handleSend}>
                        <div className="border-top chatinputcontainer" style={{ position: "relative", height : "40px" }}>
                            <input type="text" ref={(input) => { this.textinput = input; }} name="textinput" autoComplete="off" className="form-control mb-1" value={this.state.textinput} onChange={this.handleChange} width="100%" />
                            <button type="button" className={this.state.showemojimodal ? "btn btn-sm btn-primary d-none d-sm-block" : "btn btn-sm btn-light d-none d-sm-block"} onClick={this.handleEmojiModal} style={{ position: "absolute", right: "50px", bottom: "4px" }} >😀</button>
                            <button type="button" id="msgsubmit" className="btn btn-sm btn-primary " title="Send Message" onClick={(e) => this.sendTextMessage()} style={{ position: "absolute", right: "5px", bottom: "3px" }}><img src="/icons/send.svg" alt="" width="24" height="24" title="Send Message" /></button>
                        </div>
                    </form>
                    {this.renderEmojiModal()}
                </div>
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
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
            //this.hubConnection.invoke("MessageStatus", id, sender, this.state.myself.id, this.messageStatusEnum.Received)
            //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
            this.setMessageStatus(mi.id, "SetSeen");
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

        //remove messages from server
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
            this.textinput.style.height = 'inherit';

            // Get the computed styles for the element
            const computed = window.getComputedStyle(this.textinput);

            // Calculate the height
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + this.textinput.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

            //this.textinput.style.height = `${height}px`;

            this.textinput.style.minHeight = `${this.textinput.scrollHeight}px`;
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
        this.startHub();
        this.scrollToBottom();
        this.updateReceivedMessageStatusAll();
        this.deleteMyMessagesFromServer();
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

    getFileExtensionBasedName(filename) {
        return filename.substring(61, filename.length);
    }

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <div style={{ position: "fixed", bottom: "42px", right: "0px" }}><Emoji onSelect={this.handleEmojiSelect} /></div>;
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
                    <img src={msg.text} className='img-fluid d-block mt-1 mb-1 img-thumbnail' style={{ maxWidth: "260px" }} />
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
                        <img src="/icons/download-cloud.svg" className='img-fluid' title="download file" />
                        <br />
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
            margin: "0 auto", maxWidth: "80%", width: "25rem"
        };
        if (contactlist.get(this.state.person.id) !== undefined) {
            if (contactlist.get(this.state.person.id).boloRelation === BoloRelationType.Temporary) {
                html = <li style={style} >
                    <div className="card bg-light mb-3">
                        <div class="card-header">New Contact</div>
                        <div class="card-body">
                            <h5 className="card-title">Take Action Here</h5>
                            <p class="card-text">This person is not your contact list.</p>
                            <button className="btn btn-primary mr-2" onClick={this.handleAddToContacts}>Add to Contacts</button>
                            <button className="btn btn-dark" onClick={this.handleBlockandRemove}>Block and Remove</button>
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
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment(obj.timestamp.replace(" UTC", "")).fromNow(true)}</small> <small style={{ fontSize: "0.75rem" }}>{this.showMessageStatus(obj.status)}</small></span>
                    </div>
                </li>);
            } else {
                items.push(<li style={reclistyle} key={key}>
                    <div style={recmessagestyle} className="alert alert-info">
                        {this.renderLinksInMessage(obj)}
                        <span className="d-block"><small style={{ fontSize: "0.75rem" }}>{moment(obj.timestamp.replace(" UTC", "")).fromNow(true)}</small></span>
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
                        <div className="modal-body">
                            <button type="button" className="close float-right" data-dismiss="modal" aria-label="Close" onClick={this.handleProfileModalClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <ViewProfile profile={this.state.person} />
                        </div>
                    </div>
                </div>
            </div>;
        }

        let videotoggleele = this.state.videoplaying ? <button type="button" className="btn btn-sm btn-primary mr-1 ml-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <img src="/icons/video.svg" alt="" width="24" height="24" title="Video On" />
        </button> : <button type="button" className="btn btn-secondary btn-sm mr-1 ml-1 videoctrl" onClick={this.handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
                <img src="/icons/video.svg" alt="" width="24" height="24" title="Video Off" />
            </button>;
        let audiotoggleele = this.state.audioplaying ?
            <button type="button" className="btn btn-primary btn-sm mr-1 ml-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()}>
                <img src="/icons/mic.svg" alt="" width="24" height="24" title="Microphone On" />
            </button>
            : <button type="button" className="btn btn-secondary btn-sm mr-1 ml-1 audioctrl" onClick={this.handleAudioToggle} onMouseDown={(e) => e.stopPropagation()} >
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
            chatmsgcontstyle = { padding: "0px 200px" };
        }
        return (
            <React.Fragment>
                <div className="personalchatcont">
                    <table className="chatpersoninfocont sticky-top">
                        <tbody>
                            <tr>
                                <td width="40px" align="right">
                                    <button type="button" className="btn btn-light" onClick={() => this.props.handleShowSearch(true)}>❮</button>
                                </td>
                                <td width="40px" className="noPadding">
                                    {pic}
                                </td>
                                <td className="noPadding">
                                    <h5 className="ml-1" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={this.state.person.name}>{online} {this.state.person.name}</h5>
                                </td>
                                <td width="50px" style={{ paddingRight: "10px" }}>
                                    <BlockContact myself={this.state.myself} person={this.state.person} onRelationshipChange={this.handleContactRelationshipChange} />
                                </td>
                                <td width="37px">
                                    <li className="list-inline-item">
                                        <div className="dropdown">
                                            <a className="btn btn-light btn-sm dropdown-toggle" href="#" role="button" id="navbarDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <img src="/icons/file-plus.svg" alt="" width="24" height="24" title="Share Files" />
                                            </a>
                                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                                <a className="dropdown-item" href="#" onClick={this.handlePhotoClick} title="20 Files at a time, max files size 10 MB">Photos and Videos</a>
                                                <a className="dropdown-item" href="#" onClick={this.handleDocClick} title="20 Files at a time, max files size 10 MB">Documents</a>
                                                <input type="file" style={{ display: "none" }} ref={(el) => { this.fileinput = el; }} accept=".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*" onChange={this.handleFileInput} multiple="multiple" />
                                            </div>
                                        </div>
                                    </li>
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
                            {videohtml}
                            <div className="col-sm border-left" style={{ padding: "0px 5px" }}>
                                <div className="chatmsgcont" style={chatmsgcontstyle}>
                                    <ul className="list-unstyled">{this.renderMessages()}</ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={this.handleSend}>
                        <div className="border-top chatinputcontainer" style={{ position: "relative", height: "40px" }}>
                            <textarea ref={(input) => { this.textinput = input; }} name="textinput" autoComplete="off" accessKey="t" title="Keyboard Shortcut ALT + t"
                                className="form-control" value={this.state.textinput} onChange={this.handleChange} width="100%"
                                style={{ height: "40px", overflow: "hidden", resize: "none", position: "absolute", bottom: "0px", left: "0px", maxHeight: "200px" }}></textarea>
                            <button type="button" className={this.state.showemojimodal ? "btn btn-sm btn-warning d-none d-sm-block" : "btn btn-sm btn-light d-none d-sm-block"} onClick={this.handleEmojiModal} style={{ position: "absolute", right: "50px", bottom: "3px" }} accessKey="o" title="Keyboard Shortcut ALT + o" ><img src="/icons/smile.svg" alt="" width="24" height="24" /></button>
                            <button type="submit" id="msgsubmit" className="btn btn-sm btn-dark " title="Send Message" style={{ position: "absolute", right: "5px", bottom: "3px" }} title="Keyboard Shortcut ALT + s" accessKey="s"><img src="/icons/send.svg" alt="" width="24" height="24" /></button>
                        </div>
                    </form>
                    {this.renderEmojiModal()}
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
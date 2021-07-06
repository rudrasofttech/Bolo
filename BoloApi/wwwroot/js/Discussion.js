﻿class Discussion extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            redirectto: '', textinput: '', filestoupload: [], myself: null,
            showadd: false, videoplaying: false, audioplaying: false,
            loading: false, loggedin: loggedin, bsstyle: '', message: '', members: [],
            discussion: this.props.discussion === null ? { id: '', name: '', purpose: '', pic: '' } : this.props.discussion,
            messages: this.props.discussion === null ? [] : localStorage.getItem(this.props.discussion.id) === null ? [] : JSON.parse(localStorage.getItem(this.props.discussion.id)),
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            dummydate: new Date(), idvalid: true, showemojimodal: false, screensplit: false, showmembers: false
        };


        this.hasVideoAudioCapability = this.hasVideoAudioCapability.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBackButton = this.handleBackButton.bind(this);
        this.updateTextInputHeight = this.updateTextInputHeight.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.freader = new FileReader();
        this.handleEmojiModal = this.handleEmojiModal.bind(this);
        this.handleEmojiSelect = this.handleEmojiSelect.bind(this);
        this.handlePhotoClick = this.handlePhotoClick.bind(this);
        this.handleDocClick = this.handleDocClick.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleFileChunkUpload = this.handleFileChunkUpload.bind(this);
        this.processFileUpload = this.processFileUpload.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.handleMembersButton = this.handleMembersButton.bind(this);
        this.handleMembersModalClose = this.handleMembersModalClose.bind(this);
        this.handleAddMember = this.handleAddMember.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleInviteModalClose = this.handleInviteModalClose.bind(this);
    }

    detectEdgeorIE() {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        //return (isIE || isEdge);

        return false;
    }

    detectMobileorTablet() {
        //check based on useragent and device width
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check || window.matchMedia("(max-width: 768px)").matches;
    }

    detectXtralargeScreen() {
        return window.matchMedia("(min-width: 1024px)").matches;
    }

    //check if browser supports access to camera and microphone
    hasVideoAudioCapability() {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    validateDiscussionObject(t) {
        if (this.state.discussion === undefined || this.state.discussion.id === '') {
            this.setState({ idvalid: false });
        } else {
            fetch('/api/Meetings/' + this.state.discussion.id, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + t
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {

                            //now that we have validated meeting id then set messages from local storage if there are any 
                            let mlist = localStorage.getItem(this.state.discussion.id) === null ? [] : JSON.parse(localStorage.getItem(this.state.discussion.id));
                            //if there aren't any messages in localstorage then set name and purpose of the meeing
                            if (mlist.length === 0) {
                                if (data.name !== null && data.name !== '') {
                                    document.title = data.name;
                                    var mi = {
                                        sentBy: null,
                                        message: data.name
                                    };
                                    mlist.push(mi);
                                }
                                if (data.purpose !== null && data.purpose !== '') {
                                    var mi = {
                                        sentBy: null,
                                        message: data.purpose
                                    };
                                    mlist.push(mi);
                                }

                            }

                            this.setState({ idvalid: true, loading: false, messages: mlist, meetingname: data.name });

                            this.getMembers();
                        });
                    } else {
                        this.setState({ idvalid: false });
                    }
                });
        }
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
                    this.props.handleShowDiscussions(true);
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        console.log(data);
                        this.setState({
                            loggedin: true, loading: false, myself: {
                                id: data.id, name: data.name, videoCapable: this.hasVideoAudioCapability() && !this.detectEdgeorIE(),
                                peerCapable: SimplePeer.WEBRTC_SUPPORT && !this.detectEdgeorIE(),
                                pic: data.pic
                            }
                        });
                    });
                }
            });
    }

    getMembers() {
        fetch('/api/Meetings/members/' + this.state.discussion.id, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + this.state.token
            }
        })
            .then(response => {
                if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        console.log(data);
                        this.setState({
                            members: data
                        });
                    });
                }
            });
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

    //start SignalR hub invoke preliminary functions and set on event handlers
    startHub() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => this.state.token })
            .withAutomaticReconnect()
            .build();
        this.hubConnection.serverTimeoutInMilliseconds = 100000; // 1 second
        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
        }).catch(err => { console.log('Error while establishing connection :('); console.log(err); });


        this.hubConnection.onclose(this.hubConnectionClosed);

        this.hubConnection.onreconnecting(this.hubConnectionReconnecting);

        this.hubConnection.onreconnected(this.hubConnectionReconnected);

        //Handle New User Arrived server call
        //userinfo paramt will be sent by server as provided by other
        //user
        //this.hubConnection.on('NewUserArrived', (u) => {
        //    //console.log(u);
        //    this.newUserArrived(u);
        //});

        //receive updated user object from target
        //this can be any thing user name, video capability, audio capability or
        //peer capability and status of target user
        //this.hubConnection.on('UpdateUser', (u) => {
        //    this.updateUser(u);
        //});

        //userleft is called by server when a user invokes leavemeeting function
        //use this function to perform cleanup of peer object and user object
        //this.hubConnection.on('UserLeft', (cid) => {
        //    //console.log(cid);
        //    this.userLeft(cid);
        //});

        //this function is called by server when client invoke HelloUser server function
        //this is called in response to newuserarrived function
        //so that new user can add existing users to its list
        //this.hubConnection.on('UserSaidHello', (sender, receiver) => { this.userSaidHello(sender, receiver); });

        //this function is called by server when user invokes joinmeeting function on server
        //setmyself receives userinfo from server, like if user is logged then its public id, name and signalr connection id
        //this.hubConnection.on('SetMySelf', (u) => { this.setMySelf(u); });

        //this function is called by server when it receives a sendtextmessage from user.
        this.hubConnection.on('ReceiveDiscussionMessage', (meetingid, mmdto) => { console.log("rec"); this.receiveTextMessage(meetingid, mmdto); });

        //this function is strictly call by server to transfer WebRTC peer data
        //this.hubConnection.on('ReceiveSignal', (target, sender, data) => {
        //    //console.log("receivesignal sender : " + sender);
        //    //console.log("receivesignal data : " + data);
        //    if (this.myself.memberID === target) {
        //        if (this.peers.get(sender.memberID) !== undefined) {
        //            this.peers.get(sender.memberID).signal(data);
        //        }
        //    }
        //})

        //function is called by server in response to sendpulse server call
        //this.hubConnection.on('ReceivePulse', (senderid) => {
        //    //console.log(cid);
        //    this.receivePulse(senderid);
        //});

        //this.hubConnection.on("ReceiveActionNotification", (sender, action) => { this.receiveActionNotification(sender, action); });
    }

    receiveTextMessage(mid, mmdto) {
        let mlist = this.state.messages;
        var temp = mmdto;
        temp.sentBy = { id: mmdto.sentBy.id, name: mmdto.sentBy.name };
        mlist.push(temp);
        this.setState({ messages: mlist, showalert: !this.state.showchatlist }, () => {
            //if there is name for meeting than save meeting data to local storage
            if (this.state.discussion !== null) {
                localStorage.setItem(this.state.discussion.id, JSON.stringify(mlist));
            }
        });
        this.playmsgbeep();
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

    //scroll to bottom of chat window when a new message is added.
    //important feature to have.
    scrollToBottom = () => {
        if (!this.detectMobileorTablet()) {
            if (this.messagesEnd !== undefined && this.messagesEnd !== null) {
                this.messagesEnd.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    //react function
    componentDidMount() {

        this.validate(this.state.token);
        this.validateDiscussionObject(this.state.discussion);

        this.startHub();
        //this.aliveInterval = setInterval(this.collectDeadUsers, 5000);
        this.scrollToBottom();
    }

    generateVideoThumbnail(filename, id) {
        fetch('//' + window.location.host + '/api/members/GenerateThumbnail?filename=' + filename + '&id=' + id, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
    }

    processFileUpload() {
        let m = null;
        if (this.state.filestoupload.length > 0) {
            m = this.state.filestoupload[0];
        }

        if (m !== null) {
            this.freader = new FileReader();
            this.freader.uploadFile = this.uploadFile;
            this.uploadFile(this.state.discussion.id, m, 0);
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

    handleFileChunkUpload(data, msg, start, next_slice, slice_size) {

        const fd = new FormData();
        fd.set("f", data);
        fd.set("meetingid", this.state.discussion.id);
        fd.set("filename", msg.name /*start === 0 ? msg.name : msg.serverfname*/);
        fd.set("gfn", false /*start === 0 ? true : false*/);
        fetch('//' + window.location.host + '/api/meetings/uploadfile', {
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
                                fetch('api/MeetingMessage', {
                                    method: 'post',
                                    body: JSON.stringify({ meetingid: this.state.discussion.id, message: 'https://' + window.location.host + '/api/meetings/media/' + this.state.discussion.id + '?f=' + msg.serverfname }),
                                    headers: {
                                        'Authorization': 'Bearer ' + localStorage.getItem("token"),
                                        'Content-Type': 'application/json'
                                    }
                                });

                                this.setState({ filestoupload: flist });
                                this.generateVideoThumbnail(msg.serverfname, this.state.discussion.id);

                                this.processFileUpload();
                            } else {
                                this.setState({ filestoupload: flist });
                                //if there is more to file than call upload file again
                                this.uploadFile(this.state.discussion.id, msg, next_slice);
                            }
                            break;
                        }
                    }
                });

            }
        });
    }

    handleChange(e) {
        switch (e.target.name) {
            case 'textinput':
                this.setState({ textinput: e.target.value }, () => { this.updateTextInputHeight(); });
                break;
            default:
        }
    }

    handleBackButton() {
        this.props.handleShowDiscussions(true);
    }

    handleAddMember() {

    }

    handleAdd() {
        this.setState({ showadd: true });
    }
    handleInviteModalClose() {
        this.setState({ showadd: false });
    }

    handleMembersButton() {
        this.setState({ showmembers: true });
    }

    handleMembersModalClose() {
        this.setState({ showmembers: false });
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

    sendMessage() {
        fetch('api/MeetingMessage', {
            method: 'post',
            body: JSON.stringify({ meetingid: this.state.discussion.id, message: this.state.textinput }),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token"),
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                this.setState({ loading: false });
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        this.setState({ textinput: "" }, () => { this.updateTextInputHeight(); });
                    });
                } else {
                    this.setState({ bsstyle: 'danger', message: 'Unable to send message. Please try again.' });
                }
            });
    }

    renderFileUploadProcessModal() {
        let items = [];
        for (var i = 0; i < this.state.filestoupload.length; i++) {
            let f = this.state.filestoupload[i];
            items.push(
                <div className="row" key={i}>
                    <div className="col-9 col-sm-10">
                        <div className="progress">
                            <div className="progress-bar progress-bar-animated" role="progressbar" aria-valuenow={f.progresspercent} aria-valuemin="0" aria-valuemax="100" style={{ width: f.progresspercent + "%" }}></div>
                        </div>
                    </div>
                    <div className="col-3 col-sm-2"><button type="button" className="btn btn-sm btn-light" onClick={(e) => this.handleFileUploadCancel(e, f.name)}>Cancel</button></div>
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

    renderEmojiModal() {
        if (this.state.showemojimodal) {
            return <div style={{ position: "fixed", bottom: "45px", right: "15px", zIndex: '15' }}><Emoji onSelect={this.handleEmojiSelect} /></div>;
        } else {
            return null;
        }
    }

    getUrlParameter(name, filename) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(filename);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    getFileExtensionBasedName(filename) {
        return this.getUrlParameter("f", filename);
    }

    renderAddModal() {
        if (this.state.showadd) {
            const items = [];
            const contacts = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
            contacts.forEach((contacts, keys) => {
                let obj = contacts.person;
                let blocked = contacts.boloRelation === BoloRelationType.Blocked ? <span className="badge bg-danger">Blocked</span> : null;
                let pic = obj.pic !== "" ? <img src={obj.pic} className="card-img" alt="" /> : null;

                items.push(<tr><td>{pic}{obj.name} {blocked}</td><td style={{ width: "40px" }}><button type="button" className="btn btn-sm btn-primary" onClick={this.handleAddMember}>Add</button></td></tr>);
            });
            

            return (
                <div className="modal d-block" id="invitesModal" tabindex="-1" aria-labelledby="invitesModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="invitesModalLabel">Contacts</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleInviteModalClose}></button>
                            </div>
                            <div className="modal-body">
                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        {items}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>);
        } else {
            return null;
        }
    }

    renderMembers() {
        if (this.state.showmembers) {
            const items = [];
            if (this.state.myself != null) {
                for (var k in this.state.members) {
                    let obj = this.state.members[k];
                    let mtype = "";
                    switch (obj.memberType) {
                        case 6:
                            mtype = "Owner";
                            break;
                        case 3:
                            mtype = "Admin";
                            break;
                        case 1:
                            mtype = "";
                            break;
                        case 4:
                            mtype = "Pending";
                            break;
                        case 5:
                            mtype = "Blocked";
                            break;
                        default:
                    }
                    items.push(<tr><td>{obj.member.name}</td><td style={{ width: "40px" }}>{mtype}</td></tr>);
                }
            }
            return (
                <div className="modal d-block" id="membersModal" tabindex="-1" aria-labelledby="membersModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="membersModalLabel">Members</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={this.handleMembersModalClose}></button>
                            </div>
                            <div className="modal-body">
                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        {items}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>);
        } else {
            return null;
        }
    }

    renderLinksInMessage(msg) {
        var tempmid = Date.now();
        if (msg.message.startsWith("https://" + window.location.host + "/api/meetings/media/")) {
            if (msg.message.toLowerCase().endsWith(".jpg") || msg.message.toLowerCase().endsWith(".jpeg") || msg.message.toLowerCase().endsWith(".png") || msg.message.toLowerCase().endsWith(".gif") || msg.message.toLowerCase().endsWith(".bmp")) {
                return <span id={tempmid}>
                    <img src={msg.message} className='img-fluid d-block mt-1 mb-1 img-thumbnail' style={{ maxWidth: "300px" }} />
                </span>;
            }
            else if (msg.message.toLowerCase().endsWith(".mp3")) {
                return <span id={tempmid}>
                    <audio src={msg.message} controls playsInline style={{ maxWidth: "300px" }} />
                </span>;
            }
            else if (msg.message.toLowerCase().endsWith(".ogg") || msg.message.toLowerCase().endsWith(".mp4") || msg.message.toLowerCase().endsWith(".webm") || msg.message.toLowerCase().endsWith(".mov")) {
                return <span id={tempmid}>
                    <video src={msg.message.toLowerCase()} controls playsInline style={{ maxWidth: "300px" }} />
                </span>;
            }
            else {
                return <span id={tempmid}>
                    <a href={msg.message} target="_blank">
                        {this.getFileExtensionBasedName(msg.message.toLowerCase())}
                    </a>
                </span>;
            }
        } else {
            return <span id={tempmid}>{msg.message.split('\n').map((item, key) => {
                return <React.Fragment key={key}>{item}<br /></React.Fragment>
            })}</span>
        }
    }

    renderMessageList() {
        const items = [];
        if (this.state.myself != null) {
            for (var k in this.state.messages) {
                let obj = this.state.messages[k];
                if (obj.sentBy === null) {
                    items.push(<li className="notify" key={k}><span>{obj.message}</span></li>);
                } else if (obj.sentBy.id === this.state.myself.id) {
                    items.push(<li className="sent" key={k}>
                        <span>
                            {this.renderLinksInMessage(obj)}
                            <small className="time">{moment(obj.sentDate, "YYYYMMDD").fromNow()}</small>
                        </span>
                    </li>);
                } else {
                    let userpic = obj.sentBy.pic !== "" ? <img src={obj.sentBy.pic} width="20" height="20" className="rounded img-fluid" /> : null;
                    items.push(<li className="receive" key={k}>
                        <span>
                            <small className="name">{userpic} {obj.sentBy.name} -</small>
                            {this.renderLinksInMessage(obj)}
                            <small className="time">{moment(obj.sentDate, "YYYYMMDD").fromNow()}</small>
                        </span>
                    </li>);
                }
            }
        }
        let cn = "col-12";
        //if browser is edge or ie let chat window have full width
        if (this.state.screensplit) {
            cn = "col-9";
        }

        return (
            <React.Fragment>
                <div className={cn}>
                    <div id="msgcont">
                        <ul id="msglist" className="pt-1" style={{ marginBottom: "45px" }}>
                            {items}
                            <li style={{ float: "left", clear: "both" }}
                                ref={(el) => { this.messagesEnd = el; }}>
                            </li>
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        );

    }

    render() {
        let leave = null;
        if (this.state.discussion.memberRelation === 6) {
            leave = <button className="btn btn-dark me-2 float-end" type="button">Leave</button>
        }
        return (
            <React.Fragment>
                <div className="fixed-top bg-light container-fluid p-2">
                    <button className="btn  btn-light me-2" type="button" onClick={this.handleBackButton}>❮</button>
                    <h4 style={{ "display": "inline-block" }}>{this.state.discussion.name}</h4>
                    <button className="btn btn-outline-dark me-2 float-end" type="button" onClick={this.handleAdd}>Add</button>
                    <button className="btn btn-outline-dark me-2 float-end" type="button" onClick={this.handleMembersButton}>Members</button>
                </div>
                <div className="container-fluid p-2">
                    <div className="row-fluid">
                        {this.renderMessageList()}
                        {this.renderMembers()}
                        {this.renderAddModal()}
                    </div>
                </div>
                <div className="fixed-bottom bg-light container-fluid p-2">
                    <table style={{ "width": "100%" }}>
                        <tbody>
                            <tr>
                                <td style={{ "width": "60px" }}>
                                    <div className="btn-group dropup">
                                        <button className="btn  btn-light dropdown-toggle" type="button" id="fileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                            <img src="/icons/file-plus.svg" alt="" width="24" height="24" title="Share Files" />
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="fileDropdown">
                                            <li><a className="dropdown-item" href="#" onClick={this.handlePhotoClick} title="20 Files at a time, max files size 10 MB">Photos and Videos</a></li>
                                            <li><a className="dropdown-item" href="#" onClick={this.handleDocClick} title="20 Files at a time, max files size 10 MB">Documents</a>
                                                <input type="file" style={{ display: "none" }} ref={(el) => { this.fileinput = el; }} accept=".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*" onChange={this.handleFileInput} multiple="multiple" />                            </li>
                                        </ul>
                                    </div>
                                </td>
                                <td>
                                    <textarea ref={(input) => { this.textinput = input; }} name="textinput" id="msginput" placeholder="Type a text message..." autoComplete="off"
                                        className="form-control" value={this.state.textinput} onChange={this.handleChange} rows="1"
                                        style={{ height: "40px", overflow: "hidden", resize: "none", maxHeight: "200px" }}></textarea>
                                </td>
                                <td style={{ "width": "100px" }}>
                                    <button className={this.state.showemojimodal ? "btn  btn-warning" : "btn  btn-light"} type="button"><img src="/icons/smile.svg" alt="" width="15" height="15" title="Send Message" /></button>
                                    <button className="btn  btn-dark me-2" type="button" onClick={this.sendMessage}><img src="/icons/send.svg" alt="" width="15" height="15" title="Send Message" /></button>

                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </React.Fragment>);
    }
}
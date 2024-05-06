import { useEffect, useRef, useState } from "react";
import { MessageModel } from "./shared/Model";
import { useAuth } from "./shared/AuthProvider";

import { Utility } from "./Utility";
import * as signalR from "@microsoft/signalr";
import ViewProfile from "./ViewProfile";
import * as SimplePeer from "simple-peer";
import Moment from 'react-moment';
import DropDownButton from "./shared/UI/DropDownButton";
import Spinner from "./shared/Spinner";
import ShowMessage from "./shared/ShowMessage";

const BoloRelationType =
{
    Temporary: 1,
    Confirmed: 2,
    Search: 3,
    Blocked: 4
}
function PersonChat(props) {
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const [message, setMessage] = useState(new MessageModel());
    //const [person, setPerson] = useState(props.person);
    const [filestoupload, setFilesToUpload] = useState([]);
    const [textinput, setTextInput] = useState("");
    const [dummy, setDummy] = useState(new Date());
    const [videoplaying, setVideoPlaying] = useState(false);
    const [audioplaying, setAudioPlaying] = useState(false);
    const [showemojimodal, setShowEmojiModal] = useState(false);
    const [peerconnected, setPeerConnected] = useState(false);
    const [profiletoshow, setProfileToShow] = useState(null);
    const [showprofilemodal, setShowProfileModal] = useState(false);
    const videoCapable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const peerCapable = SimplePeer.WEBRTC_SUPPORT;
    const [messageContainerHeight, setMessageContainerHeight] = useState(166);
    let mystream = null;
    let otherstream = null;
    let peer = null;
    let checkPersonPulseInterval = null;
    let messages = useRef((localStorage.getItem(props.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(props.person.id))) : new Map());
    let hubConnection = null;
    let freader = new FileReader();
    const messagesEnd = useRef(null);
    const fileinput = useRef(null);
    const textinputele = useRef(null);
    const inputcontainer = useRef(null);


    const messageStatusEnum = {
        Pending: 0,
        Sent: 1,
        Received: 2,
        Seen: 3
    }

    const hubConnectionClosed = (err) => {
        console.log("Hub connection is closed");
        console.log(err);
        //hubConnection.start().then(() => {
        //    console.log('Hub Connection started!');
        //    //join meeting room
        //    //sayHello();
        //}).catch(err => console.log('Error while establishing connection :('));
    }

    const hubConnectionReconnecting = (err) => {
        console.log("Hub connection is reconnecting");
        console.log(err);
    }

    const hubConnectionReconnected = (connectionid) => {
        console.log("Hub Connection Reconnected, Check for sent messages on server");
        fetchSentMessages();
    }

    const setContactRelation = (relationship) => {
        fetch(`${Utility.GetAPIURL()}/api/Contacts/ChangeRelation/${props.person.id}?t=${relationship}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let contactlist = (localStorage.getItem("contacts") !== null) ?
                        new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    if (contactlist.get(props.person.id) !== undefined) {
                        contactlist.get(props.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    }

                    if (data.boloRelation === BoloRelationType.Blocked) {
                        try {
                            props.handleShowSearch(true);
                        } catch (err) {
                            setMessage(new MessageModel("danger", "Error in blocking and removing contact. " + err));
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
    const fetchSentMessages = () => {
        fetch(`${Utility.GetAPIURL()}/api/ChatMessages/SentMessages?sender=${props.person.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    for (let k in data) {
                        if (!messages.current.has(data[k].id)) {
                            let temp = data[k];
                            let mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: messageStatusEnum.Received };
                            messages.current.set(mi.id, mi);
                            //hubConnection.invoke("MessageStatus", mi.id, mi.sender, myself.id, messageStatusEnum.Received)
                            //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                            setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    setDummy(Date.now());
                    localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));

                });
            }
        });
    }

    const fetchMessages = () => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/ChatMessages?sender=${props.person.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    messages.current.clear();
                    for (let k in data) {
                        let temp = data[k];
                        let mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: messageStatusEnum.Received };
                        messages.current.set(mi.id, mi);
                        if (temp.status !== messageStatusEnum.Received) {
                            setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    setDummy(Date.now());
                    localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
                    scrollToBottom();
                    updateReceivedMessageStatusAll();
                });
            }
        }).catch(err => {
            setMessage(new MessageModel("danger", "Unable to fetch messages from server"));
            console.log(err);
        }).finally(() => {
            setLoading(false);
        });
    }

    const setMessageStatus = (mid, action) => {
        fetch(`${Utility.GetAPIURL()}/api/ChatMessages/${action}?mid=${mid}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
    }

    const startHub = () => {
        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => auth.token })
            .withAutomaticReconnect()
            .build();

        hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            //send a hello
            sayHello();
        }).catch(err => console.log('Error while establishing connection :('));

        hubConnection.onclose(hubConnectionClosed);

        hubConnection.onreconnecting(hubConnectionReconnecting);

        hubConnection.onreconnected(hubConnectionReconnected);

        //this function is called by server when it receives a sendtextmessage from user.
        hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            receiveTextMessage(sender, text, timestamp, id);
        });

        hubConnection.on('MessageSent', (receiver, text, timestamp, id) => {
            let mi = { id: id, sender: auth.myself.id, text: text, timestamp: timestamp, status: messageStatusEnum.Sent };
            //try to add sent message to current message list
            if (receiver.toLowerCase() === props.person.id.toLowerCase()) {
                messages.current.set(id, mi);
                setDummy(Date.now());
                localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
                scrollToBottom();
            }

        });

        hubConnection.on('MessageStatus', (messageid, receiver, status) => {
            if (receiver.toLowerCase() === props.person.id.toLowerCase() && messages.current.get(messageid) !== undefined) {
                messages.current.get(messageid).status = status;
                setDummy(Date.now());
                localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
            }
        });

        hubConnection.on('ContactSaved', (cdto) => {
            let contactmap = new Map();
            if (localStorage.getItem("contacts") !== null) {
                contactmap = new Map(JSON.parse(localStorage.getItem("contacts")));
            }
            contactmap.set(cdto.person.id, cdto);
            localStorage.setItem("contacts", JSON.stringify(Array.from(contactmap)));
        });

        //this function is strictly call by server to transfer webrtc peer data
        hubConnection.on('ReceiveSignal', (sender, data) => {
            //console.log("receivesignal sender : " + sender);
            //console.log("receivesignal data : " + data);
            if (peer !== null) {
                peer.signal(data);
            }
        });

        hubConnection.on('SaysHello', (caller) => {
            console.log("SaysHello By : " + caller);
            saysHello(caller);
        });

        hubConnection.on('AnswerHello', (responder) => {
            console.log("Call Answered By : " + responder);
            answerHello(responder);
        });

        hubConnection.on('EndPeer', (id) => {
            if (props.person.id.toLowerCase() === id.toLowerCase()) {
                if (peer !== null) {
                    peer.destroy();
                    peer = null;
                    console.log("EndPeer By : " + id);
                }
            }
        });

        //this function is called by server when it receives a sendtextmessage from user.
        hubConnection.on('ContactUpdated', (dto) => {
            //if (props.person.id === dto.id) {
            //    setPerson(dto);
            //}
        });
    }

    const receiveTextMessage = (sender, text, timestamp, id) => {
        let mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: messageStatusEnum.Seen };
        //if received message is from current person then show in ui else save in localstorage
        if (sender.toLowerCase() === props.person.id.toLowerCase()) {
            messages.current.set(id, mi);
            setDummy(Date.now());
            localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
            scrollToBottom();
            props.updateParent("updatemessageseen", { id: sender });
            playmsgbeep();
            setMessageStatus(mi.id, "SetSeen");
        }
    }

    //say hello when hub connection is established, this will begin a handshake which will
    //eventually lead to rtc peer connection
    const sayHello = () => {
        hubConnection.invoke("sayHello", auth.myself.id.toLowerCase(), props.person.id.toLowerCase())
            .catch(err => { console.log("Unable to say hello."); console.error(err); })
    }

    //catch the hello other user sent and answer it.
    //main purpose of this function is to notify that your are here to 
    //receive peer connection
    const saysHello = (caller) => {
        if (caller.toLowerCase() === props.person.id.toLowerCase()) {
            createPeer(true);
            //answer hello by provided your id
            hubConnection.invoke("AnswerHello", caller, auth.myself.id.toLowerCase());
        }
    }

    const answerHello = (responder) => {
        //check if answer to your hello came from the person your are chating at present
        if (props.person.id === responder.toLowerCase()) {

            //try create a peer connection
            createPeer(false);
        }
    }

    const sendTextMessage = (text, sendto) => {
        if (text.trim() !== "") {
            //hubConnection.invoke("SendTextMessage", props.person.id, myself.id, textinput)
            //    .catch(err => { console.log("Unable to send message to group."); console.error(err); });
            const fd = new FormData();
            fd.set("Text", text);
            fd.set("SentTo", sendto);
            fd.set("PublicID", "00000000-0000-0000-0000-000000000000");
            fetch(`${Utility.GetAPIURL()}/api/ChatMessages`, {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            //if message is successfully saved in database then you will have id here 
                            console.log(data);
                            let mi = { id: data.id, sender: auth.myself.id, text: data.message, timestamp: data.sentDate, status: messageStatusEnum.Sent };
                            //try to add sent message to current message list
                            messages.current.set(mi.id, mi);
                            setDummy(Date.now());

                            localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
                            updateTextInputHeight();

                            scrollToBottom();
                        });

                    } else {
                        setMessage(new MessageModel('danger', 'Unable to send message'));
                    }
                });

            if (detectXtralargeScreen()) {
                textinputele.current.focus();
            }

        }
    }

    //function checks if person has not send pulse for last 5 seconds then deem person offline
    //const checkPersonPulse = () => {
    //    let dt = new Date(props.person.lastPulse);
    //    dt.setSeconds(dt.getSeconds() + 5);
    //    if (dt < Date.now()) {
    //        let p = person;
    //        p.activity = 5;
    //        setPerson(p);
    //    }
    //}

    const detectEdgeorIE = () => {
        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!window.StyleMedia;

        return (isIE || isEdge);
    }

    const detectXtralargeScreen = () => {
        return window.matchMedia("(min-width: 1024px)").matches;
    }

    const createPeer = (initiater) => {
        //RTC Peer configuration
        let configuration = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        if (window.location.hostname.toLowerCase() === "localhost") {
            configuration = {};
        }
        console.log("newuserarrived stream : ");
        console.log(mystream);
        peer = new SimplePeer({ initiator: initiater, config: configuration, stream: mystream });
        //peer["cid"] = u.connectionID;
        //peer["hubConnection"] = hubConnection;
        //peer["myself"] = myself;

        //set peer event handlers
        peer.on("error", onPeerError);
        peer.on("signal", onPeerSignal);
        peer.on("connect", onPeerConnect);
        peer.on("close", onPeerClose);
        peer.on("stream", stream => { onPeerStream(stream); });
        peer.on('data', data => {
            // got a data channel message
            console.log('got a message from peer1: ' + data)
        });
    }

    /**
     * Simple Peer events
     * 
     */
    const onPeerSignal = (data) => {
        hubConnection
            .invoke('SendSignal', data, props.person.id, auth.myself.id)
            .catch(err => console.error('SendSignal ' + err));
    }

    const onPeerConnect = () => {
        peer.send(auth.myself.name + ' peer connected.');
    }

    const onPeerError = (err) => {
        console.log(props.person.name + " peer gave error. ");
        console.error(err);
    }

    const onPeerClose = () => {
        console.log("Peer Closed");
        hubConnection.invoke("EndPeer", auth.myself.id.toLowerCase(), props.person.id.toLowerCase())
            .catch(err => console.error('Endpeer ' + err));
    }

    const onPeerStream = (stream) => {
        console.log("received a stream"); console.log(stream);
        otherstream = stream;
        //update state so that UI changes
        setDummy(Date.now());

        let v = document.getElementById('othervideo');
        if (v !== null) {
            if ('srcObject' in v) {
                v.srcObject = otherstream
            } else {
                v.src = window.URL.createObjectURL(otherstream) // for older browsers
            }
            v.muted = false;
            v.volume = 0.8;
            v.play();
        }
    }
    //simple peer events end here

    const playmsgbeep = () => {
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
    const getUserCam = () => {
        //config 
        let videoconst = true;
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
        let constraints = {
            audio: true, video: videoconst
        };
        //simple feature avialability check
        if (navigator.mediaDevices.getUserMedia) {
            //try to gain access and then take appropriate action
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(addMedia)
                .catch(userMediaError); // always check for errors at the end.
        }
    }

    //assign media stream received from getusermedia to my video 
    const addMedia = (stream) => {
        //save stream in global variable 
        mystream = stream;
        //update state so that myvideo element can be added to dom and then manipulated
        setDummy(Date.now());
        attachMyStreamToVideo();

        //based on initial state enable or disable video and audio
        //initially video will be disabled or micrphone will broadcast
        if (mystream.getVideoTracks().length > 0) {
            mystream.getVideoTracks()[0].enabled = videoplaying;
        }
        if (mystream.getAudioTracks().length > 0) {
            mystream.getAudioTracks()[0].enabled = audioplaying;
        }

        //set stream to all existing peers
        if (peer !== null) {
            peer.addStream(mystream);
        }
    }

    const attachMyStreamToVideo = () => {
        if (videoplaying || audioplaying) {
            let video = document.getElementById('myvideo');
            if (video !== null) {
                video.srcObject = mystream;
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

    const attachOtherStreamToVideo = () => {
        let video = document.getElementById('othervideo');
        if (video !== null) {
            video.srcObject = otherstream;
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
    const userMediaError = (err) => {
        console.log("Unable to access user media");
        console.error(err);
        if (err.name !== undefined && err.name !== null) {
            if (err.name.toLowerCase() === "notallowederror") {
                alert("You have specifically denied access to camera and microphone. Please check browser title or address bar to see the notification.");
            } else {
                alert("Unable to access camera.");
            }
        }
        setVideoPlaying(false);
        setAudioPlaying(false);
        //dont know if user should be updated or not
        //hubConnection.invoke("UpdateUser", id, myself);
    }

    const closeVideo = () => {
        if (mystream !== null) {
            //const tracks = mystream.getTracks()
            //for(let i = 0; i < tracks.length; i++) {
            //    tracks[i].stop();
            //}
        }
    }

    const showMessageStatus = (status) => {
        switch (status) {
            case messageStatusEnum.Received:
                return <i title="Received" className="bi bi-balloon-fill"></i>;
            case messageStatusEnum.Sent:
                return <i title="Sent" className="bi bi-balloon"></i>;
            case messageStatusEnum.Seen:
                //return "Received";
                return <i title="Seen" className="bi bi-balloon-fill text-success"></i>;
            default:
                return null;
        }
    }

    //function only update message status of any messages from the sender with sent status to received in localstorage
    //it will be responsbility of sender to get updated status from received
    const updateReceivedMessageStatusAll = () => {
        for (const [key, mi] of messages.current.entries()) {
            if (mi.sender !== auth.myself.id && mi.status !== messageStatusEnum.Seen) {
                messages.current.get(key).status = messageStatusEnum.Seen;
                setMessageStatus(mi.id, "SetSeen");
            }
        }
        localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
    }

    const deleteMyMessagesFromServer = () => {
        fetch(`${Utility.GetAPIURL()}/api/chatmessages/MemberMessages/${props.person.id}`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                console.log("messages deleted from server");
            }
        });
    }

    const processFileUpload = () => {
        let m = null;
        if (filestoupload.length > 0) {
            m = filestoupload[0];
        }


        if (m !== null) {
            freader = new FileReader();
            freader.uploadFile = uploadFile;
            uploadFile(m, 0);
        }
    }

    const uploadFile = (msg, start) => {
        const slice_size = 1000 * 1024;
        let next_slice = start + slice_size + 1;
        let blob = msg.filedata.slice(start, next_slice);
        freader.onloadend = event => {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }
            handleFileChunkUpload(event.target.result, msg, start, next_slice, slice_size);
        };

        freader.readAsDataURL(blob);
    }

    const updateTextInputHeight = () => {
        if (textinput !== "") {
            // Reset field height
            //textinputele.current.style.height = 'inherit';

            // Get the computed styles for the element
            const computed = window.getComputedStyle(textinputele.current);

            // Calculate the height
            const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + textinputele.current.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

            //textinputele.current.style.height = `${height}px`;

            textinputele.current.style.height = `${textinputele.current.scrollHeight}px`;
        } else {
            textinputele.current.style.height = "40px";
            textinputele.current.style.minHeight = "40px";
        }
        setMessageContainerHeight(inputcontainer.current.offsetHeight + 92);
    }

    const handleFileChunkUpload = (data, msg, start, next_slice, slice_size) => {

        const fd = new FormData();
        fd.set("f", data);
        fd.set("filename", msg.name);
        fd.set("gfn", false);
        //no need to change file name on server
        //fd.set("filename", start === 0 ? msg.name : msg.serverfname);
        //fd.set("gfn", start === 0 ? true : false);
        fetch(`${Utility.GetAPIURL()}/api/members/uploadfile`, {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        }).then(response => {
            if (response.status === 200) {

                response.json().then(data => {
                    msg.serverfname = data.filename;
                    let flist = filestoupload;
                    for (let i = 0; flist.length > i; i++) {
                        let cfile = flist[i];
                        if (cfile.name === msg.name) {
                            let size_done = start + slice_size;
                            msg.progresspercent = Math.floor((size_done / msg.filedata.size) * 100);
                            cfile.progresspercent = msg.progresspercent;
                            if (next_slice > msg.filedata.size) {
                                flist.splice(i, 1);
                                msg.filedata = null;
                                //hubConnection.invoke("SendTextMessage", person.id, myself.id, 'https://' + window.location.host + '/data/' + myself.id + '/' + msg.serverfname)
                                //    .catch(err => { console.log("Unable to send file to other person."); console.error(err); });
                                sendTextMessage('https://' + window.location.host + '/data/' + auth.myself.id + '/' + msg.serverfname, props.person.id);
                                setFilesToUpload(flist);
                                generateVideoThumbnail(msg.serverfname);

                                processFileUpload();
                            } else {
                                setFilesToUpload(flist);
                                //if there is more to file than call upload file again
                                uploadFile(msg, next_slice);
                            }
                            break;
                        }
                    }
                });

            }
        });
    }

    const generateVideoThumbnail = (filename) => {
        fetch(`${Utility.GetAPIURL()}/api/members/GenerateThumbnail?filename=${filename}`, {
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
    }

    const handlePhotoClick = (e) => {
        e.preventDefault();
        fileinput.current.click();
    }

    const handleDocClick = (e) => {
        e.preventDefault();
        fileinput.current.click();
    }

    const handleFileUploadCancel = (event, fname) => {
        //remove the targeted file
        let flist = filestoupload;
        for (let i = 0; flist.length > i; i++) {
            let cfile = flist[i];
            if (cfile.name === fname) {
                flist.splice(i, 1);
                //cfile.cancel = true;
                setFilesToUpload(flist);
                break;
            }
        }
    }

    const handleFileInput = (e) => {

        //alert("Soon you will be able to share files.");
        //return;
        if (fileinput.current.files.length > 10) {
            alert("Only 10 files at a time.");
            return;
        }
        for (let i = 0; i < fileinput.current.files.length; i++) {
            if ((fileinput.current.files[i].size / 1048576).toFixed(1) > 300) {
                alert("File size cannot exceed 300 MB");
                return;
            }
        }

        let flist = filestoupload;
        for (let i = 0; i < fileinput.current.files.length; i++) {
            let f = { name: fileinput.current.files[i].name, filedata: fileinput.current.files[i], progresspercent: 0, serverfname: "", cancel: false };
            flist.push(f);
        }
        setFilesToUpload(flist);

        fileinput.current.value = "";
        processFileUpload();
    }

    const handleEmojiSelect = (value) => {
        setTextInput(textinput + value);
        textinputele.current.focus();
    }

    const handleEmojiModal = () => {
        setShowEmojiModal(!showemojimodal);
    }

    const handleVideoCancel = () => {
        closeVideo();
        hubConnection.invoke("EndCall", auth.myself.id.toLowerCase(), props.person.id.toLowerCase())
            .catch(err => { console.log("Unable to end call."); console.error(err); })
    }

    const handleChange = (e) => {
        switch (e.target.name) {
            case 'textinput':
                setTextInput(e.target.value);
                updateTextInputHeight();
                break;
            default:
        }
    }

    const handleSend = (e) => {

        sendTextMessage(textinput, props.person.id);
        setTextInput("");
        updateTextInputHeight();
        setShowEmojiModal(false);
    }

    //enable or disable video track of my stream
    const handleVideoToggle = (e) => {
        if (mystream !== null) {
            if (mystream.getVideoTracks().length > 0) {
                mystream.getVideoTracks()[0].enabled = !videoplaying;
                setVideoPlaying(!videoplaying);
                attachMyStreamToVideo();
            }
        } else {
            setVideoPlaying(true);
            setAudioPlaying(true);
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            getUserCam();

        }
    }
    //enable or disable audio track of my stream
    const handleAudioToggle = (e) => {
        if (mystream !== null) {
            if (mystream.getAudioTracks().length > 0) {
                mystream.getAudioTracks()[0].enabled = !audioplaying;
                setAudioPlaying(!audioplaying);
                attachMyStreamToVideo();
            }
        } else {
            //if there is no stream then most probably
            //user denied permission to cam and microphone
            getUserCam();
            setAudioPlaying(true);
        }
    }

    const scrollToBottom = () => {

        if (messagesEnd.current !== undefined && messagesEnd.current !== null) {
            messagesEnd.current.scrollIntoView();
        }
    }

    const handleProfileModalClose = () => {
        setProfileToShow(null);
        setShowProfileModal(false);
    }

    //handle search result item click
    const handleProfileImageClick = (e) => {
        //setProfileToShow(props.person);
        //setShowProfileModal(true);
    }

    const handleContactRelationshipChange = (e) => {

    }

    const handleAddToContacts = () => {
        setContactRelation(BoloRelationType.Confirmed);
    }

    const handleBlockandRemove = () => {
        setContactRelation(BoloRelationType.Blocked);
    }



    useEffect(() => {
        //setPerson(props.person);

        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/ChatMessages?sender=${props.person.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    console.log(data);
                    messages.current.clear();
                    for (let k in data) {
                        let temp = data[k];
                        let mi = { id: temp.id, sender: temp.sentBy.id, text: temp.message, timestamp: temp.sentDate, status: messageStatusEnum.Received };
                        messages.current.set(mi.id, mi);
                        if (temp.status !== messageStatusEnum.Received) {
                            setMessageStatus(mi.id, "SetReceived");
                        }
                    }
                    setDummy(Date.now());
                    localStorage.setItem(props.person.id.toLowerCase(), JSON.stringify(Array.from(messages.current.entries())));
                    scrollToBottom();
                    updateReceivedMessageStatusAll();
                });
            }
        }).catch(err => {
            setMessage(new MessageModel("danger", "Unable to fetch messages from server"));
            console.log(err);
        }).finally(() => {
            setLoading(false);
        });

        if (hubConnection === null) {
            startHub();
        }
        //let contactupdateinterval = setInterval(checkPersonPulse, 5000)

        //deleteMyMessagesFromServer();

        //set unseenmessage count of person to zero and save
        let clist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
        if (clist.get(props.person.id.toLowerCase()) !== undefined) {
            clist.get(props.person.id.toLowerCase()).unseenMessageCount = 0;
        }
        localStorage.setItem("contacts", JSON.stringify(Array.from(clist)));

        return () => {
            //destroy peer and signalr connection since the component will unmount
            if (peer !== null) {
                peer.destroy();
                peer = null;
            }
            hubConnection.stop();
            //if (contactupdateinterval !== null) {
            //    clearInterval(contactupdateinterval);
            //}
        }
    }, [props.person])

    //componentDidUpdate(prevProps, prevState) {
    //    //console.log("componentDidUpdate");
    //    if (prevProps.person.id !== props.person.id) {
    //        messages = (localStorage.getItem(props.person.id) !== null) ? new Map(JSON.parse(localStorage.getItem(props.person.id))) : new Map();
    //        setState({ dummy: Date.now(), person: props.person }, () => {

    //            fetchMessages();

    //            updateReceivedMessageStatusAll()
    //        });
    //        props.updateParent("updatemessageseen", { id: props.person.id });
    //        //each time compoment updates scroll to bottom
    //        //this can be improved by identifying if new messages added
    //        scrollToBottom();
    //    }

    //}


    const getFileExtensionBasedName = (filename) => {
        if (filename.toLowerCase().endsWith(".doc") || filename.toLowerCase().endsWith(".docx")) {
            return <i className="bi bi-file-word fs-1" title="Word Document"></i>
        } else if (filename.toLowerCase().endsWith(".pdf")) {
            return <i className="bi bi-filetype-pdf fs-1" title="PDF"></i>
        }
        else if (filename.toLowerCase().endsWith(".xls") || filename.toLowerCase().endsWith(".xlsx")) {
            return <i className="bi bi-file-earmark-excel fs-1" title="Spreadsheet"></i>
        }
        else
            return filename.substring(61, filename.length);
    }

    //const renderEmojiModal = () => {
    //    if (showemojimodal) {
    //        return <tr><td colSpan="2"><Emoji onSelect={handleEmojiSelect} /></td></tr>;
    //    } else {
    //        return null;
    //    }
    //}

    const renderVideoCallModal = () => {
        return <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <h4>Waiting For {props.person.name}</h4>
                        <button type="button" className="btn btn-danger btn-lg" onClick={handleVideoCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>;
    }

    const renderLinksInMessage = (msg, color = "rgb(48, 35, 91)") => {
        let tempmid = msg.id;
        if (msg.text.startsWith(`https://${window.location.host}/data/`)) {
            if (msg.text.toLowerCase().endsWith(".jpg") || msg.text.toLowerCase().endsWith(".jpeg") || msg.text.toLowerCase().endsWith(".png") || msg.text.toLowerCase().endsWith(".gif") || msg.text.toLowerCase().endsWith(".bmp")) {
                return <img id={tempmid} src={msg.text} className='img-fluid' alt="" style={{ maxWidth: "260px" }} />;
            }
            else if (msg.text.toLowerCase().endsWith(".mp3")) {
                return <audio id={tempmid} src={msg.text} controls playsInline style={{ maxWidth: "260px" }} />;
            }
            else if (msg.text.toLowerCase().endsWith(".ogg") || msg.text.toLowerCase().endsWith(".mp4") || msg.text.toLowerCase().endsWith(".webm") || msg.text.toLowerCase().endsWith(".mov")) {
                return <video id={tempmid} src={msg.text.toLowerCase()} controls playsInline style={{ maxWidth: "260px" }} />;
            }
            else {
                return <a id={tempmid} href={msg.text} style={{ color: color }} rel="noreferrer" target="_blank">{getFileExtensionBasedName(msg.text.toLowerCase())}</a>;
            }
        }
        else if ((msg.text.startsWith('https://') || msg.text.startsWith('http://')) && msg.text.trim().indexOf(" ") === -1) {
            return <a id={tempmid} href={msg.text.trim()} style={{ color: color }} rel="noreferrer" target="_blank">
                {msg.text}
            </a>;
        }
        else {
            return <span id={tempmid}>{msg.text.split('\n').map((item, key) => {
                return <>{item}<br /></>
            })}</span>
        }
    }

    const renderContactRelationChange = () => {
        let html = null;
        let contactlist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();

        if (contactlist.get(props.person.id) !== undefined) {
            if (contactlist.get(props.person.id).boloRelation === BoloRelationType.Temporary) {
                html = <div className="d-flex justify-content-center"><div className="card my-3">
                    <div className="card-header">New Contact</div>
                    <div className="card-body">
                        <p className="card-text mb-2">This person is not your contact list.</p>
                        <button className="btn btn-primary me-2" onClick={handleAddToContacts}>Add to Contacts</button>
                        <button className="btn btn-secondary" onClick={handleBlockandRemove}>Block and Remove</button>
                    </div>
                </div></div>;
            }
        }

        return html;
    }

    const renderMessages = () => {
        //let sentlistyle = { display: "block", textAlign: 'right' };
        //let reclistyle = { display: "block", textAlign: 'left' };
        //let sentmessagestyle = {
        //    marginBottom: "1px", maxWidth: "70%", position: "relative",

        //    fontSize: "1.2rem",
        //    //border: "none",
        //    borderRadius: "0rem",
        //    //color: "#000",
        //    //backgroundColor: "#DBF4FD",
        //    wordWrap: "break-word"
        //};
        //let recmessagestyle = {
        //    marginBottom: "1px", maxWidth: "70%", position: "relative",
        //    //border: "none",
        //    borderRadius: "0rem",
        //    fontSize: "1.2rem",
        //    //color: "#000",
        //    //backgroundColor: "#F2F6F9",
        //    wordWrap: "break-word"
        //};
        const items = [];
        for (const [key, obj] of messages.current.entries()) {
            if (obj.sender === auth.myself.id) {
                items.push(<div key={key} className="mb-3">
                    <div className="d-flex justify-content-end">
                        <div>
                            <div style={{ border: "2px solid #30235B", borderRadius: "15px", background: "#fff", color: "#30235B", maxWidth: "600px" }}
                                className="p-3 lh-base flex-shrink-1">
                                {renderLinksInMessage(obj)}
                            </div>
                            <div className="text-end my-1">
                                <small style={{ fontSize: "0.75rem" }}>
                                    <Moment local={true} fromNow>{obj.timestamp}</Moment></small> <small style={{ fontSize: "0.75rem" }}>{showMessageStatus(obj.status)}</small>
                            </div>
                        </div>
                    </div>

                </div>);
            } else {
                items.push(<div key={key} className="mb-3">
                    <div style={{ borderRadius: "15px", background: "#30235B", color: "#fff", maxWidth: "600px" }}
                        className="d-inline-block lh-base p-3 ">
                        {renderLinksInMessage(obj, "#fff")}
                    </div>
                    <span className="d-block"><small style={{ fontSize: "0.75rem" }}><Moment local={true} fromNow>{obj.timestamp}</Moment></small></span>
                </div>);
            }
        }

        return <>
            {items}
            {renderContactRelationChange()}
            <div style={{ float: "left", clear: "both" }}
                ref={messagesEnd}>
            </div>
        </>;
    }

    const renderVideo = () => {
        let myvideoclassname = "full";
        let othervideo = null, myvideo = null;
        let hasstream = false;
        if (otherstream !== null) {
            for (let i = 0; i < otherstream.getTracks().length; i++) {
                if (otherstream.getTracks()[i].enabled) {
                    hasstream = true;
                    break;
                }
            }
            if (hasstream) {
                myvideoclassname = "docked";
                othervideo = <video id="othervideo" muted="muted" volume="0" playsInline style={{ maxWidth: "100%", maxHeight: "70vh" }}></video>;
            }
        }
        if (mystream !== null) {
            hasstream = false;
            for (let i = 0; i < mystream.getTracks().length; i++) {
                if (mystream.getTracks()[i].enabled) {
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

    const renderFileUploadProcessModal = () => {
        let items = [];
        for (let i = 0; i < filestoupload.length; i++) {
            let f = filestoupload[i];
            items.push(<div className="row" key={i}>
                <div className="col-9 col-xl-10 col-sm-10">
                    <div className="progress">
                        <div className="progress-bar progress-bar-animated" role="progressbar" aria-valuenow={f.progresspercent} aria-valuemin="0" aria-valuemax="100" style={{ width: f.progresspercent + "%" }}></div>
                    </div>
                </div>
                <div className="col-3 col-xl-2 col-sm-2">
                    <button type="button" className="btn btn-sm btn-light" onClick={(e) => handleFileUploadCancel(e, f.name)}>Cancel</button></div>
            </div>);
        }
        if (filestoupload.length > 0) {
            return <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            {items}
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            return null;
        }
    }

    const renderComp = () => {
        //if (messages.current.length === 0) { profile = <ViewProfile profile={person} />; }

        let personprofile = null;
        if (profiletoshow !== null && showprofilemodal) {
            personprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={props.person} />
                        </div>
                    </div>
                </div>
            </div>;
        }

        let videotoggleele = videoplaying ? <button type="button"  disabled={loading} className="btn btn-primary videoctrl" onClick={handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <i className="bi bi-camera-video"></i>
        </button> : <button  disabled={loading} type="button" className="btn btn-secondary videoctrl" onClick={handleVideoToggle} onMouseDown={(e) => e.stopPropagation()} >
            <i className="bi bi-camera-video"></i>
        </button>;
        let audiotoggleele = audioplaying ?
            <button type="button"  disabled={loading} className="btn btn-primary audioctrl" onClick={handleAudioToggle} onMouseDown={(e) => e.stopPropagation()}>
                <i className="bi bi-mic"></i>
            </button>
            : <button type="button" disabled={loading} className="btn btn-secondary audioctrl" onClick={handleAudioToggle} onMouseDown={(e) => e.stopPropagation()} >
                <i className="bi bi-mic"></i>
            </button>;
        //if browser is edge or ie no need to show video or audio control button
        if (detectEdgeorIE()) {
            audiotoggleele = null;
            videotoggleele = null;
        }

        let videohtml = renderVideo();
        let chatmsgcontstyle = {};
        if (videohtml === null && detectXtralargeScreen()) {
            chatmsgcontstyle = { padding: "0px" };
        }
        return <>
            <div className="personalchatcont d-flex flex-column position-relative">
                <div className="chatpersoninfocont sticky-top d-flex align-items-center">
                    {props.person !== null && props.person.pic !== "" ? <div style={{ maxWidth: "60px", maxHeight: "60px" }}>
                        <img src={props.person.pic} className="rounded-3 img-fluid pointer" alt="" onClick={handleProfileImageClick} />
                    </div> : null}
                    <div className="flex-grow-1 px-2">
                        <div className="personname pointer" title={props.person.name} onClick={handleProfileImageClick}>{props.person.name && props.person.name !== "" ? props.person.name : `@${props.person.userName}`}</div>
                        <span style={{ fontSize: "0.8rem" }} className={props.person.activity !== 5 ? "text-success" : "text-danger"}>{props.person.activity !== 5 ? "Online" : "Offline"}</span>
                    </div>
                    <div className="ps-2">
                        <BlockContact person={props.person} onRelationshipChange={handleContactRelationshipChange} />
                    </div>
                    <div className="ps-2">
                        {videotoggleele}
                    </div>
                    <div className="ps-2">
                        {audiotoggleele}
                    </div>
                </div>
                <div className="flex-grow-1" style={{ maxHeight: `calc(100vh - ${messageContainerHeight}px)`, overflowY: "auto" }}>
                    <Spinner show={loading} center={true} />
                    {videohtml}
                    <div className="chatmsgcont p-3 p-xl-5" style={chatmsgcontstyle}>
                        {renderMessages()}
                    </div>
                </div>
                {showemojimodal ? <div style={{ background: "#F7F7F7" }} className="w-100 p-2 pb-0" ><Emoji onSelect={handleEmojiSelect} /></div> : null}
                <div ref={inputcontainer} style={{ background: "#F7F7F7" }}
                    className="d-flex align-items-center position-absolute bg-light bottom-0 w-100 p-2 py-3">
                    <button disabled={loading} type="button" className={showemojimodal ? "btn btn-warning text-dark" : "btn btn-light text-dark"} onClick={handleEmojiModal} >
                        <i className="bi bi-emoji-smile fs-5"></i>
                    </button>
                    <DropDownButton direction="btn-group dropup" buttoncss="btn-link text-decoration-none ms-1" text={<i className="bi bi-file-earmark-plus  fs-5"></i>}>
                        <li>
                            <button disabled={loading} className="btn btn-link dropdown-item text-dark text-decoration-none py-2" type="button" onClick={handlePhotoClick} title="20 Files at a time, max files size 10 MB">Photos and Videos</button>
                        </li>
                        <li>
                            <button disabled={loading} className="btn btn-link dropdown-item text-dark text-decoration-none py-2" type="button" onClick={handleDocClick} title="20 Files at a time, max files size 10 MB">Documents</button>
                        </li>
                    </DropDownButton>
                    <input type="file" className="d-none" ref={fileinput} accept=".html,.htm,.doc,.pdf,.xls,.xlsx,.docx,audio/*,video/*,image/*" onChange={handleFileInput} multiple="multiple" />
                    <textarea ref={textinputele} name="textinput" autoComplete="off"
                        className="form-control flew-grow-1 ms-1" value={textinput} onChange={(e) => {
                            setTextInput(e.target.value);
                            updateTextInputHeight();
                        }} onBlur={() => { updateTextInputHeight(); }} width="100%"
                        style={{ height: "40px", overflow: "hidden", resize: "none", maxHeight: "200px", border: "2px solid #30235B" }}></textarea>
                    <button type="button" onClick={handleSend} disabled={loading} id="msgsubmit" className="ms-1 btn btn-light  text-dark" title="Send Message">
                        {loading ? <Spinner show={loading} sm={true} /> : <i className="bi bi-send fs-5"></i>}
                        </button>
                </div>
            </div>
            {personprofile}
            {renderFileUploadProcessModal()}
            <ShowMessage messagemodal={message} />
            <audio id="chatbeep" muted="muted" volume="0">
                <source src="/media/swiftly.mp3"></source>
                <source src="/media/swiftly.m4r"></source>
                <source src="/media/swiftly.ogg"></source>
            </audio>
        </>;
    }
    return renderComp();
}

export function Emoji(props) {

    const onEmojiClick = (value) => {
        props.onSelect(value);
    }

    return <ul className="list-inline mb-1">
        <li className="list-inline-item px-2 pb-2 pointer "><span className="fs-3" title="GRINNING FACE" onClick={() => onEmojiClick('😀')}>😀</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="GRINNING FACE WITH SMILING EYES" onClick={() => onEmojiClick('😁')}>😁</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH TEARS OF JOY" onClick={() => onEmojiClick('😂')}>😂</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH OPEN MOUTH" onClick={() => onEmojiClick('😃')}>😃</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH OPEN MOUTH AND SMILING EYES" onClick={() => onEmojiClick('😄')}>😄</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => onEmojiClick('😅')}>😅</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES" onClick={() => onEmojiClick('😆')}>😆</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH HALO" onClick={() => onEmojiClick('😇')}>😇</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH HORNS" onClick={() => onEmojiClick('😈')}>😈</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="WINKING FACE" onClick={() => onEmojiClick('😉')}>😉</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH SMILING EYES" onClick={() => onEmojiClick('😊')}>😊</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE SAVOURING DELICIOUS FOOD" onClick={() => onEmojiClick('😋')}>😋</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="RELIEVED FACE" onClick={() => onEmojiClick('😌')}>😌</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH HEART-SHAPED EYES" onClick={() => onEmojiClick('😍')}>😍</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE WITH SUNGLASSES" onClick={() => onEmojiClick('😎')}>😎</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMIRKING FACE" onClick={() => onEmojiClick('😏')}>😏</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="NEUTRAL FACE" onClick={() => onEmojiClick('😐')}>😐</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="EXPRESSIONLESS FACE" onClick={() => onEmojiClick('😑')}>😑</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="UNAMUSED FACE" onClick={() => onEmojiClick('😒')}>😒</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH COLD SWEAT" onClick={() => onEmojiClick('😓')}>😓</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="PENSIVE FACE" onClick={() => onEmojiClick('😔')}>😔</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CONFUSED FACE" onClick={() => onEmojiClick('😕')}>😕</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CONFOUNDED FACE" onClick={() => onEmojiClick('😖')}>😖</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="KISSING FACE" onClick={() => onEmojiClick('😗')}>😗</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE THROWING A KISS" onClick={() => onEmojiClick('😘')}>😘</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="KISSING FACE WITH SMILING EYES" onClick={() => onEmojiClick('😙')}>😙</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="KISSING FACE WITH CLOSED EYES" onClick={() => onEmojiClick('😚')}>😚</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH STUCK-OUT TONGUE" onClick={() => onEmojiClick('😛')}>😛</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH STUCK-OUT TONGUE AND WINKING EYE" onClick={() => onEmojiClick('😜')}>😜</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES" onClick={() => onEmojiClick('😝')}>😝</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="DISAPPOINTED FACE" onClick={() => onEmojiClick('😞')}>😞</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="WORRIED FACE" onClick={() => onEmojiClick('😟')}>😟</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="ANGRY FACE" onClick={() => onEmojiClick('😠')}>😠</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="POUTING FACE" onClick={() => onEmojiClick('😡')}>😡</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CRYING FACE" onClick={() => onEmojiClick('😢')}>😢</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="PERSEVERING FACE" onClick={() => onEmojiClick('😣')}>😣</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH LOOK OF TRIUMPH" onClick={() => onEmojiClick('😤')}>😤</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="DISAPPOINTED BUT RELIEVED FACE" onClick={() => onEmojiClick('😥')}>😥</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FROWNING FACE WITH OPEN MOUTH" onClick={() => onEmojiClick('😦')}>😦</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="ANGUISHED FACE" onClick={() => onEmojiClick('😧')}>😧</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FEARFUL FACE" onClick={() => onEmojiClick('😨')}>😨</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="WEARY FACE" onClick={() => onEmojiClick('😩')}>😩</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SLEEPY FACE" onClick={() => onEmojiClick('😪')}>😪</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="TIRED FACE" onClick={() => onEmojiClick('😫')}>😫</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="GRIMACING FACE" onClick={() => onEmojiClick('😬')}>😬</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="LOUDLY CRYING FACE" onClick={() => onEmojiClick('😭')}>😭</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH OPEN MOUTH" onClick={() => onEmojiClick('😮')}>😮</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="HUSHED FACE" onClick={() => onEmojiClick('😯')}>😯</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => onEmojiClick('😰')}>😰</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE SCREAMING IN FEAR" onClick={() => onEmojiClick('😱')}>😱</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="ASTONISHED FACE" onClick={() => onEmojiClick('😲')}>😲</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FLUSHED FACE" onClick={() => onEmojiClick('😳')}>😳</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SLEEPING FACE" onClick={() => onEmojiClick('😴')}>😴</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="DIZZY FACE" onClick={() => onEmojiClick('😵')}>😵</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITHOUT MOUTH" onClick={() => onEmojiClick('😶')}>😶</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FACE WITH MEDICAL MASK" onClick={() => onEmojiClick('😷')}>😷</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FROWN FACE" onClick={() => onEmojiClick('🙁')}>🙁</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SMILING FACE" onClick={() => onEmojiClick('🙂')}>🙂</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="UPSIDEDOWN FACE" onClick={() => onEmojiClick('🙃')}>🙃</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="EYES ROLLING FACE" onClick={() => onEmojiClick('🙄')}>🙄</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="ZIPPED FACE" onClick={() => onEmojiClick('🤐')}>🤐</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="MONEY FACE" onClick={() => onEmojiClick('🤑')}>🤑</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="FEVERISH FACE" onClick={() => onEmojiClick('🤒')}>🤒</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SPECTACLED FACE" onClick={() => onEmojiClick('🤓')}>🤓</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="WONDERING FACE" onClick={() => onEmojiClick('🤔')}>🤔</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="HURT FACE" onClick={() => onEmojiClick('🤕')}>🤕</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="COWBOY FACE" onClick={() => onEmojiClick('🤠')}>🤠</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CLOWN FACE" onClick={() => onEmojiClick('🤡')}>🤡</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SICK VOMIT FACE" onClick={() => onEmojiClick('🤢')}>🤢</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="LAUGHING ROLLING FACE" onClick={() => onEmojiClick('🤣')}>🤣</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="LEERING FACE" onClick={() => onEmojiClick('🤤')}>🤤</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="LEING FACE" onClick={() => onEmojiClick('🤥')}>🤥</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="BLOWING NOSE FACE" onClick={() => onEmojiClick('🤧')}>🤧</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="ROCK FACE" onClick={() => onEmojiClick('🤨')}>🤨</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="STARY EYES FACE" onClick={() => onEmojiClick('🤩')}>🤩</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="MAD FACE" onClick={() => onEmojiClick('🤪')}>🤪</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="SHUSHING FACE" onClick={() => onEmojiClick('🤫')}>🤫</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CURSING FACE" onClick={() => onEmojiClick('🤬')}>🤬</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="CHUGLI FACE" onClick={() => onEmojiClick('🤭')}>🤭</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="VOMIT FACE" onClick={() => onEmojiClick('🤮')}>🤮</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="MIND BLOWN FACE" onClick={() => onEmojiClick('🤯')}>🤯</span></li>
        <li className="list-inline-item px-2 pb-2 pointer"><span className="fs-3" title="VICTORIAN FACE" onClick={() => onEmojiClick('🧐')}>🧐</span></li>
    </ul>;
}

export function BlockContact(props) {
    const auth = useAuth();
    const [blocked, setBlocked] = useState(null);

    useEffect(() => {

        fetch(`${Utility.GetAPIURL()}/api/Contacts/${props.person.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.boloRelation === BoloRelationType.Blocked) {
                        setBlocked(true);
                    } else if (data.boloRelation === BoloRelationType.Confirmed) {
                        setBlocked(false);
                    } else {
                        setBlocked(null);
                    }
                    if (props.onRelationshipChange !== undefined) {
                        props.onRelationshipChange(data.boloRelation);
                    }
                });
            }
        }).catch(err => {
            console.log(err);
        });

    }, []);

    const handleUnblockClick = () => {
        setContactRelation(BoloRelationType.Confirmed);
    }

    const handleBlockClick = () => {
        setContactRelation(BoloRelationType.Blocked);
    }

    const setContactRelation = (relationship) => {
        fetch(`${Utility.GetAPIURL()}/api/Contacts/ChangeRelation/${props.person.id}?t=${relationship}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.boloRelation === BoloRelationType.Blocked) {
                        setBlocked(true);
                    } else {
                        setBlocked(false);
                    }
                    let contactlist = (localStorage.getItem("contacts") !== null) ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    if (contactlist.get(props.person.id) !== undefined) {
                        contactlist.get(props.person.id).boloRelation = data.boloRelation;
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    }
                });
            }
        });
    }

    const renderComp = () => {
        if (blocked === true) {
            return <button className="btn mr-1 ml-1 btn-danger" onClick={handleUnblockClick}>Unblock</button>;
        } else if (blocked === false) {
            return <button className="btn mr-1 ml-1 btn-secondary" onClick={handleBlockClick}>Block</button>;
        } else {
            return null;
        }
    }

    return renderComp();
}

export default PersonChat;
﻿import React, { Component } from 'react';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';

var jsscompress = require("js-string-compression");

export class Xtream extends Component {
    constructor(props) {
        super(props);
        this.state = { dummydate: Date.now() };
        this.mystream = null;
        this.users = new Map();
        this.streaminterval = null;
        this.hubConnection = null;
        this.startHub = this.startHub.bind(this);
        this.getUserCam = this.getUserCam.bind(this);
        this.addMedia = this.addMedia.bind(this);
        this.userMediaError = this.userMediaError.bind(this);
        this.receiveImage = this.receiveImage.bind(this);
        this.capture = this.capture.bind(this);
        this.snapAndSend = this.snapAndSend.bind(this);
        this.handleLoadedMetaData = this.handleLoadedMetaData.bind(this);
    }
    componentDidMount() {
        this.startHub();
    }
    componentWillUnmount() {
        if (this.streaminterval !== null) {
            clearInterval(this.streaminterval);
        }
    }

    componentDidUpdate() {

    }
    handleLoadedMetaData(e) {
        if (document.getElementById("mycanvas") != null) {
            //var canvasstyle = { width: e.target.videoWidth, height: e.target.videoHeight };
            document.getElementById("mycanvas").width = e.target.videoWidth;
            document.getElementById("mycanvas").height = e.target.videoHeight;
        }
        if (document.getElementById("myvideo") != null) {
            //var canvasstyle = { width: e.target.videoWidth, height: e.target.videoHeight };
            document.getElementById("myvideo").width = e.target.videoWidth;
            document.getElementById("myvideo").height = e.target.videoHeight;
        }
    }
    //call this function to gain access to camera and microphone
    getUserCam() {
        //config 
        var constraints = {
            audio: true, video: {width : 320, height : 240}
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
                }
            };

            
        });

        if (this.streaminterval === null) {
            this.streaminterval = setInterval(this.snapAndSend, 150);
        }
    }

    snapAndSend() {
        var video = document.getElementById("myvideo");
        var canvas = document.getElementById("mycanvas");
        var ctx = canvas.getContext('2d');

        // Draws current image from the video element into the canvas
        ctx.drawImage(video, 0, 0, video.width, video.height);
        var rawimg = canvas.toDataURL("image/jpeg");
        document.getElementById("myimg").setAttribute("src", rawimg);
        ////var hm = new jsscompress.Hauffman();
        
        ////var compressed = hm.compress(rawimg);

        ////console.log("Raw length: " + canvas.toDataURL("image/jpeg").length);
        ////console.log("Compressed length: " + compressed.length);
        
        if (this.hubConnection.connectionState == 1) {
            this.hubConnection.invoke("SendImage", rawimg);
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
    }
    startHub() {
        this.hubConnection = new HubConnectionBuilder().withUrl("/streamhub", { accessTokenFactory: () => this.state.token }).configureLogging(LogLevel.Debug).build();

        this.hubConnection.start().then(() => {
            console.log('Hub Connection started!');
           

        }).catch(err => console.log('Error while establishing connection :('));

        //Handle New User Arrived server call
        //userinfo paramt will be sent by server as provided by other
        //user
        this.hubConnection.on('ReceiveImage', (img, id) => {
            console.log('ReceiveImage');
            this.receiveImage(img, id);
        });

    }
    capture() {
        if (this.mystream === null) {
            this.getUserCam();
        }  
    }
    receiveImage(img, id) {
        if (this.users.get(id) !== undefined) {
            this.users.get(id).image = img;
        } else {
            this.users.set(id, { image : img });
        }
        this.setState({ dummydate: Date.now() }, () => {
            if (document.getElementById(id + "vid") !== undefined) {
                
                document.getElementById(id + "vid").setAttribute("src", img);
            }
        });
    }

    render() {
        let hide = { display: 'none' };
        let items = [];
        this.users.forEach(function (value, key) {
            if (value.stream !== null) {
                items.push(<div className="col" key={key}>
                    <img id={key + "vid"} width="100%" height="auto"/>
                </div>);
            }
        });
        return (
            <>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <video id="myvideo" muted="muted"  style={hide} playsInline onLoadedMetadata={this.handleLoadedMetaData}/>
                            <canvas id="mycanvas"   style={hide} />
                            <img id='myimg' />
                            <button type="button" onClick={this.capture}>Start Cam Stream</button> 
                        </div>
                        {items}
                    </div>
                </div>
            </>);
    }
}
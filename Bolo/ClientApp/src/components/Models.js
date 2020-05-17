﻿export class UserInfo {
    //this guid used by bolo to publicly identify a user
    memberID;
    //this is connection id generated by signalr
    connectionID;
    //name of the user its provided by user.
    name;
    lastpulse;
    //has video capability
    videoCapable;
    //has rtcpeer capability
    peerCapable;

    constructor() {
        this.memberID = "00000000-0000-0000-0000-000000000000";
        this.connectionID = "";
        this.name = "";
        this.lastpulse = Date.now();
        this.videoCapable = true;
        this.peerCapable = true;
    }

    isAlive() {
        var dt = new Date(this.lastpulse);
        dt.setSeconds(dt.getSeconds() + 20);
        
        if (dt < Date.now()) {
            return false;
        } else {
            return true;
        }
    }
}

export var MessageEnum = {
    Text: 1,
    MemberAdd: 2,
    MemberLeave: 3
}

export class MessageInfo {
    //user info of who sent the message
    sender;
    //when it was sent
    timeStamp;
    //type of message info, MessageEnum
    type;
    //message body 
    text;
}
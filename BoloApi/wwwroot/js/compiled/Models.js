﻿"use strict"; class UserInfo { constructor() { _defineProperty(this, "memberID", void 0), _defineProperty(this, "connectionID", void 0), _defineProperty(this, "name", void 0), _defineProperty(this, "lastpulse", void 0), _defineProperty(this, "videoCapable", void 0), _defineProperty(this, "peerCapable", void 0), _defineProperty(this, "stream", void 0), _defineProperty(this, "pic", void 0), _defineProperty(this, "bio", void 0), this.memberID = "00000000-0000-0000-0000-000000000000", this.connectionID = "", this.name = "", this.lastpulse = Date.now(), this.videoCapable = !0, this.peerCapable = !0, this.stream = null, this.pic = "" } isAlive() { var e = new Date(this.lastpulse); return e.setSeconds(e.getSeconds() + 40), !(e < Date.now()) } } var MessageEnum = { Text: 1, MemberAdd: 2, MemberLeave: 3, File: 4 }, MessageStatusEnum = { notify: 0, inqueue: 1, inprogress: 2, ready: 5, sent: 3, error: 4 }; class MessageInfo { constructor() { _defineProperty(this, "sender", void 0), _defineProperty(this, "timeStamp", void 0), _defineProperty(this, "type", void 0), _defineProperty(this, "text", void 0), _defineProperty(this, "status", void 0), _defineProperty(this, "progresspercent", void 0), _defineProperty(this, "file", void 0), this.progresspercent = 0, this.status = MessageStatusEnum.inprogress, this.file = null } }
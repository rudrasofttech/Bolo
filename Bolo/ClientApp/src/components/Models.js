export class UserInfo {
    memberID;
    connectionID;
    name;
}

export var MessageEnum = {
    Text: 1,
    MemberAdd: 2,
    MemberLeave: 3
}

export class MessageInfo {
    sender;
    timeStamp;
    type;
    text;
}
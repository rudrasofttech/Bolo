import React, { Component } from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import { UserInfo, MessageInfo, MessageEnum } from './Models';
import { HubConnectionBuilder, LogLevel, MessageType } from '@aspnet/signalr';
import { MessageStrip } from './MessageStrip';
import { NavMenu } from './NavMenu';

export class Meeting extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }
        this.state = {
            me: null,
            users: [],
            textinput: '',
            messages: [],
            hubConnection: null,
            loading: false, loggedin: loggedin,
            bsstyle: '', message: '',
            id: this.props.match.params.id === null ? '' : this.props.match.params.id,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
        };
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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
                    let ui = new UserInfo();
                    ui.MemberID = "00000000-0000-0000-0000-000000000000";
                    ui.Name = window.prompt("Your Name?");
                    this.setState({ loggedin: false, loading: false, me: ui }, () => { this.startHub(); });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        let ui = new UserInfo();
                        ui.MemberID = data.id;
                        ui.Name = window.prompt("Your Name?", data.name);
                        this.setState({ loggedin: true, loading: false, me: ui }, () => { this.startHub(); });
                    });
                }
            });
    }

    startHub() {
        this.setState({ hubConnection: new HubConnectionBuilder().withUrl("/meetinghub", { accessTokenFactory: () => this.state.token }).configureLogging(LogLevel.Debug).build() }, () => {
            this.state.hubConnection.start().then(() => {
                console.log('Connection started!');
                //this is a test call and can be removed
                this.state.hubConnection
                    .invoke('Test', 'Connected')
                    .catch(err => console.error(err));

                //join meeting room
                this.state.hubConnection
                    .invoke('JoinMeeting', this.state.id, this.state.me.Name)
                    .catch(err => console.error(err));
            })
                .catch(err => console.log('Error while establishing connection :('));

            this.state.hubConnection.on('NewUserArrived', (u) => {
                console.log(u);
                this.newUserArrived(u);
            });

            this.state.hubConnection.on('UpdateName', (u) => {
                console.log(u);
                this.updateName(u);
            });

            this.state.hubConnection.on('UserLeft', (cid) => { console.log(cid); this.userLeft(cid); });
            this.state.hubConnection.on('UserSaidHello', (u) => { this.userSaidHello(u); });

            this.state.hubConnection.on('SetMySelf', (u) => { this.setMySelf(u); });
            this.state.hubConnection.on('ReceiveTextMessage', (ui, text, timestamp) => { this.receiveTextMessage(ui, text, timestamp); });
            this.state.hubConnection.on('Test', (u) => {
                console.log(u);
            });
        })
    }

    setMySelf(u) {
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        this.setState({ me: temp });
    }

    newUserArrived(u) {
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;
        let list = this.state.users;
        list.push(temp);

        let msg = new MessageInfo();
        msg.sender = null;
        msg.text = temp.name + " have joined the meeting.";
        msg.type = MessageEnum.MemberAdd;
        let mlist = this.state.messages;
        mlist.push(msg);
        this.setState({ messages: mlist, users: list }, () => {
            this.state.hubConnection.invoke("HelloUser", this.state.id, this.state.me, u.connectionID)
                .catch(err => { console.log("Unable to say hello to new user."); console.error(err); }) });
    }

    sendTextMessage() {
        this.state.hubConnection.invoke("SendTextMessage", this.state.id, this.state.me, this.state.textinput)
            .catch(err => { console.log("Unable to send message to group."); console.error(err); });
        this.setState({ textinput: '' });
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
        var users = this.state.users;
        for (var k = 0; k < users.length; k++) {
            if (users[k].ConnectionID === cid) {
                users = users.splice(k, 1);
                break;
            }
        }
        this.setState({ users: users });
    }

    updateName(cid, name) {
        var users = this.state.users;
        for (var k = 0; k < users.length; k++) {
            if (users[k].connectionID === cid) {
                users[k].name = name;
                break;
            }
        }
        this.setState({ users: users });
    }

    userSaidHello(u) {
        let temp = new UserInfo();
        temp.connectionID = u.connectionID;
        temp.memberID = u.memberID;
        temp.name = u.name;

        let list = this.state.users;
        list.push(temp);

        var mi = new MessageInfo();
        mi.sender = null;
        mi.text = u.name + ' is here.';
        mi.type = MessageEnum.Text;

        let mlist = this.state.messages;
        mlist.push(mi);

        this.setState({ users: list, messages: mlist });
    }

    leaveMeeting() {
        this.state.hubConnection
            .invoke('LeaveMeeting', this.state.id)
            .catch(err => console.error(err));
    }

    componentDidMount() {
        this.validate(this.state.token);
    }

    renderMessageList() {
        const items = [];
        for (var k in this.state.messages) {
            let obj = this.state.messages[k];
            if (obj.sender === null) {
                items.push(<li className="notify" key={k}>{obj.text}</li>);
            } else if (obj.sender.connectionID == this.state.me.connectionID) {
                items.push(<li className="sent" key={k}>{obj.text}</li>);
            } else {
                items.push(<li className="receive" key={k}>{obj.text}</li>);
            }
        }

        return (<ul id="msglist">
            {items}
        </ul>);
    }

    render() {
        let messagecontent = this.state.message !== "" ? <div className="fixedBottom ">
            <MessageStrip message={this.state.message} bsstyle={this.state.bsstyle} />
        </div> : <></>;
        let mhtml = this.renderMessageList();
        return (<>
            <NavMenu />
            <div id="fullheight">
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
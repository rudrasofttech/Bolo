import { FlatList, SafeAreaView, Text } from "react-native";
import { styles } from "../stylesheet";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import * as signalR from "@microsoft/signalr";
import { Utility } from "../utility";
import { AppStorage } from "../storage";

export default function Conversation(props) {
    const [loading, setLoading] = useState(false);
    const store = new AppStorage();
    const auth = useAuth();
    const [message, setMessage] = useState(new MessageModel());
    const [selectedperson, setSelectedPerson] = useState(null);
    const [searchtext, setSearchText] = useState("");

    const [showsearch, setShowSearch] = useState(true);
    const [showprofilemodal, setShowProfileModal] = useState(false);
    let hubConnection = null;
    //let contactlist = useRef(localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map());
    const [contacts, setContacts] = useState([]);

    const BoloRelationType =
    {
        Temporary: 1,
        Confirmed: 2,
        Search: 3,
        Blocked: 4
    }

    useEffect(() => {
        (async () => {
            let temp = await store.getContacts();
            setContacts(temp);
        })();
        fetchContacts();
        if (hubConnection === null) {
            startHub();
        }
    }, []);

    const startHub = () => {
        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${Utility.GetAPIURL()}/personchathub`, { accessTokenFactory: () => auth.token })
            .withAutomaticReconnect()
            .build();

        hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            
        }).catch(err => console.log('Error while establishing connection :('));


        //this function is called by server when it receives a sendtextmessage from user.
        hubConnection.on('ReceiveTextMessage', (sender, text, timestamp, id) => {
            var mi = { id: id, sender: sender, text: text, timestamp: timestamp, status: 2 /*Received*/ };
            //if received message is from current person then show in ui else save in local storage
            handleReceivedMessage(mi);
        });

        //update local contact list when some contact updates their information
        //if member is logged changes will be reflected immediately 
        //other wise when member log in latest contact info wil be fetched from db
        hubConnection.on('ContactUpdated', (dto) => {
            if (contacts[dto.id] !== undefined) {
                let p = contacts[dto.id].person
                if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city
                    || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) {
                    contacts[dto.id].person = dto;
                    setContacts(contacts);
                }
            }
        });

        hubConnection.on('ContactSaved', (dto) => {
            if (contacts[dto.id] === undefined) {
                contacts[dto.id] = dto;
                setContacts(contacts);
            }
        });
    }

    const compare_contact = (a, b) => {
        // a should come before b in the sorted order
        //console.log(a);
        if (a[1].unseenMessageCount > b[1].unseenMessageCount) {
            return -1;

        } else if (a[1].person.activity !== 5 && b[1].person.activity === 5) {
            return -1;
        }
        else if (a[1].person.activity === 5 && b[1].person.activity !== 5) {
            // a should come after b in the sorted order
            return 1;
        }
        else {
            // a and b are the same
            return 0;
        }
    }


    //function checks if any contact has not send pulse for last 5 seconds then deem them off-line
    //const checkContactPulse = () => {
    //    for (const [key, contact] of contactlist.current.entries()) {
    //        var dt = new Date(contact.lastPulse);
    //        dt.setSeconds(dt.getSeconds() + 5);
    //        if (dt < Date.now()) {
    //            contact.activity = 5;
    //        }
    //    }
    //}

    const fetchContacts = () => {
        let url = `${Utility.GetAPIURL()}/api/Contacts/Member`;
        if (searchtext !== "")
            url = `${Utility.GetAPIURL()}/api/Members/search?s=${searchtext}`;

        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log("Filter Contact List:");
                        console.log(data);
                        if (searchtext === "")
                            store.setContacts(data);
                        setContacts(data);
                        //for (let k in data) {
                        //contacts[data[k].person.id] = data[k];

                        // if (data[k].messagesOnServer.length > 0) {
                        //     let msgs = localStorage.getItem(data[k].person.id) !== null ? new Map(JSON.parse(localStorage.getItem(data[k].person.id))) : {};
                        //     for (let i in data[k].messagesOnServer) {
                        //         if (msgs.get(data[k].messagesOnServer[i].id) === undefined) {
                        //             let mi = { id: data[k].messagesOnServer[i].id, sender: data[k].messagesOnServer[i].sentBy.id, text: data[k].messagesOnServer[i].message, timestamp: data[k].messagesOnServer[i].sentDate, status: 2 /*Received*/ };
                        //             msgs.set(mi.id, mi);
                        //             //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, myself.id, this.messageStatusEnum.Received)
                        //             //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                        //             setMessageStatus(mi.id, "SetReceived");
                        //             contactlist.current.get(data[k].person.id).recentMessageDate = mi.timestamp;
                        //             if (contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                        //                 contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
                        //             } else {
                        //                 contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
                        //             }
                        //         }
                        //     }
                        //     localStorage.setItem(data[k].person.id, JSON.stringify(Array.from(msgs)));
                        // }
                        //}
                        //localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist.current)));
                        //setContacts(contacts);
                    });
                } else {
                    setMessage(new MessageModel('danger', 'Unable to search.'));
                }
            });
    }

    //search for members
    const search = () => {
        if (searchtext !== "") {
            setLoading(true);
            fetch(`${Utility.GetAPIURL()}/api/Members/search?s=${searchtext}`, {
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            console.log("Contact Search Result");
                            console.log(data);
                            let tempContacts = {};
                            for (var k in data) {
                                tempContacts[data[k].id] = { id: 0, person: data[k], createDate: null, boloRelation: 3, recentMessage: '', recentMessageDate: '' };
                            }
                            setContacts(tempContacts);
                        });
                    } else {
                        setMessage(new MessageModel('danger', 'Unable to search.'));
                    }
                }).catch(err => {
                    setMessage(new MessageModel('danger', 'Unable to search.'));
                    console.log(err);
                }).finally(() => {
                    setLoading(false);
                });
        }
    }

    const setMessageStatus = (mid, action) => {
        fetch(Utility.GetAPIURL() + '/api/ChatMessages/' + action + '?mid=' + mid, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
    }

    const handleUpdateParent = (action, data) => {
        switch (action) {
            case "updatemessageseen":
                if (contacts[data.id] !== undefined) {
                    contacts[data.id].unseenMessageCount = 0;
                    //localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    setContacts(contacts);
                }
                break;
            default:
                break;
        }
    }

    const handleShowSearch = (show) => {
        if (show) {
            let temp = localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
            contactlist.current.clear();
            for (const [key, contact] of temp.entries())
                contactlist.current.set(contact.id, contact);
        }
        setShowSearch(show);
    }

    //const handleProfileSelect = (e) => {
    //    setSelectedPerson(e);
    //}

    const handleProfileModalClose = () => {
        setProfileToShow(null);
        setShowProfileModal(false);
    }

    //handle profile menu item click
    //const handleProfileItemClick = (e) => {
    //    //should only move forward if there is memberid and there is some profileselect action provided
    //    if (e !== null && contactlist.current.get(e) !== undefined) {
    //        setProfileToShow(contactlist.current.get(e).person);
    //        setShowProfileModal(true);
    //    }
    //}

    //handle search result item click
    const handleResultItemClick = (e) => {
        //should only move forward if there is memberid and there is some profileselect action provided
        if (e !== null && contactlist.current.get(e) !== undefined) {
            setSelectedPerson(contactlist.current.get(e).person);
            setShowSearch(true);
            setShowProfileModal(false);
        }

    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        search();
    }

    return <SafeAreaView style={[styles.container, styles.pt20, styles.mt10]}>
        <FlatList data={contacts}
            renderItem={({ item }) => {
                return (
                    <Text>{item.person.name}</Text>
                );
            }}
            keyExtractor={(item, index) => index.toString()} refreshing={loading} onRefresh={() => { fetchContacts(); }}>
        </FlatList>
    </SafeAreaView>;
}
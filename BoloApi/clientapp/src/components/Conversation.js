import { useEffect, useRef, useState } from "react";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import { Utility } from "./Utility";
import PersonChat from "./PersonChat";
import ViewProfile from "./ViewProfile";
import * as signalR from "@microsoft/signalr";
import Layout from "./Layout";
import Spinner from "./shared/Spinner";
import ShowMessage from "./shared/ShowMessage";
import personfill from "../theme1/images/person-fill.svg";

function Conversation(props) {
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const [message, setMessage] = useState(new MessageModel());
    const [selectedperson, setSelectedPerson] = useState(null);
    const [searchtext, setSearchText] = useState("");
    const [dummy, setDummy] = useState(new Date());
    const [showsearch, setShowSearch] = useState(true);
    const [showprofilemodal, setShowProfileModal] = useState(false);
    const [profiletoshow, setProfileToShow] = useState(null);
    let hubConnection = null;
    let contactlist = useRef(localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map());

    const BoloRelationType =
    {
        Temporary: 1,
        Confirmed: 2,
        Search: 3,
        Blocked: 4
    }

    useEffect(() => {
        if (hubConnection === null) {
            startHub();
        }
        //let contactupdateinterval = setInterval(checkContactPulse, 5000)
        //return () => {
        //    if (contactupdateinterval !== null) {
        //        clearInterval(contactupdateinterval);
        //    }
        //}

    }, []);

    const startHub = () => {
        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/personchathub", { accessTokenFactory: () => auth.token })
            .withAutomaticReconnect()
            .build();

        hubConnection.start().then(() => {
            console.log('Hub Connection started!');
            fetchContacts();
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
            if (contactlist.current.get(dto.id) !== undefined) {
                let p = contactlist.current.get(dto.id).person
                if (p.name !== dto.name || p.activity !== dto.activity || p.city !== dto.city
                    || p.state !== dto.state || p.country !== dto.country || p.pic !== dto.pic) {
                    contactlist.current.get(dto.id).person = dto;
                    setDummy(Date.now());
                }
            }
        });

        hubConnection.on('ContactSaved', (dto) => {
            if (contactlist.current.get(dto.id) === undefined) {
                contactlist.current.set(dto.person.id, dto);
                setDummy(Date.now());
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
        fetch(Utility.GetAPIURL() + '/api/Contacts/Member', {
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
                        for (let k in data) {
                            if (contactlist.current.get(data[k].person.id) === undefined) {
                                contactlist.current.set(data[k].person.id.toLowerCase(), data[k]);
                            } else {
                                contactlist.current.set(data[k].person.id, data[k]);
                            }

                            if (data[k].messagesOnServer.length > 0) {
                                let msgs = localStorage.getItem(data[k].person.id) !== null ? new Map(JSON.parse(localStorage.getItem(data[k].person.id))) : new Map();
                                for (let i in data[k].messagesOnServer) {
                                    if (msgs.get(data[k].messagesOnServer[i].id) === undefined) {
                                        let mi = { id: data[k].messagesOnServer[i].id, sender: data[k].messagesOnServer[i].sentBy.id, text: data[k].messagesOnServer[i].message, timestamp: data[k].messagesOnServer[i].sentDate, status: 2 /*Received*/ };
                                        msgs.set(mi.id, mi);
                                        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, myself.id, this.messageStatusEnum.Received)
                                        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
                                        setMessageStatus(mi.id, "SetReceived");
                                        contactlist.current.get(data[k].person.id).recentMessageDate = mi.timestamp;
                                        if (contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                                            contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
                                        } else {
                                            contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
                                        }
                                    }
                                }
                                localStorage.setItem(data[k].person.id, JSON.stringify(Array.from(msgs)));
                            }
                        }
                        localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist.current)));

                        setDummy(Date.now());
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
                            contactlist.current.clear();
                            for (var k in data) {
                                contactlist.current.set(data[k].id, { id: 0, person: data[k], createDate: null, boloRelation: 3, recentMessage: '', recentMessageDate: '' });
                            }

                            setDummy(Date.now());
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
                if (contactlist.current.get(data.id.toLowerCase()) !== undefined) {
                    contactlist.current.get(data.id.toLowerCase()).unseenMessageCount = 0;
                    localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
                    setDummy(Date.now());
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

    //if user is not chating to receiver  at present than add received message to message list and increase unseen message count of the contact
    const handleReceivedMessage = (mi) => {
        let usermsgs = localStorage.getItem(mi.sender.toLowerCase());
        let usermsgmap = null;
        if (usermsgs !== null)
            usermsgmap = new Map(JSON.parse(usermsgs));
        else
            usermsgmap = new Map();

        usermsgmap.set(mi.id, mi);
        localStorage.setItem(mi.sender.toLowerCase(), JSON.stringify(Array.from(usermsgmap.entries())));

        //this.hubConnection.invoke("MessageStatus", mi.id, mi.sender, myself.id, this.messageStatusEnum.Received)
        //    .catch(err => { console.log("Unable to send message received status."); console.error(err); });
        setMessageStatus(mi.id, "SetReceived");
        if (contactlist.current.get(mi.sender.toLowerCase()) !== undefined) {

            if (contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount !== undefined) {
                contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount += 1;
            } else {
                contactlist.current.get(mi.sender.toLowerCase()).unseenMessageCount = 1;
            }
            localStorage.setItem("contacts", JSON.stringify(Array.from(contactlist)));
            setDummy(Date.now());
        }

    }

    //the usual BS required for form fields to work in react
    const handleChange = (e) => {
        switch (e.target.name) {
            case 'searchtext':
                if (e.target.value.trim() === "") {
                    let temp = localStorage.getItem("contacts") !== null ? new Map(JSON.parse(localStorage.getItem("contacts"))) : new Map();
                    contactlist.current.clear();
                    for (const [key, contact] of temp.entries())
                        contactlist.current.set(contact.id, contact);
                }
                setSearchText(e.target.value);
                break;
            default:
        }
    }

    const renderPeopleList = () => {
        const items = [];
        let sortedcontacts = new Map([...contactlist.current.entries()].sort(compare_contact));
        for (const [key, contact] of sortedcontacts.entries()) {
            let obj = contact.person;
            if (auth.myself === null || obj.id !== auth.myself.id) {
                items.push(<div key={key} title={obj.thoughtStatus} data-id={obj.id} className={" row g-0 contact justify-items-center pointer " + (selectedperson !== null && selectedperson.id === obj.id ? "selected" : "")} onClick={(e) => handleResultItemClick(e.target.getAttribute("data-id"))}>
                    <div className="col-3 col-xl-2">
                        <img src={obj.pic !== "" ? `//${window.location.host}/${obj.pic}` : personfill} data-id={obj.id} className="img-fluid pointer profile-pic-border owner-thumb-small" alt="" />
                    </div>
                    <div className="col px-2 py-2" data-id={obj.id} >
                        <div className="contactname mb-2" data-id={obj.id} >{obj.name && obj.name !== "" ? obj.name : obj.userName}</div>
                        {contact.unseenMessageCount > 0 ? <span className="badge bg-primary">{contact.unseenMessageCount}</span> : null}
                        {contact.boloRelation === BoloRelationType.Blocked ? <span className="badge bg-danger">Blocked</span> : null}
                        <span style={{ fontSize: "0.8rem" }} className={obj.activity !== 5 ? "text-success" : "text-danger"}>{obj.activity !== 5 ? "Online" : "Offline"}</span>
                    </div>
                </div>);
            }
        }

        if (items.length > 0) {
            return <div style={{ height: "calc(100vh - 118px)", overflowY: "auto" }}>{items}</div>;
        }
        //else if (!loading) {
        //    return <div>
        //                No profiles to show here.
        //                <br />
        //                Search for people based on their name, location, profession or gender etc.
        //                Here are some examples of search phrases.
        //                <ul>
        //                    <li>Raj Kiran Singh</li>
        //                    <li>Raj From India</li>
        //                    <li>Software Developer in Noida</li>
        //                    <li>Women in India</li>
        //                    <li>Men in India</li>
        //                    <li>Mumbai Maharashtra</li>
        //                    <li>Delhi Mumbai Kolkatta</li>
        //                </ul>
        //            </div>;
        //}
        else {
            return null;
        }
    }

    const renderComp = () => {

        let personchatorprofile = null;
        if (selectedperson !== null) {
            personchatorprofile = <PersonChat person={selectedperson} updateParent={handleUpdateParent} handleShowSearch={handleShowSearch} />
        }
        else if (profiletoshow !== null && showprofilemodal) {
            personchatorprofile = <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Profile</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleProfileModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <ViewProfile profile={profiletoshow} />
                        </div>
                    </div>
                </div>
            </div>;
        }
        else {
            personchatorprofile = null; //<HeartBeat activity="1" interval="3000" />;
        }

        let searchhtml = null;
        if (showsearch) {
            searchhtml = <div className="col-sm-4 col-md-3 p-lg-1 p-xl-4" style={{ background: "rgba(48,35,91,0.2)" }}>
                <form onSubmit={handleSearchSubmit} className="row row-cols-auto row-cols-lg-auto g-1 align-items-center mb-4">
                    <div className="col" style={{ width: "calc(100% - 75px)" }}>
                        <input type="search" disabled={loading} className="form-control" onChange={handleChange} title="Find People by Name, Location, Profession etc." name="searchtext" id="search-input" placeholder="Find People by Name, Location, Profession etc" aria-label="Search for..."
                            autoComplete="off" spellCheck="false" aria-describedby="button-addon2" />
                    </div>
                    <div className="col">
                        <button className="btn btn-light text-primary" type="submit" disabled={loading}>
                            {loading ? <Spinner show={loading} sm={true} /> : <i className="bi bi-search"></i>}
                        </button>
                    </div>
                </form>

                {renderPeopleList()}
            </div>;
        }

        return <div className="row" style={{ height: "100vh" }}>
            {searchhtml}
            <div className="col-sm-8 col-md-9 p-0">
                {personchatorprofile}
                <ShowMessage messagemodal={message} />
            </div>
        </div>;
    }
    return <Layout date={dummy}>{renderComp()}</Layout>;
}

export default Conversation;
import React, { Component } from 'react';
import nopic from "../assets/nopic.jpg";
import { API } from './APIURL';

export class RecentList extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: this.props.myself, bsstyle: '', message: '',
            onProfileSelect: this.props.profileselect !== undefined ? this.props.profileselect : null,
            contactlist: (localStorage.getItem("contacts") !== null) ? localStorage.getItem("contacts") : []
        };

        this.handleResultItemClick = this.handleResultItemClick.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.fetchData();
        }
    }

    fetchData() {
        if (localStorage.getItem("contacts") === null) {
            fetch(API.GetURL() + 'api/Contacts/Member', {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            console.log(data);
                            this.setState({ loading: false, contactlist: data }, () => {
                                localStorage.setItem("contacts", data);
                            });
                        });
                    } else {
                        this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                    }
                });
        }
    }

    //handle search result item click
    handleResultItemClick(e) {
        //get public id of the member
        var pid = e;
        //should only move forward if there is memberid and there is some profileselect action provided
        if (pid !== null && this.state.onProfileSelect !== null) {
            //loop through existing result list
            for (var k in this.state.contactlist) {
                //find the member with same public id
                if (pid === this.state.contactlist[k].id) {
                    this.state.onProfileSelect(this.state.contactlist[k]);
                    //don't go forward with loop
                    return;
                }
            }
        }
    }

    render() {
        const items = [];
        const hundred = { width: "100%" };
        for (var k in this.state.contactlist) {
            let obj = this.state.contactlist[k];
            let pic = obj.pic !== "" ? <img src={obj.pic} className="rounded img-fluid float-left" width="45" height="45" alt="" />
                : <img src={nopic} className="rounded img-fluid float-left" width="45" height="45" alt="" />;
            items.push(<li key={k} className="list-inline-item searchlistitem pt-1">
                <button className="btn btn-light" style={hundred} data-memberid={obj.id} onClick={() => this.handleResultItemClick(obj.id)}>{pic} <span className="float-left ml-1 text-left"><strong>{obj.name}</strong><br /><small>{obj.city} {obj.state} {obj.country} </small></span></button>
            </li>);
        }

        if (items.length > 0) {
            return <div className="searchresult"><ul className="list-inline mt-1">{items}</ul></div>;
        } else {
            return null;
        }
    }
}


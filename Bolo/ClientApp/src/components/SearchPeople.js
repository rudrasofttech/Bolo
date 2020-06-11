import React, { Component } from 'react';
import nopic from "../assets/nopic.jpg";
import { API } from './APIURL';

export class SearchProfile extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
            onProfileSelect: this.props.profileselect !== undefined ? this.props.profileselect : null,
            searchtext: '', resultlist: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.search = this.search.bind(this);
        this.handleResultItemClick = this.handleResultItemClick.bind(this);

    }

    //handle search result item click
    handleResultItemClick(e) {
        //get public id of the member
        var pid = e;
        //should only move forward if there is memberid and there is some profileselect action provided
        if (pid !== null && this.state.onProfileSelect !== null) {
            //loop through existing result list
            for (var k in this.state.resultlist) {
                //find the member with same public id
                if (pid === this.state.resultlist[k].id) {
                    this.state.onProfileSelect(this.state.resultlist[k]);
                    //don't go forward with loop
                    return;
                }
            }
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        this.search();
    }

    //the usual BS requied for form fields to work in react
    handleChange(e) {
        switch (e.target.name) {
            case 'searchtext':
                this.setState({ searchtext: e.target.value });
                break;
            default:
        }
    }

    //search for members
    search() {
        fetch(API.GetURL() + 'api/Members/search?s=' + this.state.searchtext, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        var list = [];
                        for (var k in data) {
                            list.push(data[k]);
                        }
                        this.setState({ loading: false, resultlist: list });
                    });
                } else {
                    this.setState({ loading: false, message: 'Unable to search.', bsstyle: 'danger' });
                }
            });
    }

    renderPeopleList() {
        const items = [];
        const hundred = { width: "100%" };
        for (var k in this.state.resultlist) {
            let obj = this.state.resultlist[k];
            let pic = obj.pic !== "" ? <img src={obj.pic} className="rounded img-fluid float-left" width="45" height="45" alt="" />
                : <img src={nopic} className="rounded img-fluid float-left" width="45" height="45" alt=""  />;
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

    render() {
        return <>
                <div className="searchcol">
                    <form onSubmit={this.handleSearchSubmit} className="searchform">
                        <input type="search" className="form-control mt-2" name="searchtext" id="search-input" onChange={this.handleChange} title="Find People by Name, Location, Profession etc." placeholder="Find People by Name, Location, Profession etc" aria-label="Search for..." autoComplete="off" spellCheck="false" />
                    </form>
                    {this.renderPeopleList()}
                </div>
            </>;
    }
}
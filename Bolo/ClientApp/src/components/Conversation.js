import React, { Component } from 'react';
import nopic from "../assets/nopic.jpg";
import { Progress, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'
import { SearchProfile } from './SearchPeople';
import { NavMenu } from './NavMenu';
import { PersonChat } from './PersonChat';
import { RecentList } from './RecentList';
import { API } from './APIURL';

export class Conversation extends Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '', selectedperson: null,
            token: localStorage.getItem("token") === null ? '' : localStorage.getItem("token"),
        };
        this.loginHandler = this.loginHandler.bind(this);
        this.handleProfileSelect = this.handleProfileSelect.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    loginHandler() {
        if (localStorage.getItem("token") != null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    //see if user is logged in
    validate(t) {
        this.setState({ loading: true });
        fetch(API.GetURL() + 'api/Members/Validate', {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false, token: null });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        //console.log(data);

                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    handleProfileSelect(e) {
        this.setState({ selectedperson: e })
    }
    render() {
        let personchat = null;
        if (this.state.selectedperson !== null) {
            personchat = <div className="col-9 p-0"><PersonChat person={this.state.selectedperson} myself={this.state.myself} /></div>
        }
        let colstyle = {
            minHeight : "calc(100vh - 60px)",
            backgroundColor : "#F0F4F8",
            padding: "0px"
        };
        return <><NavMenu onLogin={this.loginHandler} registerFormBeginWith={false} register={!this.state.loggedin} fixed={false} />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-3" style={colstyle}>
                        <SearchProfile profileselect={this.handleProfileSelect} />
                        <RecentList profileselect={this.handleProfileSelect}/>
                    </div>
                    {personchat}
                </div>
            </div>
        </>;
    }
}
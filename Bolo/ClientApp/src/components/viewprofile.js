import React, { Component } from 'react';
import nopic from "../assets/nopic.jpg";

export class ViewProfile extends Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            channel: this.props.channel === undefined ? '' : this.props.channel,
            profile: null
        };
    }

    componentDidMount() {
        fetchData();
    }

    fetchData() {
        this.setState({ loading: true });
        fetch('api/Members/Channel?name=' + this.state.channel, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    //if token is valid vet user information from response and set "myself" object with member id and name.
                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
                    //is set then start signalr hub
                    response.json().then(data => {
                        console.log(data);

                        this.setState({ loading: false, profile: data });
                    });
                }
            });
    }

    render() {
        if (this.state.profile !== null) {
            let pic = this.state.profile.pic !== "" ? <img src={this.state.profile.pic} className="rounded mx-auto d-block img-fluid" alt="" />
                : <img src={nopic} className="rounded mx-auto d-block img-fluid" alt="" />;
            let age = this.state.profile.birthYear > 0 ? <p><em>{Date.now().getFullYear() - this.state.profile.birthYear} Years</em></p> : null;
            return <>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            {pic}
                            <h4>{this.state.profile.name}</h4>
                            <p>{this.state.profile.bio}</p>
                            <p><em>This line rendered as italicized text.</em></p>
                            <span>{age}</span>
                            <p>{this.state.profile.city} {this.state.profile.state} {this.state.profile.country}</p>
                        </div>
                    </div>
                </div>
            </>;
        } else {
            return null;
        }
    }
}
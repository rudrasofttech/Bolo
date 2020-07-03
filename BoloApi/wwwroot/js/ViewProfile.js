﻿class ViewProfile extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            profile: this.props.profile === undefined ? null : this.props.profile
        };
    }

    componentDidMount() {
        //if (localStorage.getItem("token") !== null) {
        //    this.fetchData(localStorage.getItem("token"));
        //}
    }

    componentDidUpdate(prevProps, prevState) {
        //if ((prevState.channel !== this.state.channel || prevState.profileid !== this.state.profileid) && localStorage.getItem("token") !== null) {
        //    this.fetchData(localStorage.getItem("token"));
        //}
    }

    static getDerivedStateFromProps(props, state) {
        if (props.channel !== state.channel || props.profileid !== state.profileid || props.profile !== state.profile) {
            return {
                channel: props.channel,
                profileid: props.profileid,
                profile: props.profile === undefined ? null : props.profile
            };
        }
        return null;
    }

    //fetchData(t) {
    //    if (this.state.channel !== '' || this.state.profileid !== '') {
    //        this.setState({ loading: true });
    //        let url = "";
    //        if (this.state.channel !== '') {
    //            url = "//" + window.location.host + "/api/Members/" + this.state.channel;
    //        } else if (this.state.profileid !== '') {
    //            url = "//" + window.location.host + "/api/Members/" + this.state.profileid;
    //        }
    //        if (url !== "") {
    //            fetch(url, {
    //                method: 'get',
    //                headers: {
    //                    'Authorization': 'Bearer ' + t
    //                }
    //            }).then(response => {
    //                if (response.status === 401) {
    //                    //if token is not valid than remove token, set myself object with empty values
    //                    localStorage.removeItem("token");
    //                    this.setState({ loggedin: false, loading: false });
    //                } else if (response.status === 200) {
    //                    //if token is valid vet user information from response and set "myself" object with member id and name.
    //                    //set state joinmeeting to true so that it does not ask for name and other info from user. Once the state
    //                    //is set then start signalr hub
    //                    response.json().then(data => {
    //                        console.log(data);
    //                        this.setState({ loading: false, profile: data });
    //                    });
    //                }
    //            });
    //        }
    //    }
    //}

    render() {
        if (this.state.profile !== null) {
            var d = new Date();
            let pic = <React.Fragment><img src="/images/nopic.jpg" className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;

            if (this.state.profile.pic !== "") {
                pic = <React.Fragment><img src={this.state.profile.pic} className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;
            }
            let age = this.state.profile.birthYear > 0 ? <React.Fragment>{d.getFullYear() - this.state.profile.birthYear} Years Old</React.Fragment> : null;

            let address = this.state.profile.city + ' ' + this.state.profile.state + ' ' + this.state.profile.country;

            if (address.trim() !== '') {
                address = 'From ' + address;
            }
            return (
                <div className="text-center">
                    {pic}
                    <h4>{this.state.profile.name}</h4>
                    <p>{this.state.profile.bio}</p>
                    <p><em>{age} {address}</em></p>
                </div>
            );
        } else {
            return null;
        }
    }
}
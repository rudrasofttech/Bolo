class Profile extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
            member: null, bsstyle: '', message: '', followStatus: null,
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            showfollowers: false, showfollowing: false, showSettings : false
        };

    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
        if (this.props.username == undefined || this.props.username == null || this.props.username == "") {
            this.setState({ member: JSON.parse(localStorage.getItem("myself")) });
        } else {
            this.loadMember(localStorage.getItem("token"), this.props.username);

        }
    }

    loadMember(t, username) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/' + username, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + t
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ loggedin: true, loading: false, member: data }, () => {
                            this.loadFollowStatus(localStorage.getItem("token"), this.state.member.id);
                        });
                    });
                }
            });
    }

    loadFollowStatus(t, username) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Follow/Status/' + username, {
            method: 'get',
            headers: { 'Authorization': 'Bearer ' + t }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({ loggedin: true, loading: false, followStatus: data.status });
                    });
                }
            });
    }

    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
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
                        localStorage.setItem("myself", JSON.stringify(data));
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    renderFollowHtml() {

        if (this.state.followStatus != null) {
            return <FollowButton member={this.state.member} status={this.state.followStatus} />
        }
    }

    renderFollowers() {
        if (this.state.showfollowers) {
            return <div className="modal fade show" style={{ display: "block" }} id="followersModal" tabindex="-1" aria-labelledby="followersModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followersModalLabel">Followers</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showfollowers: false }) }}></button>
                        </div>
                        <div className="modal-body">
                            <MemberSmallList memberid={this.state.member.id} target="follower" />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return null;
    }

    renderFollowing() {
        if (this.state.showfollowing) {
            return <div className="modal fade show" style={{ display: "block" }} id="followingModal" tabindex="-1" aria-labelledby="followingModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followingModalLabel">Following</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { this.setState({ showfollowing: false }) }}></button>
                        </div>
                        <div className="modal-body">
                            <MemberSmallList memberid={this.state.member.id} target="following" />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return null;
    }

    render() {
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        if (this.state.showSettings) {
            return <ManageProfile onProfileChange={() => { this.validate(localStorage.getItem("token")); }} onBack={() => { this.setState({ showSettings: false }); }} />;
        }
        var followlist = null;
        if (this.state.showfollowing) {
            followlist = <React.Fragment>{this.renderFollowing()}</React.Fragment>;
        }
        else if (this.state.showfollowers) {
            followlist = <React.Fragment>{this.renderFollowers()}</React.Fragment>;
        }

        let loading = null;
        if (this.state.loading) {
            loading = <div className="progress fixed-bottom" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
            </div>
        }
        let me = null, pic = null, settings = null, followhtml = null;
        if (this.state.member !== null) {
            pic = this.state.member.pic !== "" ? <img src={this.state.member.pic} className="img-fluid rounded profile-thumb" alt="" />
                : <img src="/images/nopic.jpg" className="img-fluid profile-thumb rounded" alt="" />;
            let name = null, thought = null, email = null, phone = null;
            if (this.state.member.name !== "") {
                name = <div className="fs-6 p-1 ms-2 fw-bold">{this.state.member.name}</div>;
            }
            if (this.state.member.thoughtStatus !== "") {
                thought = <p>{this.state.member.thoughtStatus}</p>;
            }
            if (this.state.myself != null && this.state.member != null && this.state.myself.id == this.state.member.id) {
                settings = <div className="p-1 ms-2"><a className="text-dark text-decoration-none" onClick={() => { this.setState({ showSettings : true}) } }><i className="bi bi-gear"></i> Settings</a></div>;
            } else {
                followhtml = this.renderFollowHtml();
            }
            me = <React.Fragment><div className="pt-2 border-bottom mb-1">
                <div className="row mx-0">
                    <div className="col-5 p-1 col-md-3 text-end">
                        {pic}
                    </div>
                    <div className="col-7 col-md-9 p-1">
                        <div className="fs-6 p-1 ms-2 fw-bold">@{this.state.member.userName}</div>
                        {name}
                        {settings}
                        {followhtml}
                    </div>
                </div>
                <div className="row mx-0">
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none">{this.state.member.postCount} Posts</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({showfollowing : true}) } }>{this.state.member.followingCount} Following</button></div>
                    <div className="col px-0 text-center"><button type="button" className="btn btn-link text-dark fw-bold text-decoration-none" onClick={() => { this.setState({ showfollowers: true }) }}>{this.state.member.followerCount} Followers</button></div>
                </div>
                {thought}
                <p>{this.state.member.bio}</p>
            </div>
                <MemberPostList search={this.state.member.userName} viewMode={2} viewModeAllowed="true" />
                {followlist}
            </React.Fragment>;
        }

        return <React.Fragment>
            {loading}
            {me}
        </React.Fragment>;
    }
}

class ManageProfile extends React.Component {
    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") === null) {
            loggedin = false;
        }

        this.state = {
            loading: false, loggedin: loggedin,
            myself: null, bsstyle: '', message: '',
            token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token"),
            onProfileChange: this.props.onProfileChange === undefined ? null : this.props.onProfileChange,
            showProfilePicModal: false, src: null,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                locked: true
            },
            croppedImageUrl: null, profilepiczoom: 1
        };

        this.hammer = null;
        this.pinch = null;
        this.profilePicCanvas = null;
        this.profilePicImgInst = null;
        this.handleChange = this.handleChange.bind(this);
        this.saveData = this.saveData.bind(this);
        this.toggleProfilePicModal = this.toggleProfilePicModal.bind(this);
        this.saveProfilePic = this.saveProfilePic.bind(this);
        this.removeProfilePicture = this.removeProfilePicture.bind(this);
        this.handleProfileImageLoaded = this.handleProfileImageLoaded.bind(this);
        this.handleProfileZoom = this.handleProfileZoom.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    handleChange(e) {
        let m = this.state.myself;
        switch (e.target.name) {
            case 'userName':
                m.userName = e.target.value.replace(" ", "").replace("\\", "").replace("/", "").replace(";", "").replace("\"", "").replace("'", "").replace("#", "");
                break;
            case 'phone':
                m.phone = e.target.value;
                break;
            case 'email':
                m.email = e.target.value;
                break;
            case 'bio':
                m.bio = e.target.value;
                break;
            case 'name':
                if (e.target.value.trim() === "") {
                    alert("Name is required.");
                    e.target.focus();
                } else {
                    m.name = e.target.value;
                }
                break;
            case 'birthYear':
                m.birthYear = e.target.value;
                break;
            case 'gender':
                m.gender = e.target.value;
                break;
            case 'visibility':
                m.visibility = e.target.value;
                break;
            case 'country':
                m.country = e.target.value;
                break;
            case 'state':
                m.state = e.target.value;
                break;
            case 'city':
                m.city = e.target.value;
                break;
            case 'thoughtStatus':
                m.thoughtStatus = e.target.value;
                break;
            default:
                break;
        }

        this.setState({ myself: m });
    }

    handleProfileImageLoaded(e) {
        this.profilePicCanvas.remove(this.profilePicImgInst);
        this.profilePicImgInst = new fabric.Image(e.target, { angle: 0, padding: 0, cornersize: 0 });
        if (e.target.width >= e.target.height) {
            this.profilePicImgInst.scaleToHeight(this.profilePicCanvas.height);
        } else if (e.target.height > e.target.width) {
            this.profilePicImgInst.scaleToWidth(this.profilePicCanvas.width);
        }
        this.profilePicImgInst.hasControls = false;
        //this.profilePicImgInst.lockMovementX = true;
        //this.profilePicImgInst.lockMovementY = true;
        this.profilePicCanvas.centerObject(this.profilePicImgInst);
        this.profilePicCanvas.add(this.profilePicImgInst);
    }

    handleProfileZoom() {
        this.profilePicCanvas.setZoom(this.state.profilepiczoom * 0.1);
    }

    handleFile = e => {
        const fileReader = new FileReader()
        fileReader.onloadend = () => {
            this.setState({ src: fileReader.result }, () => {
                if (this.profilePicCanvas === null) {

                    this.profilePicCanvas = new fabric.Canvas('profilePicCanvas');
                    this.profilePicCanvas.setDimensions({ width: 300, height: 300 });
                    this.profilePicCanvas.setZoom(1);
                    this.hammer = new Hammer.Manager(this.profilePicCanvas.upperCanvasEl); // Initialize hammer
                    this.pinch = new Hammer.Pinch();
                    this.hammer.add([this.pinch]);

                    this.hammer.on('pinch', (ev) => {
                        //console.log(ev);
                        //let point = new fabric.Point(ev.center.x, ev.center.y);
                        //let delta = this.profilepiczoom * ev.scale;

                        this.profilePicCanvas.setZoom(this.state.profilepiczoom * ev.scale);
                    });
                }

                var img = new Image();
                img.onload = this.handleProfileImageLoaded;
                img.src = this.state.src;
            });
        }
        fileReader.readAsDataURL(e.target.files[0]);
    }

    toggleProfilePicModal() {
        this.setState({ showProfilePicModal: !this.state.showProfilePicModal });
    }

    removeProfilePicture(e) {
        this.setState({ loading: true });
        const fd = new FormData();
        fd.set("pic", "");
        fetch('//' + window.location.host + '/api/Members/savepic', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            }
        })
            .then(response => {
                if (response.status === 401) {
                    //if token is not valid than remove token, set myself object with empty values
                    localStorage.removeItem("token");
                    this.setState({ loggedin: false, loading: false });
                } else if (response.status === 200) {
                    this.setState({ loading: false, showProfilePicModal: false });
                    if (localStorage.getItem("token") !== null) {
                        this.validate(localStorage.getItem("token"));
                    }
                    if (this.state.onProfileChange !== null) {
                        this.state.onProfileChange();
                    }
                } else {
                    this.setState({ loading: false, message: 'Unable to save profile pic', bsstyle: 'danger' });
                }
            });
    }

    saveProfilePic() {
        this.setState({
            croppedImageUrl: this.profilePicCanvas.toDataURL("image/png")
        }, () => {
            this.hammer = null;
            this.pinch = null;
            this.profilePicCanvas = null;
            this.profilePicImgInst = null;
            this.setState({ loading: true });
            const fd = new FormData();
            fd.set("pic", this.state.croppedImageUrl);
            fetch('//' + window.location.host + '/api/Members/savepic', {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        //if token is not valid than remove token, set myself object with empty values
                        localStorage.removeItem("token");
                        this.setState({ loggedin: false, loading: false });
                    } else if (response.status === 200) {
                        this.setState({ loading: false, showProfilePicModal: false, profilepiczoom: 1 });
                        if (localStorage.getItem("token") !== null) {
                            this.validate(localStorage.getItem("token"));
                        }
                        if (this.state.onProfileChange !== null) {
                            this.state.onProfileChange();
                        }
                    } else {
                        this.setState({ loading: false, message: 'Unable to save profile pic', bsstyle: 'danger' });
                    }
                });
        });

    }

    saveData(name, value) {
        this.setState({ loading: true });
        if (name !== 'bio') {
            fetch('//' + window.location.host + '/api/Members/Save' + name + '?d=' + value, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        //if token is not valid than remove token, set myself object with empty values
                        localStorage.removeItem("token");
                        this.setState({ loggedin: false, loading: false });
                    } else if (response.status === 200) {
                        this.setState({ loading: false, message: '', bsstyle: '' });
                        if (this.state.onProfileChange) {
                            this.state.onProfileChange();
                        }
                    } else if (response.status === 400) {
                        try {
                            response.json().then(data => {
                                //console.log(data);
                                this.setState({ loading: false, message: data.error, bsstyle: 'danger' }, () => {
                                    if (this.props.onProfileChange) {
                                        this.props.onProfileChange();
                                    }
                                });
                            });
                        } catch (err) {
                            this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                        }

                    } else {
                        try {
                            response.json().then(data => {
                                //console.log(data);
                                this.setState({ loading: false, message: data.error, bsstyle: 'danger' });
                            });
                        } catch (err) {
                            this.setState({ loading: false, message: 'Unable to save ' + name, bsstyle: 'danger' });
                        }

                    }
                });
        } else {
            const fd = new FormData();
            fd.set("d", value);
            fetch('//' + window.location.host + '/api/Members/savebio', {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        //if token is not valid than remove token, set myself object with empty values
                        localStorage.removeItem("token");
                        this.setState({ loggedin: false, loading: false });
                    } else if (response.status === 200) {
                        this.setState({ loading: false });
                        if (this.state.onProfileChange !== null) {
                            this.state.onProfileChange();
                        }
                    } else {
                        this.setState({ loading: false, message: 'Unable to save data', bsstyle: 'danger' });
                    }
                });
        }
    }

    validate(t) {
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Validate', {
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
                        //console.log(data);
                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    //onImageLoaded = image => {
    //    this.imageRef = image
    //}

    //onCropChange = (crop) => {
    //    this.setState({ crop });
    //}

    //onCropComplete = crop => {
    //    if (this.imageRef && crop.width && crop.height) {
    //        const croppedImageUrl = this.getCroppedImg(this.imageRef, crop)
    //        this.setState({ croppedImageUrl })
    //    }
    //}

    //getCroppedImg(image, crop) {
    //    const canvas = document.createElement("canvas");
    //    const scaleX = image.naturalWidth / image.width;
    //    const scaleY = image.naturalHeight / image.height;
    //    canvas.width = crop.width;
    //    canvas.height = crop.height;
    //    const ctx = canvas.getContext("2d");

    //    ctx.drawImage(
    //        image,
    //        crop.x * scaleX,
    //        crop.y * scaleY,
    //        crop.width * scaleX,
    //        crop.height * scaleY,
    //        0,
    //        0,
    //        crop.width,
    //        crop.height
    //    )

    //    return canvas.toDataURL();
    //}

    renderUSStates() {
        return <select name="state" id="state" className="form-control" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData}><option value=""></option><option value="Alabama">Alabama</option><option value="Alaska">Alaska</option><option value="Arizona">Arizona</option><option value="Arkansas">Arkansas</option><option value="California">California</option><option value="Colorado">Colorado</option><option value="Connecticut">Connecticut</option><option value="Delaware">Delaware</option><option value="District of Columbia">District of Columbia</option><option value="Florida">Florida</option><option value="Georgia">Georgia</option><option value="Guam">Guam</option><option value="Hawaii">Hawaii</option><option value="Idaho">Idaho</option><option value="Illinois">Illinois</option><option value="Indiana">Indiana</option><option value="Iowa">Iowa</option><option value="Kansas">Kansas</option><option value="Kentucky">Kentucky</option><option value="Louisiana">Louisiana</option><option value="Maine">Maine</option><option value="Maryland">Maryland</option><option value="Massachusetts">Massachusetts</option><option value="Michigan">Michigan</option><option value="Minnesota">Minnesota</option><option value="Mississippi">Mississippi</option><option value="Missouri">Missouri</option><option value="Montana">Montana</option><option value="Nebraska">Nebraska</option><option value="Nevada">Nevada</option><option value="New Hampshire">New Hampshire</option><option value="New Jersey">New Jersey</option><option value="New Mexico">New Mexico</option><option value="New York">New York</option><option value="North Carolina">North Carolina</option><option value="North Dakota">North Dakota</option><option value="Northern Marianas Islands">Northern Marianas Islands</option><option value="Ohio">Ohio</option><option value="Oklahoma">Oklahoma</option><option value="Oregon">Oregon</option><option value="Pennsylvania">Pennsylvania</option><option value="Puerto Rico">Puerto Rico</option><option value="Rhode Island">Rhode Island</option><option value="South Carolina">South Carolina</option><option value="South Dakota">South Dakota</option><option value="Tennessee">Tennessee</option><option value="Texas">Texas</option><option value="Utah">Utah</option><option value="Vermont">Vermont</option><option value="Virginia">Virginia</option><option value="Virgin Islands">Virgin Islands</option><option value="Washington">Washington</option><option value="West Virginia">West Virginia</option><option value="Wisconsin">Wisconsin</option><option value="Wyoming">Wyoming</option></select>;
    }

    renderIndianStates() {
        return <select name="state" id="state" className="form-control" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData}>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
            <option value="Daman and Diu">Daman and Diu</option>
            <option value="Delhi">Delhi</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Puducherry">Puducherry</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
        </select>;
    }

    renderStates() {
        if (this.state.myself.country.toLowerCase() == "india") {
            return this.renderIndianStates();
        } else if (this.state.myself.country.toLowerCase() == "usa") {
            return this.renderUSStates();
        } else {
            return <input type="text" name="state" className="form-control" maxLength="100" value={this.state.myself.state} onChange={this.handleChange} onBlur={this.saveData} />
        }
    }
    renderProfilePicModal() {
        if (this.state.showProfilePicModal) {
            const { crop, profile_pic, src } = this.state;
            return (
                <div className="modal  d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Profile Picture</h5>
                                <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={this.toggleProfilePicModal}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <button className="btn btn-primary" type="button" onClick={() => { document.getElementById("profile_pic").click(); }}>Choose Picture</button>
                                    <input type="file" className="d-none" id="profile_pic" value={profile_pic}
                                        onChange={this.handleFile} />
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col">
                                        <canvas id="profilePicCanvas" style={{ width: "300px", height: "300px" }}></canvas>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={this.saveProfilePic}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else { return null; }
    }

    render() {
        if (!this.state.loggedin) {
            return <RegisterForm beginWithRegister={false} onLogin={() => {
                this.setState({
                    loggedin: localStorage.getItem("token") === null ? false : true,
                    myself: localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself")),
                    token: localStorage.getItem("token") == null ? '' : localStorage.getItem("token")
                })
            }} />;
        }
        var yearitems = []
        for (var i = 1947; i <= 2004; i++) {
            yearitems.push(<option value={i}>{i}</option>);
        }
        let loading = this.state.loading ? <div className="progress fixed-bottom rounded-0" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{ width: '100%' }}></div>
        </div> : null;
        if (this.state.loggedin && this.state.myself !== null) {

            let message = this.state.message !== "" ? <div className={'text-center noMargin noRadius alert alert-' + this.state.bsstyle} role="alert">
                {this.state.message}
            </div> : null;
            let pic = this.state.myself.pic !== "" ? <React.Fragment><img src={this.state.myself.pic} className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />
                <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.removeProfilePicture}>Remove</button></React.Fragment> : <img src="/images/nopic.jpg" className=" mx-auto d-block img-fluid" alt="" style={{ maxWidth: "200px" }} />;
            return <React.Fragment>
                <div className="container py-5">
                    {loading}
                    {message}
                    <div className="row align-items-center">
                        <div className="col-md-6 text-center">
                            {pic}
                            <button type="button" className="btn btn-sm btn-secondary m-1" onClick={this.toggleProfilePicModal}>Change</button>
                            {this.renderProfilePicModal()}
                        </div>
                        <div className="col-md-6">
                            <div className="mb-2">
                                <label htmlFor="channelnametxt" className="form-label">Username</label>
                                <input type="text" id="channelnametxt" readOnly name="userName" placeholder="Unique Channel Name" className="form-control" value={this.state.myself.userName} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="nametxt" className="form-label">Name <span className="text-danger">(Required)</span></label>
                                <input type="text" id="nametxt" name="name" placeholder="Your Name" className="form-control" value={this.state.myself.name} onChange={this.handleChange} onBlur={() => { this.saveData("name", this.state.myself.name) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Mobile <span className="text-danger">(Required)</span></label>
                                <input type="text" name="phone" className="form-control" maxLength="15" value={this.state.myself.phone} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("phone", this.state.myself.phone) }} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Email <span className="text-danger">(Required)</span></label>
                                <input type="email" name="email" className="form-control" maxLength="250" value={this.state.myself.email} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("email", this.state.myself.email) }} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="birthyeartxt" className="form-label">Year of Birth (optional)</label>
                                <select id="birthyeartxt" name="birthYear" className="form-select" value={this.state.myself.birthYear} onChange={this.handleChange}
                                    onBlur={() => { this.saveData("birthYear", this.state.myself.birthYear) }}>
                                    {yearitems}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="thoughtStatus" className="form-label">One line Introduction (Optional)</label>
                        <input type="text" name="thoughtStatus" className="form-control" maxLength="195" value={this.state.myself.thoughtStatus} onChange={this.handleChange}
                            onBlur={() => { this.saveData("thoughtstatus", this.state.myself.thoughtStatus) }} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="biotxt" className="form-label">About Me (Optional)</label>
                        <textarea className="form-control" id="biotxt" maxLength="950" name="bio" value={this.state.myself.bio} onChange={this.handleChange} rows="4" placeholder="Write something about yourself."
                            onBlur={() => { this.saveData("bio", this.state.myself.bio) }}></textarea>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="visibilityselect" className="form-label">Profile Visibility (Optional)</label>
                            <select className="form-select" id="genderselect" name="visibility" value={this.state.myself.visibility} onChange={this.handleChange}
                                onBlur={() => { this.saveData("visibility", this.state.myself.visibility) }}>
                                <option value="0"></option>
                                <option value="2">Public</option>
                                <option value="1">Private</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="countryselect" className="form-label">Country (Optional)</label>
                            <select className="form-select" id="countryselect" name="country" value={this.state.myself.country} onChange={this.handleChange} onBlur={() => { this.saveData("country", this.state.myself.country) }}>
                                <option value=""></option>
                                <option value="Afganistan">Afghanistan</option>
                                <option value="Albania">Albania</option>
                                <option value="Algeria">Algeria</option>
                                <option value="American Samoa">American Samoa</option>
                                <option value="Andorra">Andorra</option>
                                <option value="Angola">Angola</option>
                                <option value="Anguilla">Anguilla</option>
                                <option value="Antigua & Barbuda">Antigua & Barbuda</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Armenia">Armenia</option>
                                <option value="Aruba">Aruba</option>
                                <option value="Australia">Australia</option>
                                <option value="Austria">Austria</option>
                                <option value="Azerbaijan">Azerbaijan</option>
                                <option value="Bahamas">Bahamas</option>
                                <option value="Bahrain">Bahrain</option>
                                <option value="Bangladesh">Bangladesh</option>
                                <option value="Barbados">Barbados</option>
                                <option value="Belarus">Belarus</option>
                                <option value="Belgium">Belgium</option>
                                <option value="Belize">Belize</option>
                                <option value="Benin">Benin</option>
                                <option value="Bermuda">Bermuda</option>
                                <option value="Bhutan">Bhutan</option>
                                <option value="Bolivia">Bolivia</option>
                                <option value="Bonaire">Bonaire</option>
                                <option value="Bosnia & Herzegovina">Bosnia & Herzegovina</option>
                                <option value="Botswana">Botswana</option>
                                <option value="Brazil">Brazil</option>
                                <option value="British Indian Ocean Ter">British Indian Ocean Ter</option>
                                <option value="Brunei">Brunei</option>
                                <option value="Bulgaria">Bulgaria</option>
                                <option value="Burkina Faso">Burkina Faso</option>
                                <option value="Burundi">Burundi</option>
                                <option value="Cambodia">Cambodia</option>
                                <option value="Cameroon">Cameroon</option>
                                <option value="Canada">Canada</option>
                                <option value="Canary Islands">Canary Islands</option>
                                <option value="Cape Verde">Cape Verde</option>
                                <option value="Cayman Islands">Cayman Islands</option>
                                <option value="Central African Republic">Central African Republic</option>
                                <option value="Chad">Chad</option>
                                <option value="Channel Islands">Channel Islands</option>
                                <option value="Chile">Chile</option>
                                <option value="China">China</option>
                                <option value="Christmas Island">Christmas Island</option>
                                <option value="Cocos Island">Cocos Island</option>
                                <option value="Colombia">Colombia</option>
                                <option value="Comoros">Comoros</option>
                                <option value="Congo">Congo</option>
                                <option value="Cook Islands">Cook Islands</option>
                                <option value="Costa Rica">Costa Rica</option>
                                <option value="Cote DIvoire">Cote DIvoire</option>
                                <option value="Croatia">Croatia</option>
                                <option value="Cuba">Cuba</option>
                                <option value="Curaco">Curacao</option>
                                <option value="Cyprus">Cyprus</option>
                                <option value="Czech Republic">Czech Republic</option>
                                <option value="Denmark">Denmark</option>
                                <option value="Djibouti">Djibouti</option>
                                <option value="Dominica">Dominica</option>
                                <option value="Dominican Republic">Dominican Republic</option>
                                <option value="East Timor">East Timor</option>
                                <option value="Ecuador">Ecuador</option>
                                <option value="Egypt">Egypt</option>
                                <option value="El Salvador">El Salvador</option>
                                <option value="Equatorial Guinea">Equatorial Guinea</option>
                                <option value="Eritrea">Eritrea</option>
                                <option value="Estonia">Estonia</option>
                                <option value="Ethiopia">Ethiopia</option>
                                <option value="Falkland Islands">Falkland Islands</option>
                                <option value="Faroe Islands">Faroe Islands</option>
                                <option value="Fiji">Fiji</option>
                                <option value="Finland">Finland</option>
                                <option value="France">France</option>
                                <option value="French Guiana">French Guiana</option>
                                <option value="French Polynesia">French Polynesia</option>
                                <option value="French Southern Ter">French Southern Ter</option>
                                <option value="Gabon">Gabon</option>
                                <option value="Gambia">Gambia</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Germany">Germany</option>
                                <option value="Ghana">Ghana</option>
                                <option value="Gibraltar">Gibraltar</option>
                                <option value="Great Britain">Great Britain</option>
                                <option value="Greece">Greece</option>
                                <option value="Greenland">Greenland</option>
                                <option value="Grenada">Grenada</option>
                                <option value="Guadeloupe">Guadeloupe</option>
                                <option value="Guam">Guam</option>
                                <option value="Guatemala">Guatemala</option>
                                <option value="Guinea">Guinea</option>
                                <option value="Guyana">Guyana</option>
                                <option value="Haiti">Haiti</option>
                                <option value="Hawaii">Hawaii</option>
                                <option value="Honduras">Honduras</option>
                                <option value="Hong Kong">Hong Kong</option>
                                <option value="Hungary">Hungary</option>
                                <option value="Iceland">Iceland</option>
                                <option value="Indonesia">Indonesia</option>
                                <option value="India">India</option>
                                <option value="Iran">Iran</option>
                                <option value="Iraq">Iraq</option>
                                <option value="Ireland">Ireland</option>
                                <option value="Isle of Man">Isle of Man</option>
                                <option value="Israel">Israel</option>
                                <option value="Italy">Italy</option>
                                <option value="Jamaica">Jamaica</option>
                                <option value="Japan">Japan</option>
                                <option value="Jordan">Jordan</option>
                                <option value="Kazakhstan">Kazakhstan</option>
                                <option value="Kenya">Kenya</option>
                                <option value="Kiribati">Kiribati</option>
                                <option value="Korea North">Korea North</option>
                                <option value="Korea South">Korea South</option>
                                <option value="Kuwait">Kuwait</option>
                                <option value="Kyrgyzstan">Kyrgyzstan</option>
                                <option value="Laos">Laos</option>
                                <option value="Latvia">Latvia</option>
                                <option value="Lebanon">Lebanon</option>
                                <option value="Lesotho">Lesotho</option>
                                <option value="Liberia">Liberia</option>
                                <option value="Libya">Libya</option>
                                <option value="Liechtenstein">Liechtenstein</option>
                                <option value="Lithuania">Lithuania</option>
                                <option value="Luxembourg">Luxembourg</option>
                                <option value="Macau">Macau</option>
                                <option value="Macedonia">Macedonia</option>
                                <option value="Madagascar">Madagascar</option>
                                <option value="Malaysia">Malaysia</option>
                                <option value="Malawi">Malawi</option>
                                <option value="Maldives">Maldives</option>
                                <option value="Mali">Mali</option>
                                <option value="Malta">Malta</option>
                                <option value="Marshall Islands">Marshall Islands</option>
                                <option value="Martinique">Martinique</option>
                                <option value="Mauritania">Mauritania</option>
                                <option value="Mauritius">Mauritius</option>
                                <option value="Mayotte">Mayotte</option>
                                <option value="Mexico">Mexico</option>
                                <option value="Midway Islands">Midway Islands</option>
                                <option value="Moldova">Moldova</option>
                                <option value="Monaco">Monaco</option>
                                <option value="Mongolia">Mongolia</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Morocco">Morocco</option>
                                <option value="Mozambique">Mozambique</option>
                                <option value="Myanmar">Myanmar</option>
                                <option value="Nambia">Nambia</option>
                                <option value="Nauru">Nauru</option>
                                <option value="Nepal">Nepal</option>
                                <option value="Netherland Antilles">Netherland Antilles</option>
                                <option value="Netherlands">Netherlands (Holland, Europe)</option>
                                <option value="Nevis">Nevis</option>
                                <option value="New Caledonia">New Caledonia</option>
                                <option value="New Zealand">New Zealand</option>
                                <option value="Nicaragua">Nicaragua</option>
                                <option value="Niger">Niger</option>
                                <option value="Nigeria">Nigeria</option>
                                <option value="Niue">Niue</option>
                                <option value="Norfolk Island">Norfolk Island</option>
                                <option value="Norway">Norway</option>
                                <option value="Oman">Oman</option>
                                <option value="Pakistan">Pakistan</option>
                                <option value="Palau Island">Palau Island</option>
                                <option value="Palestine">Palestine</option>
                                <option value="Panama">Panama</option>
                                <option value="Papua New Guinea">Papua New Guinea</option>
                                <option value="Paraguay">Paraguay</option>
                                <option value="Peru">Peru</option>
                                <option value="Phillipines">Philippines</option>
                                <option value="Pitcairn Island">Pitcairn Island</option>
                                <option value="Poland">Poland</option>
                                <option value="Portugal">Portugal</option>
                                <option value="Puerto Rico">Puerto Rico</option>
                                <option value="Qatar">Qatar</option>
                                <option value="Republic of Montenegro">Republic of Montenegro</option>
                                <option value="Republic of Serbia">Republic of Serbia</option>
                                <option value="Reunion">Reunion</option>
                                <option value="Romania">Romania</option>
                                <option value="Russia">Russia</option>
                                <option value="Rwanda">Rwanda</option>
                                <option value="St Barthelemy">St Barthelemy</option>
                                <option value="St Eustatius">St Eustatius</option>
                                <option value="St Helena">St Helena</option>
                                <option value="St Kitts-Nevis">St Kitts-Nevis</option>
                                <option value="St Lucia">St Lucia</option>
                                <option value="St Maarten">St Maarten</option>
                                <option value="St Pierre & Miquelon">St Pierre & Miquelon</option>
                                <option value="St Vincent & Grenadines">St Vincent & Grenadines</option>
                                <option value="Saipan">Saipan</option>
                                <option value="Samoa">Samoa</option>
                                <option value="Samoa American">Samoa American</option>
                                <option value="San Marino">San Marino</option>
                                <option value="Sao Tome & Principe">Sao Tome & Principe</option>
                                <option value="Saudi Arabia">Saudi Arabia</option>
                                <option value="Senegal">Senegal</option>
                                <option value="Seychelles">Seychelles</option>
                                <option value="Sierra Leone">Sierra Leone</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Slovakia">Slovakia</option>
                                <option value="Slovenia">Slovenia</option>
                                <option value="Solomon Islands">Solomon Islands</option>
                                <option value="Somalia">Somalia</option>
                                <option value="South Africa">South Africa</option>
                                <option value="Spain">Spain</option>
                                <option value="Sri Lanka">Sri Lanka</option>
                                <option value="Sudan">Sudan</option>
                                <option value="Suriname">Suriname</option>
                                <option value="Swaziland">Swaziland</option>
                                <option value="Sweden">Sweden</option>
                                <option value="Switzerland">Switzerland</option>
                                <option value="Syria">Syria</option>
                                <option value="Tahiti">Tahiti</option>
                                <option value="Taiwan">Taiwan</option>
                                <option value="Tajikistan">Tajikistan</option>
                                <option value="Tanzania">Tanzania</option>
                                <option value="Thailand">Thailand</option>
                                <option value="Togo">Togo</option>
                                <option value="Tokelau">Tokelau</option>
                                <option value="Tonga">Tonga</option>
                                <option value="Trinidad & Tobago">Trinidad & Tobago</option>
                                <option value="Tunisia">Tunisia</option>
                                <option value="Turkey">Turkey</option>
                                <option value="Turkmenistan">Turkmenistan</option>
                                <option value="Turks & Caicos Is">Turks & Caicos Is</option>
                                <option value="Tuvalu">Tuvalu</option>
                                <option value="Uganda">Uganda</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Ukraine">Ukraine</option>
                                <option value="UAE">United Arab Emirates</option>
                                <option value="USA">United States of America</option>
                                <option value="Uraguay">Uruguay</option>
                                <option value="Uzbekistan">Uzbekistan</option>
                                <option value="Vanuatu">Vanuatu</option>
                                <option value="Vatican City State">Vatican City State</option>
                                <option value="Venezuela">Venezuela</option>
                                <option value="Vietnam">Vietnam</option>
                                <option value="Virgin Islands (Brit)">Virgin Islands (Brit)</option>
                                <option value="Virgin Islands (USA)">Virgin Islands (USA)</option>
                                <option value="Wake Island">Wake Island</option>
                                <option value="Wallis & Futana Is">Wallis & Futana Is</option>
                                <option value="Yemen">Yemen</option>
                                <option value="Zaire">Zaire</option>
                                <option value="Zambia">Zambia</option>
                                <option value="Zimbabwe">Zimbabwe</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-2 mt-3 border text-end bg-light sticky-bottom">

                        <button className="btn btn-link text-dark mx-2" onClick={() => {
                            localStorage.clear();
                            location.reload();
                        }}>Logout</button>
                    </div>
                </div>
            </React.Fragment>;
        } else {
            return <React.Fragment>
                {loading}
            </React.Fragment>;
        }
    }
}

class RegisterForm extends React.Component {

    constructor(props) {
        super(props);
        let loggedin = true;
        if (localStorage.getItem("token") == null) {
            loggedin = false;
        }

        this.state = {
            showregisterform: props.beginWithRegister,
            registerdto: { userName: '', password: '', userEmail: '' },
            logindto: { userName: '', password: '' },
            loading: false, message: '', bsstyle: '', loggedin: loggedin
        };

        this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegisterClickHere = this.handleRegisterClickHere.bind(this);
        this.handleLoginClickHere = this.handleLoginClickHere.bind(this);
    }

    handleLogin(e) {
        e.preventDefault();

        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/Members/Login', {
            method: 'post',
            body: JSON.stringify({ UserName: this.state.logindto.userName, Password: this.state.logindto.password }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                //console.log(response);
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        if (data.token !== undefined) {
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("myself", JSON.stringify(data.member));
                            this.setState({ bsstyle: '', message: '', loggedin: true, loading: false });
                            if (this.props.onLogin !== undefined) {
                                this.props.onLogin();
                            } else {
                                this.setState({ redirectto: '/' });
                            }
                        }
                    });
                }
                else if (response.status === 404) {
                    response.json().then(data => {
                        //console.log(data);
                        this.setState({ bsstyle: 'danger', message: data.error, loading: false });
                    });

                }
            });
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true });
        fetch('//' + window.location.host + '/api/members/register', {
            method: 'post',
            body: JSON.stringify({ UserName: this.state.registerdto.userName, Password: this.state.registerdto.password, Email: this.state.registerdto.userEmail }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log(response.status);
                if (response.status === 200) {
                    this.setState({
                        loading: false,
                        bsstyle: 'success',
                        message: 'Your registration is complete.',
                        loggedin: false,
                        logindto: { userName: this.state.registerdto.userName, password: '' },
                        showregisterform: false
                    });
                } else if (response.status === 400) {

                    response.json().then(data => {

                        this.setState({
                            loading: false,
                            bsstyle: 'danger',
                            message: data.error
                        });
                    });
                }
                else {
                    this.setState({
                        loading: false,
                        bsstyle: 'danger',
                        message: 'Unable to process your request please try again.',
                    });
                }
            });

        return false;
    }

    handleRegisterClickHere() {
        this.setState({ showregisterform: true, message: "" });
    }

    handleLoginClickHere() {
        this.setState({ showregisterform: false, message: "" });
    }

    renderLoginForm() {
        return <form onSubmit={this.handleLogin}>
            <div className="mb-3">
                <label>Username</label>
                <input type="text" className="form-control" required name="userName" value={this.state.logindto.userName} onChange={(e) => { this.setState({ logindto: { userName: e.target.value, password: this.state.logindto.password } }) }} />
            </div>
            <div className="mb-3">
                <label>Password</label>
                <input className="form-control" required name="password" type="password" onChange={(e) => { this.setState({ logindto: { userName: this.state.logindto.userName, password: e.target.value } }) }} />
            </div>
            <div className="row">
                <div className="col">
                    <button className="btn btn-dark" type="submit">Login</button>
                </div>
                <div className="col text-end">
                    <a href="/forgotpassword" className="btn btn-link text-dark">Forgot Password?</a>
                </div>
            </div>
        </form>;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.beginWithRegister !== prevState.beginWithRegister) {
            return { someState: nextProps.beginWithRegister };
        }
        else return null;
    }

    render() {
        let loading = this.state.loading ? <div className="progress" style={{ height: "5px" }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{ width: "100%" }}></div>
        </div> : null;
        let messagecontent = this.state.message !== "" ? <div className={"mt-1 alert alert-" + this.state.bsstyle}>
            {this.state.message}
        </div> : null;

        let logincontents = this.state.GenerateOTPButton ?
            this.renderOTPForm()
            : this.renderLoginForm();

        let formcontents = this.state.showregisterform ?
            <div>
                <h3>Register</h3>
                <div >
                    <form autoComplete="off" onSubmit={this.handleRegisterSubmit}>
                        <div className="mb-3">
                            <label>Email</label>
                            <input className="form-control" maxLength="250" required name="userEmail" type="email"
                                value={this.state.registerdto.userEmail}
                                onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: this.state.registerdto.password, userEmail: e.target.value } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Username</label>
                            <input type="text" className="form-control" required name="username" value={this.state.registerdto.userName}
                                onChange={(e) => { this.setState({ registerdto: { userName: e.target.value, password: this.state.registerdto.password, userEmail: this.state.registerdto.userEmail } }) }} />
                        </div>
                        <div className="mb-3">
                            <label>Password</label>
                            <input className="form-control" minLength="8" required name="password" type="password" onChange={(e) => { this.setState({ registerdto: { userName: this.state.registerdto.userName, password: e.target.value, userEmail: this.state.registerdto.userEmail } }) }} />
                        </div>

                        <button className="btn btn-dark" type="submit">Register</button>
                    </form>

                    <p className="text-center mt-2">
                        Already a Member! <a onClick={this.handleLoginClickHere} className="link-success">Login Here</a> </p>
                    {messagecontent}
                    {loading}
                </div>
            </div> :
            <div>
                <h3>Login</h3>
                <div >
                    {logincontents}
                    <p className="text-center mt-3 p-3 border-top">
                        Register for FREE <a onClick={this.handleRegisterClickHere} className="link-success">Click Here</a></p>
                    {messagecontent}
                    {loading}
                </div>
            </div>;
        return <div className="row align-items-center justify-content-center mx-0">
            <div className="col px-0">
                {formcontents}
            </div></div>;
    }
}

class ViewProfile extends React.Component {

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

    processString(options) {
        var key = 0;

        function processInputWithRegex(option, input) {
            if (!option.fn || typeof option.fn !== 'function') return input;

            if (!option.regex || !(option.regex instanceof RegExp)) return input;

            if (typeof input === 'string') {
                var regex = option.regex;
                var result = null;
                var output = [];

                while ((result = regex.exec(input)) !== null) {
                    var index = result.index;
                    var match = result[0];

                    output.push(input.substring(0, index));
                    output.push(option.fn(++key, result));

                    input = input.substring(index + match.length, input.length + 1);
                    regex.lastIndex = 0;
                }

                output.push(input);
                return output;
            } else if (Array.isArray(input)) {
                return input.map(function (chunk) {
                    return processInputWithRegex(option, chunk);
                });
            } else return input;
        }

        return function (input) {
            if (!options || !Array.isArray(options) || !options.length) return input;

            options.forEach(function (option) {
                return input = processInputWithRegex(option, input);
            });

            return input;
        };
    }

    renderText(text) {
        let parts = text.split(/(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim) // re is a matching regular expression
        for (let i = 1; i < parts.length; i += 2) {
            parts[i] = <a key={'link' + i} href={parts[i]}>{parts[i].split('\n').map((item, key) => {
                return <React.Fragment key={key}>{item}<br /></React.Fragment>
            })}</a>
        }
        return parts
    }

    render() {
        if (this.state.profile !== null) {
            var d = new Date();
            let pic = <React.Fragment><img src="/images/nopic.jpg" style={{ width: "50px" }} className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;

            if (this.state.profile.pic !== "") {
                pic = <React.Fragment><img src={this.state.profile.pic} className="rounded mx-auto d-block img-fluid" alt="" /></React.Fragment>;
            }
            let age = this.state.profile.birthYear > 0 ? <React.Fragment>{d.getFullYear() - this.state.profile.birthYear} Years Old</React.Fragment> : null;

            let address = this.state.profile.city + ' ' + this.state.profile.state + ' ' + this.state.profile.country;

            if (address.trim() !== '') {
                address = 'From ' + address;
            }
            let config = [{
                regex: /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => <span key={key}>
                    <a target="_blank" href={`${result[1]}://${result[2]}.${result[3]}${result[4]}`}>{result[2]}.{result[3]}{result[4]}</a>{result[5]}
                </span>
            },
            {
                regex: /\n/gim,
                fn: (key, result) => <br key={key} />
            }, {
                regex: /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
                fn: (key, result) => <span key={key}>
                    <a target="_blank" href={`http://${result[1]}.${result[2]}${result[3]}`}>{result[1]}.{result[2]}{result[3]}</a>{result[4]}
                </span>
            }];
            var bio = <p>{this.processString(config)(this.state.profile.bio)}</p>;
            return (
                <div className="text-center">
                    {pic}
                    <h4>{this.state.profile.name}</h4>
                    <p>{bio}</p>
                    <p><em>{age} {address}</em></p>
                </div>
            );
        } else {
            return null;
        }
    }
}

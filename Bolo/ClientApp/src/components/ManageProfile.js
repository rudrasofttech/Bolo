import React, { Component } from 'react';
import nopic from "../assets/nopic.jpg";
import { Progress, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'

export class ManageProfile extends Component {
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
                x: 20,
                y: 20,
                width: 200,
                height: 200
            },
            croppedImageUrl: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.saveData = this.saveData.bind(this);
        this.toggleProfilePicModal = this.toggleProfilePicModal.bind(this);
        this.saveProfilePic = this.saveProfilePic.bind(this);
        this.removeProfilePicture = this.removeProfilePicture.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("token") !== null) {
            this.validate(localStorage.getItem("token"));
        }
    }

    handleChange(e) {
        let m = this.state.myself;
        switch (e.target.name) {
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
            default:
                break;
        }

        this.setState({ myself: m });
    }

    handleFile = e => {
        const fileReader = new FileReader()
        fileReader.onloadend = () => {
            this.setState({ src: fileReader.result })
        }
        fileReader.readAsDataURL(e.target.files[0])
    }

    toggleProfilePicModal() {
        this.setState({ showProfilePicModal: !this.state.showProfilePicModal });
    }

    removeProfilePicture(e) {
        this.setState({ loading: true });
        const fd = new FormData();
        fd.set("pic", "");
        fetch('api/Members/savepic', {
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
        if (this.state.croppedImageUrl !== null) {
            this.setState({ loading: true });
            const fd = new FormData();
            fd.set("pic", this.state.croppedImageUrl);
            fetch('api/Members/savepic', {
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
    }

    saveData(e) {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ loading: true });
        if (name !== 'bio') {
            fetch('api/Members/Save' + name + '?d=' + value, {
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
                        this.setState({ loading: false });
                        if (localStorage.getItem("token") !== null) {
                            this.validate(localStorage.getItem("token"));
                        }
                        if (this.state.onProfileChange !== null) {
                            this.state.onProfileChange();
                        }
                    } else {
                        this.setState({ loading: false, message: 'Unable to save data', bsstyle: 'danger' });
                    }
                });
        } else {
            const fd = new FormData();
            fd.set("d", value);
            fetch('api/Members/savebio', {
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
        fetch('api/Members/Validate', {
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

                        this.setState({ loggedin: true, loading: false, myself: data });
                    });
                }
            });
    }

    onImageLoaded = image => {
        this.imageRef = image
    }

    onCropChange = (crop) => {
        this.setState({ crop });
    }

    onCropComplete = crop => {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = this.getCroppedImg(this.imageRef, crop)
            this.setState({ croppedImageUrl })
        }
    }

    getCroppedImg(image, crop) {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        )

        return canvas.toDataURL();
    }

    render() {
        if (this.state.loggedin && this.state.myself !== null) {
            const { crop, profile_pic, src } = this.state;

            let loading = this.state.loading ? <div> <Progress animated color="info" value="100" className="loaderheight" /> </div> : <></>;
            let pic = this.state.myself.pic !== "" ? <><img src={this.state.myself.pic} className="rounded mx-auto d-block img-fluid" alt="" />
                <button type="button" className="btn btn-sm btn-light m-1" onClick={this.removeProfilePicture}>Remove Picture</button></> : <img src={nopic} className="rounded mx-auto d-block img-fluid" alt="" />;
            return <>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3 text-center">
                            {pic}
                            <button type="button" className="btn btn-sm btn-light m-1" onClick={this.toggleProfilePicModal}>Upload Picture</button>
                            
                            <Modal isOpen={this.state.showProfilePicModal} toggle={this.toggleProfilePicModal}>
                                <ModalHeader toggle={this.toggleProfilePicModal}>Profile Picture</ModalHeader>
                                <ModalBody>
                                    <div className="custom-file m-1">
                                        <input type="file" className="custom-file-input" id="profile_pic" value={profile_pic}
                                            onChange={this.handleFile} />
                                        <label className="custom-file-label" htmlFor="profile_pic">Choose Picture</label>
                                    </div>
                                    {src && (
                                        <ReactCrop
                                            src={src}
                                            crop={crop}
                                            locked="true"
                                            onImageLoaded={this.onImageLoaded}
                                            onComplete={this.onCropComplete}
                                            onChange={this.onCropChange}
                                        />
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <button type="button" className="btn btn-primary" onClick={this.saveProfilePic}>Save</button>

                                </ModalFooter>
                            </Modal>
                        </div>
                        <div className="col-md-9">

                            <div className="form-row">
                                <div className="col-mg-12">
                                    <div className="form-group">
                                        <label htmlFor="biotxt">About Me</label>
                                        <textarea className="form-control" id="biotxt" name="bio" value={this.state.myself.bio} onChange={this.handleChange} onBlur={this.saveData} rows="3" placeholder="Write something about yourself."></textarea>
                                        <small className="form-text text-muted">Optional, but recommended. Use this space to describe yourself. Your interests,  profession, hobbies etc. It's your space use it well.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="nametxt">Name</label>
                                        <input type="text" id="nametxt" name="name" placeholder="Your Name" className="form-control" value={this.state.myself.name} onChange={this.handleChange} onBlur={this.saveData} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="birthyeartxt">Year of Birth</label>
                                        <input type="number" id="birthyeartxt" name="birthYear" className="form-control" value={this.state.myself.birthYear} onChange={this.handleChange} onBlur={this.saveData} />
                                        <small className="form-text text-muted">Optional, but recommended.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="genderselect">Gender</label>
                                        <select className="custom-select" id="genderselect" name="gender" value={this.state.myself.gender} onChange={this.handleChange} onBlur={this.saveData} >
                                            <option value="0"></option>
                                            <option value="1">Male</option>
                                            <option value="2">Female</option>
                                            <option value="3">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="visibilityselect">Profile Visibility</label>
                                        <select className="custom-select" id="genderselect" name="visibility" value={this.state.myself.visibility} onChange={this.handleChange} onBlur={this.saveData}>
                                            <option value="0"></option>
                                            <option value="1">Public</option>
                                            <option value="2">Private</option>
                                        </select>
                                        <small className="form-text text-muted">Optional, but recommended. Public visibility means your profile will be visible in searches. Private visibility means your profile will not be shown in searches.</small>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                {loading}
            </>;
        } else {
            return <></>;
        }
    }
}

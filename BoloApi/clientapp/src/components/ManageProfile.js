import { useRef, useState } from "react";
import AvatarEditor from 'react-avatar-editor'
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import ShowMessage from "./shared/ShowMessage";
import ChangePassword from "./ChangePassword";
import ManageLinks from "./ManageLinks";
import ManageEmails from "./ManageEmails";
import ManagePhones from "./ManagePhones";
import Layout from "./Layout";
import Spinner from "./shared/Spinner";
import { Utility } from "./Utility";

function ManageProfile(props) {
    const auth = useAuth();
    const [thoughtStatus, setThoughtStatus] = useState(auth.myself.thoughtStatus);
    const [bio, setBio] = useState(auth.myself.bio);
    const [securityAnswer, setSecurityAnswer] = useState(auth.myself.securityAnswer);
    const [securityQuestion, setSecurityQuestion] = useState(auth.myself.securityQuestion);
    const [userName, setUserName] = useState(auth.myself.userName);
    const [phone, setPhone] = useState(auth.myself.phone);
    const [email, setEmail] = useState(auth.myself.email);
    const [name, setName] = useState(auth.myself.name);
    const [gender, setGender] = useState(auth.myself.gender);
    const [birthYear, setBirthYear] = useState(auth.myself.birthYear);
    const [visibility, setVisibility] = useState(auth.myself.visibility);
    const [country, setCountry] = useState(auth.myself.country);
    const [state, setState] = useState(auth.myself.state);
    const [city, setCity] = useState(auth.myself.city);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [showProfilePicModal, setShowProfilePicModal] = useState(false);
    const [src, setSrc] = useState(null);
    const [showSecAnsModal, setShowSecAnsModal] = useState(false);
    const editor = useRef(null);
    const profilePicInput = useRef(null);
    const [profilePicScale, setProfilePicScale] = useState(1);

    //const [countryitems, setCountryItems] = useState([]);
    const [showchangepasswordmodal, setShowChangePasswordModal] = useState(false);


    const handleChange = (e) => {
        switch (e.target.name) {
            case 'securityQuestion':
                setSecurityQuestion(e.target.value);
                break;
            case 'securityAnswer':
                setSecurityAnswer(e.target.value);
                break;
            case 'userName':
                setUserName(e.target.value.replace(" ", "").replace("\\", "").replace("/", "").replace(";", "").replace("\"", "").replace("'", "").replace("#", ""));
                break;
            case 'phone':
                setPhone(e.target.value);
                break;
            case 'email':
                setEmail(e.target.value);
                break;
            case 'bio':
                setBio(e.target.value);
                break;
            case 'name':
                if (e.target.value.trim() === "") {
                    setMessage(new MessageModel("danger", "Name is required."));
                    e.target.focus();
                } else {
                    setName(e.target.value);
                }
                break;
            case 'birthYear':
                setBirthYear(e.target.value);
                break;
            case 'gender':
                setGender(e.target.value);
                break;
            case 'visibility':
                setVisibility(e.target.value);
                break;
            case 'country':
                setCountry(e.target.value);
                break;
            case 'state':
                setState(e.target.value);
                break;
            case 'city':
                setCity(e.target.value);
                break;
            case 'thoughtStatus':
                setThoughtStatus(e.target.value);
                break;
            default:
                break;
        }

    }

    const toggleProfilePicModal = () => {
        setShowProfilePicModal(!showProfilePicModal);
    }

    const removeProfilePicture = (e) => {
        setLoading(true);
        const fd = new FormData();
        fd.set("pic", "");
        fetch(`${Utility.GetAPIURL()}/api/Members/savepic`, {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    auth.logout();
                } else if (response.status === 200) {
                    setShowProfilePicModal(false);
                    auth.validate();
                } else {
                    setMessage(new MessageModel("danger", 'Unable to save profile pic.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    }

    const handleScale = (e) => {
        const scale = parseFloat(e.target.value)
        setProfilePicScale(scale);
    }

    const saveProfilePic = () => {
        setLoading(true);
        const fd = new FormData();
        fd.set("pic", editor.current?.getImageScaledToCanvas().toDataURL());
        fetch('//' + window.location.host + '/api/Members/savepic', {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                } else if (response.status === 200) {
                    setMessage(new MessageModel("success", "Data is saved."));
                    auth.validate();
                    setShowProfilePicModal(false);
                    setSrc(null);
                } else {
                    setMessage(new MessageModel("danger", "Unable to save profile pic."));
                }
            }).catch(err => {
                setMessage(new MessageModel("danger", "Unable to save profile pic."));
                console.log(err);
            }).finally(() => { setLoading(false) });
    }

    const saveData = (name, value) => {
        setLoading(true);
        if (name !== 'bio') {
            fetch(`${Utility.GetAPIURL()}/api/Members/Save${name}?d=${value}`, {
                method: 'get',
                headers: {
                    "Authorization": `Bearer ${auth.token}`
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        auth.logout();
                    } else if (response.status === 200) {
                        setMessage(new MessageModel("success", "Data is saved."));
                        auth.validate();
                    } else {
                        response.json().then(data => {
                            setMessage(new MessageModel("danger", data.error));
                        }).catch(err => {
                            setMessage(new MessageModel("danger", "Unable to process request."));
                            console.log(err);
                        });
                    }
                }).catch(() => {
                    setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
                }).finally(() => {
                    setLoading(false);
                });
        } else {
            const fd = new FormData();
            fd.set("d", value);
            fetch(`${Utility.GetAPIURL()}/api/Members/savebio`, {
                method: 'post',
                body: fd,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })
                .then(response => {
                    if (response.status === 401) {
                        auth.logout();
                    } else if (response.status === 200) {
                        setMessage(new MessageModel("success", "Data is saved."));
                        auth.validate();
                    } else {
                        response.json().then(data => {
                            setMessage(new MessageModel("danger", data.error));
                        }).catch(err => {
                            setMessage(new MessageModel("danger", "Unable to process request."));
                            console.log(err);
                        });
                    }
                }).catch(() => {
                    setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
                }).finally(() => {
                    setLoading(false);
                });
        }
    }

    const renderUSStates = () => {
        return <select name="state" id="state" className="form-control" value={state} onChange={handleChange} onBlur={() => { saveData("state", state) }}><option value=""></option><option value="Alabama">Alabama</option><option value="Alaska">Alaska</option><option value="Arizona">Arizona</option><option value="Arkansas">Arkansas</option><option value="California">California</option><option value="Colorado">Colorado</option><option value="Connecticut">Connecticut</option><option value="Delaware">Delaware</option><option value="District of Columbia">District of Columbia</option><option value="Florida">Florida</option><option value="Georgia">Georgia</option><option value="Guam">Guam</option><option value="Hawaii">Hawaii</option><option value="Idaho">Idaho</option><option value="Illinois">Illinois</option><option value="Indiana">Indiana</option><option value="Iowa">Iowa</option><option value="Kansas">Kansas</option><option value="Kentucky">Kentucky</option><option value="Louisiana">Louisiana</option><option value="Maine">Maine</option><option value="Maryland">Maryland</option><option value="Massachusetts">Massachusetts</option><option value="Michigan">Michigan</option><option value="Minnesota">Minnesota</option><option value="Mississippi">Mississippi</option><option value="Missouri">Missouri</option><option value="Montana">Montana</option><option value="Nebraska">Nebraska</option><option value="Nevada">Nevada</option><option value="New Hampshire">New Hampshire</option><option value="New Jersey">New Jersey</option><option value="New Mexico">New Mexico</option><option value="New York">New York</option><option value="North Carolina">North Carolina</option><option value="North Dakota">North Dakota</option><option value="Northern Marianas Islands">Northern Marianas Islands</option><option value="Ohio">Ohio</option><option value="Oklahoma">Oklahoma</option><option value="Oregon">Oregon</option><option value="Pennsylvania">Pennsylvania</option><option value="Puerto Rico">Puerto Rico</option><option value="Rhode Island">Rhode Island</option><option value="South Carolina">South Carolina</option><option value="South Dakota">South Dakota</option><option value="Tennessee">Tennessee</option><option value="Texas">Texas</option><option value="Utah">Utah</option><option value="Vermont">Vermont</option><option value="Virginia">Virginia</option><option value="Virgin Islands">Virgin Islands</option><option value="Washington">Washington</option><option value="West Virginia">West Virginia</option><option value="Wisconsin">Wisconsin</option><option value="Wyoming">Wyoming</option></select>;
    }

    const renderIndianStates = () => {
        return <select name="state" id="state" className="form-control" value={state} onChange={handleChange} onBlur={() => { saveData("state", state) }}>
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

    const renderStates = () => {
        if (auth.myself.country.toLowerCase() === "india") {
            return renderIndianStates();
        } else if (auth.myself.country.toLowerCase() === "usa") {
            return renderUSStates();
        } else {
            return <input type="text" name="state" className="form-control" maxLength="100" value={state} onChange={handleChange} onBlur={() => { saveData("state", state) }} />
        }
    }

    const renderSecAnsModal = () => {
        if (showSecAnsModal) {
            return <>
                <div className="modal  d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Set Security Answer</h5>
                                <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={() => { setShowSecAnsModal(false); }}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="securityAnswerTxt" className="form-label">Security Question </label>
                                    <div>{auth.myself.securityQuestion}</div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="securityAnswerTxt" className="form-label">Security Answer <span className="text-danger">(Required)</span></label>
                                    <input type="text" id="securityAnswerTxt" name="securityAnswer" className="form-control"
                                        maxLength="300" value={securityAnswer} onChange={(e) => { setSecurityAnswer(e.target.value); }} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <ShowMessage messagemodal={message} toast={false} />
                                <button type="button" disabled={loading} className="btn btn-primary"
                                    onClick={() => { saveData("securityanswer", securityAnswer) }}><Spinner show={loading} sm={true} /> Save</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        else { return null; }
    }

    const renderProfilePicModal = () => {
        if (showProfilePicModal) {
            return <>
                <div className="modal d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title text-primary fw-semibold">Profile Picture</h4>
                                <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={toggleProfilePicModal}>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3 text-center">
                                    <button className="btn btn-primary" type="button" onClick={() => {
                                        document.getElementById("profile_pic").click();
                                    }}>Choose Picture</button>
                                    <input ref={profilePicInput} type="file" className="d-none" id="profile_pic"
                                        onChange={(e) => { setSrc(e.target.files[0]); }} />
                                </div>
                                {src !== null ? <div className="text-center">
                                    <AvatarEditor ref={editor} image={src} width={250} height={250} border={50} scale={profilePicScale} />
                                    <div className="my-2">
                                        <input type="range" onChange={handleScale} min='0.1' max="2" step="0.01" defaultValue="1" />
                                    </div>
                                </div> : null}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={saveProfilePic}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
        else { return null; }
    }

    const renderChangePasswordModal = () => {
        if (showchangepasswordmodal) {
            return <>
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Reset Password</h1>
                                <button type="button" className="btn-close" onClick={() => { setShowChangePasswordModal(false); }}></button>
                            </div>
                            <div className="modal-body">
                                <ChangePassword />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        }
    }

    const renderComp = () => {

        var yearitems = []
        for (var i = 1947; i <= 2004; i++) {
            yearitems.push(<option value={i}>{i}</option>);
        }

        if (auth.myself !== null) {
            return <>
                <div className="px-md-5 my-lg-3 my-2">
                    <Spinner show={loading} />
                    {renderSecAnsModal()}
                    {renderProfilePicModal()}
                    <div className="row">
                        <div className="col-lg-4">
                            <h4 className="mb-3 text-primary fw-bold text-center">Personal Information</h4>
                            <img src={auth.myself.pic !== "" ? "//" + window.location.host + "/" + auth.myself.pic : "/theme1/images/person-fill.svg"} className="rounded-circle mx-auto d-block img-fluid" alt="" style={{ width: "150px" }} />
                            <div className="text-center">
                                {auth.myself.pic !== "" ? <button type="button" className="btn btn-sm btn-link m-1" onClick={removeProfilePicture}>Remove</button> : null}
                                <button type="button" className="btn btn-sm btn-link m-1" onClick={toggleProfilePicModal}>Change</button>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="channelnametxt" className="form-label text-primary">Username</label>
                                <input type="text" id="channelnametxt" disabled readOnly name="userName" placeholder="Unique Channel Name"
                                    className="form-control shadow-none border" value={userName} />
                            </div>
                            <div className="mb-3">
                                <button type="button" className="btn btn-primary" onClick={() => { setShowChangePasswordModal(true); }}>Reset Password</button>
                                {renderChangePasswordModal()}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="nametxt" className="form-label text-primary">Name <span className="text-danger">(Required)</span></label>
                                <input type="text" id="nametxt" name="name" placeholder="Your Name" className="form-control shadow-none border"
                                    value={name} onChange={handleChange} onBlur={() => { saveData("name", name) }} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-primary">Mobile <span className="text-danger">(Required)</span></label>
                                <input type="text" name="phone" className="form-control shadow-none border" maxLength="15" value={phone} onChange={handleChange}
                                    onBlur={() => { saveData("phone", phone) }} />
                                <div className="fs-small text-secondary">Mobile will not be shown on profile.</div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-primary">Email <span className="text-danger">(Required)</span></label>
                                <input type="email" name="email" className="form-control shadow-none border" maxLength="250" value={email}
                                    onChange={handleChange}
                                    onBlur={() => { saveData("email", email) }} />
                                <div className="fs-small text-secondary">Email will not be shown on profile.</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="birthyeartxt" className="form-label text-primary">Year of Birth</label>
                                <select id="birthyeartxt" name="birthYear" className="form-select rounded-4 shadow-none border" value={birthYear} onChange={handleChange}
                                    onBlur={() => { saveData("birthYear", birthYear) }}>
                                    {yearitems}
                                </select>
                                <div className="fs-small text-secondary">Age will not be shown on profile.</div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <h4 className="mb-3 text-primary fw-bold text-center">Profile Information</h4>
                            <div className="mb-3">
                                <label htmlFor="thoughtStatus" className="form-label text-primary">One line Introduction</label>
                                <input type="text" name="thoughtStatus" className="form-control shadow-none border" maxLength="195" value={thoughtStatus} onChange={(e) => { setThoughtStatus(e.target.value); }}
                                    onBlur={() => { saveData("thoughtstatus", thoughtStatus) }} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="biotxt" className="form-label text-primary">About Me</label>
                                <textarea className="form-control shadow-none border" id="biotxt" maxLength="950" name="bio" value={bio} onChange={(e) => { setBio(e.target.value); }} rows="7" placeholder="Write something about yourself."
                                    onBlur={() => { saveData("bio", bio) }}></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="visibilityselect" className="form-label text-primary">Profile Visibility</label>
                                <select className="form-select rounded-4 shadow-none border" id="genderselect" name="visibility" value={visibility} onChange={handleChange}
                                    onBlur={() => { saveData("visibility", visibility) }}>
                                    <option value="0"></option>
                                    <option value="2">Public</option>
                                    <option value="1">Private</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="countryselect" className="form-label text-primary">Country</label>
                                <select className="form-select rounded-4 shadow-none border" id="countryselect" name="country" value={country} onChange={handleChange} onBlur={() => { saveData("country", country) }}>
                                    <option value=""></option>
                                    <option value="AD">Andorra</option>
                                    <option value="AE">United Arab Emirates</option>
                                    <option value="AF">Afghanistan</option>
                                    <option value="AG">Antigua and Barbuda</option>
                                    <option value="AI">Anguilla</option>
                                    <option value="AL">Albania</option>
                                    <option value="AM">Armenia</option>
                                    <option value="AO">Angola</option>
                                    <option value="AQ">Antarctica</option>
                                    <option value="AR">Argentina</option>
                                    <option value="AS">American Samoa</option>
                                    <option value="AT">Austria</option>
                                    <option value="AU">Australia</option>
                                    <option value="AW">Aruba</option>
                                    <option value="AX">Åland Islands</option>
                                    <option value="AZ">Azerbaijan</option>
                                    <option value="BA">Bosnia and Herzegovina</option>
                                    <option value="BB">Barbados</option>
                                    <option value="BD">Bangladesh</option>
                                    <option value="BE">Belgium</option>
                                    <option value="BF">Burkina Faso</option>
                                    <option value="BG">Bulgaria</option>
                                    <option value="BH">Bahrain</option>
                                    <option value="BI">Burundi</option>
                                    <option value="BJ">Benin</option>
                                    <option value="BL">Saint Barthélemy</option>
                                    <option value="BM">Bermuda</option>
                                    <option value="BN">Brunei Darussalam</option>
                                    <option value="BO">Bolivia, Plurinational State of</option>
                                    <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
                                    <option value="BR">Brazil</option>
                                    <option value="BS">Bahamas</option>
                                    <option value="BT">Bhutan</option>
                                    <option value="BV">Bouvet Island</option>
                                    <option value="BW">Botswana</option>
                                    <option value="BY">Belarus</option>
                                    <option value="BZ">Belize</option>
                                    <option value="CA">Canada</option>
                                    <option value="CC">Cocos (Keeling) Islands</option>
                                    <option value="CD">Congo, the Democratic Republic of the</option>
                                    <option value="CF">Central African Republic</option>
                                    <option value="CG">Congo</option>
                                    <option value="CH">Switzerland</option>
                                    <option value="CI">Côte d'Ivoire</option>
                                    <option value="CK">Cook Islands</option>
                                    <option value="CL">Chile</option>
                                    <option value="CM">Cameroon</option>
                                    <option value="CN">China</option>
                                    <option value="CO">Colombia</option>
                                    <option value="CR">Costa Rica</option>
                                    <option value="CU">Cuba</option>
                                    <option value="CV">Cape Verde</option>
                                    <option value="CW">Curaçao</option>
                                    <option value="CX">Christmas Island</option>
                                    <option value="CY">Cyprus</option>
                                    <option value="CZ">Czech Republic</option>
                                    <option value="DE">Germany</option>
                                    <option value="DJ">Djibouti</option>
                                    <option value="DK">Denmark</option>
                                    <option value="DM">Dominica</option>
                                    <option value="DO">Dominican Republic</option>
                                    <option value="DZ">Algeria</option>
                                    <option value="EC">Ecuador</option>
                                    <option value="EE">Estonia</option>
                                    <option value="EG">Egypt</option>
                                    <option value="EH">Western Sahara</option>
                                    <option value="ER">Eritrea</option>
                                    <option value="ES">Spain</option>
                                    <option value="ET">Ethiopia</option>
                                    <option value="FI">Finland</option>
                                    <option value="FJ">Fiji</option>
                                    <option value="FK">Falkland Islands (Malvinas)</option>
                                    <option value="FM">Micronesia, Federated States of</option>
                                    <option value="FO">Faroe Islands</option>
                                    <option value="FR">France</option>
                                    <option value="GA">Gabon</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="GD">Grenada</option>
                                    <option value="GE">Georgia</option>
                                    <option value="GF">French Guiana</option>
                                    <option value="GG">Guernsey</option>
                                    <option value="GH">Ghana</option>
                                    <option value="GI">Gibraltar</option>
                                    <option value="GL">Greenland</option>
                                    <option value="GM">Gambia</option>
                                    <option value="GN">Guinea</option>
                                    <option value="GP">Guadeloupe</option>
                                    <option value="GQ">Equatorial Guinea</option>
                                    <option value="GR">Greece</option>
                                    <option value="GS">South Georgia and the South Sandwich Islands</option>
                                    <option value="GT">Guatemala</option>
                                    <option value="GU">Guam</option>
                                    <option value="GW">Guinea-Bissau</option>
                                    <option value="GY">Guyana</option>
                                    <option value="HK">Hong Kong</option>
                                    <option value="HM">Heard Island and McDonald Islands</option>
                                    <option value="HN">Honduras</option>
                                    <option value="HR">Croatia</option>
                                    <option value="HT">Haiti</option>
                                    <option value="HU">Hungary</option>
                                    <option value="ID">Indonesia</option>
                                    <option value="IE">Ireland</option>
                                    <option value="IL">Israel</option>
                                    <option value="IM">Isle of Man</option>
                                    <option value="IN">India</option>
                                    <option value="IO">British Indian Ocean Territory</option>
                                    <option value="IQ">Iraq</option>
                                    <option value="IR">Iran, Islamic Republic of</option>
                                    <option value="IS">Iceland</option>
                                    <option value="IT">Italy</option>
                                    <option value="JE">Jersey</option>
                                    <option value="JM">Jamaica</option>
                                    <option value="JO">Jordan</option>
                                    <option value="JP">Japan</option>
                                    <option value="KE">Kenya</option>
                                    <option value="KG">Kyrgyzstan</option>
                                    <option value="KH">Cambodia</option>
                                    <option value="KI">Kiribati</option>
                                    <option value="KM">Comoros</option>
                                    <option value="KN">Saint Kitts and Nevis</option>
                                    <option value="KP">Korea, Democratic People's Republic of</option>
                                    <option value="KR">Korea, Republic of</option>
                                    <option value="KW">Kuwait</option>
                                    <option value="KY">Cayman Islands</option>
                                    <option value="KZ">Kazakhstan</option>
                                    <option value="LA">Lao People's Democratic Republic</option>
                                    <option value="LB">Lebanon</option>
                                    <option value="LC">Saint Lucia</option>
                                    <option value="LI">Liechtenstein</option>
                                    <option value="LK">Sri Lanka</option>
                                    <option value="LR">Liberia</option>
                                    <option value="LS">Lesotho</option>
                                    <option value="LT">Lithuania</option>
                                    <option value="LU">Luxembourg</option>
                                    <option value="LV">Latvia</option>
                                    <option value="LY">Libya</option>
                                    <option value="MA">Morocco</option>
                                    <option value="MC">Monaco</option>
                                    <option value="MD">Moldova, Republic of</option>
                                    <option value="ME">Montenegro</option>
                                    <option value="MF">Saint Martin (French part)</option>
                                    <option value="MG">Madagascar</option>
                                    <option value="MH">Marshall Islands</option>
                                    <option value="MK">Macedonia, the Former Yugoslav Republic of</option>
                                    <option value="ML">Mali</option>
                                    <option value="MM">Myanmar</option>
                                    <option value="MN">Mongolia</option>
                                    <option value="MO">Macao</option>
                                    <option value="MP">Northern Mariana Islands</option>
                                    <option value="MQ">Martinique</option>
                                    <option value="MR">Mauritania</option>
                                    <option value="MS">Montserrat</option>
                                    <option value="MT">Malta</option>
                                    <option value="MU">Mauritius</option>
                                    <option value="MV">Maldives</option>
                                    <option value="MW">Malawi</option>
                                    <option value="MX">Mexico</option>
                                    <option value="MY">Malaysia</option>
                                    <option value="MZ">Mozambique</option>
                                    <option value="NA">Namibia</option>
                                    <option value="NC">New Caledonia</option>
                                    <option value="NE">Niger</option>
                                    <option value="NF">Norfolk Island</option>
                                    <option value="NG">Nigeria</option>
                                    <option value="NI">Nicaragua</option>
                                    <option value="NL">Netherlands</option>
                                    <option value="NO">Norway</option>
                                    <option value="NP">Nepal</option>
                                    <option value="NR">Nauru</option>
                                    <option value="NU">Niue</option>
                                    <option value="NZ">New Zealand</option>
                                    <option value="OM">Oman</option>
                                    <option value="PA">Panama</option>
                                    <option value="PE">Peru</option>
                                    <option value="PF">French Polynesia</option>
                                    <option value="PG">Papua New Guinea</option>
                                    <option value="PH">Philippines</option>
                                    <option value="PK">Pakistan</option>
                                    <option value="PL">Poland</option>
                                    <option value="PM">Saint Pierre and Miquelon</option>
                                    <option value="PN">Pitcairn</option>
                                    <option value="PR">Puerto Rico</option>
                                    <option value="PS">Palestine, State of</option>
                                    <option value="PT">Portugal</option>
                                    <option value="PW">Palau</option>
                                    <option value="PY">Paraguay</option>
                                    <option value="QA">Qatar</option>
                                    <option value="RE">Réunion</option>
                                    <option value="RO">Romania</option>
                                    <option value="RS">Serbia</option>
                                    <option value="RU">Russian Federation</option>
                                    <option value="RW">Rwanda</option>
                                    <option value="SA">Saudi Arabia</option>
                                    <option value="SB">Solomon Islands</option>
                                    <option value="SC">Seychelles</option>
                                    <option value="SD">Sudan</option>
                                    <option value="SE">Sweden</option>
                                    <option value="SG">Singapore</option>
                                    <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                                    <option value="SI">Slovenia</option>
                                    <option value="SJ">Svalbard and Jan Mayen</option>
                                    <option value="SK">Slovakia</option>
                                    <option value="SL">Sierra Leone</option>
                                    <option value="SM">San Marino</option>
                                    <option value="SN">Senegal</option>
                                    <option value="SO">Somalia</option>
                                    <option value="SR">Suriname</option>
                                    <option value="SS">South Sudan</option>
                                    <option value="ST">Sao Tome and Principe</option>
                                    <option value="SV">El Salvador</option>
                                    <option value="SX">Sint Maarten (Dutch part)</option>
                                    <option value="SY">Syrian Arab Republic</option>
                                    <option value="SZ">Swaziland</option>
                                    <option value="TC">Turks and Caicos Islands</option>
                                    <option value="TD">Chad</option>
                                    <option value="TF">French Southern Territories</option>
                                    <option value="TG">Togo</option>
                                    <option value="TH">Thailand</option>
                                    <option value="TJ">Tajikistan</option>
                                    <option value="TK">Tokelau</option>
                                    <option value="TL">Timor-Leste</option>
                                    <option value="TM">Turkmenistan</option>
                                    <option value="TN">Tunisia</option>
                                    <option value="TO">Tonga</option>
                                    <option value="TR">Turkey</option>
                                    <option value="TT">Trinidad and Tobago</option>
                                    <option value="TV">Tuvalu</option>
                                    <option value="TW">Taiwan, Province of China</option>
                                    <option value="TZ">Tanzania, United Republic of</option>
                                    <option value="UA">Ukraine</option>
                                    <option value="UG">Uganda</option>
                                    <option value="UM">United States Minor Outlying Islands</option>
                                    <option value="US">United States</option>
                                    <option value="UY">Uruguay</option>
                                    <option value="UZ">Uzbekistan</option>
                                    <option value="VA">Holy See (Vatican City State)</option>
                                    <option value="VC">Saint Vincent and the Grenadines</option>
                                    <option value="VE">Venezuela, Bolivarian Republic of</option>
                                    <option value="VG">Virgin Islands, British</option>
                                    <option value="VI">Virgin Islands, U.S.</option>
                                    <option value="VN">Viet Nam</option>
                                    <option value="VU">Vanuatu</option>
                                    <option value="WF">Wallis and Futuna</option>
                                    <option value="WS">Samoa</option>
                                    <option value="YE">Yemen</option>
                                    <option value="YT">Mayotte</option>
                                    <option value="ZA">South Africa</option>
                                    <option value="ZM">Zambia</option>
                                    <option value="ZW">Zimbabwe</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="securityQuesitonTxt" className="form-label text-primary">Security Question <span className="text-danger">(Required)</span></label>
                                <input type="text" id="securityQuesitonTxt" name="securityQuestion" className="form-control shadow-none border"
                                    maxLength="300" value={securityQuestion} onChange={(e) => { setSecurityQuestion(e.target.value); }}
                                    onBlur={() => { saveData("securityquestion", securityQuestion) }} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="securityAnswerTxt" className="form-label text-primary">Security Answer <span className="text-danger">(Required)</span></label>
                                <div className="mb-2" style={{ fontSize: "13px" }}>Your existing answer is not shown.</div>
                                <button type="button" className="btn btn-primary ms-2 btn-sm" onClick={() => { setShowSecAnsModal(true); }}>Change Answer</button>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <h4 className="mb-3 text-primary fw-bold text-center">Display Contact Information</h4>
                            <div className="lh-base fs-small">Links, Emails and Phone numbers added here will be displayed on profile.</div>
                            <div className="py-2">
                                <ManageLinks myself={auth.myself} />
                            </div>
                            <div className="py-2">
                                <ManageEmails myself={auth.myself} />
                            </div>
                            <div className="py-2">
                                <ManagePhones myself={auth.myself} />
                            </div>
                        </div>
                    </div>
                </div>
            </>;
        } else {
            return <Spinner show={loading} />;
        }
    }
    return <Layout>
        {renderComp()}
        <ShowMessage messagemodal={message} toast={true} />
    </Layout>;
}

export default ManageProfile;

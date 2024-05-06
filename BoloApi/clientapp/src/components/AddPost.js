import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import { Utility } from "./Utility";
import Spinner from "./shared/Spinner";
import ShowMessage from "./shared/ShowMessage";
import addpost from "../theme1/images/add-post.svg";

function AddPost(props) {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [describe, setDescribe] = useState("");
    const [acceptComment, setAcceptComment] = useState(true);
    const [allowShare, setAllowShare] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [photosAdded, setPhotosAdded] = useState(null);
    const inputFile = useRef(null);
    const [cactive, setCurrentActive] = useState(0);

    const handleFileChange = (e) => {
        if (e.target.files.length === 0) return;

        for (let k = 0; k < e.target.files.length; k++) {
            let fr = new FileReader();
            fr.onload = (event) => {
                if (photos.length >= 10) {
                    setMessage(new MessageModel("danger", "Only 10 files allowed."));
                    return;
                }
                let temp = photos;

                temp.push(fr.result);
                setPhotos(temp);
                setPhotosAdded(Date.now());
            }
            fr.readAsDataURL(e.target.files[k]);
        }
    };

    const savePost = () => {
        if (photos.length === 0) {
            setMessage(new MessageModel("danger", "Please add some photos to post."));
            return;
        }
        setLoading(true);
        let fd = new FormData();
        fd.append("Describe", describe);
        fd.append("AcceptComment", acceptComment);
        fd.append("AllowShare", allowShare);
        photos.forEach((value, index) => {
            fd.append(`Photos[${index}]`, value);
        });
        fetch(`${Utility.GetAPIURL()}/api/Post`, { method: "post", body: fd, headers: { 'Authorization': `Bearer ${auth.token}` } })
            .then(response => {
                if (response.status === 200) {
                    navigate("/");
                } else if (response.status === 500) {
                    response.json().then(data => {
                        setMessage(new MessageModel("danger", data.error));
                    }).catch(err => {
                        setMessage(new MessageModel("danger", "Unable to save the post, please try after some time."));
                    });
                }
            }).catch(err => {
                setMessage(new MessageModel("danger", "Unable to save the post, please try after some time."));
            }).finally(() => {
                setMessage(new MessageModel("danger", "Unable to connect to internet."));
            });
    }

    const renderComp = () => {
        return <div className="text-center">
            <div className="carousel d-inline-block slide mb-3" style={{ height: "600px" }}>
                {photos.length > 1 ? <div className="carousel-indicators">
                    {photos.map((p, index) => {
                        return <button type="button" data-bs-target="" className={index === cactive ? "active" : ""} aria-current={index === cactive ? "true" : ""} aria-label={`Slide ${index + 1}`}></button>;
                    })}
                </div>
                    : null}
                <div className="carousel-inner d-flex align-items-center">
                    {photos.map((p, index) => {
                        return <div className={index === cactive ? "carousel-item active position-relative" : "carousel-item position-relative"}>
                            <button className="btn btn-primary btn-sm position-absolute top-0 start-50 translate-middle-x mt-2" title="Remove Photo" type="button" onClick={() => {
                                setPhotos(photos.filter((t, i) => i !== index));
                                setPhotosAdded(Date.now());
                            }}>
                                Remove
                            </button>
                            <img src={p} className="img-fluid" style={{ maxHeight: "600px" }} alt="" />
                        </div>;
                    })}
                </div>
                {photos.length > 1 ? <>
                    <button className="carousel-control-prev" type="button" onClick={() => {

                        if (cactive === 0)
                            setCurrentActive(photos.length - 1);
                        else
                            setCurrentActive(cactive - 1);
                    }}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" onClick={() => {
                        if (cactive === photos.length - 1)
                            setCurrentActive(0);
                        else
                            setCurrentActive(cactive + 1);
                    }}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </> : null}
            </div>
            <div className="mb-3 text-center">
                <button className="btn btn-blue btn-sm" style={{ width: "130px" }} type="button" onClick={() => { inputFile.current.click(); }}>Add Photos</button>
            </div>

        </div>;
    }
    return <Layout>
        <div className="px-md-5 my-md-3 my-2">
            {photos.length === 0 ? <div className="text-center pt-5">
                <h1 className="mb-3 fs-2 text-primary">Create new post</h1>
                <img alt="" src={addpost} className="img-fluid mt-1 pointer" onClick={() => { inputFile.current.click(); }} />
                <p className="my-3 lh-base">
                    Upload photos and videos here
                </p>
                <button className="btn btn-blue" style={{ width: "130px" }} type="button" onClick={() => { inputFile.current.click(); }}>Add Photos</button>

            </div> : <div className="row">
                <div className="col-lg-6">
                    <div className="px-md-5 my-md-3 my-2">
                        {renderComp()}
                    </div>
                </div>
                {photos.length > 0 ?
                    <div className="col-lg-6 pt-4">
                        <div className="mb-5">
                            <div className="form-floating">
                                <textarea className="form-control" value={describe} onChange={(e) => { setDescribe(e.target.value); }} placeholder="Write about photos here." id="floatingTextarea2" style={{ height: "200px" }} ></textarea>
                                <label htmlFor="floatingTextarea2">Write about photos here</label>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="acceptCommentCheckbox" checked={acceptComment} onChange={() => { setAcceptComment(!acceptComment); }} />
                                <label className="form-check-label pt-1" htmlFor="acceptCommentCheckbox">Accept comments on post.</label>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="allowShareCheckbox" checked={allowShare} onChange={() => { setAllowShare(!allowShare); }} />
                                <label className="form-check-label pt-1" htmlFor="allowShareCheckbox">Allow sharing of post.</label>
                            </div>
                        </div>
                        <div className="mb-3 text-end">
                            <button type="button" onClick={savePost} className="btn btn-primary" disabled={loading}>
                                <Spinner show={loading} sm={true} /> Save</button>
                        </div>
                    </div> : null}
                <ShowMessage messagemodal={message} />
            </div>}
            
            <input type="file" ref={inputFile} className="d-none" accept="*.jpg.*.png,*.jpeg" multiple onChange={handleFileChange} />
        </div>
    </Layout>;
}

export default AddPost;
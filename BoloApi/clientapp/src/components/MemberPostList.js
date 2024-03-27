﻿import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberPost from "./shared/MemberPost";

function MemberPostList(props) {
    const navigate = useNavigate();
    //const myself = localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself"));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [bsstyle, setBsstyle] = useState('');
    const token = props.token;
    const [q, setSearchKeyword] = useState(props.search);
    let ls = { model: null, posts: [] };
    if (props.search === "userfeed" && localStorage.getItem("userfeed") != null)
        ls = JSON.parse(localStorage.getItem("userfeed"))
    else if (props.search === "explore" && localStorage.getItem("explore") != null)
        ls = JSON.parse(localStorage.getItem("explore"));
    const [firsttime, setFirstTime] = useState(true);
    const [model, setModel] = useState(ls.model);
    const [posts, setPosts] = useState(ls.posts);
    const [p, setCurrentPage] = useState(0);
    const [viewMode, setViewMode] = useState(props.viewMode);
    const [viewModeAllowed, setViewModeAllowed] = useState(props.viewModeAllowed === "true");
    const [post, setPost] = useState(null);


    const selectPost = (id) => {
        setViewMode(2);
        document.getElementById(id).scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    }

    //const addReaction = (id) => {
    //    fetch('//' + window.location.host + '/api/Post/addreaction/' + id, {
    //        method: 'get',
    //        headers: {
    //            'Authorization': 'Bearer ' + token
    //        }
    //    })
    //        .then(response => {
    //            if (response.status === 401) {
    //                //if token is not valid than remove token, set myself object with empty values
    //                console.log("Unauthorized access return, but don take me to login page, just keep quiet.");
    //            } else if (response.status === 200) {
    //                response.json().then(data => {
    //                    var temp = posts;
    //                    for (var k in temp) {
    //                        var p = temp[k];
    //                        if (p.id == id) {
    //                            p.hasReacted = data.hasReacted;
    //                            p.reactionCount = data.reactionCount;
    //                        }
    //                    }
    //                    setBsstyle('');
    //                    setMessage('');
    //                    setPosts(temp);
    //                });
    //            } else {
    //                response.json().then(data => {
    //                    setBsstyle('danger');
    //                    setMessage(data.error);
    //                }).catch(err => {
    //                    setBsstyle('danger');
    //                    setMessage('Unable to process your request.');
    //                    console.log(err);
    //                });
    //            }
    //        }).catch(error => {
    //            setBsstyle('danger');
    //            setMessage('Unable to contact server, Please check your internet connection.');
    //            console.log(error);
    //        });
    //}

    useEffect(() => {
        setLoading(true);
        let url = '//' + window.location.host + '/api/post?q=' + encodeURIComponent(q) + '&p=' + p;

        if (q === "userfeed")
            url = '//' + window.location.host + '/api/post/feed?p=' + p;
        else if (q === "explore")
            url = '//' + window.location.host + '/api/post/explore?p=' + p;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        let temp = firsttime ? data.posts : posts;
                        if (!firsttime) {
                            for (var k in data.posts) {
                                temp.push(data.posts[k]);
                            }
                        }
                        setModel({
                            current: data.current,
                            pageSize: data.pageSize,
                            total: data.total,
                            totalPages: data.totalPages
                        });
                        setPosts(temp);
                        setFirstTime(false);
                        if (q === "userfeed" || q === "explore")
                            localStorage.setItem(q, JSON.stringify({ model, posts }));
                    });
                }
            }).catch(error => {
                setBsstyle('danger');
                setMessage('Unable to contact server, Please check your internet connection.');
                console.log(error);
            }).finally(() => { setLoading(false); });
    }, [q, p, token, navigate, firsttime]);


    const postDeleted = (id) => {
        setPosts(posts.filter(t => t.id !== id));
    }

    const renderPosts = () => {
        let empty = <div key={0}>
            <div className="text-center fs-3 py-5 bg-white rounded-3">
                <img src={"//" + window.location.host + "/theme1/images/add-post.svg"} className="img-fluid" style={{ maxWidth: "150px" }} alt="" /><h2 className="fw-semibold">Nothing to see here</h2>
            </div>
        </div>;
        if (viewMode === 2) {
            let items = []
            if (model !== null) {
                for (var k in posts) {
                    items.push(<MemberPost key={posts[k].id} post={posts[k]} ondelete={postDeleted} onIgnoredMember={(userid) => {
                        setPosts(posts.filter(t => t.owner.id !== userid));
                    }} />);
                }
            }
            if (items.length === 0 && !loading) {
                items.push(empty);
            }
            return <>{items}</>;
        }
        else if (viewMode === 1) {
            let items = [];
            for (let k in posts) {
                let p = posts[k];
                if (p.videoURL !== "") { } else {
                    items.push(<div className="col pointer">
                        <div className="card border-0">
                            <div className="imgbg rounded-3" style={{ backgroundImage: "url(//" + window.location.host + "/" + p.photos[0].photo + ")" }}>
                                <img alt="" src={"//" + window.location.host + "/" + p.photos[0].photo} className="opacity-0 img-fluid" data-postid={p.id} onClick={(e) => {
                                    selectPost(e.target.getAttribute("data-postid"));
                                }} />
                            </div>
                        </div>
                    </div>);
                }
            }
            if (items.length === 0 && !loading) {
                items.push(empty);
                return items;
            }
            return <div className="row row-cols-2 row-cols-md-3 g-4">{items}</div>;
        }
    }

    return <>
        {viewModeAllowed && posts.length > 0 ? <nav className="nav nav-pills justify-content-center m-1">
            <button type="button" onClick={() => { setViewMode(1); }} className={viewMode === 1 ? "nav-link active bg-primary" : "nav-link text-primary"}><i className="bi bi-grid-3x3-gap-fill"></i></button>
            <button type="button" onClick={() => { setViewMode(2); }} className={viewMode === 2 ? "nav-link active bg-primary" : "nav-link text-primary"}><i className="bi bi-view-list"></i></button>
        </nav> : null}
        {loading ? <div className="text-center p-3">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div> : null}
        {renderPosts()}
        {(model != null && (model.current + 1) < model.totalPages) ?
            <div className="text-center">
                <button className="btn btn-light" onClick={() => {
                    setCurrentPage(model.current + 1);
                }}>Load More</button>
            </div>
            : null}
    </>;

}
export default MemberPostList;
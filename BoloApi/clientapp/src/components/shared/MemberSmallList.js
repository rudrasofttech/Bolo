import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberSmallRow from "./MemberSmallRow";
import { useAuth } from "./AuthProvider";
import { Utility } from "../Utility";

function MemberSmallList(props) {
    const navigate = useNavigate();
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    //const [message, setMessage] = useState(new MessageModel());
    //const token = props.token;
    //const myself = props.myself;
    const [model, setModel] = useState(null);
    const [q, setKeywords] = useState('');
    const [p, setCurrentPage] = useState(0);
    const [reactions, setReactions] = useState([]);
    const [followList, setFollowList] = useState([]);
    let url = props.target === 'reaction' ? `${Utility.GetAPIURL()}/api/post/reactionlist/${props.postid}` : (props.target === 'follower' || props.target === 'share') ? '//' + window.location.host + '/api/Follow/followerlist/' : props.target === 'following' ? `${Utility.GetAPIURL()}/api/Follow/followinglist/` : '';


    const followerRemoved = (id) => {
        let items = [];
        for (let k in followList) {
            let p = followList[k];
            if (p.follower.id !== id) {
                items.push(p);
            }
        }
        setFollowList(items);
    }

    const hashTagRemove = (tag) => {
        fetch(`${Utility.GetAPIURL()}/api/Follow/UnfollowHashtag?q=${encodeURIComponent(tag)}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    navigate("/login");
                } else if (response.status === 200) {
                    let items = followList.filter(t => t.tag !== tag);
                    setFollowList(items);
                }
            });
    }

    useEffect(() => {
        setLoading(true);
        fetch(url + "?q=" + encodeURIComponent(q) + "&p=" + p, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        if (props.target === 'reaction') {
                            //console.log(data);
                            let temp = p === 0 ? [] : reactions;
                            for (let k in data.reactions) {
                                temp.push(data.reactions[k]);
                            }

                            setModel({
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            });
                            setReactions(temp);

                        } else if (props.target === 'follower' || props.target === 'following' || props.target === "share") {
                            let temp = p === 0 ? [] : followList;
                            for (let k in data.followList) {
                                temp.push(data.followList[k]);
                            }
                            setModel({
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            });
                            setFollowList(temp);
                        }
                    });
                }
            }).finally(() => {
                setLoading(false);
            });
    }, [q, p]);

    const renderPosts = () => {
        if (props.target === 'reaction') {
            let items = [];
            for (let k in reactions) {
                let p = reactions[k];
                items.push(<MemberSmallRow token={auth.token} key={p.member.id} member={p.member} status={p.status} />);
            }
            return <>{items}</>;
        }
        else if (props.target === 'follower') {
            let items = [];
            for (let k in followList) {
                let p = followList[k];
                items.push(<MemberSmallRow token={auth.token} key={p.follower.id} member={p.follower} status={p.status}
                    showRemove={auth.myself.id === props.memberid ? true : false}
                    removed={(id) => { followerRemoved(id); }}
                />);
            }
            return <>{items}</>;
        }
        else if (props.target === 'share') {
            let items = [];
            for (let k in followList) {
                let p = followList[k];
                items.push(<MemberSmallRow token={auth.token} key={p.follower.id} member={p.follower} status={p.status}
                    showRemove={false} showShare={true} onShare={(id) => {
                        if (props.onSelected !== undefined && props.onSelected !== null)
                            props.onSelected(id);
                    }}
                />);
            }
            return <>{items}</>;
        }
        else if (props.target === 'following') {
            let items = [];
            for (let k in followList) {
                let p = followList[k];
                if (p.tag !== null && p.tag !== "") {
                    let h = <div key={p.id} style={{ height: "55px" }} className="row g-0 my-2 align-items-center justify-items-center" >
                        <div className="col">
                            <a href={"//" + window.location.host + "/?q=" + encodeURIComponent(p.tag)} class="text-primary text-decoration-none">{p.tag}</a></div>
                        <div className="col text-end">
                            <button data-tag={p.tag} type="button" className="btn btn-blue btn-sm"
                                onClick={(e) => { hashTagRemove(e.target.getAttribute("data-tag")); }}
                            >Unfollow</button>
                        </div>
                    </div>;
                    items.push(h);
                } else {
                    items.push(<MemberSmallRow token={auth.token} key={p.following.id} member={p.following} status={p.status} />);
                }
            }
            return <>{items}</>;
        }
    }

    const renderLoadMore = () => {
        let loadmore = null;
        if (model !== null) {
            if ((model.current + 1) < model.totalPages) {
                loadmore = <div className="text-center bg-white p-3">
                    <button className="btn btn-light" onClick={() => { setCurrentPage(model.current + 1) }}>Load More</button>
                </div>;
            }
        }
        return loadmore;
    }

    return <div style={{ minHeight: "400px" }}>
        <div className="row g-1">
            <div className="col-10">
                <input type="text" placeholder="Search keywords..." className="form-control shadow-none border" value={q}
                    onChange={(e) => {
                        setCurrentPage(0);
                        setKeywords(e.target.value);
                    }} /></div>
            {/*<div className="col">*/}
            {/*    <button type="button" disabled={loading} className="btn btn-blue" onClick={() => { this.loadFeed(true); }}>*/}
            {/*    {loading ? <div className="spinner-border spinner-border-sm" role="status">*/}
            {/*        <span className="visually-hidden">Loading...</span>*/}
            {/*    </div>*/}
            {/*        : <i className="bi bi-search"></i>}*/}
            {/*</button></div>*/}
        </div>
        {renderPosts()}
        {renderLoadMore()}
        {loading ? <div className="text-center p-2"><div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div></div> : null}
    </div>;

}
export default MemberSmallList;
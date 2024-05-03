import { useEffect, useState } from "react";
import { Utility } from "./Utility";

function HashTagDetail(props) {
    const [totalPosts, setTotalPosts] = useState(null);
    const [followed, setFollowed] = useState(null);

    useEffect(() => {
        fetch(`${Utility.GetAPIURL()}/api/post/hashtagpostcount?q=${encodeURIComponent(props.search)}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + props.token
            }
        })
            .then(resp => {
                if (resp.status === 200) {
                    resp.json().then(d => {
                        setTotalPosts(d.postCount);
                        setFollowed(d.followed);
                    });
                }
            });
    }, [props.search, props.token])

    const follow = () => {
        fetch(`${Utility.GetAPIURL()}/api/follow/FollowHashtag?q=${encodeURIComponent(props.search)}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + props.token
            }
        }).then(resp => {
            if (resp.status === 200) {
                setFollowed(true);
            }
        });
    }

    const unfollow = () => {
        fetch(`${Utility.GetAPIURL()}/api/follow/UnfollowHashtag?q=${encodeURIComponent(props.search)}`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + props.token
            }
        }).then(resp => {
            if (resp.status === 200) {
                setFollowed(false);
            }
        });
    }

    return <div className=" bg-white rounded-3 mb-2 p-2">
        <div className="row align-items-center">
            <div className="col text-end">
                <h4 className="fs-6 fw-bold">{props.search}</h4>
                {totalPosts != null ? <div className="fw-bold">{totalPosts} posts</div> : null}
            </div>
            <div className="col">
                {followed != null ?
                    followed ? <button type="button" className="btn btn-primary" onClick={unfollow}>Unfollow</button> : <button type="button" className="btn btn-primary" onClick={follow}>Follow</button>
                    : null}
            </div>
        </div>
    </div>;
}

export default HashTagDetail;
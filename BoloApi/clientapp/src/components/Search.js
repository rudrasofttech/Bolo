import { useEffect, useState } from "react";
import { useAuth } from "./shared/AuthProvider";
import Spinner from "./shared/Spinner";
import MemberSmallRow from "./shared/MemberSmallRow";

function Search(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [q, setSearchKeyword] = useState(props.keywords);
    const [items, setItems] = useState([]);
    

    useEffect(() => {
        if (props.keywords.length === 0) {
            setItems([]);
            return;
        }
        setLoading(true);
        let url = '//' + window.location.host + '/api/search?q=' + props.keywords.replace("#", "");

        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' + auth.token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    auth.logout();
                } else if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        setItems(data);
                    });
                }
            })
            .catch(err => {
                
            })
            .finally(() => {
                setLoading(false);
            });
    }, [props.keywords]);

    const renderSearchResult = () => {
        let itemsList = [];
        var i = 1;
        for (let k in items) {
            let p = items[k];
            if (p.member) {
                itemsList.push(<li key={i} className="list-group-item border-0 p-2"> <MemberSmallRow member={p.member} /></li>)
            } else if (p.hashtag) {
                itemsList.push(<li key={i} className="list-group-item border-0 p-2">
                    <div>
                        <a className="text-dark fw-bold text-decoration-none" href={'//' + window.location.host + '/?q=%23' + p.hashtag.tag}>#{p.hashtag.tag}</a>
                        <div>{p.hashtag.postCount} Posts</div>
                    </div>
                </li>);
            }
            i++;
        }
        if (itemsList.length > 0) {
            return <ul className="list-group list-group-flush">
                {itemsList}
            </ul>;
        }
        else {
            return null;
        }
    }

    const renderComp = () => {
        let clearsearchhtml = <div className="col-md-1 col-2 p-0 text-center">
            <button type="button" className="btn btn-light" aria-label="Close" onClick={() => {
                setSearchKeyword("");
                setItems([]);
            }}><i className="bi bi-trash"></i></button>
        </div>;
        if (q === '') {
            clearsearchhtml = null;
        }
        return <>
            <div className="row g-1">
                <div className="col">
                    <input type="text" className="form-control shadow-none border" value={q} onChange={(e) => { setSearchKeyword(e.target.value); }} placeholder="Search People, Topics, Hashtags" maxLength="150"
                         />
                </div>
                {clearsearchhtml}
            </div>
            {renderSearchResult()}
        </>;
    }
    return <>{renderSearchResult()}</>;
}

export default Search;
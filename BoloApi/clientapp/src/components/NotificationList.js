import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./shared/AuthProvider";
import { MessageModel } from "./shared/Model";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function NotificationList(props) {
    const navigate = useNavigate();
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [list, setList] = useState([]);

    useEffect(() => {
        fetch("//" + window.location.host + "/api/notification", {
            method: 'get',
            headers: { "Authorization": 'Bearer ' + auth.token }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    setList(data.notifications);
                    console.log(data.notifications);
                    props.onUpdateUnseen(list.filter(t => !t.seen).length);
                });
            }
        });
    }, []);

    const addReceivedNotification = (n) => {
        list.unshift(n);
        setList(list);
        props.onUpdateUnseen(list.filter(t => !t.seen).length);
    }

    //updateUnseenNotificationCount = () => {
    //    let count = list.filter(t => !t.seen).length;
    //    if (count > 0) {
    //        $(".notificationcountcnt").append('<span style="top:8px; font-size:13px;" class="position-absolute start-100 translate-middle badge rounded-pill bg-danger">' + count + ' <span class="visually-hidden">unread messages</span></span>');
    //        $(".notificationcount").html(count);
    //    }
    //    else {
    //        $(".notificationcountcnt").find(".rounded-pill").remove();
    //        $(".notificationcount").html("");
    //    }
    //}

    const onNotificationClick = (id) => {
        fetch("//" + window.location.host + "/api/notification/setseen/" + id, {
            method: 'get',
            headers: { "Authorization": 'Bearer ' + auth.token }
        }).then((data) => {
            if (data.status === 200) {
                let url = "";
                for (let k in list) {
                    if (list[k].id === id) {
                        list[k].seen = true;
                        url = list[k].url;
                        break;
                    }
                }
                console.log(list);
                setList(list);
                navigate(`/${url}`);
                if (props.onNotificationClick) {
                    props.onNotificationClick();
                }
            }
        });

    }

    const getURL = (p) => {
        if (p.startsWith("https://") || p.startsWith("http://") || p.startsWith("//") || p.startsWith("data:")) {
            return p;
        } else {
            return '//' + window.location.host + '/' + p;
        }
    }

    const renderComp = () => {
        let items = [];
        for (let k in list) {
            let n = list[k];
            items.push(<div className='row mt-2 mb-3 pointer' key={k}>
                <div className='col-2'>
                        <img alt="" src={getURL(n.pic)} className="img-fluid rounded-3" data-id={n.id} onClick={(e) => { onNotificationClick(e.target.getAttribute("data-id")); }} />
                </div>
                <div className='col'>
                    <div data-id={n.id} onClick={(e) => { onNotificationClick(e.target.getAttribute("data-id")); }} className={"mb-2 text-primary " + (!n.seen ? "fw-semibold lh-base" : "lh-base")}>{n.title}</div>
                    {n.type === 4 ? <span className="text-primary me-2" style={{
                        fontSize: "13px",
                        fontWeight: "600"
                    }}>Follow Request</span> : null}
                    <span className="text-primary" style={{
                        fontSize: "13px"
                    }}>{dayjs(n.createDate).fromNow()}</span>
                </div>
                {n.pic2 !== "" ? <div className='col-2'>
                    <img alt="" src={getURL(n.pic2)} className="img-fluid rounded-1" data-id={n.id} onClick={(e) => { onNotificationClick(e.target.getAttribute("data-id")); }} />
                </div> : null}
            </div>);
        }
        return items;
    }

    return <>{renderComp()}</>;
}
export default NotificationList;
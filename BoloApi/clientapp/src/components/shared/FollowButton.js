﻿import { useEffect, useState } from "react";
import { MessageModel } from "./Model";


function FollowButton(props) {    const [loading, setLoading] = useState(false);    const [message, setMessage] = useState(new MessageModel());        const myself = localStorage.getItem("myself") == null ? null : JSON.parse(localStorage.getItem("myself"));    const [status, setStatus] = useState(null);       useEffect(() => {        setLoading(true);        fetch('//' + window.location.host + '/api/follow/Status/' + props.member.id, {            method: 'get',            headers: {                'Authorization': 'Bearer ' + props.token            }        })            .then(response => {                 if (response.status === 200) {                    response.json().then(data => {                        setStatus(data.status);                    });                }            }).catch(error => {                setMessage(new MessageModel('danger', 'Unable to contact server'));            }).finally(() => {                setLoading(false);            });    }, [props.member, props.token]);        const askToFollow = () => {        setLoading(true);        fetch('//' + window.location.host + '/api/follow/ask/' + props.member.id, {            method: 'get',            headers: {                'Authorization': 'Bearer ' + props.token            }        })            .then(response => {                 if (response.status === 200) {                    response.json().then(data => {                        console.log(data);                        setStatus(data.status);                        if (props.notify) {                            props.notify(props.member.id, status);                        }                    });                }            }).catch(() => {                setMessage(new MessageModel('danger', 'Unable to contact server'));            }).finally(() => {                setLoading(false);            });    }    const unFollow = () => {        setLoading(true);        fetch('//' + window.location.host + '/api/follow/unfollow/' + props.member.id, {            method: 'get',            headers: {                'Authorization': 'Bearer ' + props.token            }        })            .then(response => {                if (response.status === 200) {                    response.json().then(data => {                        //console.log(data);                        setStatus(data.status);                        if (props.notify) {                            props.notify(props.member.id, status);                        }                    });                } else {                    setMessage(new MessageModel('danger', 'Unable to process request'));                }            }).catch(() => {                setMessage(new MessageModel('danger', 'Unable to contact server'));            }).finally(() => {                setLoading(false);            });    }    const renderFollowButton = () => {        let followbtn = null;        if (!loading) {            if (status === 0) {                if (props.member.id !== myself.id) {                    followbtn = <button type="button" className="btn btn-danger btn-follow btn-sm" onClick={askToFollow}>Follow</button>;                }            } else if (status === 1) {                followbtn = <button type="button" className="btn btn-blue btn-follow btn-sm" onClick={unFollow}>Unfollow</button>;            }            else if (status === 2) {                followbtn = <button type="button" className="btn btn-danger btn-sm" onClick={unFollow}>Requested</button>;            }        } else if (loading) {            followbtn = null;        }        return followbtn;    }    return <>{renderFollowButton()}</>;}export default FollowButton;
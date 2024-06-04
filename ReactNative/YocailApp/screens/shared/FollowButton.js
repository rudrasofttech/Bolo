import { useState } from "react";
import { MessageModel } from "../../model";
import { useAuth } from "../../authprovider";
import { Utility } from "../../utility";
import { Pressable } from "react-native";
import { styles } from "../../stylesheet";
import { useEffect } from "react";
import { Text } from "react-native";

export default function FollowButton(props){
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const auth = useAuth();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/follow/Status/${props.member.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                 if (response.status === 200) {
                    response.json().then(data => {
                        setStatus(data.status);
                    });
                }
            }).catch(error => {
                setMessage(new MessageModel('danger', 'Unable to contact server'));
            }).finally(() => {
                setLoading(false);
            });
    }, [props.member, props.token]);
    
    
    const askToFollow = () => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/follow/ask/${props.member.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                 if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        setStatus(data.status);
                        if (props.notify) {
                            props.notify(props.member.id, status);
                        }
                    });
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to contact server'));
            }).finally(() => {
                setLoading(false);
            });
    }
    
    const unFollow = () => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/follow/unfollow/${props.member.id}`, {
            method: 'get',
            headers: {
                'Authorization':  `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        setStatus(data.status);
                        if (props.notify) {
                            props.notify(props.member.id, status);
                        }
                    });
                } else {
                    setMessage(new MessageModel('danger', 'Unable to process request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to contact server'));
            }).finally(() => {
                setLoading(false);
            });
    }
    
    const renderFollowButton = () => {
        if(auth.myself === null)
            return null;
        let followbtn = null;
        if (!loading) {
            if (status === 0) {
                if (props.member.id !== auth.myself.id) {
                    followbtn = <Pressable disabled={loading} style={styles.followButton} onPress={askToFollow}>
                        <Text style={styles.textWhite}>Follow</Text></Pressable>;
                }
            } else if (status === 1) {
                followbtn = <Pressable  disabled={loading} style={styles.unfollowButton} onPress={unFollow}><Text style={styles.textWhite}>Unfollow</Text></Pressable>;
            }
            else if (status === 2) {
                followbtn = <Pressable  disabled={loading} style={styles.unfollowButton} className="btn btn-danger btn-sm" onPress={unFollow}><Text style={styles.textWhite}>Requested</Text></Pressable>;
            }
        } else if (loading) {
            followbtn = null;
        }
    
        return followbtn;
    }
    
    return <>{renderFollowButton()}</>;
}
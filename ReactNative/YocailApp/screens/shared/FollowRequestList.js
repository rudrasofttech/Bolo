import { useEffect, useState } from "react";
import { useAuth } from "../../authprovider";
import { MessageModel } from "../../model";
import { Utility } from "../../utility";
import { FlatList } from "react-native-gesture-handler";
import ShowMessage from "./ShowMessage";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styles } from "../../stylesheet";
import MemberPicSmall from "./MemberPicSmall";

export default function FollowRequestList(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [requests, setRequests] = useState([]);

    const fetchData = () => {
        setLoading(true);
        setMessage(null);
        fetch(`${Utility.GetAPIURL()}/api/Follow/Requests`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log("Follow Requests");
                        //console.log(data);
                        setRequests(data);
                    });
                } else {
                    setMessage(new MessageModel('danger', 'Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const allowRequest = (id) => {
        setLoading(true);
        setMessage(new MessageModel());
        fetch(`${Utility.GetAPIURL()}/api/Follow/Allow/${id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setRequests(requests.filter(t => t.id !== id));
                } else if (response.status === 500) {
                    setMessage(new MessageModel('danger', 'Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }

    const rejectRequest = (id) => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/Follow/Reject/${id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setRequests(requests.filter(t => t.id !== id));

                } else if (response.status === 500) {
                    setMessage(new MessageModel('danger', 'Unable to process this request'));
                }
            }).catch(() => {
                setMessage(new MessageModel('danger', 'Unable to process this request, check your internet connection.'));
            }).finally(() => { setLoading(false); });
    }

    return <>
    {loading ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> : null}
        <FlatList data={requests}
            renderItem={({ item }) => {
                return (
                    <View style={[styles.px10,{ flexDirection: "row", alignItems:"center" }]}>
                        <MemberPicSmall member={item} navigation={props.navigation} />
                        <Pressable onPress={() => { props.navigation.push("Profile", { username: item.userName }); }} style={[{flexGrow:1}]}>
                            <Text style={[styles.textPrimary, styles.fwBold]}>{item.userName !== "" ? item.name : item.userName}</Text>
                        </Pressable>
                        <Pressable disabled={loading} onPress={() => { allowRequest(item.id) }} style={[styles.mx10]}><Text>Allow</Text></Pressable>
                        <Pressable disabled={loading} onPress={() => { rejectRequest(item.id) }} style={[styles.mx10]}><Text>Reject</Text></Pressable>
                    </View>
                );
            }}
            keyExtractor={(item, index) => index.toString()}
            refreshing={loading}
            onRefresh={fetchData}
            initialNumToRender={5}>
        </FlatList>
        
        <ShowMessage messagemodal={message} />
    </>;
}


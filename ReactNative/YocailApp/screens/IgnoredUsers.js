import { useEffect, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import MemberPicSmall from "./shared/MemberPicSmall";
import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { styleProps } from "react-native-web/dist/cjs/modules/forwardedProps";
import { styles } from "../stylesheet";
import { stringifyValueWithProperty } from "react-native-web/dist/cjs/exports/StyleSheet/compiler";
import ShowMessage from "./shared/ShowMessage";
import { SafeAreaView } from "react-native";

export default function IgnoredUsers(props) {
    const auth = useAuth();
    const window = Dimensions.get('window');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const [items, setItems] = useState([]);
    const q = '';

    const fetchData = () => {
        setLoading(true);
        let url = `${Utility.GetAPIURL()}/api/Ignored?q=${q}`;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logOut();
            } else if (response.status === 200) {
                response.json().then(data => {
                    setItems(data);
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    }
    useEffect(() => {
        fetchData();
    }, [q]);

    const removeMember = (userid) => {
        setLoading(true);
        let url = `${Utility.GetAPIURL()}/api/Ignored/remove/${userid}`;
        fetch(url, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logOut();
            } else if (response.status === 200) {
                response.text().then(data => {
                    //console.log(data);
                    if (data === "true") {
                        setItems(items.filter(t => t.id !== userid));
                    }
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    }

    return <SafeAreaView style={[styles.container, styles.width100]}>
        <FlatList data={items}
            renderItem={({ item }) => {
                return (
                    <View key={item.id} style={[styles.p10, styles.width100, { flexDirection: "row", alignItems:"center" }]}>
                        <MemberPicSmall member={item} navigation={props.navigation} />
                        <Pressable style={{flexGrow:1}} onPress={() => { props.navigation.push('Profile', { username: item.userName }); }}>
                            <Text style={[styles.fsnormal, styles.fwBold]}>{item.userName}</Text>
                        </Pressable>
                        <Pressable disabled={loading} style={[styles.unfollowButton]} onPress={(e) => { removeMember(item.id) }}><Text style={[styles.textWhite, styles.px10]}>Remove</Text></Pressable>
                    </View>
                );
            }}
            
            keyExtractor={(item, index) => index.toString()}
            refreshing={loading}
            onRefresh={fetchData}
            initialNumToRender={10}
            >
        </FlatList>
        {loading ? <ActivityIndicator size={"large"} /> : null}
        <ShowMessage messagemodal={message} toast={true} />

    </SafeAreaView>;
}

import { useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import { styles } from "../stylesheet";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Platform } from "react-native";

export default function ManageLinks(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const emptyid = Utility.EmptyID;
    const [id, setId] = useState(Utility.EmptyID);
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    const saveData = () => {
        if (url === "")
            return;
        const fd = new FormData();
        fd.append("id", id);
        fd.append("url", url);
        fd.append("name", name);
        setLoading(true);
        setMessage(null);
        fetch(`${Utility.GetAPIURL()}/api/Members/savelink`, {
            method: 'post',
            body: fd,
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        let ms = auth.myself;
                        if (id === Utility.EmptyID) {
                            ms.links.push(data);
                        } else {
                            for (let k in ms.links) {
                                if (ms.links[k].id === id) {
                                    ms.links[k].url = data.url;
                                    ms.links[k].name = data.name;
                                    break;
                                }
                            }
                        }
                        (async () => { await auth.updateMyself(ms) })();
                        setId(emptyid);
                        setUrl("");
                        setName("");
                        props.onChange();
                    });
                } else {
                    setMessage("danger", 'Unable to save link');
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = (id) => {
        setRemoveLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/Members/removelink/${id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200 || response.status === 404) {
                    let ms = auth.myself;
                    ms.links = ms.links.filter(t => t.id !== id);
                    (async () => { await auth.updateMyself(ms) })();
                    setId(emptyid);
                    setUrl("");
                    setName("");
                    props.onChange();
                } else {
                    console.log(`Remove link response status: ${response.status}`);
                    setMessage(new MessageModel("danger", 'Unable to remove link.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setRemoveLoading(false);
            });
    };

    return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.p5, styles.width100, { flexDirection: "column", flex: 1 }]}>
        
            {auth.myself.links.length < 5 ? <KeyboardAvoidingView style={[styles.p10, styles.mb20, styles.borderBottom, { borderRadius: 10 }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text style={[styles.pb10, styles.fwBold, styles.textPrimary]}>Add Links</Text>
                <ShowMessage messagemodal={message} toast={false} />
                <Text style={[styles.label]}>URL</Text>
                <TextInput inputMode="text" required placeholder="https://www.yocail.com"
                    style={[styles.input]} maxLength={300} placeholderTextColor={styles.textSecondary.color} value={url}
                    onChangeText={(e) => { setUrl(e.toLowerCase()); }} autoComplete="url" />
                <Text style={[styles.label]}>Text</Text>
                <TextInput inputMode="text" required placeholder="Yocail"
                    style={[styles.input, styles.mb10]} maxLength={100} placeholderTextColor={styles.textSecondary.color} value={name}
                    onChangeText={(e) => { setName(e); }} />
                <Pressable disabled={loading} style={[styles.primaryButton, styles.mb20]} onPress={saveData}>
                    {loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save</Text>}
                </Pressable>
            </KeyboardAvoidingView> : null}
            <FlatList style={{ flexGrow: 1 }} data={auth.myself.links}
                renderItem={({ item, index }) => {
                    return (
                        <View key={item.id} style={[styles.px10, styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                            <Text style={[styles.px10, styles.fwBold]}>{index + 1}.</Text>
                            <View style={{ flexGrow: 1 }}>
                                <Text style={[styles.fsnormal, styles.mb10]}>{`${item.name ? `${item.name}\n` : ""}${item.url}`}</Text>
                            </View>
                            <Pressable disabled={loading || removeLoading} onPress={(e) => {
                                setId(item.id);
                                removeData(item.id);
                            }}>
                                {removeLoading && id === item.id ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> : <Text>Remove</Text>} 
                            </Pressable>
                        </View>
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10} ListEmptyComponent={<Text style={[styles.textCenter, styles.p20]}>No links found, you can add upto 5.</Text>}>
            </FlatList>

        </View></TouchableWithoutFeedback>;
}

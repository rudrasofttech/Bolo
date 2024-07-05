import { useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import { styles } from "../stylesheet";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Platform } from "react-native";

export default function ManagePhones(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [removeloading, setRemoveLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [id, setId] = useState(Utility.EmptyID);
    const [phone, setPhone] = useState("");

    const saveData = () => {
        if(phone.length === 0)
            return;
        const fd = new FormData();
        fd.append("id", id);
        fd.append("phone", phone);
        setLoading(true);
        setMessage(null);

        fetch(`${Utility.GetAPIURL()}/api/members/savephone`, {
            method: 'post',
            body: fd,
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        let ms = auth.myself;
                        if (id === Utility.EmptyID) {
                            ms.phones.push(data);
                        } else {
                            for (let k in ms.phones) {
                                if (ms.phones[k].id === id) {
                                    ms.phones[k].phone = data.phone;
                                    break;
                                }
                            }
                        }
                        (async () => { await auth.updateMyself(ms) })();
                        setId(Utility.EmptyID);
                        setPhone("");
                        Keyboard.dismiss();
                        props.onChange();
                    });
                } else {
                    setMessage(new MessageModel("danger", 'Unable to save phone.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = (id) => {
        setRemoveLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/Members/removephone/${id}`, {
            method: 'get',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 200) {
                    let ms = auth.myself;
                    ms.phones = ms.phones.filter(t => t.id !== id);
                    (async () => { await auth.updateMyself(ms) })();
                    setMessage(null);
                    setId(Utility.EmptyID);
                    setPhone("");
                    props.onChange();
                } else {
                    setMessage(new MessageModel("danger", 'Unable to remove phone.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setRemoveLoading(false);
            });
    };

    return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.p5, styles.width100, { flexDirection: "column", flex: 1 }]}>
            {auth.myself.phones.length < 2 ? <KeyboardAvoidingView style={[styles.p10, styles.borderBottom, { borderRadius: 10 }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text style={[styles.pb10, styles.fwBold, styles.textPrimary]}>Add Phones</Text>
                <ShowMessage messagemodal={message} toast={false} />
                <TextInput inputMode="numeric" required placeholder="9999111222" placeholderTextColor={styles.textSecondary.color}
                    style={[styles.input, styles.mb10]} maxLength={100} value={phone}
                    onChangeText={(e) => { setPhone(e.toLowerCase()); }} />
                <Pressable disabled={loading} style={[styles.primaryButton, styles.mb20]} onPress={saveData}>
                    {loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save</Text>}
                </Pressable>
            </KeyboardAvoidingView> : null}

            <FlatList style={{ flexGrow: 1 }} data={auth.myself.phones}
                renderItem={({ item }) => {
                    return (
                        <View key={item.id} style={[styles.p10, styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                            <Text style={[styles.fsnormal, styles.mb10, { flexGrow: 1 }]}>{item.phone}</Text>
                            <Pressable disabled={removeloading || loading} onPress={(e) => {
                                setId(item.id);
                                removeData(item.id);
                            }}>
                               {removeloading && id === item.id ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> : <Text>Remove</Text>} 
                            </Pressable>
                        </View>
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10} ListEmptyComponent={<Text style={[styles.textCenter, styles.p20]}>No phone numbers found, you can add upto 2.</Text>}>
            </FlatList>
        </View>
    </TouchableWithoutFeedback>;;
}

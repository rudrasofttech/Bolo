import { useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import { styles } from "../stylesheet";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Platform } from "react-native";

export default function ManageEmails(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [id, setId] = useState(Utility.EmptyID);
    const [email, setEmail] = useState("");

    const saveData = () => {
        if (email.length === 0)
            return;
        const fd = new FormData();
        fd.append("id", id);
        fd.append("email", email);
        setLoading(true);
        setMessage(null);

        fetch(`${Utility.GetAPIURL()}/api/members/saveemail`, {
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
                            ms.emails.push(data);
                        } else {
                            for (let k in ms.emails) {
                                if (ms.emails[k].id === id) {
                                    ms.emails[k].email = data.email;
                                    break;
                                }
                            }
                        }
                        (async () => { await auth.updateMyself(ms) })();
                        setId(Utility.EmptyID);
                        setEmail("");
                        Keyboard.dismiss();
                        props.onChange();
                    });
                } else {
                    setMessage(new MessageModel("danger", 'Unable to save email.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    };

    const removeData = (id) => {
        setRemoveLoading(true);
        setMessage(null);
        fetch(`${Utility.GetAPIURL()}/api/Members/removeemail/${id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let ms = auth.myself;
                    ms.emails = ms.emails.filter(t => t.id !== id);
                    (async () => { await auth.updateMyself(ms) })();

                    setId(Utility.EmptyID);
                    setEmail("");
                    props.onChange();
                } else {
                    setMessage(new MessageModel("danger", 'Unable to remove email.'));
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setRemoveLoading(false);
            });
    };

    return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.p5, styles.width100, { flexDirection: "column", flex: 1 }]}>
            {auth.myself.emails.length < 2 ? <KeyboardAvoidingView style={[styles.p10, styles.borderBottom, { borderRadius: 10 }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text style={[styles.pb10, styles.fwBold, styles.textPrimary]}>Add Emails</Text>
                <ShowMessage messagemodal={message} toast={false} />
                <TextInput inputMode="email" required placeholder="xxx@yocail.com" placeholderTextColor={styles.textSecondary.color}
                    style={[styles.input, styles.mb10]} maxLength={100} value={email}
                    onChangeText={(e) => { setEmail(e.toLowerCase()); }} />
                <Pressable disabled={loading} style={[styles.primaryButton, styles.mb20]} onPress={saveData}>
                    {loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save</Text>}
                </Pressable>
            </KeyboardAvoidingView> : null}
            <ShowMessage modal={message} />
            <FlatList style={{ flexGrow: 1 }} data={auth.myself.emails}
                renderItem={({ item }) => {
                    return (
                        <View key={item.id} style={[styles.p10, styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                            <Text style={[styles.fsnormal, styles.mb10, { flexGrow: 1 }]}>{item.email}</Text>
                            <Pressable disabled={loading} onPress={(e) => {
                                setId(item.id);
                                removeData(item.id);
                            }}>
                                {removeLoading && id === item.id ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> : <Text>Remove</Text>}
                            </Pressable>
                        </View>
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10} ListEmptyComponent={<Text style={[styles.textCenter, styles.p20]}>No emails found, you can add upto 2.</Text>}>
            </FlatList>
        </View>
    </TouchableWithoutFeedback>;;
}

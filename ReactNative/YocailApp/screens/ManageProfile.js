import { useEffect, useState } from "react";
import { useAuth } from "../authprovider"
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { styles } from "../stylesheet";
import { MessageModel } from "../model";
import close from '../assets/close.png';
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";


export default function ManageProfile(props) {
    const auth = useAuth();
    const [thoughtStatus, setThoughtStatus] = useState(auth.myself.thoughtStatus);
    const [bio, setBio] = useState(auth.myself.bio);
    const [phone, setPhone] = useState(auth.myself.phone !== null ? auth.myself.phone.toString() : "");
    const [email, setEmail] = useState(auth.myself.email);
    const [name, setName] = useState(auth.myself.name);
    const [birthYear, setBirthYear] = useState(auth.myself.birthYear !== null ? auth.myself.birthYear.toString() : "");
    const [visibility, setVisibility] = useState(auth.myself.visibility);
    const [securityQuestion, setSecurityQuestion] = useState(auth.myself.securityQuestion);
    const [loading, setLoading] = useState(false);
    const [loadingVisiblity, setLoadingVisibility] = useState(false);
    const [message, setMessage] = useState(null);

    const saveVisibility = (value) => {
        setLoadingVisibility(true);

        fetch(`${Utility.GetAPIURL()}/api/Members/Savevisibility?d=${value}`, {
            method: 'get',
            headers: { "Authorization": `Bearer ${auth.token}` }
        })
            .then(response => {
                if (response.status === 401) {
                    auth.logout();
                } else if (response.status === 200) {
                    let ms = auth.myself;
                    ms.visibility = value;
                    setVisibility(value);
                    (async () => { await auth.updateMyself(ms) })();
                    props.onChange();
                } else {
                    response.json().then(data => {
                        setMessage(new MessageModel("danger", data.error));
                    }).catch(err => {
                        setMessage(new MessageModel("danger", "Unable to process request."));
                        console.log(err);
                    });
                }
            }).catch(() => {
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoadingVisibility(false);
            });
    };

    const saveData = (name, value) => {
        if (name === "securityquestion" && value.length === 0) {
            setMessage(new MessageModel("danger", `Security question is required.`, 0));
            return;
        }
        setLoading(true);
        if (name !== 'bio') {
            fetch(`${Utility.GetAPIURL()}/api/Members/Save${name}?d=${value}`, {
                method: 'get',
                headers: { "Authorization": `Bearer ${auth.token}` }
            })
                .then(response => {
                    if (response.status === 401) {
                        auth.logout();
                    } else if (response.status === 200) {
                        setMessage(new MessageModel("success", `${name} is saved.`));
                        let ms = auth.myself;
                        switch (name) {
                            case "name":
                                ms.name = value;
                                break;
                            case "phone":
                                ms.phone = value;
                                break;
                            case "visibility":
                                setVisibility(value);
                                ms.visibility = value;
                                break;
                            case "birthYear":
                                ms.birthYear = value;
                                break;
                            case "email":
                                ms.email = value;
                                break;
                            case "thoughtstatus":
                                ms.thoughtStatus = value;
                                break;
                            case "securityquestion":
                                ms.securityQuestion = value;
                                break;
                            default:
                                break;
                        }
                        (async () => { await auth.updateMyself(ms) })();
                        props.onChange();
                    } else {
                        response.json().then(data => {
                            setMessage(new MessageModel("danger", data.error));
                        }).catch(err => {
                            setMessage(new MessageModel("danger", "Unable to process request."));
                            console.log(err);
                        });
                    }
                }).catch(() => {
                    setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
                }).finally(() => {
                    setLoading(false);
                });
        } else {
            const fd = new FormData();
            fd.append("d", value);
            fetch(`${Utility.GetAPIURL()}/api/Members/savebio`, {
                method: 'post',
                body: fd,
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(response => {
                    if (response.status === 401) {
                        auth.logout();
                    } else if (response.status === 200) {
                        setMessage(new MessageModel("success", "Data is saved."));
                        let ms = auth.myself;
                        ms.bio = value;
                        (async () => { await auth.updateMyself(ms) })();
                        props.onChange();
                    } else {
                        response.json().then(data => {
                            setMessage(new MessageModel("danger", data.error));
                        }).catch(err => {
                            setMessage(new MessageModel("danger", "Unable to process request."));
                            console.log(err);
                        });
                    }
                }).catch(() => {
                    setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
                }).finally(() => {
                    setLoading(false);
                });
        }
    }

    return <>
        <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingRight: 10 }]}>
            <Text style={[styles.px10, styles.pt10, styles.fwBold, styles.textPrimary, styles.fsnormal, { flexGrow: 1 }]}>Edit Profile</Text>
            <Pressable onPress={() => { props.onClose(); }} style={[styles.py15]}><Image source={close} style={[{ width: 13, height: 13 }, styles.mx20]} /></Pressable>
        </View>
        {loading ? <ActivityIndicator size={"small"} /> : <ShowMessage modal={message} />}
        <ScrollView style={[styles.p10]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Name</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="text" maxLength={100} value={name}
                            onChangeText={(e) => { setName(e); }}
                            onBlur={() => {
                                if (name !== auth.myself.name) {
                                    saveData("name", name);
                                }
                            }} />
                    </View>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Mobile</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="numeric" maxLength={15} value={phone} onChangeText={(e) => { setPhone(e.toString()); }}
                            onBlur={() => {
                                if (phone !== auth.myself.phone) {
                                    saveData("phone", phone);
                                }
                            }} />
                    </View>
                    <Text style={[styles.fssmall, styles.mb10, styles.textEnd]}>Mobile will not be shown on profile.</Text>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Email</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="email" maxLength={250} value={email} onChangeText={(e) => { setEmail(e); }}
                            onBlur={() => {
                                if (email !== auth.myself.email) {
                                    saveData("email", email);
                                }
                            }} />
                    </View>
                    <Text style={[styles.fssmall, styles.mb10, styles.textEnd]}>Email will not be shown on profile.</Text>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Year of Birth</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="numeric" value={birthYear} onChangeText={(e) => { setBirthYear(e.toString()); }}
                            onBlur={() => {
                                if (birthYear != auth.myself.birthYear) {
                                    saveData("birthYear", birthYear);
                                }
                            }} />
                    </View>
                    <Text style={[styles.fssmall, styles.mb10, styles.textEnd]}>Age will not be shown on profile.</Text>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Thought</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="text" maxLength={195} value={thoughtStatus} onChangeText={(e) => { setThoughtStatus(e); }}
                            onBlur={() => {
                                if (thoughtStatus !== auth.myself.thoughtStatus) {
                                    saveData("thoughtstatus", thoughtStatus);
                                }
                            }} />
                    </View>
                    <View style={[styles.mb10, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.label, styles.px10, { width: 100 }]}>Security Question</Text>
                        <TextInput editable={!loading} style={[styles.input, { flexGrow: 1 }]} inputMode="text" maxLength={300} value={securityQuestion} onChangeText={(e) => {
                            setSecurityQuestion(e);
                        }} onBlur={(e) => {
                            if (securityQuestion.length === 0)
                                e.target.focus();
                            if (securityQuestion !== auth.myself.securityQuestion) {
                                saveData("securityquestion", securityQuestion);
                            }
                        }} />
                    </View>
                    <Text style={[styles.fssmall, styles.mb10, styles.textEnd]}>Security Question is required.</Text>
                    <Text style={[styles.label]}>About Me</Text>
                    <TextInput editable={!loading} style={[styles.input, styles.mb10]} inputMode="text" maxLength={950} multiline={true} numberOfLines={2} value={bio} onChangeText={(e) => { setBio(e); }}
                        onBlur={() => {
                            if (bio !== auth.myself.bio) {
                                saveData("bio", bio);
                            }
                        }} />

                    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
                        <Text style={[styles.label]}>Profile Visibility</Text><Text style={[styles.label, styles.px10, styles.fwBold, styles.fsnormal]}>{visibility === 1 ? "Private" : "Public"}</Text>
                    </View>

                    {visibility === 1 ? <Pressable style={[styles.primaryButton]} onPress={() => { saveVisibility(2); }}>
                        {loadingVisiblity ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.px10, styles.fsnormal, styles.textWhite]} >Make it Public</Text>}

                    </Pressable> : <Pressable style={[styles.primaryButton]} onPress={() => { saveVisibility(1); }}>
                        {loadingVisiblity ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.px10, styles.fsnormal, styles.textWhite]} >Make it Private</Text>}
                    </Pressable>}
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </ScrollView>
    </>;
}
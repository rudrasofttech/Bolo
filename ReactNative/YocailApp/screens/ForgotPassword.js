import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../stylesheet";
import { useAuth } from "../authprovider";
import { useEffect, useState } from "react";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import { MessageModel } from "../model";


export default function ForgotPassword({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [username, setUsername] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newpassword, setNewPassword] = useState('');

    const loadMember = () => {
        if (username !== "") {
            setLoading(true);
            let url = `${Utility.GetAPIURL()}/api/members/getsecurityquestion/${username}`;

            fetch(url, {
                method: 'get'
            })
                .then(response => {
                    //console.log(response.status);
                    if (response.status === 200) {
                        response.json().then(data => {
                            //console.log(data);
                            setSecurityQuestion(data.securityQuestion);
                        });
                    } else {
                        setMessage(new MessageModel('danger', "Username not found."))
                    }
                })
                .catch(err => {
                    console.log(err);
                    setMessage(new MessageModel('danger', err));
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setMessage(new MessageModel('danger', "Username is required."));
        }
    }
    const validateSecurityAnswer = () => {
        if (username !== "" && newpassword !== "" && securityAnswer !== "") {
            setLoading(true);
            let url = `${Utility.GetAPIURL()}/api/members/validatesecurityanswer`;
            const fd = new FormData();
            fd.append("username", username);
            fd.append("question", securityQuestion);
            fd.append("answer", securityAnswer);
            fd.append("password", newpassword);

            fetch(url, {
                method: 'post',
                body: fd
            })
                .then(response => {
                    console.log(response.status);
                    if (response.status === 200) {
                        setMessage(new MessageModel('success', "Password is set, try logging into account now."));
                    } else {
                        response.json().then(data => {
                            setMessage(new MessageModel('danger', data.error))
                        }).catch(err => {
                            console.log(err);
                            setMessage(new MessageModel('danger', "Unable to set password."));
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    setMessage(new MessageModel('danger', err));
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setMessage(new MessageModel('danger', "Username, New Password and Security Answer is required."));
        }
    }

    return (
        <SafeAreaView style={styles.container}>

            
                <Image style={[{ maxWidth: 100, maxHeight: 58 }, styles.textCenter]} source={require('../assets/yocail-logo.png')} />
                <View style={{ backgroundColor: "rgba(154,154,154,0.1)", marginTop: 30, width: 320, borderRadius: 20, padding: 20, paddingTop: 30 }}>
                    <ShowMessage modal={message} />
                    <Text style={styles.label}>Username</Text>
                    <TextInput style={[styles.inputwhitebg, styles.mb20]} readOnly={securityQuestion.length > 0} placeholder="Username" maxLength={300} onChangeText={val => { setMessage(null); setUsername(val); }} />
                    {securityQuestion === '' ? <>
                        <Pressable style={[styles.primaryButton, styles.mb20]} disabled={loading} onPress={() => { loadMember(); }} >
                            {loading ? <ActivityIndicator size="small" color={styles.textWhite.color} /> : <Text style={styles.textWhite}>Load Member</Text>}
                        </Pressable>
                    </> :
                        <>
                            <Text style={styles.label}>{securityQuestion}</Text>
                            <TextInput style={[styles.inputwhitebg, styles.mb20]} placeholder="Security Answer" maxLength={2000} onChangeText={val => { setMessage(null); setSecurityAnswer(val); }} />
                            <Text>Your new password will be set only if your security answer matches with our record.</Text>
                            <Text style={[styles.label, styles.mt10]}>New Password</Text>
                            <TextInput style={[styles.inputwhitebg, styles.mb20]} placeholder="New Password" secureTextEntry={true}
                                onChangeText={val => { setMessage(null); setNewPassword(val); }} />
                            <Pressable style={[styles.primaryButton, styles.mb20]} disabled={loading} onPress={validateSecurityAnswer} >
                                {loading ? <ActivityIndicator size="small" color={styles.textWhite.color} /> : <Text style={styles.textWhite}>Save New Password</Text>}
                            </Pressable>
                        </>}

                </View>

            
            <View style={{ marginVertical: 15 }}>

            </View>
        </SafeAreaView>
    );
}
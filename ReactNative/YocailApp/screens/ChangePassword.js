import { useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import { styles } from "../stylesheet";
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import ShowMessage from "./shared/ShowMessage";

function ChangePassword() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const savePassword = () => {
        if(password.length === 0) {
            setMessage(new MessageModel("danger", "Password is required."));
            return;
        }
        if (password !== confirmPassword) {
            setMessage(new MessageModel("danger", "Confirm password should match password."));
            return;
        }
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/Members/SavePassword?d=${password}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        }).then(response => {
            if (response.status === 401) {
                auth.logout();
            } else if (response.status === 200) {
                setMessage(new MessageModel("success", "Account password is reset."));
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error));
                }).catch(err => {
                    setMessage(new MessageModel("danger", 'Unable to reset password.'));
                    console.log(err);
                });
            }
        }).catch(() => {
            setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        }).finally(() => {
            setLoading(false);
        });
    }

    return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.p5, styles.width100, { flexDirection: "column", flex: 1 }]}>
        <Text style={[styles.label]}>Password</Text>
        <TextInput inputMode='text' style={[styles.input, styles.mb15]} secureTextEntry={true} maxLength={100} passwordRules="required:upper;required:lower;required:digit;minlength:8" 
            value={password} onChangeText={(e) => { setPassword(e); }} />
        <Text style={[styles.label]}>Confirm Password</Text>
        <TextInput inputMode="text" style={[styles.input, styles.mb15]} secureTextEntry={true} passwordRules="required:upper;required:lower;required:digit;minlength:8" value={confirmPassword}
            onChangeText={(e) => { setConfirmPassword(e); }} />
        <Pressable disabled={loading} style={[styles.primaryButton]} onPress={savePassword}>{loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save Password</Text>}</Pressable>
        <ShowMessage modal={message} />
    </View>
    </TouchableWithoutFeedback>;
}
export default ChangePassword;
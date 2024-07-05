import { useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import { styles } from "../stylesheet";
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import ShowMessage from "./shared/ShowMessage";

function SecurityAnswer() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [securityAnswer, setSecurityAnswer] = useState("");

    const saveData = (name, value) => {
        if (value.length === 0) {
            setMessage(new MessageModel("danger", `Security Answer is required.`));
            return;
        }
        setLoading(true);

        fetch(`${Utility.GetAPIURL()}/api/Members/Save${name}?d=${value}`, {
            method: 'get',
            headers: {
                "Authorization": `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 401) {
                    auth.logout();
                } else if (response.status === 200) {
                    setMessage(new MessageModel("success", `Security Answer is saved.`));
                } else {
                    response.json().then(data => {
                        setMessage(new MessageModel("danger", data.error));
                    }).catch(err => {
                        setMessage(new MessageModel("danger", "Unable to process request."));
                        console.log(err);
                    });
                }
            }).catch((err) => {
                console.log(err);
                setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
            }).finally(() => {
                setLoading(false);
            });
    }

    return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.p5, styles.width100, { flexDirection: "column", flex: 1 }]}>
            <Text style={[styles.fsnormal, styles.fwBold, styles.textCenter, styles.textPrimary, styles.mb10]}>Set Security Answer</Text>
            <Text style={[styles.label]}>Security Question</Text>
            <Text style={[styles.input, styles.mb15]} >{auth.myself.securityQuestion}</Text>
            <Text style={[styles.label]}>Security Answer</Text>
            <TextInput editable={!loading} inputMode="text" style={[styles.input, styles.mb15]} autoComplete={false} value={securityAnswer} maxLength={300}
                onChangeText={(e) => { setSecurityAnswer(e); }} />
            <Text style={[styles.fssmall, styles.mb10]}>Your existing answer is not shown.</Text>
            <Pressable disabled={loading} style={[styles.primaryButton]} onPress={() => { saveData("securityanswer", securityAnswer); }}>{loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save</Text>}</Pressable>
            <ShowMessage modal={message} />
        </View>
    </TouchableWithoutFeedback>;
}
export default SecurityAnswer;
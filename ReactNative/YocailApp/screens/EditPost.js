import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Switch, Text, TextInput, View,ScrollView,ActivityIndicator } from "react-native";
import { styles } from "../stylesheet";
import { MessageModel } from "../model";
import { useAuth } from "../authprovider";
import ShowMessage from "./shared/ShowMessage";
import { Utility } from "../utility";


export default function EditPost(props) {
    const auth = useAuth();
    const [describe, setDescribe] = useState(props.post.describe);
    const [acceptComment, setAcceptComment] = useState(props.post.acceptComment);
    const [allowShare, setAllowShare] = useState(props.post.allowShare);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    const rows = 7;


    const acceptCommentChanged = () => {
        setAcceptComment(!acceptComment);
    }

    const allowShareChanged = () => {
        setAllowShare(!allowShare);
    }

    const editPost = () => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/post/edit/${props.post.id}`, {
            method: 'post',
            body: JSON.stringify({ describe: describe, acceptComment: acceptComment, allowShare: allowShare }),
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status === 200) {
                setMessage(new MessageModel("success", "Post is edited", 0));
                props.onchange(describe, acceptComment, allowShare);
            } else {
                response.json().then(data => {
                    setMessage(new MessageModel("danger", data.error, 0));
                }).catch(err => {
                    console.log(err);
                    setMessage(new MessageModel("danger", "Unable to add reaction to post.", 0));
                });
            }
        }).catch(error => {
            setMessage(new MessageModel("danger", "Unable to connect to internet.", 0));
            console.log(error);
        }).finally(() => {
            setLoading(false);
        });
    }

    return <>
        <ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.p15]}>
                <Text style={[styles.px10, styles.label]} >Describe</Text>
                <TextInput onChangeText={(e) => {
                    setDescribe(e);
                    props.onchange(describe, acceptComment, allowShare);
                }} value={describe} inputMode="text" multiline={true} style={[styles.inputwhitebg, styles.textPrimary, styles.fsnormal, styles.mb20, { borderWidth: 0.5 }]} placeholder="Add description to your post..." maxlength="7000" />

                <View style={[{ flexDirection: "row", alignItems: "center" }]}>
                    <Switch onValueChange={acceptCommentChanged} value={acceptComment} />
                    <Text style={[styles.px10, styles.fsnormal]} >Accept comment On Post</Text>
                </View>
                <View style={[ { flexDirection: "row", alignItems: "center" }]}>
                    <Switch onValueChange={allowShareChanged} value={allowShare} />
                    <Text style={[styles.px10, styles.fsnormal]} >Allow sharing of Post</Text>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
        <ShowMessage modal={message}></ShowMessage>
        <Pressable onPress={editPost} disabled={loading} style={[styles.primaryButton, styles.mx15]}>{loading ? <ActivityIndicator size={"small"} color={styles.textWhite.color} /> : <Text style={[styles.textWhite]}>Save</Text>}</Pressable>
    </>;
}
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useAuth } from "../authprovider";
import { useState } from "react";
import { MessageModel } from "../model";
import { styles } from "../stylesheet";
import ShowMessage from "./shared/ShowMessage";

export default function Login({ navigation }) {
    const auth = useAuth();
    const [username, setUsername] = useState('popularmemes');
    const [password, setPassword] = useState('Welcome1!');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setMessage(null);
        if (username !== "" && password !== "") {
            let ret = await auth.loginAction({ username, password });
            setMessage(ret);
        }
        setLoading(false);
    }

    const onForgotPasswordPress = () => { navigation.push('ForgotPassword', {}); }

    return (
        <SafeAreaView style={styles.container}>
            <Image style={{ maxWidth: 100, maxHeight: 58 }} source={require('../assets/yocail-logo.png')} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <View style={{ backgroundColor: "rgba(154,154,154,0.1)", marginTop: 30, width: 320, borderRadius: 20, padding: 20, paddingTop: 30 }}>
                    <Text style={[styles.textPrimary, styles.fslarge, styles.fwBold, styles.mb20]}>Login</Text>
                    <TextInput style={[styles.inputwhitebg, styles.mb20]} placeholder="Username" value={username} maxLength={300} onChangeText={val => { setMessage(null); setUsername(val); }} />
                    <TextInput style={[styles.inputwhitebg, styles.mb20]} placeholder="Password" value={password} secureTextEntry={true} maxLength={300} onChangeText={val => { setMessage(null); setPassword(val); }} />
                    <Pressable style={styles.primaryButton} disabled={loading} onPress={() => { handleLogin(); }} >
                        {loading ? <ActivityIndicator size="small" color={styles.textWhite.color} /> : <Text style={styles.textWhite}>Login</Text>}
                    </Pressable>
                    <ShowMessage modal={message} />
                    <View style={{ marginBottom: 10, marginTop:20 }}>
                        <Pressable onPress={onForgotPasswordPress}><Text style={[styles.textPrimary, styles.textEnd]}>Forgot Password?</Text></Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <View style={styles.mt15}>
                <Text style={[styles.textPrimary]}>Don’t have an account?</Text>
                <Pressable style={styles.mt15} onPress={() => { navigation.push("Register") }}><Text style={[styles.textCenter, styles.textPrimary, styles.textUnderline, styles.fslarge]}>SIGN UP HERE</Text></Pressable>
            </View>
        </SafeAreaView>
    );
}
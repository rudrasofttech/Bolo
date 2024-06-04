import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, TextInput, View } from "react-native";
import { styles } from "../stylesheet";
import { Text } from "react-native";
import { useState } from "react";
import ShowMessage from "./shared/ShowMessage";
import { validate } from "email-validator";
import { MessageModel } from "../model";
import { Utility } from "../utility";


export default function Register({ navigation }) {
  const [username, setUsername] = useState('');
  const [usernameerror, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passworderror, setPasswordError] = useState('');
  const [email, setEmail] = useState('');
  const [emailerror, setEmailError] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityQuestionError, setSecurityQuestionError] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityAnswerError, setSecurityAnswerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const saveMember = () => {
    if (username == "") {
      setUsernameError("Required");
      return;
    } else {
      setUsernameError('');
    }
    if (password.trim().length == 0) {
      setPasswordError("Minimum 8 characters required.");
      return;
    } else {
      setPasswordError("");
    }

    if (email.trim().length == 0) {
      setEmailError("Required");
      return;
    } else if (!validate(email)) {
      setEmailError("Invalid Email");
      return;
    }
    else {
      setEmailError("");
    }
    if (securityQuestion.trim().length == 0) {
      setSecurityQuestionError("Required");
      return;
    } else {
      setSecurityQuestionError("");
    }
    if (securityAnswer.trim().length == 0) {
      setSecurityAnswerError("Required");
      return;
    } else {
      setSecurityAnswerError("");
    }

    setLoading(true);
    let url = `${Utility.GetAPIURL()}/api/members/register`;
    fetch(url, {
      method: 'post',
      body: JSON.stringify({
        UserName: username,
        Password: password,
        Email: email,
        SecurityQuestion: securityQuestion,
        SecurityAnswer: securityAnswer
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log(response.status);
        if (response.status === 200) {
          setMessage(new MessageModel('success', 'Your registration is complete.'));
          setTimeout(() => {navigation.pop();}, 1500);
          
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
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image style={{ maxWidth: 100, maxHeight: 58 }} source={require('../assets/yocail-logo.png')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <View style={{ backgroundColor: "rgba(154,154,154,0.1)", marginTop: 30, width: 320, borderRadius: 20, padding: 20, paddingTop: 30 }}>
          <Text style={[styles.textPrimary, styles.fsnormal]}>Let's get you started</Text>
          <Text style={[styles.textPrimary, styles.fsxlarge, styles.fwBold, styles.mb20]}>Create an Account</Text>
          <TextInput style={usernameerror !== "" ? [styles.inputwhitebg, { borderColor: "red", borderWidth: 1 }] : [styles.inputwhitebg, styles.mb20]} placeholder="Username*" value={username} maxLength={300} onChangeText={val => { setMessage(null); setUsername(val); }} />
          {usernameerror !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.mb10, styles.mt10, styles.textDanger]}>{usernameerror}</Text> : null}

          <TextInput style={passworderror !== "" ? [styles.inputwhitebg, { borderColor: "red", borderWidth: 1 }] : [styles.inputwhitebg, styles.mb20]} placeholder="Password*" value={password} secureTextEntry={true} maxLength={300} onChangeText={val => { setMessage(null); setPassword(val); }} />
          {passworderror !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.mb10, styles.mt10, styles.textDanger]}>{passworderror}</Text> : null}

          <TextInput style={emailerror !== "" ? [styles.inputwhitebg, { borderColor: "red", borderWidth: 1 }] : [styles.inputwhitebg, styles.mb20]} placeholder="Email*" value={email} maxLength={200} onChangeText={val => { setMessage(null); setEmail(val); }} />
          {emailerror !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.mb10, styles.mt10, styles.textDanger]}>{emailerror}</Text> : null}

          <TextInput style={securityQuestionError !== "" ? [styles.inputwhitebg, { borderColor: "red", borderWidth: 1 }] : [styles.inputwhitebg]} placeholder="Security Question*" value={securityQuestion} onChangeText={val => { setMessage(null); setSecurityQuestion(val); }} />
          {securityQuestionError !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.mb10, styles.mt10, styles.textDanger]}>{securityQuestionError}</Text> : null}
          <Text style={[styles.textPrimary, styles.fssmall, styles.mb20, styles.mt10]}>Security question is needed for password recovery.</Text>

          <TextInput style={securityAnswerError !== "" ? [styles.inputwhitebg, { borderColor: "red", borderWidth: 1 }] : [styles.inputwhitebg]} placeholder="Security Answer*" value={securityAnswer} maxLength={200} onChangeText={val => { setMessage(null); setSecurityAnswer(val); }} />
          {securityAnswerError !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.mb10, styles.mt10, styles.textDanger]}>{securityAnswerError}</Text> : null}
          <Text style={[styles.textPrimary, styles.fssmall, styles.mb20, styles.mt10]}>We will ask for this answer while recovering forgotten password.</Text>
          <Pressable style={styles.primaryButton} disabled={loading} onPress={() => { saveMember(); }} >
            {loading ? <ActivityIndicator size="small" color={styles.textWhite.color} /> : <Text style={styles.textWhite}>REGISTER</Text>}
          </Pressable>
          <ShowMessage modal={message} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
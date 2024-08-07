import { ActivityIndicator, Button, Image, KeyboardAvoidingView, Pressable, SafeAreaView, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { styles } from "../stylesheet";
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from "react";
import addPostImg from '../assets/add-post.png';
//import { captureRef } from "react-native-view-shot";
import ShowMessage from "./shared/ShowMessage";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Platform } from "react-native";
import { Utility } from "../utility";


export default function AddPost(props) {
  const [viewName, setViewName] = useState("add");
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [describe, setDescribe] = useState('');
  const [acceptComment, setAcceptComment] = useState(true);
  const [allowShare, setAllowShare] = useState(true);
  return <SafeAreaView style={[styles.container, styles.width100]}>
    {viewName === "add" ? <AddPostItems data={images} onSave={(data, croppedData) => {
      setImages(data);
      setCroppedImages(croppedData);

      setViewName("form")
    }} /> : null}
    {viewName === "form" ? <SavePostItems data={images} croppedData={croppedImages} describe={describe} acceptComment={acceptComment} allowShare={allowShare} onGoBack={(d, ac, as) => {
      setDescribe(d);
      setAcceptComment(ac);
      setAllowShare(as);
      setViewName("add");
    }} onSave={() => {
      setDescribe('');
      setImages([]);
      setViewName('add');
      props.navigation.navigate('HomeTab', { screen: 'Home' });
    }} /> : null}
  </SafeAreaView>
}

function AddPostItems(props) {
  const [images, setImages] = useState(props.data);
  const [date, setDate] = useState(Date.now());
  const [croppedImages, setCroppedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const pickImage = async () => {
    setLoading(true);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      //aspect: [4, 4],
      quality: 0.5,
      exif: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsMultipleSelection: false
    });

    //console.log(result);
    if (!result.canceled) {
      let temp = images;
      for (let k in result.assets) {
        temp.push(result.assets[k]);
      }
      setImages(temp);
      setDate(Date.now());
    }
    setLoading(false);
  };

  if (loading && images.length === 0) {
    return <View style={[{ flexDirection: "column", justifyContent: "center", flex: 1 }]}>
      <ActivityIndicator size={"large"} color={styles.textPrimary.color} />
    </View>;
  }
  else if (images.length === 0) {
    return <View style={[{ flexDirection: "column", justifyContent: "center", flex: 1 }]}>
      <Text style={[styles.textCenter, styles.textPrimary, { fontSize: 25 }]}>Create new post</Text>
      <Image source={addPostImg} style={[styles.alignCenter, styles.pb15, { width: 130, resizeMode: "contain" }]} />
      <Text style={[styles.textCenter, styles.fslarge, styles.textPrimary, styles.pb20]}>Add photos and videos here</Text>
      <Pressable style={[styles.primaryButton]} onPress={async () => { await pickImage(); }}><Text style={[styles.textWhite]}>Add</Text></Pressable>
    </View>
  } else {
    return <>
      <View style={[styles.width100, { height: 55, flexDirection: "row", alignContent: "center", alignItems: "center" }]}>
        <Text style={[styles.p10, styles.fsxlarge, styles.fwBold, styles.textPrimary, { flexGrow: 1 }]}>Add Photos</Text>
        <Pressable style={[styles.p10, { marginRight: 10 }]} onPress={async () => { await pickImage(); }}>
          <MaterialIcons name="add" size={25} color={styles.textPrimary.color} />
        </Pressable>
        {images.length > 0 ? <Pressable onPress={() => {
          props.onSave(images, croppedImages);
        }} style={[styles.p10]}>
          <Text style={[styles.fslarge, styles.textPrimary, styles.fwBold, { marginRight: 10 }]}>Next</Text>
        </Pressable> : null}
      </View>
      {/*{images.length === 1 ? <CaptureShot image={images[0]} onSuccess={(d) => {
        let temp = croppedImages;
        temp.push(d);
        setCroppedImages(temp);
      }}></CaptureShot> : null}*/}
      {/* {images.length === 1 ? <View>
        <Image source={{ uri: `data:${images[0].mimeType};base64,${images[0].base64}` }} style={[styles.width100, { height: styles.width100.width * (images[0].height / images[0].width) }]} />
      </View> : null} */}
      <ScrollView ref={scrollViewRef} horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true}
        snapToStart={true} >
        {images.map((image, index) => {
          let asp = image.height / image.width;
          return <View style={[{ flexDirection: "column", alignItems: "center" }]} data-date={date}>
            <View style={[styles.width100, { height: styles.width100.width * asp }]}>
              <Image source={{ uri: `data:${image.mimeType};base64,${image.base64}` }} style={[{
                flex: 1, width: styles.width100.width, height: styles.width100.width * asp,
                resizeMode: 'cover'
              }]} />
            </View>
            <View style={[styles.py20]}>
              <Pressable style={[styles.mx20]} onPress={() => {
                let temp = [];
                for (let k = 0; k < images.length; k++) {
                  if (k !== index){
                    temp.push(images[k]);
                  }
                }
                setImages(temp);
                setTimeout(() => {
                  setDate(Date.now());
                }, 100);
              }}>
                <MaterialIcons name="delete" size={40} color={styles.textSecondary.color} />
              </Pressable>
            </View>
          </View>
        })}
      </ScrollView></>
  }
}

function SavePostItems(props) {

  const auth = useAuth();
  const [describe, setDescribe] = useState(props.describe);
  const [acceptComment, setAcceptComment] = useState(props.acceptComment);
  const [allowShare, setAllowShare] = useState(props.allowShare);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const rows = 2;


  const acceptCommentChanged = () => {
    setAcceptComment(!acceptComment);
  }

  const allowShareChanged = () => {
    setAllowShare(!allowShare);
  }

  const savePost = () => {
    if (props.data.length === 0) {
      setMessage(new MessageModel("danger", "Please add some photos to post."));
      return;
    }
    setLoading(true);
    setMessage(null);
    let fd = new FormData();
    fd.append("Describe", describe);
    fd.append("AcceptComment", acceptComment === undefined || acceptComment === null ? false : acceptComment);
    fd.append("AllowShare", allowShare === undefined || allowShare === null ? false : allowShare);
    props.data.forEach((value, index) => {
      fd.append(`Photos[${index}]`, `data:${value.mimeType};base64,${value.base64}`);
    });
    //console.log(fd);
    fetch(`${Utility.GetAPIURL()}/api/Post`, { method: "post", body: fd, headers: { 'Authorization': `Bearer ${auth.token}` } })
      .then(response => {
        console.log(response.status);
        if (response.status === 200) {
          setDescribe('');
          props.onSave();
        } else {
          response.json().then(data => {
            console.log(data);
            setMessage(new MessageModel("danger", data.error));
          }).catch(err => {
            console.log(err);
            setMessage(new MessageModel("danger", "Unable to save the post, please try after some time."));
          });
        }
      }).catch(err => {
        console.log(err);
        setMessage(new MessageModel("danger", "Unable to save the post, please try after some time."));
      }).finally(() => {
        setLoading(false);
      });
  }

  return <>
    <View style={[styles.width100, { height: 55, flexDirection: "row", alignContent: "center", alignItems: "center" }]}>
      <Pressable style={[styles.p10]} onPress={() => { props.onGoBack({ describe, acceptComment, allowShare }); }}>
        <MaterialIcons name="keyboard-arrow-left" size={25} color={styles.textPrimary.color} />
      </Pressable>
      <Text style={[styles.p10, styles.fsxlarge, styles.fwBold, styles.textPrimary, { flexGrow: 1 }]}>Add Details</Text>
      <Pressable onPress={savePost} style={[styles.p10]}>
        {loading ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> :
          <Text style={[styles.fslarge, styles.textPrimary, styles.fwBold, { marginRight: 10 }]}>Save</Text>}
      </Pressable>
    </View>
    <ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.p15, styles.width100]}>
        <Text style={[styles.fsnormal, styles.label]} >Describe</Text>
        <TextInput onChangeText={(e) => {
          setDescribe(e);
        }} value={describe} numberOfLines={rows} inputMode="text" multiline={true} style={[styles.inputwhitebg, styles.textPrimary, styles.fsnormal, styles.mb20, { borderWidth: 0.5 }]} placeholder="Add description to your post..." maxlength="7000" />

        <View style={[styles.mb20, { flexDirection: "row", alignItems: "center" }]}>
          <Switch onValueChange={acceptCommentChanged} value={acceptComment} />
          <Pressable onPress={acceptCommentChanged}><Text style={[styles.px10, styles.fsnormal]} >Accept comment On Post</Text></Pressable>
        </View>
        <View style={[styles.mb20, { flexDirection: "row", alignItems: "center" }]}>
          <Switch onValueChange={allowShareChanged} value={allowShare} />
          <Pressable onPress={allowShareChanged}><Text style={[styles.px10, styles.fsnormal]} >Allow sharing of Post</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
    <ShowMessage modal={message}></ShowMessage>
  </>;
}

// function CaptureShot(props) {
//   const viewShotRef = useRef();

//   return <View ref={viewShotRef}>
//     <Image onLoad={() => {
//       setTimeout(() => {
//         captureRef(viewShotRef, {
//           format: "png",
//           quality: 0.7,
//           //result : 'data-uri'
//         }).then(
//           (uri) => {
//             console.log("Image saved to", uri);
//             //props.onSuccess(uri);
//           },
//           (error) => console.error("Oops, snapshot failed", error)
//         );
//       }, 300);

//     }} source={{ uri: `data:${props.image.mimeType};base64,${props.image.base64}` }} style={[styles.width100, { height: styles.width100.width * (props.image.height / props.image.width) }]} />
//   </View>;
// }
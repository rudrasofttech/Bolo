import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from "../stylesheet";
import { MessageModel } from '../model';
import { Utility } from '../utility';
import { useAuth } from '../authprovider';

export default function EditProfilePic(props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(new MessageModel());
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.4,
      exif: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true
    });

    //console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      (async () => {
        await pickImage();
      })();
    }, 300)
  }, []);

  const saveProfilePic = () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("pic", `data:image/jpeg;base64,${image.base64}`);
    fetch(`${Utility.GetAPIURL()}/api/Members/savepic`, {
        method: 'post',
        body: fd,
        headers: {
            'Authorization': `Bearer ${auth.token}`
        }
    })
        .then(response => {
            if (response.status === 401) {
            } else if (response.status === 200) {
                setMessage(new MessageModel("success", "Data is saved."));
                props.navigation.pop();
            } else {
                setMessage(new MessageModel("danger", "Unable to save profile pic."));
            }
        }).catch(err => {
            setMessage(new MessageModel("danger", "Unable to save profile pic."));
            console.log(err);
        }).finally(() => { setLoading(false) });
}

  return (
    <SafeAreaView style={[styles.container, styles.width100, { alignContent: "center", justifyContent:"center" }]}>
      {image ? <>
        <Image source={{ uri: `data:image/jpeg;base64,${image.base64}` }} style={[styles.width100, { height: styles.width100.width }]} />
        <Pressable disabled={loading} style={[styles.my20]} onPress={async () => {await pickImage();}}>
          <Text style={[styles.textPrimary, styles.fslarge]}>Change Selection</Text>
          </Pressable>
        <Pressable disabled={loading} style={[styles.my20, styles.primaryButton]} onPress={saveProfilePic}>
          {loading ? <ActivityIndicator color={styles.textWhite.color} size={"small"}  /> : <Text style={[styles.textWhite, styles.fslarge]}>Save as Profile Picture</Text>}
          </Pressable>
      </> : <Pressable disabled={loading} style={[styles.my20]} onPress={async () => {await pickImage();}}><Text style={[styles.textPrimary, styles.fsxlarge]}>Choose picture from gallery</Text></Pressable>}
    </SafeAreaView>
  );
}

import { useEffect } from "react";
import { Alert, Platform, Text, ToastAndroid, View } from "react-native";
import { styles } from "../../stylesheet";

export default function ShowMessage(props) {
    // useEffect(() => {
    //     {
    //         if (props.modal && props.modal.message !== "") {
    //             if (props.modal.style === "danger") {
    //                 if (Platform.OS === 'android') {
    //                     ToastAndroid.show(props.modal.message, ToastAndroid.SHORT)
    //                 } else {
    //                     Alert.alert(props.modal.message);
    //                 }
    //             }
    //         }
    //     }
    // }, [props]);
    return <>
    {props.modal && props.modal.message !== "" ? <View style={[styles.mt10, styles.mb10]}>
        <Text style={props.modal.style === "danger" ? [styles.textDanger, styles.textCenter] : [styles.textCenter]}>
            {props.modal.message}
        </Text>
    </View> : null }
    </>;
}
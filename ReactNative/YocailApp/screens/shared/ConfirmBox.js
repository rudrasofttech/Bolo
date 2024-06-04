import { useState } from "react";
import { Alert } from "react-native";

export default function ConfirmBox(props) {
    const [open, setOpen] = useState(true);
    return <>{open ? <>{Alert.alert(props.message,[
        // The "Yes" button
        {
          text: "Yes",
          onPress: () => {
            setOpen(false);
            props.ok();
          },
        },
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: "No",
          onPress: () => {
            setOpen(false);
            props.cancel();
          }
        },
      ] )}
    </> : null}</>;


}

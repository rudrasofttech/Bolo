
import { Text, View } from "react-native";
import { styles } from "../../stylesheet";
import { useEffect, useState } from "react";

export default function ShowMessage(props) {
    const [modal, setModal] = useState(null)

    useEffect(() => {
        if (props.modal) {
            setModal(props.modal);
            if (props.modal.disappear > 0) {
                const timer = setTimeout(() => { setModal(null) }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [props.modal]);

    
    return <>
        {modal && modal.message !== "" ? <View style={[styles.mt10, styles.mb10]}>
            <Text style={modal.style === "danger" ? [styles.textDanger, styles.textCenter] : [styles.textCenter, styles.textSuccess]}>
                {modal.message}
            </Text>
        </View> : null}
    </>;
}
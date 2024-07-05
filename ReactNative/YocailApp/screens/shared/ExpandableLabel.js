import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import MentionHashtagTextView from "react-native-mention-hashtag-text";
import { styles } from "../../stylesheet";

export default function ExpandableLabel(props) {
    const [expanded, setExpanded] = useState(false);
    const [shouldExpand, setShouldExpand] = useState(false);
    const [text, setTrimText] = useState('');
    useEffect(() => {
        if (props.text.length > props.maxLength) {
            setShouldExpand(true);
            setExpanded(false);
            let t = props.text.substring(0, props.maxLength - 3);
            t = t.replaceAll('\n', '');

            setTrimText(t);

        } else {
            setShouldExpand(false);
            setExpanded(true);
        }
    }, [props.text, props.maxLength]);

    const mentionHashtagClick = (text) => {
        props.navigation.push("Hashtag", { hashtag: text });
    };

    if (expanded)
        return <><MentionHashtagTextView mentionHashtagPress={mentionHashtagClick} mentionHashtagColor={styles.textPrimary.color}>{props.text}</MentionHashtagTextView>
            {shouldExpand ? <Pressable onPress={() => { setExpanded(!expanded); }}><Text styles={[styles.fwBold, styles.fsnormal]}>less</Text></Pressable> : null}
        </>;
    else
        return <>
            {shouldExpand ? <Pressable onPress={() => { setExpanded(!expanded); }}><Text styles={[styles.fwBold]} >{text}... more</Text></Pressable> : null}
        </>;
}
import { Image, Pressable } from 'react-native';
import personFill from '../../assets/person-fill.png';
import { styles } from "../../stylesheet";
import { Utility } from '../../utility';

export default function MemberPicSmall(props) {

    let memberpic = props.member.picFormedURL !== "" ? <Pressable onPress={() => { props.navigation.push('Profile', { username: props.member.userName }) }}>
        <Image source={{uri : Utility.GetPhotoUrl(props.member.picFormedURL)}} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} />
    </Pressable>
        : <Pressable onPress={() => { props.navigation.push('Profile', { username: props.member.userName }) }}>
            <Image source={personFill} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} />
        </Pressable>;

    return <>{memberpic}</>;

}

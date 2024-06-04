import { useState } from "react";
import personFill from '../../assets/person-fill.png';
import ConfirmBox from "./ConfirmBox";
import FollowButton from "./FollowButton";
import { Image, Pressable, Text, View } from "react-native";
import { Utility } from "../../utility";
import { useAuth } from "../../authprovider";
import { styles } from "../../stylesheet";

export default function MemberSmallRow(props) {
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const member = props.member;
    const [status, setStatus] = useState(props.status);
    const [showRemove, setShowRemove] = useState(props.showRemove);
    const showShare = (props.showShare === undefined || props.showShare === null) ? false : props.showShare;
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);


    const removeFollow = () => {
        setLoading(true);
        fetch(`${Utility.GetAPIURL()}/api/follow/remove/${member.id}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setStatus(0);
                    setShowRemove(false);
                    if (props.removed) {
                        props.removed(member.id);
                    }
                }
            }).finally(() => {
                setLoading(false);
            });
    }

    const renderFollowButton = () => {
        let followbtn = <FollowButton member={member} status={status} />;
        if (showRemove) {
            //replace follow button with remove
            followbtn = <Pressable disabled={loading} onPress={() => { setShowRemoveConfirm(true); }} style={styles.unfollowButton}><Text>Remove</Text></Pressable>;
        }
        if (showShare)
            followbtn = <Pressable disabled={loading} style={styles.unfollowButton} onPress={(e) => { props.onShare(props.member.id); }}>
                <Text style={styles.textWhite}>Share</Text>
            </Pressable>;

        return followbtn;
    }

    return <View style={[styles.mb10, { flex: 1, flexDirection: "row", alignItems:"center" }]}>
        <View>
            {props.member.picFormedURL !== "" ? <Pressable onPress={() => { props.navigation.push('Profile', { username: props.member.userName }) }}>
                <Image source={{ uri: props.member.picFormedURL }} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} />
            </Pressable>
                : <Pressable onPress={() => { props.navigation.push('Profile', { username: props.member.userName }) }}>
                    <Image source={personFill} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} />
                </Pressable>}
        </View>
        <View style={{ flexGrow: 1 }} >
            <Pressable onPress={() => { props.navigation.push("Profile", { username: member.userName }) }} >
                {member.name !== "" ? <Text style={[styles.fwBold, styles.fsnormal]}>{member.name}</Text> : <Text style={[styles.fwBold, styles.fsnormal]}>@{member.userName}</Text>}
            </Pressable>
        </View>
        <View>
            {renderFollowButton()}
            {showRemoveConfirm ? <ConfirmBox cancel={() => { setShowRemoveConfirm(false); }}
                ok={() => { setShowRemove(false); removeFollow(); }}
                message="Are you sure you want to remove this member from your followers?" /> : null}
        </View>
    </View>;

}

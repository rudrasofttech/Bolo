import { useEffect, useRef, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import ShowMessage from "./shared/ShowMessage";
import { Dimensions, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { styles } from "../stylesheet";
import { Utility } from "../utility";
import personFill from '../assets/person-fill.png';
import FollowButton from "./shared/FollowButton";
import MemberPostList from "./MemberPostList";
import RBSheet from "react-native-raw-bottom-sheet";
import FollowRequestList from "./shared/FollowRequestList";
import MemberSmallList from "./shared/MemberSmallList";
import hamburger from "../assets/hamburger.png";

export default function Profile(props) {
  const auth = useAuth();
  const { username } = props.route?.params ? props.route?.params : { username: auth.myself.userName };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasFollowRequest, setHasFollowRequest] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);
  const [member, setMember] = useState(null);
  const [moreProfileText, setMoreProfileText] = useState("");
  const followRequestRbSHeet = useRef();
  const followingRbSHeet = useRef();
  const followerRbSHeet = useRef();
  const profileInfoRbSheet = useRef();
  const settingsRbSheet = useRef();
  const win = Dimensions.get('window');

  const fetchProfile = () => {
    setLoading(true);

    let un = username;
    if (username === "") {
      auth.validate();
      un = auth.myself.id;
    }

    fetch(`${Utility.GetAPIURL()}/api/Members/${un}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            //console.log(data);
            setMember(data);
            let text = "";
            if (data.emails.length > 0)
              text = data.emails[0].email;
            if (data.phones.length > 0 && text.length < 70)
              text = `${text} ${data.phones[0].phone}`;
            if (data.links.length > 0 && text.length < 70)
              text = `${text} ${data.links[0].url}`;

            if (text.length >= 40)
              setMoreProfileText(text.substring(0, 37));
            else
              setMoreProfileText(text);

            loadFollowStatus(data.id);
            checkIfHasRequest(data.id)
          });
        } else {
          setMessage(new MessageModel("danger", "Unable to load profile."));
        }
      }).catch(() => {
        setMessage(new MessageModel("danger", "Unable to connect to internet."));
      }).finally(() => {
        setLoading(false);
      });
  }


  useEffect(() => {
    fetchProfile();
  }, [username]);

  const loadFollowStatus = (username) => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/Follow/Status/${username}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            setFollowStatus(data.status);
          });
        }

      }).catch(() => {
        setMessage(new MessageModel("danger", "Unable to connect to internet."));
      }).finally(() => {
        setLoading(false);
      });
  }

  const checkIfHasRequest = (username) => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/Follow/HasRequest/${username}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(response => {
        if (response.status === 200) {
          setHasFollowRequest(true);

        } else {
          setHasFollowRequest(false);
        }
      }).catch(() => {
        setMessage(new MessageModel("danger", "Unable to connect to internet."));
      }).finally(() => {
        setLoading(false);
      });
  }

  const allowRequest = () => {
    fetch(`${Utility.GetAPIURL()}/api/Follow/allow/${member.id}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(response => {
        if (response.status === 200) {
          setHasFollowRequest(false);
        }
      }).catch(() => {
        setMessage(new MessageModel("danger", "Unable to connect to internet."));
      }).finally(() => {
        setLoading(false);
      });
  }



  const rejectRequest = () => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/Follow/Reject/${member.id}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(response => {
        if (response.status === 200) {
          setHasFollowRequest(false);
        }
      }).catch(() => {
        setMessage(new MessageModel("danger", "Unable to connect to internet."));
      }).finally(() => {
        setLoading(false);
      });
  }

  const renderOwnerPic = () => {
    if (member.picFormedURL !== "")
      return { uri: member.picFormedURL };
    else
      return personFill;
  }

  if (member !== null) {
    return (
      <SafeAreaView style={[styles.container, styles.width100, styles.mt10]}>
        <View style={[styles.width100, styles.p10, { flexDirection: "row" }]}>
          <Image source={renderOwnerPic(member)} style={[styles.profilepic100, styles.borderPrimary, styles.alignCenter]} />
          <View style={[styles.px10]}>
            {member.name !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.fwBold]}>{member.name}</Text> : null}
            <Text style={[styles.textSecondary, styles.mb10, styles.mt5, styles.fsnormal]}>@{member.userName}</Text>
            <View style={[styles.mt5, styles.mb10, {
              flexDirection: 'row'

            }]}>
              {followStatus != null ? <FollowButton member={member} status={followStatus} /> : null}
              {member.followRequestCount > 0 && member.userName === auth.myself.userName ?
                <Pressable style={[styles.lightButton, styles.mx20, { width: 140 }]} onPress={() => { followRequestRbSHeet.current.open(); }}><Text style={[styles.textSuccess]}>{member.followRequestCount} Follow Request</Text></Pressable> : null}
              {auth.myself && member != null && auth.myself.id === member.id ? <Pressable onPress={() => { settingsRbSheet.current.open(); }}>
                <Image source={hamburger} style={[{ width: 25, height: 25, resizeMode: "contain" }]} />
              </Pressable> : null}
            </View>
          </View>
        </View>
        {member.bio !== "" ? <Text style={[styles.textCenter, styles.fsnormal, { paddingHorizontal: 5, paddingVertical: 10 }]}>{member.bio}</Text> : null}
        {moreProfileText.length > 0 ? <Pressable onPress={() => { profileInfoRbSheet.current.open(); }}>
          <Text style={[styles.fwBold, styles.mb15]}>{moreProfileText}... more</Text>
        </Pressable> : null}
        {hasFollowRequest ? <View style={[styles.p10, styles.mb10, styles.mx10, { backgroundColor: "rgba(48, 35, 91, 0.05)", borderRadius: 15 }]}>
          <Text>You have follow request from this account, take action.</Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Pressable disabled={loading} onPress={() => { allowRequest(); }}><Text style={[styles.textPrimary, styles.fsnormal, styles.fwBold, styles.py10, styles.mx10]}>Approve</Text></Pressable>
            <Pressable disabled={loading} onPress={() => { rejectRequest(); }}><Text style={[styles.textDanger, styles.fsnormal, styles.fwBold, styles.py10, styles.mx10]}>Reject</Text></Pressable>
          </View>
        </View> : null}
        <View style={[styles.py10, { flexDirection: "row", backgroundColor: "rgba(48, 35, 91, 0.05)" }]}>
          <Text style={[styles.fssmall, styles.textCenter, styles.fwBold, { width: styles.width100.width / 3 }]}>{member.postCount} Posts</Text>
          <Pressable style={{ width: styles.width100.width / 3 }} onPress={() => {
            if (auth.myself && member != null && auth.myself.id === member.id) {
              followerRbSHeet.current.open();
            }
          }}>
            <Text style={[styles.fssmall, styles.textCenter, styles.fwBold]}>{member.followerCount} Followers</Text>
          </Pressable>
          <Pressable style={{ width: styles.width100.width / 3 }} onPress={() => {
            if (auth.myself && member != null && auth.myself.id === member.id) {
              followingRbSHeet.current.open();
            }
          }}>
            <Text style={[styles.fssmall, styles.textCenter, styles.fwBold, { width: styles.width100.width / 3 }]}>{member.followingCount} Following</Text>
          </Pressable>
        </View>

        <MemberPostList gridColumns={3} scrollEnabled={true} search={username} navigation={props.navigation} viewMode={1} viewModeAllowed={false} allowProfileNavigation={false} />
        <ShowMessage modal={message} />
        <RBSheet ref={followRequestRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
          <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Follow Request</Text>
          <FollowRequestList navigation={props.navigation} />
        </RBSheet>
        {auth.myself && member != null && auth.myself.id === member.id ? <RBSheet ref={followingRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
          <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Following</Text>
          <MemberSmallList memberid={member.id} target="following" navigation={props.navigation} />
        </RBSheet> : null}
        {auth.myself && member != null && auth.myself.id === member.id ? <RBSheet ref={followerRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
          <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Followers</Text>
          <MemberSmallList memberid={member.id} target="follower" navigation={props.navigation} />
        </RBSheet> : null}
        <RBSheet ref={profileInfoRbSheet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
          <ScrollView style={[styles.p10]}>
            {member.emails.length > 0 ? <>
              <Text style={[styles.fslarge, styles.fwBold, styles.my10, styles.textPrimary, styles.textCenter]}>Emails</Text>
              {member.emails.map(e => <><Text selectable={true} style={[styles.fslarge, styles.my10, styles.textPrimary, styles.textCenter]}>{e.email}</Text></>)}
            </> : null}
            {member.phones.length > 0 ? <>
              <Text style={[styles.fslarge, styles.fwBold, styles.my10, styles.textPrimary, styles.textCenter]}>Phone Numbers</Text>
              {member.phones.map(e => <><Text selectable={true} style={[styles.fslarge, styles.my10, styles.textPrimary, styles.textCenter]}>{e.phone}</Text></>)}
            </> : null}
            {member.links.length > 0 ? <>
              <Text style={[styles.fslarge, styles.fwBold, styles.mt10, styles.textPrimary, styles.textCenter]}>Links</Text>
              {member.links.map(e => <Pressable onPress={() => {
                profileInfoRbSheet.current.close();
                props.navigation.push("Webpage", { link: e });
              }}>
                <View style={{ flexDirection: "column" }}>
                  <Text style={[styles.fslarge, styles.mt10, styles.mb5, styles.textPrimary, styles.textCenter]}>{e.name}</Text>
                  <Text selectable={true} style={[styles.fssmall, styles.mb10, styles.textPrimary, styles.textCenter]}>{e.url}</Text>
                </View>
              </Pressable>)}
            </> : null}
          </ScrollView>
        </RBSheet>
        <RBSheet ref={settingsRbSheet} height={200} draggable={true} customStyles={styles.rbSheet}>
          <View style={{ flexDirection: "column" }}>
            <Pressable style={[styles.borderBottom]}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Edit Profile</Text></Pressable>
              <Pressable style={[styles.borderBottom]} onPress={() => {
                settingsRbSheet.current.close();
                props.navigation.push('IgnoredUsers');
              }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Ignored Members</Text></Pressable>
            <Pressable onPress={() => {
              auth.logOut();
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Logout</Text></Pressable>
          </View>
        </RBSheet>
      </SafeAreaView>
    );
  }
  else
    return null;
}

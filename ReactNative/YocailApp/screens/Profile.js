import { useEffect, useRef, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import ShowMessage from "./shared/ShowMessage";
import { Alert, Dimensions, FlatList, Image, Platform, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../stylesheet";
import { Utility } from "../utility";
import personFill from '../assets/person-fill.png';
import FollowButton from "./shared/FollowButton";
import RBSheet from "react-native-raw-bottom-sheet";
import FollowRequestList from "./shared/FollowRequestList";
import MemberSmallList from "./shared/MemberSmallList";
import hamburger from "../assets/hamburger.png";
import { useIsFocused } from "@react-navigation/native";
import IgnoredUsers from "./IgnoredUsers";
import ManageLinks from "./ManageLinks";
import ManageEmails from "./ManageEmails";
import ManagePhones from "./ManagePhones";
import ManageProfile from "./ManageProfile";
import ChangePassword from "./ChangePassword";
import SecurityAnswer from "./SecurityAnswer";
import ExpandableLabel from "./shared/ExpandableLabel";

export default function Profile(props) {
  const auth = useAuth();
  const { username } = props.route?.params ? props.route?.params : { username: auth.myself.userName };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  let ls = { model: { current: 0, pageSize: 20, total: 0, totalPages: 0 }, posts: [] };
  const [model, setModel] = useState(ls.model);
  const [posts, setPosts] = useState(ls.posts);
  const [hasFollowRequest, setHasFollowRequest] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);
  const [member, setMember] = useState(null);
  const [moreProfileText, setMoreProfileText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const followRequestRbSHeet = useRef();
  const followingRbSHeet = useRef();
  const followerRbSHeet = useRef();
  const profileInfoRbSheet = useRef();
  const settingsRbSheet = useRef();
  const profilePicRBSheet = useRef();
  const ignoredRBSheet = useRef();
  const editLinksRBSheet = useRef();
  const editEmailsRBSheet = useRef();
  const editPhonesRBSheet = useRef();
  const editProfileRBSheet = useRef();
  const editChangePasswordRBSheet = useRef();
  const setSecAnsRBSheet = useRef();
  const win = Dimensions.get('window');
  const isFocused = useIsFocused();
  const gridColumns = 2;

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
            if (data.emails.length > 0) {
              let emails = data.emails.map(function (item) {
                return item.email;
              });
              text = emails.join(', ');

            }
            if (data.phones.length > 0 && text.length < 120) {
              let phones = data.phones.map(function (item) {
                return item.phone;
              });
              text = `${text} ${phones.join(', ')}`;
            }
            if (data.links.length > 0 && text.length < 120) {
              let links = data.links.map(function (item) {
                return item.url;
              });
              text = `${text} ${links.join(', ')}`;
            }

            if (text.length >= 45)
              setMoreProfileText(text.substring(0, 42));
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

  const fetchData = () => {
    //console.log(`current page: ${currentPage}`);
    setLoading(true);
    let url = `${Utility.GetAPIURL()}/api/post?q=${encodeURIComponent(username)}&p=${currentPage}`;

    //console.log(url);
    fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            //console.log(data.posts.length);
            let temp = currentPage === 0 ? data.posts : posts;
            if (currentPage > 0) {
              for (var k in data.posts) {
                temp.push(data.posts[k]);
              }
            }
            setModel({
              current: data.current,
              pageSize: data.pageSize,
              total: data.total,
              totalPages: data.totalPages
            });
            setPosts(temp);
            //console.log(`current page: ${currentPage}`);
          });
        }
      }).catch(error => {
        setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
        console.log(error);
      }).finally(() => { setLoading(false); });
  }


  useEffect(() => {
    fetchProfile();
    fetchData();
  }, [isFocused]);

  const loadFollowStatus = async (username) => {

    const response = await fetch(`${Utility.GetAPIURL()}/api/Follow/Status/${username}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
    if (response.status === 200) {
      //console.log(`loadFollowStatus status ${response.status} ${currentPage}`);
      response.json().then(data => {
        setFollowStatus(data.status);
      });
    }
  }

  const checkIfHasRequest = async (username) => {

    const response = await fetch(`${Utility.GetAPIURL()}/api/Follow/HasRequest/${username}`, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })

    if (response.status === 200) {
      setHasFollowRequest(true);

    } else {
      setHasFollowRequest(false);
    }
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

  const removeProfilePicture = (e) => {
    setLoading(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("pic", "");
    fetch(`${Utility.GetAPIURL()}/api/Members/savepic`, {
      method: 'post',
      body: fd,
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 401) {
          auth.logOut();
        } else if (response.status === 200) {
          fetchProfile();
        } else {
          setMessage(new MessageModel("danger", 'Unable to save profile pic.'));
        }
      }).catch((err) => {
        setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
        console.log(err);
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
      <SafeAreaView style={[styles.container, styles.width100]}>
        <FlatList style={[styles.width100]} data={posts}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={() => {
                props.navigation.push("ProfilePosts", {search : username, posts :posts, postIndex : index, model : model});
              }}>
                <View key={item.id} style={[styles.mx10, styles.my10, {}]}>
                <Image source={{ uri: Utility.GetPhotoUrl(item.photos[0].photo) }} style={[{ borderRadius: 15, resizeMode: "cover", width: (styles.width100.width / gridColumns) - 20, height: (styles.width100.width / gridColumns) - 20 }]} />
              </View></TouchableOpacity>
            );
          }}
          numColumns={gridColumns}
          keyExtractor={(item, index) => index.toString()}
          refreshing={loading}
          onRefresh={() => { setCurrentPage(0); fetchData(); }}
          initialNumToRender={10}
          onEndReached={() => {
            if (model.totalPages > (currentPage + 1)) {
              console.log("onEndReached");
              setCurrentPage(currentPage + 1);
            }
          }} scrollEnabled={props.scrollEnabled !== undefined ? props.scrollEnabled : true}
          ListHeaderComponent={<>
            <View style={[styles.width100, styles.p10, { flexDirection: "row" }]}>
              <Pressable onPress={() => {
                {
                  auth.myself && member != null && auth.myself.id === member.id ?
                    profilePicRBSheet.current.open() : null
                }
              }}>
                <Image source={renderOwnerPic(member)} style={[styles.profilepic100, styles.borderPrimary, styles.alignCenter]} />
              </Pressable>
              <View style={[styles.px10]}>
                {member.name !== "" ? <Text style={[styles.textPrimary, styles.fsnormal, styles.fwBold]}>{member.name}</Text> : null}
                <Text style={[styles.textSecondary, styles.mt5, styles.fsnormal]}>@{member.userName}</Text>
                {member.countryName !== "" ? <Text style={[styles.textSecondary, styles.mb10, styles.mt5, styles.fssmall]}>{member.countryName}</Text> : null}
                <View style={[styles.mt5, styles.mb10, { flexDirection: 'row' }]}>
                  {followStatus != null ? <FollowButton member={member} status={followStatus} /> : null}
                  {member.followRequestCount > 0 && member.userName === auth.myself.userName ?
                    <Pressable style={[styles.lightButton, styles.mx20, { width: 140 }]} onPress={() => { followRequestRbSHeet.current.open(); }}><Text style={[styles.textSuccess]}>{member.followRequestCount} Follow Request</Text></Pressable> : null}
                  {auth.myself && member != null && auth.myself.id === member.id ? <Pressable onPress={() => { settingsRbSheet.current.open(); }}>
                    <Image source={hamburger} style={[{ width: 25, height: 25, resizeMode: "contain" }]} />
                  </Pressable> : null}
                </View>
              </View>
            </View>
            {member.bio !== "" ? <View style={[styles.p5, styles.width90]}>
              <ExpandableLabel text={member.bio} maxLength={35} navigation={props.navigation} />
            </View>
              : null}
            {moreProfileText.length > 0 ? <Pressable onPress={() => { profileInfoRbSheet.current.open(); }}>
              <Text style={[styles.p5, styles.mb15, styles.width90]}>{moreProfileText}... more</Text>
            </Pressable> : null}
            {hasFollowRequest ? <View style={[styles.p10, styles.mb10, styles.mx10, { backgroundColor: "rgba(48, 35, 91, 0.05)", borderRadius: 15 }]}>
              <Text>You have follow request from this account, take action.</Text>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Pressable disabled={loading} onPress={() => { allowRequest(); }}>
                  <Text style={[styles.textPrimary, styles.fsnormal, styles.fwBold, styles.py10, styles.mx10]}>Approve</Text></Pressable>
                <Pressable disabled={loading} onPress={() => { rejectRequest(); }}>
                  <Text style={[styles.textDanger, styles.fsnormal, styles.fwBold, styles.py10, styles.mx10]}>Reject</Text></Pressable>
              </View>
            </View> : null}
            <View style={[styles.py15, { flexDirection: "row", backgroundColor: "rgba(48, 35, 91, 0.05)" }]}>
              <Text style={[styles.fsnormal, styles.textCenter, styles.fwBold, { width: styles.width100.width / 3 }]}>{member.postCount} Posts</Text>
              <Pressable style={{ width: styles.width100.width / 3 }} onPress={() => {
                if (auth.myself && member != null && auth.myself.id === member.id) {
                  followerRbSHeet.current.open();
                }
              }}>
                <Text style={[styles.fsnormal, styles.textCenter, styles.fwBold]}>{member.followerCount} Followers</Text>
              </Pressable>
              <Pressable style={{ width: styles.width100.width / 3 }} onPress={() => {
                if (auth.myself && member != null && auth.myself.id === member.id) {
                  followingRbSHeet.current.open();
                }
              }}>
                <Text style={[styles.fsnormal, styles.textCenter, styles.fwBold, { width: styles.width100.width / 3 }]}>{member.followingCount} Following</Text>
              </Pressable>
            </View>
          </>} >
        </FlatList>
        <ShowMessage modal={message} />
        <RBSheet ref={followRequestRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
          <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Follow Request</Text>
          <FollowRequestList navigation={props.navigation} />
        </RBSheet>
        {auth.myself && member != null && auth.myself.id === member.id ? <>
          <RBSheet ref={followingRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
            <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Following</Text>
            <MemberSmallList memberid={member.id} target="following" navigation={props.navigation} />
          </RBSheet>
          <RBSheet ref={followerRbSHeet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
            <Text style={[styles.textCenter, styles.pb15, styles.fslarge, styles.fwBold]}>Followers</Text>
            <MemberSmallList memberid={member.id} target="follower" navigation={props.navigation} />
          </RBSheet>
          <RBSheet ref={profilePicRBSheet} height={200} draggable={true} customStyles={styles.rbSheet}>
            <View style={{ flexDirection: "column" }}>
              <Pressable style={[styles.borderBottom]} onPress={() => {
                profilePicRBSheet.current.close();
                props.navigation.push('EditProfilePic');
              }}>
                <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Change Picture</Text>
              </Pressable>
              <Pressable style={[styles.borderBottom]} disabled={loading} onPress={() => {
                Alert.alert('Confirm', 'You are about to remove profile pic.', [
                  { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                  {
                    text: 'OK', onPress: () => {
                      removeProfilePicture();
                      profilePicRBSheet.current.close();
                    }
                  },
                ]);
              }}>
                <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Remove Picture</Text>
              </Pressable>
            </View>
          </RBSheet>
        </> : null}

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
        <RBSheet ref={settingsRbSheet} height={500} draggable={true} customStyles={styles.rbSheet}>
          <View style={{ flexDirection: "column" }}>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { editProfileRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Edit Profile</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { editLinksRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Edit Links</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { editEmailsRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Edit Emails</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { editPhonesRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Edit Phone Numbers</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { editChangePasswordRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Change Password</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { setSecAnsRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Set Security Answer</Text>
            </Pressable>
            <Pressable style={[styles.borderBottom]} onPress={() => {
              settingsRbSheet.current.close();
              setTimeout(() => { ignoredRBSheet.current.open(); }, 300);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Ignored Members</Text></Pressable>
            <Pressable onPress={() => {
              auth.logOut();
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Logout</Text></Pressable>
          </View>
        </RBSheet>
        <RBSheet ref={ignoredRBSheet} height={win.height - 200} draggable={true} customStyles={styles.rbSheet}>
          <Text style={[styles.fsnormal, styles.fwBold, styles.alignCenter, styles.pb10]}>Ignored Profiles</Text>
          <IgnoredUsers />
        </RBSheet>
        <RBSheet ref={editLinksRBSheet} height={Platform.OS === 'ios' ? win.height * (3 / 4) : win.height - 30} draggable={true} customStyles={styles.rbSheet}>
          <ManageLinks onChange={fetchProfile} />
        </RBSheet>
        <RBSheet ref={editEmailsRBSheet} height={300} draggable={true} customStyles={styles.rbSheet}>
          <ManageEmails onChange={fetchProfile} />
        </RBSheet>
        <RBSheet ref={editPhonesRBSheet} height={300} draggable={true} customStyles={styles.rbSheet}>
          <ManagePhones onChange={fetchProfile} />
        </RBSheet>
        <RBSheet ref={editProfileRBSheet} height={win.height} customStyles={[styles.rbSheet, { borderRadius: 0 }]}>
          <SafeAreaView>
            <ManageProfile onChange={fetchProfile} onClose={() => { editProfileRBSheet.current.close(); }} />
          </SafeAreaView>
        </RBSheet>
        <RBSheet ref={editChangePasswordRBSheet} height={300} draggable="true" customStyles={styles.rbSheet}>
          <ChangePassword />
        </RBSheet>
        <RBSheet ref={setSecAnsRBSheet} height={350} draggable="true" customStyles={styles.rbSheet}>
          <SecurityAnswer />
        </RBSheet>
      </SafeAreaView>
    );
  }
  else
    return null;
}


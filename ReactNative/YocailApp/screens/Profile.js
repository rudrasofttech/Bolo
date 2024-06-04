import { useEffect, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import ShowMessage from "./shared/ShowMessage";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import { FlatList } from "react-native";
import MemberPost from "./MemberPost";
import { styles } from "../stylesheet";
import { Utility } from "../utility";
import personFill from '../assets/person-fill.png';
import FollowButton from "./shared/FollowButton";
import MemberPostList from "./MemberPostList";

export default function Profile(props) {
  const auth = useAuth();
  const { username } = props.route?.params ? props.route?.params : {username:auth.myself.userName};
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  let ls = { model: null, posts: [] };
  const [model, setModel] = useState(ls.model);
  const [posts, setPosts] = useState(ls.posts);
  const [p, setCurrentPage] = useState(0);
  const [showfollowers, setShowFollowers] = useState(false);
  const [showfollowing, setShowFollowing] = useState(false);
  //const [showSettings, setShowSettings] = useState(false);
  const [showrequests, setShowRequests] = useState(false);
  const [hasFollowRequest, setHasFollowRequest] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);
  const [member, setMember] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    
    let un = username;
    if (username === "") {
      auth.validate();
      un = auth.myself.id;
    }
    console.log(un);
    fetch(`${Utility.GetAPIURL()}/api/Members/${un}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            console.log(data);
            setMember(data);
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
    setLoading(true);
    let un = username;
    if (username === "") {
      un = auth.myself.userName;
    }
    fetch(`${Utility.GetAPIURL()}/api/post?q=${encodeURIComponent(`@${un}`)}&p=${p}&ps=10`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            //console.log(data);
            let temp = p === 0 ? data.posts : posts;
            if (p !== 0) {
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
          });
        } else if (response.status === 401) {
          auth.logOut();
        }
      }).catch(error => {
        setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
        console.log(error);
      }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    fetchProfile();
    fetchData();
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

  const renderItem = ({ item }) => {
    return (
      <MemberPost post={item} navigation={props.navigation} allowProfileNavigation={false} />
    );
  };

  const renderFollowHtml = () => {
    if (followStatus != null) {
      return <FollowButton member={member} status={followStatus} />
    }
  }

  const renderOwnerPic = () => {
    if (member.picFormedURL !== "")
      return { uri: member.picFormedURL };
    else
      return personFill;
  }

  if (member !== null){
    
    return (
      <SafeAreaView style={[styles.container, styles.width100, { paddingTop: 10 }]}>
        <ScrollView contentContainerStyle={[styles.width100, {justifyContent:"center"}]}>
          <View style={[styles.mx10, styles.my10, {flex:1,flexDirection:"column", justifyContent:"center", borderColor: "rgba(0,0,0,0.2)", borderWidth: 1, borderRadius: 10, padding: 10 }]}>
            {member.picFormedURL !== "" ? <Image source={renderOwnerPic(member)} style={[styles.profilepic100, styles.borderPrimary, { marginRight: 10, alignSelf: "center" }]} /> : null}
            {member.name !== "" ? <Text style={[styles.textSecondary, styles.textCenter, styles.mt10, styles.fsnormal]}>{member.name}</Text> : null}
            <View style={[styles.py5,{flex:1, flexDirection:"row"}]}>
              <Text style={[styles.textCenter, styles.fsnormal, styles.fwBold, {flexGrow:1}]}>{member.postCount} Posts</Text>
              <Text style={[styles.textCenter, styles.fsnormal, styles.fwBold, {flexGrow:1}]}>{member.followerCount} Followers</Text>
              <Text style={[styles.textCenter, styles.fsnormal, styles.fwBold, {flexGrow:1}]}>{member.followingCount} Following</Text>
            </View>
            {member.bio !== "" ? <Text style={[styles.py10, styles.textCenter]}>{member.bio}</Text> : null} 
            {followStatus != null ? <View style={[ styles.py5, {alignSelf:"center"}]}><FollowButton member={member} status={followStatus} /></View> : null}
          </View>
           <MemberPostList gridColumns={2} scrollEnabled={false} search={username} navigation={props.navigation} viewMode={1} viewModeAllowed={true} allowProfileNavigation={false} /> 
        </ScrollView>
        <ShowMessage modal={message} />
      </SafeAreaView>
    );
  }
  else
    return null;
}
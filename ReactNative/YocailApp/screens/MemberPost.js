import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
//import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useAuth } from "../authprovider";
import { useEffect, useState } from "react";
import { MessageModel } from "../model";
import { styles } from "../stylesheet";
import personFill from '../assets/person-fill.png';
import moreIcon from '../assets/more.png';
import heart from '../assets/heart.png';
import heartFill from '../assets/heart-fill.png';
import comment from '../assets/comment.png';
import share from '../assets/share.png';
import { useRef } from "react";
import { Utility } from "../utility";
import MentionHashtagTextView from "react-native-mention-hashtag-text";
import { TapGestureHandler, State, TextInput } from 'react-native-gesture-handler';
import RBSheet from 'react-native-raw-bottom-sheet';
import MemberSmallList from "./shared/MemberSmallList";
import DateLabel from "./shared/DateLabel";
import MemberPicSmall from "./shared/MemberPicSmall";

export default function MemberPost(props) {
  const win = Dimensions.get('window');
  const [message, setMessage] = useState(new MessageModel());
  const SLIDER_WIDTH = Dimensions.get('window').width + 80
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
  const cl = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const doubleTapRef = useRef(null);
  const [post, setPost] = useState(props.post);
  const auth = useAuth();
  const likesRBSheet = useRef();
  const sharesRBSheet = useRef();
  const commentsRBSheet = useRef();

  const renderOwnerPic = () => {
    if (post.owner.picFormedURL !== "")
      return { uri: post.owner.picFormedURL };
    else
      return personFill;
  }

  const renderCaourselItem = ({ item, index }) => {
    //console.log(item);
    let asp = item.height / item.width;
    return (
      <Image style={{ width: win.width - 10, height: (win.width - 10) * asp }}
        source={{ uri: Utility.GetPhotoUrl(item.photo) }} />
    );
  }

  const onDoubleTapEvent = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log("double tap");
      addReaction();
    }
  };

  const sharePost = (sharewithid) => {
    fetch(`${Utility.GetAPIURL()}/api/post/share/${post.id}?uid=${sharewithid}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          setMessage(new MessageModel("success", "Post is shared.", 0));
        } else {
          response.json().then(data => {
            setMessage(new MessageModel("danger", data.error, 0));
          }).catch(err => {
            setMessage(new MessageModel("danger", "Unable to share post.", 0));
            console.log(err);
          });
        }
      }).catch(error => {
        setMessage(new MessageModel("danger", "Unable to connect to internet.", 0));
        console.log(error);
      });
  }

  const addReaction = () => {
    fetch(`${Utility.GetAPIURL()}/api/post/addreaction/${post.id}`, {
      method: 'get',
      headers: { "Authorization": `Bearer ${auth.token}` }
    }).then(response => {
      if (response.status === 200) {
        response.json().then(data => {
          let p = post;
          p.hasReacted = data.hasReacted;
          p.reactionCount = data.reactionCount;
          setMessage(new MessageModel());
          setPost(p);
        });
      } else {
        response.json().then(data => {
          setMessage(new MessageModel('danger', data.error));
        }).catch(err => {
          setMessage(new MessageModel('danger', "Unable to add reaction to post."));
          console.log(err);
        });
      }
    }).catch(error => {
      setMessage(new MessageModel('danger', "Unable to connect to internet."));
      console.log(error);
    });
  }

  const renderPostPic = () => {
    
    if (post.photos.length > 1) {
      return <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTapEvent} numberOfTaps={2}>
        <View></View>
        {/* <Carousel ref={cl} layout='default' data={post?.photos ? post?.photos : []} renderItem={renderCaourselItem}
          sliderWidth={win.width} itemWidth={win.width - 10} onSnapToItem={(index) => setCarouselIndex(index)} useScrollView={true} /> */}
      </TapGestureHandler>;
    } else {
      let asp = post.photos[0].height / post.photos[0].width;
      return <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTapEvent} numberOfTaps={2}>
        <Image style={{ width: win.width, height: win.width * asp }} source={{ uri: Utility.GetPhotoUrl(post.photos[0].photo) }} />
      </TapGestureHandler>;
    }
  }

  const mentionHashtagClick = (text) => {
    console.log("Clicked to + " + text);
    props.navigation.push("Hashtag", { hashtag: text });
  };

  const renderLikeText = (c) => {
    if (c <= 0)
      return "";
    else if (c == 1)
      return "like";
    else
      return "likes";
  }

  const renderCommentText = (c) => {
    if (c <= 0)
      return "";
    else if (c == 1)
      return "comment";
    else
      return "comments";
  }

  return (<View style={[styles.mb20]}>
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", height: 60, paddingLeft: 15, paddingRight: 15, marginBottom: 10 }}>
      <Pressable onPress={() => { 
        if(props.allowProfileNavigation){
        props.navigation.push('Profile', { username: post.owner.userName });
        }
         }}><Image source={renderOwnerPic()} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} /></Pressable>
      <View style={{ flexGrow: 1 }}>
        <Text style={[styles.textPrimary, styles.fwBold, styles.fsnormal]}>{post.owner.name !== "" ? post.owner.name : post.owner.userName}</Text>
        <Text style={[styles.textPrimary, styles.fssmall]}>{post.postDateDisplay}</Text>
      </View>
      <Image source={moreIcon} style={{ width: 20, height: 20 }} />
    </View>
    {renderPostPic()}
    {/* {post.photos.length > 1 ? <Pagination dotsLength={post.photos.length}
      activeDotIndex={carouselIndex} containerStyle={{ backgroundColor: '#fff' }}
      dotStyle={{ width: 8, height: 8, borderRadius: 5, marginHorizontal: 0, padding: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      inactiveDotStyle={{ }} inactiveDotOpacity={0.4} inactiveDotScale={0.6} /> : null} */}
    <View style={[styles.py10, styles.px15, { flex: 1, flexDirection: 'row', alignItems: "flex-start", justifyContent: "center" }]}>
      <View style={[styles.px15, { flexShrink: 1 }]}>
        <Pressable onPress={addReaction}><Image source={post.hasReacted ? heartFill : heart} style={{ width: 20, height: 20, margin: 5, alignSelf:"center" }} /></Pressable>
        <Pressable onPress={() => { likesRBSheet.current.open(); }}>{post.reactionCount > 0 ? <Text style={[styles.textCenter, styles.fssmall]}>{post.reactionCount} {renderLikeText(post.reactionCount)}</Text> : <Text style={[styles.textCenter, styles.fssmall]}>No Likes</Text>}</Pressable>
      </View>
      {post.acceptComment ? <View style={[styles.px15, { flexShrink: 1 }]}>
        <Pressable onPress={() => { commentsRBSheet.current.open(); }}><Image source={comment} style={{ width: 20, height: 20, margin: 5, alignSelf:"center" }} />
          {post.commentCount > 0 ? <Text style={[styles.textCenter, styles.fssmall]}>{post.commentCount} {renderCommentText(post.commentCount)}</Text> : <Text style={[styles.textCenter, styles.fssmall]}>No Comments</Text>}</Pressable>
      </View> : null}
      {post.allowShare ? <View style={[styles.px15, { flexShrink: 1 }]}>
        <Pressable onPress={() => { sharesRBSheet.current.open(); }}><Image source={share} style={{ width: 20, height: 20, margin: 5, alignSelf:"center" }} /></Pressable>
      </View> : null}
    </View>
    <View style={[styles.p10]}>
      <MentionHashtagTextView mentionHashtagPress={mentionHashtagClick} mentionHashtagColor={styles.textPrimary.color}>
        {post.describe}
      </MentionHashtagTextView>
      <RBSheet ref={likesRBSheet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
        <MemberSmallList target="reaction" postid={post.id} navigation={props.navigation} />
      </RBSheet>
      <RBSheet ref={sharesRBSheet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
        <MemberSmallList postid={post.id} navigation={props.navigation} memberid={auth.myself.id} target="share" onSelected={(id) => { sharePost(id); }} />
      </RBSheet>
      <RBSheet ref={commentsRBSheet} height={win.height - 350} draggable={true} customStyles={styles.rbSheet}>
        <MemberComment navigation={props.navigation} post={post}
          cancel={() => { }} onCommentAdded={count => {
            let p = post;
            commentCount = count;
            setPost(p);
          }}
          onCommentRemoved={count => {
            let p = post;
            p.commentCount = count;
            setPost(p);
          }} />
      </RBSheet>

    </View>
  </View>);
}

function MemberComment(props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(new MessageModel());
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState({ current: 0, pageSize: 20, total: 0, commentList: [] });
  const [currentPage, setCurrentPage] = useState(0);
  const [commenttext, setCommentText] = useState('');
  const [height, setHeight] = useState(0);

  const fetchData = () => {
    setLoadingComments(true);
    let url = `${Utility.GetAPIURL()}/api/post/comments/${props.post.id}?ps=${comments.pageSize}&p=${currentPage}`;
    fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    }).then(response => {
      if (response.status === 200) {
        response.json().then(data => {
          //console.log(data);
          let temp = comments.commentList;
          for (let k in data.commentList) {
            if (temp.filter(t => t.id === data.commentList[k].id).length === 0)
              temp.push(data.commentList[k]);
          }

          setComments({
            current: data.current,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: data.totalPages,
            commentList: temp
          });

        });
      } else {
        response.json().then(data => {
          setMessage(new MessageModel("danger", data.error));
        }).catch(err => {
          console.log(err);
          setMessage(new MessageModel("danger", "Unable to load comments of this post."));
        });
      }
    }).catch(() => {
      setMessage(new MessageModel("danger", "Unable to connect to internet."));
    }).finally(() => {
      setLoadingComments(false);
    });
  }

  useEffect(() => {
    fetchData();
  }, [props.post, currentPage]);


  const addComment = () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("comment", commenttext);
    fd.append("postId", props.post.id);

    fetch(`${Utility.GetAPIURL()}/api/post/addcomment`, {
      method: 'post',
      body: fd,
      headers: { 'Authorization': `Bearer ${auth.token}` }
    }).then(response => {
      if (response.status === 200) {
        response.json().then(data => {
          let temp = comments.commentList;
          temp.unshift(data);

          setComments({
            current: comments.current,
            pageSize: comments.pageSize,
            total: comments.total + 1,
            totalPages: comments.totalPages,
            commentList: temp
          });
          setCommentText("");

          if (props.onCommentAdded !== undefined && props.onCommentAdded !== null) {
            props.onCommentAdded(comments.total);
          }
        });
      } else {
        setMessage(new MessageModel("danger", 'Unable to save comment'));
      }
    })
      .catch(() => {
        setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
      })
      .finally(() => { setLoading(false); });
  }

  const removeComment = (commentiddel) => {
    setLoading(true);
    let url = `${Utility.GetAPIURL()}/api/post/removecomment/${commentiddel}`;
    fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          let temp = comments.commentList.filter(t => t.id !== commentiddel);
          //console.log(temp);
          setComments({
            current: comments.current,
            pageSize: comments.pageSize,
            total: comments.total - 1,
            totalPages: comments.totalPages,
            commentList: temp
          });

          if (props.onCommentRemoved !== undefined && props.onCommentRemoved !== null) {
            props.onCommentRemoved(comments.total);
          }
        }
      }).catch(() => {
        setMessage(new MessageModel("danger", 'Unable to connect to internet.'));
      })
      .finally(() => { setLoading(false); });
  }

  return <View style={{ flex: 1, flexDirection: "column" }}>
    <Text style={[styles.mb10, styles.textCenter, styles.fsnormal, styles.fwBold]}>Comments</Text>
    <FlatList data={comments.commentList}
      renderItem={({ item }) => {
        return (
          <View style={[styles.px10]}>
            <View style={[{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
              <MemberPicSmall member={item.postedBy} />
              <View style={{ flexGrow: 1 }}>
                <Pressable onPress={() => { props.navigation.push("Profile", { username: item.postedBy.userName }) }}>
                  <Text style={[styles.fwBold]}>{item.postedBy.name !== "" ? item.postedBy.name : item.postedBy.userName}</Text>
                </Pressable>
                <Text style={[styles.fssmall, styles.mt5]}><DateLabel value={item.postDate} /></Text>
              </View>
              {auth.myself.id === item.postedBy.id ? <Pressable onPress={() => { removeComment(item.id) }}><Text>Delete</Text>
              </Pressable> : null}
            </View>
            <Text style={[styles.fsnormal, styles.my10]}>{item.comment}</Text>
          </View>
        );
      }}
      keyExtractor={(item, index) => index.toString()} refreshing={loading} onRefresh={fetchData} initialNumToRender={10}
      onEndReached={() => {
        if (comments.totalPages >= (currentPage + 1)) {
          setCurrentPage(currentPage + 1);
        }
      }} style={{ flexGrow: 1 }}>
    </FlatList>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ height: Math.max(80, height + 10), borderTopColor: "rgba(48,35,91)", borderTopWidth: 1 }}>
      <View style={[styles.py10, styles.px5, { flex: 1, flexDirection: "row" }]}>
        <TextInput multiline={true} onChangeText={(text) => { setCommentText(text); }}
          onContentSizeChange={(event) => { setHeight(event.nativeEvent.contentSize.height); }}
          value={commenttext} style={[styles.inputwhitebg, { width: "auto", flexGrow: 1, minHeight: Math.max(35, height + 10) }]} />
        <Pressable style={[styles.px15, styles.py10]} disabled={loading} onPress={addComment}>
          <Text style={[styles.textPrimary, styles.fwBold]}>Post</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  </View>;
}
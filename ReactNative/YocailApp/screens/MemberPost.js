import { ActivityIndicator, Alert, Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, View } from "react-native";
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
import { TapGestureHandler, State, TextInput } from 'react-native-gesture-handler';
import RBSheet from 'react-native-raw-bottom-sheet';
import MemberSmallList from "./shared/MemberSmallList";
import DateLabel from "./shared/DateLabel";
import MemberPicSmall from "./shared/MemberPicSmall";
import ExpandableLabel from "./shared/ExpandableLabel";
import EditPost from "./EditPost";
import ShowMessage from "./shared/ShowMessage";
import { MaterialIcons } from '@expo/vector-icons';

export default function MemberPost(props) {
  const win = Dimensions.get('window');
  const [message, setMessage] = useState(new MessageModel());
  const [reportMessage, setReportMessage] = useState(new MessageModel());
  const SLIDER_WIDTH = Dimensions.get('window').width + 80
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
  const cl = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const doubleTapRef = useRef(null);
  const [post, setPost] = useState(props.post);
  const [loading, setLoading] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const auth = useAuth();
  const likesRBSheet = useRef();
  const sharesRBSheet = useRef();
  const commentsRBSheet = useRef();
  const postMenuRBSheet = useRef();
  const editPostRBSheet = useRef();
  const reportPostRBSheet = useRef();


  const renderOwnerPic = () => {
    if (post.owner.picFormedURL !== "")
      return { uri: post.owner.picFormedURL };
    else
      return personFill;
  }

  const renderCaourselItem = ({ item, index }) => {
    let asp = item.height / item.width;
    return (
      <Image style={{ width: win.width - 10, height: (win.width - 10) * asp }}
        source={{ uri: Utility.GetPhotoUrl(item.photo) }} />
    );
  }

  const onDoubleTapEvent = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      //console.log("double tap");
      addReaction();
    }
  };

  const deletePost = () => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/post/delete/${post.id}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    }).then(response => {
      if (response.status === 200) {
        let id = post.id;
        setMessage(new MessageModel());
        setPost(null);
        if (props.ondelete !== undefined && props.ondelete !== null) {
          props.ondelete(id);
        }
      } else {
        response.json().then(data => {
          setMessage(new MessageModel("danger", data.error));
        }).catch(err => {
          setMessage(new MessageModel("danger", "Unable to delete post."));
          console.log(err);
        });
      }
    }).catch((error) => {
      setMessage(new MessageModel("danger", "Unable to connect to internet."));
      console.log(error);
    }).finally(() => { setLoading(false); });
  }

  const ignoreMember = () => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/ignored/${post.owner.id}`, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    }).then(response => {
      if (response.status === 200) {
        if (props.onIgnoredMember !== undefined && props.onIgnoredMember !== null) {
          props.onIgnoredMember(post.owner.id);
        }
      }
    }).finally(() => { setLoading(false); });
  }

  const flagPost = (typeid) => {
    setLoading(true);
    fetch(`${Utility.GetAPIURL()}/api/post/flag/${post.id}?type=${typeid}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    }).then(response => {
      if (response.status === 200) {
        setReportMessage(new MessageModel("info", "Thank you! for reporting the post."));
      } else {
        setReportMessage(new MessageModel("danger", "Unable to process your request."));
      }
    }).catch(() => {
      setReportMessage(new MessageModel("danger", "Unable to process your request."));
    }).finally(() => { setLoading(false); });
  }

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
    setReactionLoading(true);
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
    }).finally(() => {setReactionLoading(false);});
  }

  const renderPostPic = () => {
    if (post.photos.length > 1) {
      return <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTapEvent} numberOfTaps={2}>
        <FlatList style={{width:window.width}} data={post?.photos ? post?.photos : []}
                renderItem={renderCaourselItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false} snapToStart={true}
                >
            </FlatList>
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

  if (post !== null)
    return (<View style={[styles.mb20]}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", height: 60, paddingLeft: 15, paddingRight: 15, marginBottom: 10 }}>
        <Pressable onPress={() => {
          if (props.allowProfileNavigation) {
            props.navigation.push('Profile', { username: post.owner.userName });
          }
        }}><Image source={renderOwnerPic()} style={[styles.profilepic50, styles.borderPrimary, { marginRight: 10 }]} /></Pressable>
        <View style={{ flexGrow: 1 }}>
          <Text style={[styles.textPrimary, styles.fwBold, styles.fsnormal]}>{post.owner.name !== "" ? post.owner.name : post.owner.userName}</Text>
          <Text style={[styles.textPrimary, styles.fssmall]}>{post.postDateDisplay}</Text>
        </View>
        <Pressable onPress={() => { postMenuRBSheet.current.open(); }}><Image source={moreIcon} style={{ width: 20, height: 20 }} /></Pressable>
      </View>
      {renderPostPic()}
      {/* {post.photos.length > 1 ? <Pagination dotsLength={post.photos.length}
      activeDotIndex={carouselIndex} containerStyle={{ backgroundColor: '#fff' }}
      dotStyle={{ width: 8, height: 8, borderRadius: 5, marginHorizontal: 0, padding: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      inactiveDotStyle={{ }} inactiveDotOpacity={0.4} inactiveDotScale={0.6} /> : null} */}
      <View style={[styles.py10, styles.px15, { flex: 1, flexDirection: 'row', alignItems: "flex-start", justifyContent: "center" }]}>
        <View style={[styles.px15, { flexShrink: 1 }]}>
          <Pressable onPress={addReaction} disabled={reactionLoading}>
            {reactionLoading ? <ActivityIndicator style={[styles.p5]} color={styles.textPrimary.color}/> : <Image source={post.hasReacted ? heartFill : heart} style={{ width: 20, height: 20, margin: 5, alignSelf: "center" }} />}
            
            </Pressable>
          <Pressable onPress={() => { likesRBSheet.current.open(); }}>{post.reactionCount > 0 ? <Text style={[styles.textCenter, styles.fssmall]}>{post.reactionCount} {renderLikeText(post.reactionCount)}</Text> : <Text style={[styles.textCenter, styles.fssmall]}>No Likes</Text>}</Pressable>
        </View>
        {post.acceptComment ? <View style={[styles.px15, { flexShrink: 1 }]}>
          <Pressable onPress={() => { commentsRBSheet.current.open(); }}><Image source={comment} style={{ width: 20, height: 20, margin: 5, alignSelf: "center" }} />
            {post.commentCount > 0 ? <Text style={[styles.textCenter, styles.fssmall]}>{post.commentCount} {renderCommentText(post.commentCount)}</Text> : <Text style={[styles.textCenter, styles.fssmall]}>No Comments</Text>}</Pressable>
        </View> : null}
        {post.allowShare ? <View style={[styles.px15, { flexShrink: 1 }]}>
          <Pressable onPress={() => { sharesRBSheet.current.open(); }}><Image source={share} style={{ width: 20, height: 20, margin: 5, alignSelf: "center" }} /></Pressable>
        </View> : null}
      </View>
      <View style={[styles.p10]}>
        <ExpandableLabel text={post.describe} maxLength={35} navigation={props.navigation} />
      </View>
      <RBSheet ref={likesRBSheet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
        <MemberSmallList target="reaction" postid={post.id} navigation={props.navigation} />
      </RBSheet>
      <RBSheet ref={sharesRBSheet} height={win.height * (3 / 4)} draggable={true} customStyles={styles.rbSheet}>
        <MemberSmallList postid={post?.id} navigation={props.navigation} memberid={auth.myself.id} target="share" onSelected={(id) => { if (id !== null) { sharePost(id); } }} />
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
      <RBSheet ref={postMenuRBSheet} height={post?.owner?.id === auth.myself.id ? 120 : 130} draggable={true} customStyles={styles.rbSheet}>
        <View style={{ flexDirection: "column" }}>
          {post?.owner?.id === auth.myself.id ? <>
            <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => {
              postMenuRBSheet.current.close();
              setTimeout(() => { editPostRBSheet.current.open(); },
                300
              );
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Edit </Text></Pressable>
            <Pressable disabled={loading} onPress={() => {
              Alert.alert('Confirm', 'You are about to remove this post.', [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                { text: 'OK', onPress: () => { deletePost(); } },
              ]);
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Delete</Text></Pressable>
          </> : <>
            <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => {
              postMenuRBSheet.current.close();
              ignoreMember();
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Ignore Member</Text></Pressable>
            <Pressable disabled={loading} onPress={() => {
              postMenuRBSheet.current.close();
              setTimeout(() => { reportPostRBSheet.current.open(); },
                300
              );
            }}>
              <Text style={[styles.fsxlarge, styles.textPrimary, styles.py10, styles.textCenter]}>Report Post</Text>
            </Pressable>
          </>}
        </View>
      </RBSheet>
      <RBSheet ref={editPostRBSheet} height={400} draggable={true} customStyles={styles.rbSheet}>
        <EditPost post={post} onchange={(describe, ac, as) => {
          let p = post;
          p.describe = describe;
          p.acceptComment = ac;
          p.allowShare = as;
          setPost(p);
        }} />
      </RBSheet>
      <RBSheet ref={reportPostRBSheet} height={380} draggable={true} customStyles={styles.rbSheet} onClose={() => {setReportMessage(null); }}>
        <ShowMessage modal={reportMessage} />
        <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => { flagPost(1); }}>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Abusive Content</Text>
        </Pressable>
        <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => { flagPost(2); }}>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Spam Content</Text>
        </Pressable>
        <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => { flagPost(3); }}>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Fake / Misleading</Text>
        </Pressable>
        <Pressable disabled={loading} style={[styles.borderBottom]} onPress={() => { flagPost(4); }}>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Nudity</Text>
        </Pressable>
        <Pressable disabled={loading} onPress={() => { flagPost(5); }}>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.py15, styles.textCenter]}>Promoting Violence</Text>
        </Pressable>
      </RBSheet>
    </View>);
  else
    return null;
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
    if(commenttext.trim().length === 0)
      return;
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

  return <SafeAreaView style={[styles.mb20,{ flex: 1, flexDirection: "column" }]}>
    <Text style={[styles.mb10, styles.textCenter, styles.fsnormal, styles.fwBold]}>Comments</Text>
    <FlatList data={comments.commentList}
      renderItem={({ item }) => {
        return (
          <View style={[styles.px10]}>
            <View style={[{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
              <MemberPicSmall navigation={props.navigation} member={item.postedBy} />
              <View style={{ flexGrow: 1 }}>
                <Pressable onPress={() => { props.navigation.push("Profile", { username: item.postedBy.userName }) }}>
                  <Text style={[styles.fwBold]}>{item.postedBy.name !== "" ? item.postedBy.name : item.postedBy.userName}</Text>
                </Pressable>
                <Text style={[styles.fssmall, styles.mt5]}><DateLabel value={item.postDate} /></Text>
              </View>
              {auth.myself.id === item.postedBy.id ? <Pressable disabled={loading} onPress={() => { removeComment(item.id) }}><MaterialIcons name="highlight-remove" size={25} color={styles.textSecondary.color} />
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.py10, styles.px5, { flex: 1, flexDirection: "row", alignItems:"flex-end" }]}>
        <TextInput multiline={true} onChangeText={(text) => { setCommentText(text); }}
          onContentSizeChange={(event) => { setHeight(event.nativeEvent.contentSize.height); }}
          value={commenttext} style={[styles.input, { width: styles.width100.width - 60, flexGrow: 1, minHeight: Math.max(35, height + 10), maxHeight:300 }]} />
        <Pressable style={[styles.px15, styles.py10]} disabled={loading} onPress={addComment}>
          {loading ? <ActivityIndicator size={"small"} color={styles.textPrimary.color} /> : <Text style={[styles.textPrimary, styles.fwBold]}>Post</Text>}
        </Pressable>
      
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
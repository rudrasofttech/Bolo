import { ActivityIndicator, Button, Dimensions, FlatList, Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "../authprovider";
import { useEffect, useState } from "react";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import { styles } from "../stylesheet";
import MemberPost from "./MemberPost";
import addPost from '../assets/add-post.png';
import MemberPostList from "./MemberPostList";

export default function Home(props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(new MessageModel());
  let ls = { model: null, posts: [] };
  const [model, setModel] = useState(ls.model);
  const [posts, setPosts] = useState(ls.posts);
  const [p, setCurrentPage] = useState(0);

  // const fetchData = () => {
  //   setLoading(true);
  //   fetch(`${Utility.GetAPIURL()}/api/post/feed?p=${p}&ps=10`, {
  //     method: 'get',
  //     headers: {
  //       'Authorization': `Bearer ${auth.token}`
  //     }
  //   })
  //     .then(response => {
  //       //console.log(`Response Status ${response.status}`);
  //       if (response.status === 200) {
  //         response.json().then(data => {

  //           let temp = p === 0 ? data.posts : posts;
  //           if (p !== 0) {
  //             for (var k in data.posts) {
  //               temp.push(data.posts[k]);
  //             }
  //           }
  //           setModel({
  //             current: data.current,
  //             pageSize: data.pageSize,
  //             total: data.total,
  //             totalPages: data.totalPages
  //           });
  //           setPosts(temp);
  //           //console.log(temp);
  //           //setFirstTime(false);
  //         });
  //       } else if (response.status === 401) {
  //         auth.logOut();
  //       }
  //     }).catch(error => {
  //       setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
  //       console.log(error);
  //     }).finally(() => { setLoading(false); });
  // }

  // useEffect(() => {
  //   fetchData();
  // }, [p]);

  // const postDeleted = (id) => {
  //   setPosts(posts.filter(t => t.id !== id));
  // }

  // const renderItem = ({ item }) => {
  //   return (
  //     <MemberPost post={item} navigation={props.navigation} allowProfileNavigation={true} />
  //   );
  // };


  return (
    <SafeAreaView style={[styles.container, styles.pt10]}>
      {/* {!loading && posts.length === 0 ?
        <>
          <Text style={[styles.fsxlarge, styles.textPrimary, styles.mt20, styles.mb20]}>Nothing Here</Text>
          <Image source={addPost} style={[styles.mb20, { height: 100, width: 100 }]} />
        </>
        : null} */}
        <MemberPostList search={""} viewMode={2} viewModeAllowed={false} navigation={props.navigation} allowProfileNavigation={true} />
      {/* <FlatList data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshing={loading}
        onRefresh={fetchData}
        initialNumToRender={5}
        onEndReached={() => {
          if (model.totalPages >= (p + 1)) {
            setCurrentPage(p + 1);
          }
        }}
      >
      </FlatList> */}
      <ShowMessage modal={message} />
    </SafeAreaView>
  );
}
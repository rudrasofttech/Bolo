import { SafeAreaView } from "react-native";
import { styles } from "../stylesheet";
import { useAuth } from "../authprovider";
import { useEffect, useState } from "react";
import { MessageModel } from "../model";
import MemberPost from "./MemberPost";
import { FlatList } from "react-native";
import { Utility } from "../utility";
import { useIsFocused } from "@react-navigation/native";
import { AppStorage } from "../storage";


export default function Home(props) {
  const store = new AppStorage();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(new MessageModel());
  //let ls = { model: null, posts: [] };
  const isFocused = useIsFocused();
  const [model, setModel] = useState({current : 0, pageSize:20, posts: [] });
  //const [posts, setPosts] = useState(ls.posts);
  const [p, setCurrentPage] = useState(0);


  const fetchData = () => {

    setLoading(true);

    let url = `${Utility.GetAPIURL()}/api/post/feed?p=${p}`;
    fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        console.log(`Response Status ${response.status}`);
        if (response.status === 200) {
          response.json().then(data => {
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
              totalPages: data.totalPages,
              posts: temp
            });
            store.setFeed(model);
          });
        }
      }).catch(error => {
        setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
        console.log(error);
      }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    if (model.posts.length === 0) {
      (async () => {
        let  i = await store.getFeed();
        setModel(i);
      })();
    }
    if (model.current !== p || model.posts.length === 0)
      fetchData();
  }, [p, isFocused]);


  return <SafeAreaView style={[styles.container, styles.pt20, styles.mt10]}>
    <FlatList data={model.posts}
      renderItem={({ item }) => {
        return (
          <MemberPost post={item} navigation={props.navigation} allowProfileNavigation={true} ondelete={(id) => {
            setPosts(posts.filter(t => t.id !== id));
          }} onIgnoredMember={(userid) => {
            let temp = posts.filter(t => t.owner.id !== userid);
            setPosts(temp);
          }} />
        );
      }}
      keyExtractor={(item, index) => index.toString()} refreshing={loading} onRefresh={() => { setCurrentPage(0); fetchData(); }}

      onEndReached={() => {
        if (model.totalPages > (p + 1)) {
          setCurrentPage(p + 1);
        }
      }} scrollEnabled={props.scrollEnabled !== undefined ? props.scrollEnabled : true}>
    </FlatList>
  </SafeAreaView>;
}
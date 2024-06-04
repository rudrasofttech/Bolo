import { useEffect, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import ShowMessage from "./shared/ShowMessage";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native";
import MemberPost from "./MemberPost";
import { styles } from "../stylesheet";
import { Utility } from "../utility";

export default function Hashtag(props) {
  const { hashtag } = props.route.params;
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(new MessageModel());
  let ls = { model: null, posts: [] };
  const [model, setModel] = useState(ls.model);
  const [posts, setPosts] = useState(ls.posts);
  const [p, setCurrentPage] = useState(0);

  const fetchData = () => {
    setLoading(true);
    //console.log(hashtag);
    fetch(`${Utility.GetAPIURL()}/api/post?q=${encodeURIComponent(hashtag)}&p=${p}&ps=10`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            console.log(data);
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
    fetchData();
  }, [p]);

  const renderItem = ({ item }) => {
    return (
      <MemberPost post={item} navigation={props.navigation} allowProfileNavigation={true} />
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <FlatList data={posts}
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
      </FlatList>
      <ShowMessage modal={message} />
    </SafeAreaView>
  );
}
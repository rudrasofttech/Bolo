import { useEffect, useState } from "react";
import { useAuth } from "../authprovider";
import { MessageModel } from "../model";
import { Utility } from "../utility";
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, Text, View } from "react-native";
import MemberPost from "./MemberPost";
import MasonryList from "react-native-masonry-list";


import { styles } from "../stylesheet";

export default function MemberPostList(props) {
    const auth = useAuth();
    const window = Dimensions.get('window');
    const gridColumns = props.gridColumns !== undefined ? props.gridColumns : 2;
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(new MessageModel());
    //const [q, setSearchKeyword] = useState(props.search);
    let ls = { model: null, posts: [] };
    //if (props.search === "userfeed" && localStorage.getItem("userfeed") != null)
    //    ls = JSON.parse(localStorage.getItem("userfeed"))
    //else if (props.search === "explore" && localStorage.getItem("explore") != null)
    //    ls = JSON.parse(localStorage.getItem("explore"));
    const [firsttime, setFirstTime] = useState(true);
    const [model, setModel] = useState(ls.model);
    const [posts, setPosts] = useState(ls.posts);
    const [p, setCurrentPage] = useState(0);
    const [viewMode, setViewMode] = useState(props.viewMode);
    const viewModeAllowed = props.viewModeAllowed;
    const [post, setPost] = useState(null);


    const selectPost = (id) => {
        setViewMode(2);
    }

    const fetchData = () => {
        //console.log(props.search);
        setLoading(true);
        let url = `${Utility.GetAPIURL()}/api/post?q=${encodeURIComponent(props.search)}&p=${p}`;

        if (props.search === "userfeed")
            url = `${Utility.GetAPIURL()}/api/post/feed?p=${p}`;
        else if (props.search === "explore")
            url = `${Utility.GetAPIURL()}/api/post/explore?p=${p}`;
        fetch(url, {
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
                        setFirstTime(false);
                    });
                }
            }).catch(error => {
                setMessage(new MessageModel('danger', 'Unable to contact server, Please check your internet connection.'));
                console.log(error);
            }).finally(() => { setLoading(false); });
    }

    useEffect(() => {
        fetchData();
    }, [props.search, p]);

    const renderItem = ({ item }) => {
        
        return (
            <MemberPost post={item} navigation={props.navigation} allowProfileNavigation={props.allowProfileNavigation} ondelete={(id) => {
                setPosts(posts.filter(t => t.id !== id));
            }} onIgnoredMember={(userid) => {
                let temp = posts.filter(t => t.owner.id !== userid);
                setPosts(temp);
            }} />
        );
    };

    //   [
    //     // Can be used with different image object fieldnames.
    //     // Ex. source, source.uri, uri, URI, url, URL
    //     { uri: "https://luehangs.site/pic-chat-app-images/beautiful-blond-blonde-hair-478544.jpg" },
    //     // IMPORTANT: It is REQUIRED for LOCAL IMAGES
    //     // to include a dimensions field with the
    //     // actual width and height of the image or
    //     // it will throw an error.
    //     // { source: require("yourApp/image.png"),
    //     //     dimensions: { width: 1080, height: 1920 }
    //     // },
    //     // "width" & "height" is an alternative to the dimensions
    //     // field that will also be acceptable.
    //     // { source: require("yourApp/image.png"),
    //     //     width: 1080,
    //     //     height: 1920 },
    //     { source: { uri: "https://luehangs.site/pic-chat-app-images/beautiful-beautiful-women-beauty-40901.jpg" } },
    //     { uri: "https://luehangs.site/pic-chat-app-images/animals-avian-beach-760984.jpg",
    //         // Optional: Adding a dimensions field with
    //         // the actual width and height for REMOTE IMAGES
    //         // will help improve performance.
    //         dimensions: { width: 1080, height: 1920 } },
    //     { URI: "https://luehangs.site/pic-chat-app-images/beautiful-blond-fishnet-stockings-48134.jpg",
    //         // Optional: Does not require an id for each
    //         // image object, but is for best practices.
    //         id: "blpccx4cn" },
    //     { url: "https://luehangs.site/pic-chat-app-images/beautiful-beautiful-woman-beauty-9763.jpg" },
    //     { URL: "https://luehangs.site/pic-chat-app-images/attractive-balance-beautiful-186263.jpg" },
    // ]

    const renderPosts = () => {
         
        if (viewMode === 1) {
            let temp = [];
            for (let k in posts) {
                if (posts[k].photos.length > 0) {
                    temp.push({ uri: Utility.GetPhotoUrl(posts[k].photos[0].photo), id: posts[k].id, dimensions: { width: posts[k].photos[0].width, height: posts[k].photos[0].height } });
                }
            }
            return (
                <FlatList style={{width:window.width}} data={temp}
                renderItem={({ item }) => {
                    return (
                        <View key={item.id}>
                            <Image source={{uri : item.uri}} style={{resizeMode:"cover",width:window.width / gridColumns, height: window.width / gridColumns}} />
                        </View>
                    );
                }}
                numColumns={gridColumns}
                keyExtractor={(item, index) => index.toString()}
                refreshing={loading}
                onRefresh={fetchData}
                initialNumToRender={5}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} scrollEnabled={props.scrollEnabled !== undefined ? props.scrollEnabled : true}>
            </FlatList>
            );
        }
        else if (viewMode === 2) {
            return <FlatList data={posts}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshing={loading}
                onRefresh={fetchData}
                initialNumToRender={5}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} scrollEnabled={props.scrollEnabled !== undefined ? props.scrollEnabled : true}>
            </FlatList>;
        }
    }

    return <>
        {viewModeAllowed ? <View style={[styles.py10, styles.borderBottom, { flex: 1, flexDirection: "row" }]}>
            <Pressable onPress={() => { setViewMode(1); }} style={{ flexGrow: 1 }}><Text style={viewMode === 1 ? [styles.fwBold, styles.fsnormal, styles.textCenter, { flexGrow: 1 }] : [styles.textCenter, styles.fsnormal, { flexGrow: 1 }]}>Grid</Text></Pressable>
            <Pressable onPress={() => { setViewMode(2); }} style={{ flexGrow: 1 }}><Text style={viewMode === 2 ? [styles.fwBold, styles.fsnormal, styles.textCenter, { flexGrow: 1 }] : [styles.textCenter, styles.fsnormal, { flexGrow: 1 }]}>List</Text></Pressable>
        </View> : null}
        {loading ? <ActivityIndicator /> : null}
        {renderPosts()}
    </>;

}

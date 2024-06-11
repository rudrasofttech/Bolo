import { useEffect, useState } from "react";
import { useAuth } from "../../authprovider";
import { Utility } from "../../utility";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { styles } from "../../stylesheet";
import { SearchBar } from "@rneui/themed";
import MemberSmallRow from "./MemberSmallRow";

export default function MemberSmallList(props) {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState(null);
    const [q, setKeywords] = useState('');
    const [p, setCurrentPage] = useState(0);
    const [reactions, setReactions] = useState([]);
    const [followList, setFollowList] = useState([]);
    let url = props.target === 'reaction' ? `${Utility.GetAPIURL()}/api/post/reactionlist/${props.postid}` : (props.target === 'follower' || props.target === 'share') ? `${Utility.GetAPIURL()}/api/Follow/followerlist/` : props.target === 'following' ? `${Utility.GetAPIURL()}/api/Follow/followinglist/` : '';


    const followerRemoved = (id) => {
        let items = [];
        for (let k in followList) {
            let p = followList[k];
            if (p.follower.id !== id) {
                items.push(p);
            }
        }
        setFollowList(items);
    }

    const hashTagRemove = (tag) => {
        fetch(`${Utility.GetAPIURL()}/api/Follow/UnfollowHashtag?q=${encodeURIComponent(tag)}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    let items = followList.filter(t => t.tag !== tag);
                    setFollowList(items);
                }
            });
    }

    const fetchData = () => {
        setLoading(true);
        fetch(`${url}?q=${encodeURIComponent(q)}&p=${p}`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        //console.log(data);
                        if (props.target === 'reaction') {
                            let temp = p === 0 ? [] : reactions;
                            for (let k in data.reactions) {
                                temp.push(data.reactions[k]);
                            }

                            setModel({
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            });
                            setReactions(temp);

                        } else if (props.target === 'follower' || props.target === 'following' || props.target === "share") {
                            let temp = p === 0 ? [] : followList;
                            for (let k in data.followList) {
                                temp.push(data.followList[k]);
                            }
                            setModel({
                                current: data.current,
                                pageSize: data.pageSize,
                                total: data.total,
                                totalPages: data.totalPages
                            });
                            setFollowList(temp);
                        }
                    });
                }
            }).finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchData();
    }, [q, p]);

    const renderPosts = () => {
        if (props.target === 'reaction') {
            return <FlatList data={reactions}
                renderItem={({ item }) => {
                    return (
                        <MemberSmallRow navigation={props.navigation} key={item.member.id} member={item.member} status={p.status} />
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} style={[styles.my10, styles.px10]}>
            </FlatList>;
        }
        else if (props.target === 'follower') {
            return <FlatList data={followList}
                renderItem={({ item }) => {
                    return (
                        <MemberSmallRow token={auth.token} key={item.follower.id} member={item.follower} status={item.status}
                            showRemove={auth.myself.id === props.memberid ? true : false}
                            removed={(id) => { followerRemoved(id); }}
                        />
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                refreshing={loading}
                onRefresh={fetchData}
                initialNumToRender={10}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} style={[styles.my10, styles.px10]}>
            </FlatList>;
        }
        else if (props.target === 'share') {
            return <FlatList data={followList}
                renderItem={({ item }) => {
                    return (
                        <MemberSmallRow token={auth.token} key={item.follower.id} member={item.follower} status={item.status}
                            showRemove={false} showShare={true} onShare={(id) => {
                                if (props.onSelected !== undefined && props.onSelected !== null)
                                    props.onSelected(id);
                            }}
                        />
                    );
                }}
                keyExtractor={(item, index) => index.toString()}
                initialNumToRender={10}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} style={[styles.my10, styles.px10]}>
            </FlatList>;
        }
        else if (props.target === 'following') {
            return <FlatList data={followList}
                renderItem={({ item }) => {
                    if (item.tag !== null && item.tag !== "") {
                        return (<View key={item.id} style={[styles.py10,{flexDirection:"row"}]} >
                            <View style={{ flexGrow: 1 }}>
                                <Pressable onPress={() => { navigation.push("Hashtag", { Hashtag: item.tag }); }} ><Text style={[styles.fsnormal, styles.fwBold]}>{item.tag}</Text></Pressable>
                            </View>
                            <View>
                                <Pressable style={styles.unfollowButton} onPress={() => { hashTagRemove(item.tag); }}><Text style={[styles.textWhite]}>Unfollow</Text></Pressable>
                            </View>
                        </View>);
                    } else {
                        return (<MemberSmallRow token={auth.token} key={item.following.id} member={item.following} status={item.status} />);
                    }
                }}
                keyExtractor={(item, index) => index.toString()}
                refreshing={loading}
                onRefresh={fetchData}
                initialNumToRender={10}
                onEndReached={() => {
                    if (model.totalPages >= (p + 1)) {
                        setCurrentPage(p + 1);
                    }
                }} style={[styles.my10, styles.px10]}>
            </FlatList>;
        }
    }

    return <View style={{flex:1,flexDirection:"column"}}>
        <SearchBar placeholder="Type Here..."
          onChangeText={(e) => {
            setCurrentPage(0);
            setKeywords(e);
        }}  value={q} lightTheme={true}></SearchBar>
        {renderPosts()}
        {loading ? <ActivityIndicator color={styles.textPrimary.color} size="small" /> : null}
    </View>;

}
 
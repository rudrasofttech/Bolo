import { ActivityIndicator, Dimensions, Image, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { styles } from "../stylesheet";
import { useAuth } from "../authprovider";
import { SearchBar } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import personFill from '../assets/person-fill.png';
import close from '../assets/close.png';
import { AppStorage } from "../storage";

export default function Search({ navigation }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [items, setItems] = useState([]);
  const store = new AppStorage();

  const updateSearch = (search) => {
    setSearch(search);
  };

  const auth = useAuth();

  useEffect(() => {
    if (search === "") {
      (async () => {
        setItems(await store.getVisitedSearchResults());
      })();
      return;
    }
    setLoading(true);
    let url = `${Utility.GetAPIURL()}/api/search?q=${search.replace("#", "")}`;

    fetch(url, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(response => {
        if (response.status === 401) {
          auth.logout();
        } else if (response.status === 200) {
          response.json().then(data => {
            setItems(data);
          });
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  const removeItemFromList = async (value) => {
    
    let items2 = [];
    if(value.hashtag !== null){
      items2 = items.filter(t => t.member !== null || t.hashtag.tag !== value.hashtag.tag);
    }else{
      items2 = items.filter(t => t.hashtag !== null || t.member.userName !== value.member.userName);
    }
    setItems(items2);
    await store.removeVisitedSearchResults(value);
  }

  const renderOwnerPic = (member) => {
    if (member.picFormedURL !== "")
      return { uri: member.picFormedURL };
    else
      return personFill;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.width100]} >
        <SearchBar placeholder="Type Here..."
          onChangeText={updateSearch}
          value={search} lightTheme={true}></SearchBar>
      </View>
      {items.length > 0 ? <ScrollView style={styles.width100}>
        {items.map(i => <>{i.hashtag !== null ?
          <Pressable onPress={async () => {
            await store.updateVisitedSearchResults(i);
            navigation.push('Hashtag', { hashtag: `#${i.hashtag.tag}` });
          }}>
            <View style={[styles.borderBottom, {flex:1, flexDirection: "row", alignItems:"center" }]}>
              <View style={{flexGrow:1}}><Text style={[styles.p15, styles.textPrimary, styles.fwBold, styles.fsnormal]}>#{i.hashtag.tag}</Text></View>
              <Pressable style={[styles.p10, { width: 40 }]} onPress={async () => { await removeItemFromList(i); }} >
                <Image source={close} style={{ width: 10, height: 10 }} />
              </Pressable>
            </View>
          </Pressable>
          :
          <Pressable onPress={async () => {
            await store.updateVisitedSearchResults(i);
            navigation.push('Profile', { username: i.member.userName });
          }}>
            <View style={[styles.borderBottom, styles.alignCenter, styles.p10, {  flexDirection: "row", alignItems:"center" }]}>
              <Image source={renderOwnerPic(i.member)} style={[styles.profilepic30, styles.borderPrimary, { marginRight: 10, borderWidth:0 }]} />
              <View style={{ flexGrow: 1 }}>
                <Text style={[styles.textPrimary, styles.fwBold, styles.fsnormal]}>{i.member.name !== "" ? i.member.name : i.member.userName}</Text>
              </View>
              <Pressable style={[styles.p10]} onPress={async () => { await removeItemFromList(i); }} >
                <Image source={close} style={{ width: 10, height: 10 }} />
              </Pressable>
              {/* <View>
              <FollowButton member={i.member} notify={(memberid, status) => { console.log(`Member ID: ${memberid} , Status : ${status}`) }}/>
            </View> */}
            </View>
          </Pressable>}
        </>)}
      </ScrollView> : null}
      <ShowMessage modal={message} />
    </SafeAreaView>
  );
}
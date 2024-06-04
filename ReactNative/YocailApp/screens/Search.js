import { ActivityIndicator, Dimensions, Image, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { styles } from "../stylesheet";
import { useAuth } from "../authprovider";
import { SearchBar } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Utility } from "../utility";
import ShowMessage from "./shared/ShowMessage";
import personFill from '../assets/person-fill.png';
import FollowButton from "./shared/FollowButton";


export default function Search({ navigation }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [items, setItems] = useState([]);

  const updateSearch = (search) => {
    setSearch(search);
  };

  const auth = useAuth();

  useEffect(() => {
    if (search === "") {
      setItems([]);
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

  const renderOwnerPic = (member) => {
    if (member.picFormedURL !== "")
      return { uri: member.picFormedURL };
    else
      return personFill;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: "#fcfcfc", width: Dimensions.get('window').width }} >
        <SearchBar placeholder="Type Here..."
          onChangeText={updateSearch}
          value={search} lightTheme={true}></SearchBar>
      </View>
      {items.length > 0 ? <ScrollView style={styles.width100}>
        {items.map(i => <>{i.hashtag !== null ?
          <Pressable onPress={() => { navigation.push('Hashtag', { hashtag: `#${i.hashtag.tag}` }) }}>
            <View style={[styles.px15, styles.mb10, styles.mt10, { flex: 1, flexDirection: "row", alignItems: "center", height: 40 }]}>
              <Text style={[styles.textPrimary, styles.fwBold, styles.fsnormal]}>#{i.hashtag.tag}</Text>
            </View>
          </Pressable>
          :
          <Pressable onPress={() => { navigation.push('Profile', { username: i.member.userName }) }}>
            <View style={[styles.px15, styles.mb10, styles.mt10, { flex: 1, flexDirection: "row", alignItems: "center", height: 40 }]}>
              <Image source={renderOwnerPic(i.member)} style={[styles.profilepic40, styles.borderPrimary, { marginRight: 10 }]} />
              <View style={{ flexGrow: 1 }}>
                <Pressable onPress={() => { navigation.push('Profile', { username: i.member.userName }) }}><Text style={[styles.textPrimary, styles.fwBold, styles.fsnormal]}>{i.member.name !== "" ? i.member.name : i.member.userName}</Text></Pressable>
              </View>
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
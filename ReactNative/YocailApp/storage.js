import AsyncStorage from "@react-native-async-storage/async-storage";

export class AppStorage {

  setItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(
        key,
        value,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  getItem = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      // Error retrieving data
      console.log("GetItem Error");
      console.log(error);
      return null;
    }
  };

  getFeed = async () => {
    let temp = { current: 0, pageSize: 20, total: 0, totalPages: 0, posts: [] };
    try {
      const value = await AsyncStorage.getItem("feed");
      if (value === null || value === "")
        return temp;
      else
        return JSON.parse(value);
    } catch (error) {
      // Error retrieving data
      console.log("GetItem Error");
      console.log(error);
      return temp;
    }
  }

  setFeed = async (value) => {
    try {
      await AsyncStorage.setItem(
        "feed",
        JSON.stringify(value),
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  setContacts = async (value) => {
    try {
      await AsyncStorage.setItem(
        "contacts",
        JSON.stringify(value),
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  getContacts = async () => {
    let temp = [];
    try {
      const value = await AsyncStorage.getItem("feed");
      if (value === null || value === "")
        return temp;
      else
        return JSON.parse(value);
    } catch (error) {
      // Error retrieving data
      console.log("GetItem Error");
      console.log(error);
      return temp;
    }
  }

  removeItem = async (key) => {
    await AsyncStorage.removeItem(key);
  };

  clear = async () => {
    await AsyncStorage.clear();
  }

  getVisitedSearchResults = async () => {
    let data = await this.getItem("visitedsearchresults");
    let items = [];
    if (data !== null)
      items = JSON.parse(data);
    return items;
  }

  updateVisitedSearchResults = async (value) => {
    let data = await this.getItem("visitedsearchresults");
    let items = [];
    if (data !== null)
      items = JSON.parse(data);

    if (value.hashtag !== null) {
      if (items.filter(t => t.hashtag !== null && t.hashtag.tag == value.hashtag.tag).length === 0) {
        items.push(value);
        await this.setItem("visitedsearchresults", JSON.stringify(items));
        return;
      }
    }
    if (value.member !== null) {
      if (items.filter(t => t.member !== null && t.member.userName === value.member.userName).length === 0) {
        items.push(value);
        await this.setItem("visitedsearchresults", JSON.stringify(items));
      }
    }
  }

  removeVisitedSearchResults = async (value) => {
    let data = await this.getItem("visitedsearchresults");
    let items = [];
    if (data !== null)
      items = JSON.parse(data);

    let items2 = [];
    if (value.hashtag !== null) {
      items2 = items.filter(t => t.member !== null || t.hashtag.tag !== value.hashtag.tag);
    } else {
      items2 = items.filter(t => t.hashtag !== null || t.member.userName !== value.member.userName);
    }
    await this.setItem("visitedsearchresults", JSON.stringify(items2));
    return items2;
  }
}
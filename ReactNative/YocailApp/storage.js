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

  removeItem = async (key) => {
    await AsyncStorage.removeItem(key);
  };

  clear = async () => {
    await AsyncStorage.clear();
  }
}
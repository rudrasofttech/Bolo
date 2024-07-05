import { Dimensions, StyleSheet } from "react-native";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 0,
    paddingTop: 25,
    backgroundColor: '#ffffff',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  width100: {
    width: Dimensions.get('window').width
  },
  width90: {
    width: Dimensions.get('window').width - 10
  },
  textDanger: {
    color: 'red'
  },
  fwBold: {
    fontWeight: "bold"
  },
  textSuccess: {
    color: "rgb(25, 135, 84)"
  },
  textPrimary: {
    color: '#30235B'
  },
  textWhite: {
    color: "#ffffff"
  },
  textEnd: {
    textAlign: "right"
  },
  textSecondary: {
    color: "#616161"
  },
  textCenter: {
    textAlign: "center"
  },
  textStart: {
    textAlign: "left"
  },
  bgPrimary: {
    backgroundColor: '#30235B'
  },
  borderPrimary: {
    borderColor: '#30235B'
  },
  borderBottom: {
    borderBottomColor: "rgba(97,97,97,0.5)",
    borderBottomWidth: 0.5
  },
  alignCenter: {
    alignSelf: "center"
  },
  profilepic100: {
    width: 120, height: 120, resizeMode: "contain", borderWidth: 0, borderRadius: 10
  },
  profilepic50: {
    width: 50, height: 50, resizeMode: "contain", borderWidth: 0, borderRadius: 10
  },
  profilepic40: {
    width: 40, height: 40, resizeMode: "contain", borderWidth: 0, borderRadius: 10
  },
  profilepic30: {
    width: 30, height: 30, resizeMode: "contain", borderWidth: 2, borderRadius: 10
  },
  input: {
    backgroundColor: "#ffffff",
    width: "auto",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 10 : 3,
    paddingHorizontal : Platform.OS === "ios" ? 10 : 8
  },
  inputwhitebg: {
    backgroundColor: "#ffffff",
    width: "100%",
    borderWidth: 0,
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 10 : 5,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  lightButton: {

    borderRadius: 15,
    backgroundColor: "#ffffff",
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  primaryButton: {
    color: "#ffffff",
    borderRadius: 15,
    backgroundColor: "#30235B",
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  followButton: {
    color: "#ffffff",
    borderRadius: 15,
    backgroundColor: "#30235B",
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 25,
    width: 75
  },
  unfollowButton: {
    color: "#ffffff",
    borderRadius: 15,
    backgroundColor: "#30235B",
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 26,
    width: 75
  },
  textUnderline: {
    textDecorationStyle: "solid"
  },
  label: { color: '#30235B', 
    fontSize: Platform.OS === "ios" ? 15 : 13, 
    marginBottom: Platform.OS === "ios" ? 10 : 8, 
    marginTop: Platform.OS === "ios" ? 5 : 3, 
    textTransform: "capitalize" },
  mb5: { marginBottom: Platform.OS === "ios" ? 5 : 3 },
  mb10: { marginBottom: Platform.OS === "ios" ? 10 : 8 },
  mb15: { marginBottom: Platform.OS === "ios" ? 15 : 13 },
  mb20: { marginBottom: Platform.OS === "ios" ? 20 : 18 },
  mx10: { marginHorizontal: Platform.OS === "ios" ? 10 : 8 },
  mx15: { marginHorizontal: Platform.OS === "ios" ? 15 : 13 },
  mx20: { marginHorizontal: Platform.OS === "ios" ? 20 : 18 },
  my10: { marginVertical: Platform.OS === "ios" ? 10 : 8 },
  my15: { marginVertical: Platform.OS === "ios" ? 15 : 13 },
  my20: { marginVertical: Platform.OS === "ios" ? 20 : 18 },
  mt5: { marginTop: Platform.OS === "ios" ? 5 : 3 },
  mt10: { marginTop: Platform.OS === "ios" ? 10 : 8 },
  mt15: { marginTop: Platform.OS === "ios" ? 15 : 13 },
  mt20: { marginTop: Platform.OS === "ios" ? 20 : 18 },
  p5: { padding: Platform.OS === "ios" ? 5 : 3 },
  p10: { padding: Platform.OS === "ios" ? 10 : 8 },
  p15: { padding: Platform.OS === "ios" ? 15 : 13 },
  p20: { padding: Platform.OS === "ios" ? 20 : 18 },
  px5: { paddingHorizontal: Platform.OS === "ios" ? 5 : 3 },
  px10: { paddingHorizontal: Platform.OS === "ios" ? 10 : 8 },
  px15: { paddingHorizontal: Platform.OS === "ios" ? 15 : 13 },
  px20: { paddingHorizontal: Platform.OS === "ios" ? 20 : 18 },
  py5: { paddingVertical: Platform.OS === "ios" ? 5 : 3 },
  py10: { paddingVertical: Platform.OS === "ios" ? 10 : 8 },
  py15: { paddingVertical: Platform.OS === "ios" ? 15 : 13 },
  py20: { paddingVertical: Platform.OS === "ios" ? 20 : 18 },
  pb5: { paddingBottom: Platform.OS === "ios" ? 5 : 3 },
  pb10: { paddingBottom: Platform.OS === "ios" ? 10 : 8 },
  pb15: { paddingBottom: Platform.OS === "ios" ? 15 : 13 },
  pb20: { paddingBottom: Platform.OS === "ios" ? 20 : 18 },
  pt5: { paddingTop: Platform.OS === "ios" ? 5 : 3 },
  pt10: { paddingTop: Platform.OS === "ios" ? 10 : 8 },
  pt15: { paddingTop: Platform.OS === "ios" ? 15 : 13 },
  pt20: { paddingTop: Platform.OS === "ios" ? 20 : 18 },
  fssmall: { fontSize:  Platform.OS === "ios" ? 13 : 11 },
  fsnormal: { fontSize:  Platform.OS === "ios" ? 16 : 14 },
  fslarge: { fontSize: Platform.OS === "ios" ? 17 : 15 },
  fsxlarge: { fontSize: Platform.OS === "ios" ? 23 : 20 },
  rbSheet: {
    wrapper: { backgroundColor: "rgba(0,0,0,0.6)" },
    container: { borderTopLeftRadius: 15, borderTopRightRadius: 15 }
  }
});
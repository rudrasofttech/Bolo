import { Dimensions, StyleSheet } from "react-native";

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
  textSuccess : {
    color:"rgb(25, 135, 84)"
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
  borderBottom:{
    borderBottomColor:"rgba(97,97,97,0.5)",
    borderBottomWidth:0.5
  },
  alignCenter:{
    alignSelf:"center"
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
  inputwhitebg: {
    backgroundColor: "#ffffff",
    width: "100%",
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  lightButton : {
    
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
    backgroundColor: "#D23200",
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
    backgroundColor: "#7BAAF9",
    padding: 0,
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
  textUnderline: {
    textDecorationStyle: "solid"
  },
  label: { color: '#30235B', fontSize: 15, marginBottom: 10, textTransform: "capitalize" },
  mb5: { marginBottom: 5 },
  mb10: { marginBottom: 10 },
  mb15: { marginBottom: 15 },
  mb20: { marginBottom: 20 },
  mx10: { marginHorizontal: 10 },
  mx15: { marginHorizontal: 15 },
  mx20: { marginHorizontal: 20 },
  my10: { marginVertical: 10 },
  my15: { marginVertical: 15 },
  my20: { marginVertical: 20 },
  mt5: { marginTop: 5 },
  mt10: { marginTop: 10 },
  mt15: { marginTop: 15 },
  mt20: { marginTop: 20 },
  p5: { padding: 5 },
  p10: { padding: 10 },
  p15: { padding: 15 },
  p20: { padding: 20 },
  px5: { paddingHorizontal: 5 },
  px10: { paddingHorizontal: 10 },
  px15: { paddingHorizontal: 15 },
  px20: { paddingHorizontal: 20 },
  py5: { paddingVertical: 5 },
  py10: { paddingVertical: 10 },
  py15: { paddingVertical: 15 },
  py20: { paddingVertical: 20 },
  pb5: { paddingBottom: 5 },
  pb10: { paddingBottom: 10 },
  pb15: { paddingBottom: 15 },
  pb20: { paddingBottom: 20 },
  pt5: { paddingTop: 5 },
  pt10: { paddingTop: 10 },
  pt15: { paddingTop: 15 },
  pt20: { paddingTop: 20 },
  fssmall: { fontSize: 13 },
  fsnormal: { fontSize: 16 },
  fslarge: { fontSize: 17 },
  fsxlarge: { fontSize: 23 },
  rbSheet : {
    wrapper: {backgroundColor:"rgba(0,0,0,0.6)"},
    container: {borderTopLeftRadius:15, borderTopRightRadius:15}
  }
});
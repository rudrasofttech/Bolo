import { SafeAreaView } from "react-native";
import { styles } from "../stylesheet";
import MemberPostList from "./MemberPostList";

export default function Home(props) {
  return (
    <SafeAreaView style={[styles.container, styles.pt20, styles.mt10]}>
      <MemberPostList search={""} viewMode={2} viewModeAllowed={false} navigation={props.navigation} allowProfileNavigation={true} />
    </SafeAreaView>
  );
}
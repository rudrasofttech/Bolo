import WebView from "react-native-webview";

export default function Webpage(props) {
    const { link } = props.route.params;
    return <WebView source={{uri : link.url}} style={{flex:1}}></WebView>
}
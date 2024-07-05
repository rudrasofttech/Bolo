import { useState } from "react";
import MemborPostList from './MemberPostList';
import { SafeAreaView } from "react-native";
import { styles } from "../stylesheet";

export default function ViewPost(props){
    const { search, posts, postIndex , model } = props.route?.params ? props.route?.params : {search : 'explore', posts : null, model : null, postIndex : null};
    
    return <SafeAreaView style={[styles.container, styles.width100, {paddingTop:0}]}>
        <MemborPostList search={search} viewMode={2} viewModeAllowed={false} posts={posts} postIndex={postIndex} model={model} />
        </SafeAreaView>;
}
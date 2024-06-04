import { Button, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../authprovider";
import { useEffect } from "react";

export default function Splash({ navigation }) {
    const auth = useAuth();

    useEffect(() => {
        console.log("call validate");
        auth.validate();

    }, []);
    return (
        <SafeAreaView>
            <Text>Splash Screen</Text>
            <Button
                title="Go to Login"
                onPress={() =>
                    navigation.navigate('Login', {})
                }
            />
        </SafeAreaView>
    );
}
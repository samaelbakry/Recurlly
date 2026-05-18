import {SplashScreen, Stack} from "expo-router";
import "../global.css"
import {useFonts} from "expo-font";
import {useEffect} from "react";

export default function RootLayout() {
    const [FontsLoaded] = useFonts({
        "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
        "sans-extraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    })

    useEffect(() => {
        if (FontsLoaded) {
            SplashScreen.hideAsync()
        }
    }, [FontsLoaded]);

    if(!FontsLoaded) return null
    return <Stack screenOptions={{headerShown: false}}/>;
}

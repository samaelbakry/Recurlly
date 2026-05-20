import {ClerkProvider} from "@clerk/expo";
import {tokenCache} from "@clerk/expo/token-cache";
import {SplashScreen, Stack} from "expo-router";
import "../global.css"
import {useFonts} from "expo-font";
import {useEffect} from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

const clerkPublishableKey = publishableKey;

export default function RootLayout() {
    const [FontsLoaded] = useFonts({
        "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
        "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    })

    useEffect(() => {
        if (FontsLoaded) {
            SplashScreen.hideAsync()
        }
    }, [FontsLoaded]);

    if(!FontsLoaded) return null
    return (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
            <Stack screenOptions={{headerShown: false}}/>
        </ClerkProvider>
    );
}

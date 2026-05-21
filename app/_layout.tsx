import {ClerkProvider, useAuth} from "@clerk/expo";
import {tokenCache} from "@clerk/expo/token-cache";
import {SplashScreen, Stack} from "expo-router";
import "../global.css";
import {useFonts} from "expo-font";
import {useEffect} from "react";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const {isLoaded: authLoaded} = useAuth();

    const [fontsLoaded] = useFonts({
        "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
        "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded && authLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, authLoaded]);

    if (!fontsLoaded || !authLoaded) return null;

    return <Stack screenOptions={{headerShown: false}}/>;
}

export default function RootLayout() {
    return (
        <ClerkProvider
            publishableKey={clerkPublishableKey!}
            tokenCache={tokenCache}
        >
            <InitialLayout/>
        </ClerkProvider>
    );
}
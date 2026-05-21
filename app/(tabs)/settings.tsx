import {useClerk, useUser} from '@clerk/expo'
import {useRouter} from "expo-router";
import {ActivityIndicator, Pressable, Text, View} from 'react-native'
import React, {useState} from 'react'
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {clsx} from "clsx";

const SafeAreaView = styled(RNSafeAreaView)

export default function Settings() {
    const {signOut} = useClerk()
    const {user} = useUser()
    const router = useRouter()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [signOutError, setSignOutError] = useState<string | null>(null)

    const handleSignOut = async () => {
        if (isSigningOut) return

        setIsSigningOut(true)
        setSignOutError(null)

        try {
            await signOut()
            router.replace("/signin")
        } catch {
            setSignOutError("Could not log out. Please try again.")
            setIsSigningOut(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background p-5 pb-28">
            <View className="gap-6">
                <View>
                    <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
                    <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
                        Manage your account access and preferences.
                    </Text>
                </View>

                <View className="rounded-2xl border border-border bg-card p-5">
                    <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
                        Signed in as
                    </Text>
                    <Text className="mt-2 text-lg font-sans-bold text-primary">
                        {user?.primaryEmailAddress?.emailAddress ?? "Your account"}
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Log out"
                    className={clsx("auth-button flex-row justify-center gap-2", isSigningOut && "auth-button-disabled")}
                    disabled={isSigningOut}
                    onPress={handleSignOut}
                >
                    {isSigningOut && <ActivityIndicator color="#081126"/>}
                    <Text className="auth-button-text">{isSigningOut ? "Logging out..." : "Log out"}</Text>
                </Pressable>
                {!!signOutError && <Text className="auth-error text-center">{signOutError}</Text>}
            </View>
        </SafeAreaView>
    )
}

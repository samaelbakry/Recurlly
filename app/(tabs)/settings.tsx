import {useClerk, useUser} from '@clerk/expo'
import {Pressable, Text, View} from 'react-native'
import React from 'react'
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

export default function Settings() {
    const {signOut} = useClerk()
    const {user} = useUser()

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
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

                <Pressable className="auth-button" onPress={() => signOut()}>
                    <Text className="auth-button-text">Sign out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

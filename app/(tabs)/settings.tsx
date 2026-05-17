import {Text} from 'react-native'
import React from 'react'
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

export default function Settings() {
    return (
        <SafeAreaView className="flex-1 p-5">
            <Text>Settings</Text>
        </SafeAreaView>
    )
}

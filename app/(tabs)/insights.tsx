import {Text} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

export default function Insights() {
    return (
        <SafeAreaView className="p-5 flex-1 ">
            <Text>Insights</Text>
        </SafeAreaView>
    );
}
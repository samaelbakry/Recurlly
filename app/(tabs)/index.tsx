import "../../global.css"
import {Text} from "react-native";
import {Link} from "expo-router"
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <Text className="text-xl font-bold text-success m-2">
                Welcome to Nativewind!
            </Text>
            <Link href={"/(auth)/signin"}>GO TO SIGNIN</Link>
        </SafeAreaView>
    );
}

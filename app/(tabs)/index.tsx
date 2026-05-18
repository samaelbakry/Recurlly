import "@/global.css"
import {FlatList, Image, Text, View} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images"
import {HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils/currencyFormat"
import dayjs from "dayjs";
import ListHeadings from "@/app/components/ListHeadings";
import UpcomingSubscriptionCard from "@/app/components/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <View className="home-header">
                <View className="home-user">
                    <Image source={images.avatar} className="home-avatar"/>
                    <Text className="home-user-name">{HOME_USER.name}</Text>
                </View>
                <Image source={icons.add} className="home-add-icon"/>
            </View>
            <View className="home-balance-card">
                <Text className="home-balance-label">
                    Balance
                </Text>
                <View className="home-balance-row">
                    <Text className="home-balance-amount">
                        {formatCurrency(HOME_BALANCE.amount)}
                    </Text>
                    <Text className="home-balance-date">
                        {dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}
                    </Text>
                </View>
            </View>
            <View>
                <ListHeadings title="UpComing"/>
                <FlatList
                    data={UPCOMING_SUBSCRIPTIONS}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    renderItem=
                        {({item}) => (<UpcomingSubscriptionCard {...item} />)}
                    ListEmptyComponent={<Text className="home-empty-state"> No upcoming subscriptions </Text>}
                />
            </View>
            <View>
                <ListHeadings title="All Subscriptions"/>
            </View>
        </SafeAreaView>
    );
}

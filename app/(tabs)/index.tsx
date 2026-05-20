import "@/global.css"
import {useUser} from "@clerk/expo";
import {FlatList, Image, Text, View} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images"
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils/currencyFormat"
import dayjs from "dayjs";
import ListHeadings from "@/app/components/ListHeadings";
import UpcomingSubscriptionCard from "@/app/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/app/components/SubscriptionCard";
import {useState} from "react";

const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
    const {user} = useUser()
    const [expandSubscriptionId, setExpandSubscriptionId] = useState<string | null>(null)
    const email = user?.primaryEmailAddress?.emailAddress ?? "Your account"
    const avatarSource = user?.imageUrl ? {uri: user.imageUrl} : images.avatar

    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
                            <View className="home-user">
                                <Image source={avatarSource} className="home-avatar"/>
                                <View className="ml-4 min-w-0 flex-1">
                                    <Text className="text-sm font-sans-semibold text-muted-foreground">
                                        Welcome back
                                    </Text>
                                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xl font-sans-bold text-primary">
                                        {email}
                                    </Text>
                                </View>
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
                        <View className="mb-5">
                            <ListHeadings title="UpComing"/>
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                renderItem=
                                    {({item}) => (<UpcomingSubscriptionCard {...item} />)}
                                ListEmptyComponent={<Text className="home-empty-state"> No upcoming
                                    subscriptions </Text>}
                            />
                        </View>
                        <ListHeadings title="All Subscriptions"/>
                    </>
                )}
                data={HOME_SUBSCRIPTIONS}
                extraData={expandSubscriptionId}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View className="h-4"></View>}
                showsHorizontalScrollIndicator={false}
                renderItem=
                    {({item}) =>
                        (<SubscriptionCard {...item} expanded={expandSubscriptionId === item.id}
                                           onPress={() => setExpandSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}/>)

                    }/>
        </SafeAreaView>
    );
}

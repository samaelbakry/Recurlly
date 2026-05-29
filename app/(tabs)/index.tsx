import "@/global.css"
import {useUser} from "@clerk/expo";
import {Alert, FlatList, Image, Text, View} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {router} from "expo-router";
import images from "@/constants/images"
import {formatCurrency} from "@/lib/utils/currencyFormat"
import dayjs from "dayjs";
import ListHeadings from "@/app/components/ListHeadings";
import UpcomingSubscriptionCard from "@/app/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/app/components/SubscriptionCard";
import {useMemo, useState} from "react";
import CreateSubscriptionModal from "@/src/components/CreateSubscriptionModal";
import {useSubscriptions} from "@/src/context/SubscriptionsContext";
import {getMonthlyTotal, getUpcomingSubscriptions} from "@/lib/utils/subscriptionInsights";

const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
    const {user} = useUser()
    const [expandSubscriptionId, setExpandSubscriptionId] = useState<string | null>(null)
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
    const {subscriptions, addSubscription, deleteSubscription} = useSubscriptions()
    const email = user?.primaryEmailAddress?.emailAddress ?? "Your account"
    const avatarSource = user?.imageUrl ? {uri: user.imageUrl} : images.avatar
    const monthlyTotal = useMemo(() => getMonthlyTotal(subscriptions), [subscriptions])
    const upcomingSubscriptions = useMemo(() => getUpcomingSubscriptions(subscriptions, 5), [subscriptions])
    const nextRenewalDate = upcomingSubscriptions[0]?.renewalDate

    const handleCreateSubscription = (subscription: Subscription) => {
        addSubscription(subscription)
        setExpandSubscriptionId(subscription.id)
    }

    const handleDeleteSubscription = (subscription: Subscription) => {
        Alert.alert(
            "Delete subscription",
            `Delete ${subscription.name}?`,
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteSubscription(subscription.id)
                        setExpandSubscriptionId((currentId) => (currentId === subscription.id ? null : currentId))
                    },
                },
            ],
        )
    }

    return (
        <SafeAreaView className="flex-1 p-5 bg-background">
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className="home-header">
                            <View className="home-user flex-1 pr-4">
                                <Image source={avatarSource} className="home-avatar"/>
                                <View className="ml-4 min-w-0 flex-1">
                                    <Text className="text-sm font-sans-semibold text-muted-foreground">
                                        Welcome back
                                    </Text>
                                    <Text numberOfLines={1} ellipsizeMode="tail"
                                          className="text-xl font-sans-bold text-primary">
                                        {email}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="home-balance-card">
                            <Text className="home-balance-label">
                                Balance
                            </Text>
                            <View className="home-balance-row">
                                <Text className="home-balance-amount">
                                    {formatCurrency(monthlyTotal)}
                                </Text>
                                <Text className="home-balance-date">
                                    {nextRenewalDate ? dayjs(nextRenewalDate).format("DD/MM") : "--/--"}
                                </Text>
                            </View>
                        </View>
                        <View className="mb-5">
                            <ListHeadings title="UpComing" onViewAllPress={() => router.push("/subscriptions")}/>
                            <FlatList
                                data={upcomingSubscriptions}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                renderItem=
                                    {({item}) => (<UpcomingSubscriptionCard {...item} />)}
                                ListEmptyComponent={<Text className="home-empty-state"> No upcoming
                                    subscriptions </Text>}
                            />
                        </View>
                        <ListHeadings
                            title="All Subscriptions"
                            onViewAllPress={() => router.push("/subscriptions")}
                            onAddPress={() => setIsCreateModalVisible(true)}
                        />
                    </>
                )}
                data={subscriptions}
                extraData={expandSubscriptionId}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View className="h-4"></View>}
                showsHorizontalScrollIndicator={false}
                renderItem=
                    {({item}) =>
                        (<SubscriptionCard {...item} expanded={expandSubscriptionId === item.id}
                                           onPress={() => setExpandSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
                                           onDeletePress={() => handleDeleteSubscription(item)}/>)

                    }/>
            <CreateSubscriptionModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onCreate={handleCreateSubscription}
            />
        </SafeAreaView>
    );
}

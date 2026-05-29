import {Alert, FlatList, Text, TextInput, View} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {useMemo, useState} from "react";
import SubscriptionCard from "@/app/components/SubscriptionCard";
import {useSubscriptions} from "@/src/context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView)

export default function Subscriptions() {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
    const {subscriptions, deleteSubscription} = useSubscriptions()

    const filteredSubscriptions = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()

        if (!normalizedQuery) {
            return subscriptions
        }

        return subscriptions.filter((subscription) => {
            const searchableText = [
                subscription.name,
                subscription.plan,
                subscription.category,
                subscription.billing,
                subscription.status,
                subscription.paymentMethod,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()

            return searchableText.includes(normalizedQuery)
        })
    }, [searchQuery, subscriptions])

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
                        setExpandedSubscriptionId((currentId) => (currentId === subscription.id ? null : currentId))
                    },
                },
            ],
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <FlatList
                className="flex-1"
                contentContainerClassName="px-5 pb-8"
                data={filteredSubscriptions}
                extraData={expandedSubscriptionId}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListHeaderComponent={
                    <View className="subscriptions-header">
                        <Text className="subscriptions-title">Subscriptions</Text>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search subscriptions"
                            placeholderTextColor="rgba(0, 0, 0, 0.45)"
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="subscriptions-search"
                        />
                        <Text className="subscriptions-count">
                            {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? "subscription" : "subscriptions"}
                        </Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View className="h-4"/>}
                ListEmptyComponent={() => (
                    <View className="subscriptions-empty">
                        <Text className="subscriptions-empty-title">No subscriptions found</Text>
                        <Text className="subscriptions-empty-copy">Try a different name, category, plan, or payment
                            method.</Text>
                    </View>
                )}
                renderItem={({item}) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
                        onDeletePress={() => handleDeleteSubscription(item)}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}

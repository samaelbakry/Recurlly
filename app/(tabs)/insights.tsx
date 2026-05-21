import {icons} from "@/constants/icons";
import {colors, components} from "@/constants/themes";
import {useSubscriptions} from "@/src/context/SubscriptionsContext";
import {formatCurrency} from "@/lib/utils/currencyFormat";
import dayjs from "dayjs";
import {router} from "expo-router";
import {styled} from "nativewind";
import {useMemo, useState} from "react";
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {
    getMonthlyTotal,
    getUpcomingSubscriptions,
    getWeeklySpending,
    isBillableSubscription,
} from "@/lib/utils/subscriptionInsights";

const SafeAreaView = styled(RNSafeAreaView);

export default function Insights() {
    const {subscriptions} = useSubscriptions();
    const insets = useSafeAreaInsets();
    const [selectedDayIndex, setSelectedDayIndex] = useState(3);
    const [historyLimit, setHistoryLimit] = useState(3);

    const monthlyTotal = useMemo(() => getMonthlyTotal(subscriptions), [subscriptions]);
    const activeSubscriptionsCount = useMemo(
        () => subscriptions.filter(isBillableSubscription).length,
        [subscriptions],
    );

    const monthlyDelta = activeSubscriptionsCount > 0 ? "+12%" : "0%";

    const weeklySpending = useMemo(() => getWeeklySpending(subscriptions), [subscriptions]);

    const maxWeeklyAmount = Math.max(...weeklySpending.map((item) => item.amount), 40);

    const upcomingSubscriptions = useMemo(() => getUpcomingSubscriptions(subscriptions, 3), [subscriptions]);

    const visibleHistory = subscriptions.slice(0, historyLimit);
    const selectedDayAmount = weeklySpending[selectedDayIndex]?.amount ?? 0;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={[
                    styles.content,
                    {paddingBottom: components.tabBar.height + Math.max(insets.bottom, components.tabBar.horizontalInset) + 24},
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.replace("/")}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Back to home"
                        style={({pressed}) => [styles.circleButton, pressed && styles.pressed]}
                    >
                        <Image source={icons.back} style={styles.headerIcon} resizeMode="contain"/>
                    </Pressable>
                    <Text style={styles.title}>Monthly Insights</Text>
                    <Pressable
                        onPress={() => router.push("/settings")}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Open settings"
                        style={({pressed}) => [styles.circleButton, pressed && styles.pressed]}
                    >
                        <Image source={icons.menu} style={styles.headerIcon} resizeMode="contain"/>
                    </Pressable>
                </View>

                <View style={styles.sectionHead}>
                    <View>
                        <Text style={styles.sectionEyebrow}>This week</Text>
                        <Text style={styles.sectionTitle}>Upcoming</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push("/subscriptions")}
                        accessibilityRole="button"
                        style={({pressed}) => [styles.actionButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.actionText}>View all</Text>
                    </Pressable>
                </View>

                <View style={styles.chartCard}>
                    <View style={styles.gridLayer} pointerEvents="none">
                        {[0, 1, 2, 3].map((line) => (
                            <View key={line} style={styles.gridLine}/>
                        ))}
                    </View>
                    <View style={styles.axisLabels} pointerEvents="none">
                        {["45", "35", "25", "5", "0"].map((label) => (
                            <Text key={label} style={styles.axisText}>{label}</Text>
                        ))}
                    </View>
                    <View style={styles.barsRow}>
                        {weeklySpending.map((item) => {
                            const isSelected = item.index === selectedDayIndex;
                            const barHeight = Math.max((item.amount / maxWeeklyAmount) * 148, 18);

                            return (
                                <Pressable
                                    key={item.day}
                                    onPress={() => setSelectedDayIndex(item.index)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${item.day} spending ${formatCurrency(item.amount)}`}
                                    style={({pressed}) => [styles.barButton, pressed && styles.pressed]}
                                >
                                    {isSelected && (
                                        <View style={styles.tooltip}>
                                            <Text style={styles.tooltipText}>{formatCurrency(selectedDayAmount)}</Text>
                                        </View>
                                    )}
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: isSelected ? colors.accent : colors.primary,
                                            },
                                        ]}
                                    />
                                    <Text style={styles.dayLabel}>{item.day}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    <View style={styles.summaryTile}>
                        <Text style={styles.summaryLabel}>Monthly</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(monthlyTotal)}</Text>
                    </View>
                    <View style={styles.summaryTile}>
                        <Text style={styles.summaryLabel}>Active</Text>
                        <Text style={styles.summaryValue}>{activeSubscriptionsCount}</Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => router.push("/subscriptions")}
                    accessibilityRole="button"
                    style={({pressed}) => [styles.expensePanel, pressed && styles.pressed]}
                >
                    <View>
                        <Text style={styles.expenseTitle}>Expenses</Text>
                        <Text style={styles.expenseDate}>{dayjs().format("MMMM YYYY")}</Text>
                    </View>
                    <View style={styles.expenseValues}>
                        <Text style={styles.expenseAmount}>-{formatCurrency(monthlyTotal)}</Text>
                        <Text style={styles.expenseDelta}>{monthlyDelta}</Text>
                    </View>
                </Pressable>

                <View style={styles.sectionHead}>
                    <View>
                        <Text style={styles.sectionEyebrow}>Recent payments</Text>
                        <Text style={styles.sectionTitle}>History</Text>
                    </View>
                    <Pressable
                        onPress={() => setHistoryLimit((currentLimit) => (currentLimit >= subscriptions.length ? 3 : subscriptions.length))}
                        accessibilityRole="button"
                        style={({pressed}) => [styles.actionButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.actionText}>{historyLimit >= subscriptions.length ? "Show less" : "View all"}</Text>
                    </Pressable>
                </View>

                <View style={styles.historyList}>
                    {visibleHistory.map((subscription) => (
                        <Pressable
                            key={subscription.id}
                            onPress={() => router.push("/subscriptions")}
                            accessibilityRole="button"
                            style={({pressed}) => [
                                styles.historyCard,
                                {backgroundColor: subscription.color ?? colors.card},
                                pressed && styles.pressed,
                            ]}
                        >
                            <View style={styles.historyMain}>
                                <Image source={subscription.icon} style={styles.historyIcon} resizeMode="contain"/>
                                <View style={styles.historyCopy}>
                                    <Text numberOfLines={1} style={styles.historyName}>{subscription.name}</Text>
                                    <Text numberOfLines={1} style={styles.historyDate}>
                                        {dayjs(subscription.renewalDate).isValid()
                                            ? dayjs(subscription.renewalDate).format("MMMM D, HH:mm")
                                            : subscription.billing}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.historyValues}>
                                <Text style={styles.historyPrice}>{formatCurrency(subscription.price, subscription.currency)}</Text>
                                <Text style={styles.historyBilling}>per {subscription.billing.toLowerCase()}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {upcomingSubscriptions.length > 0 && (
                    <View style={styles.renewalRail}>
                        {upcomingSubscriptions.map((subscription) => (
                            <Pressable
                                key={subscription.id}
                                onPress={() => router.push("/subscriptions")}
                                accessibilityRole="button"
                                style={({pressed}) => [styles.renewalChip, pressed && styles.pressed]}
                            >
                                <Image source={subscription.icon} style={styles.renewalIcon} resizeMode="contain"/>
                                <View style={styles.renewalCopy}>
                                    <Text numberOfLines={1} style={styles.renewalName}>{subscription.name}</Text>
                                    <Text style={styles.renewalDate}>
                                        {subscription.renewalDate ? dayjs(subscription.renewalDate).format("MMM D") : "--"}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingTop: 6,
    },
    header: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    circleButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.16)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.card,
    },
    headerIcon: {
        width: 24,
        height: 24,
        tintColor: colors.primary,
    },
    title: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 20,
    },
    sectionHead: {
        marginTop: 20,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionEyebrow: {
        marginBottom: 4,
        color: colors.mutedForeground,
        fontFamily: "sans-semibold",
        fontSize: 12,
    },
    sectionTitle: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 20,
    },
    actionButton: {
        minWidth: 82,
        minHeight: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.16)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        backgroundColor: colors.card,
    },
    actionText: {
        color: colors.primary,
        fontFamily: "sans-semibold",
        fontSize: 14,
    },
    chartCard: {
        minHeight: 252,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.08)",
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 18,
        overflow: "hidden",
    },
    gridLayer: {
        position: "absolute",
        left: 42,
        right: 16,
        top: 36,
        height: 142,
        justifyContent: "space-between",
    },
    gridLine: {
        borderTopWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(8, 17, 38, 0.12)",
    },
    axisLabels: {
        position: "absolute",
        left: 17,
        top: 31,
        height: 174,
        justifyContent: "space-between",
    },
    axisText: {
        color: colors.primary,
        fontFamily: "sans-medium",
        fontSize: 13,
    },
    barsRow: {
        marginLeft: 34,
        height: 212,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    barButton: {
        width: 36,
        height: 212,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    bar: {
        width: 12,
        borderRadius: 8,
    },
    dayLabel: {
        marginTop: 14,
        color: colors.primary,
        fontFamily: "sans-medium",
        fontSize: 13,
    },
    tooltip: {
        position: "absolute",
        top: 0,
        minWidth: 38,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.08)",
        paddingHorizontal: 7,
        paddingVertical: 5,
        alignItems: "center",
    },
    tooltipText: {
        color: colors.accent,
        fontFamily: "sans-bold",
        fontSize: 13,
    },
    summaryRow: {
        marginTop: 14,
        flexDirection: "row",
        gap: 12,
    },
    summaryTile: {
        flex: 1,
        minHeight: 82,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.08)",
        backgroundColor: colors.card,
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    summaryLabel: {
        color: colors.mutedForeground,
        fontFamily: "sans-semibold",
        fontSize: 13,
    },
    summaryValue: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 22,
    },
    expensePanel: {
        marginTop: 12,
        minHeight: 78,
        borderRadius: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    expenseTitle: {
        color: colors.background,
        fontFamily: "sans-bold",
        fontSize: 18,
    },
    expenseDate: {
        marginTop: 8,
        color: colors.background,
        fontFamily: "sans-semibold",
        fontSize: 13,
    },
    expenseValues: {
        alignItems: "flex-end",
    },
    expenseAmount: {
        color: colors.background,
        fontFamily: "sans-bold",
        fontSize: 18,
    },
    expenseDelta: {
        marginTop: 8,
        color: colors.background,
        fontFamily: "sans-semibold",
        fontSize: 13,
    },
    historyList: {
        gap: 12,
    },
    historyCard: {
        minHeight: 84,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.08)",
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    historyMain: {
        minWidth: 0,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    historyIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    historyCopy: {
        minWidth: 0,
        flex: 1,
    },
    historyName: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 17,
    },
    historyDate: {
        marginTop: 6,
        color: "rgba(8, 17, 38, 0.72)",
        fontFamily: "sans-medium",
        fontSize: 14,
    },
    historyValues: {
        flexShrink: 0,
        alignItems: "flex-end",
    },
    historyPrice: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 17,
    },
    historyBilling: {
        marginTop: 8,
        color: "rgba(8, 17, 38, 0.72)",
        fontFamily: "sans-medium",
        fontSize: 14,
    },
    renewalRail: {
        marginTop: 16,
        gap: 10,
    },
    renewalChip: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(8, 17, 38, 0.08)",
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    renewalIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
    },
    renewalCopy: {
        minWidth: 0,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    renewalName: {
        flex: 1,
        color: colors.primary,
        fontFamily: "sans-semibold",
        fontSize: 14,
    },
    renewalDate: {
        color: colors.primary,
        fontFamily: "sans-bold",
        fontSize: 14,
    },
    pressed: {
        opacity: 0.72,
    },
});

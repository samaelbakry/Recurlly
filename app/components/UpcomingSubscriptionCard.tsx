import {Image, Text, View} from 'react-native'
import React from 'react'
import {formatCurrency} from "@/lib/utils/currencyFormat";

export default function UpcomingSubscriptionCard({name, icon, daysLeft, price, currency}: UpcomingSubscription) {
    return (
        <View className="upcoming-card px-2">
            <View className="upcoming-row">
                <Image source={icon} className='upcoming-icon'/>
                <View>
                    <Text className="upcoming-price">
                        {formatCurrency(price, currency)}
                    </Text>
                    <Text className="upcoming-meta" numberOfLines={1}>
                        {daysLeft > 1 ? `${daysLeft} Days Left` : "Last Day"}
                    </Text>
                </View>
            </View>
            <Text className="upcoming-name">
                {name}
            </Text>
        </View>
    )
}

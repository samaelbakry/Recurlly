import {Image, Pressable, Text, View} from 'react-native'
import React from 'react'
import {icons} from "@/constants/icons";

export default function ListHeadings({
    title,
    onViewAllPress,
    onAddPress,
    viewAllLabel = "View all",
}: ListHeadingProps) {
    return (
        <View className="list-head">
            <Text className='list-title'>{title}</Text>
            <View className="list-actions">
                {onViewAllPress && (
                    <Pressable
                        className='list-action'
                        onPress={onViewAllPress}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={viewAllLabel}
                    >
                        <Text className='list-action-text'>
                            {viewAllLabel}
                        </Text>
                    </Pressable>
                )}
                {onAddPress && (
                    <Pressable
                        className="list-add-action"
                        onPress={onAddPress}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Add subscription"
                    >
                        <Image source={icons.add} className="list-add-icon"/>
                    </Pressable>
                )}
            </View>
        </View>
    )
}

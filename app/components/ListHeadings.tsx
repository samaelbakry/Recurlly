import {Text, TouchableOpacity, View} from 'react-native'
import React from 'react'

export default function ListHeadings({title}: ListHeadingProps) {
    return (
        <View className="list-head">
            <Text className='list-title'>{title}</Text>
            <TouchableOpacity className='list-action'>
                <Text className='list-action-text'>
                    view all
                </Text>
            </TouchableOpacity>
        </View>
    )
}

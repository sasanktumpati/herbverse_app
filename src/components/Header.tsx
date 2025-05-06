import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top }} className="bg-herb-surface">
      <View className="px-4 h-14 flex flex-row items-center justify-between">
        <Text className="font-bold text-lg text-herb-primaryDark">HerbVerse</Text>
      </View>
    </View>
  );
}
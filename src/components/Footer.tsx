import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Footer() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="bg-herb-surface"
      style={{ paddingBottom: bottom }}
    >
      <View className="py-4 items-center">
        <Text className="text-herb-textSecondary text-center text-xs">
          © {new Date().getFullYear()} HerbVerse
        </Text>
      </View>
    </View>
  );
}
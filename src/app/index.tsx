import React from "react";
import { View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Page() {
  return (
    <View className="flex-1">
      <Header />
      <HomeScreen />
      <Footer />
    </View>
  );
}

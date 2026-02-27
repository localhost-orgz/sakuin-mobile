import { Stack } from "expo-router";
import { View } from "react-native";
import FloatingTabBar from "../../components/FloatingTabBar"; // your custom component

export default function MainLayout() {
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingTabBar />
    </View>
  );
}

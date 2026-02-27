import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Home 🏠</Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-xl"
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text className="text-white font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

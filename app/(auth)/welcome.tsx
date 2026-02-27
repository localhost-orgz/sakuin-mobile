import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold mb-4">Welcome 👋</Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-xl"
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text className="text-white font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

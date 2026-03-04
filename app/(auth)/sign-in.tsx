import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Sign In Screen</Text>
      <Link href={"/(main)/home"}>
        <Text>Home</Text>
      </Link>
    </View>
  );
}

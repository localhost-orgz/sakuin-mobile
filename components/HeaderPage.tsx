import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderPage = ({ title }: { title: string }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#00bf71", "#00a878"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        paddingHorizontal: 20,
      }}
    >
      <Text className="text-4xl text-white font-bold tracking-wide">
        {title}
      </Text>
    </LinearGradient>
  );
};

export default HeaderPage;

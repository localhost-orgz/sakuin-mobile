import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const HeaderTransfer = () => {
  return (
    <View className="px-5">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between py-4">
        <TouchableOpacity onPress={() => router.back()} className="z-10">
          <Text className="text-[#00bf71] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center">
          <Text className="text-xl font-bold text-[#1a1f36]">Transfer</Text>
        </View>
        <View className="w-10" />
      </View>
    </View>
  );
};

export default HeaderTransfer;

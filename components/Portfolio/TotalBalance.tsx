import { Eye, EyeOff } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TotalBalance = ({ isBalanceShow, onBalanceShow }: any) => {
  return (
    <View className="flex-1 p-5 bg-white -mt-5 mx-8 rounded-md">
      <Text className="text-md text-[#9ca3af] font-semibold">
        Total Simpanan
      </Text>
      <View className="flex flex-row items-center gap-2">
        <View className="flex flex-row mt-3 gap-1 items-end">
          <Text className="text-xl font-semibold">Rp</Text>
          <Text className="text-3xl font-semibold">
            {isBalanceShow ? "3.000.000" : "•••••••••"}
          </Text>
        </View>
        <Pressable
          className="mt-3 p-1"
          onPress={() => onBalanceShow(!isBalanceShow)}
        >
          {isBalanceShow ? <Eye size={25} /> : <EyeOff size={25} />}
        </Pressable>
      </View>
    </View>
  );
};

export default TotalBalance;

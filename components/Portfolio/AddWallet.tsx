import { Plus } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const AddWallet = () => {
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 5,
      }}
      className="w-[48%] h-40 bg-slate-200/50 border-[2px] flex justify-center items-center border-dashed border-slate-400  relative rounded-3xl mb-5"
    >
      <View className="p-2 rounded-full bg-slate-400/30">
        <Plus strokeWidth={4} color={"#90a1b9"} />
      </View>
      <Text className="mt-3 font-semibold text-slate-400">Add Wallet</Text>
    </View>
  );
};

export default AddWallet;

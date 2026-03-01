import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const IncomeExpenseCard = ({ isBalanceShow }: { isBalanceShow: boolean }) => {
  return (
    <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-5">
      <View className="w-[170px] h-[80px] bg-white rounded-lg p-3">
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Income
        </Text>
        <View className="flex flex-row mt-2 items-center">
          <Text className="font-semibold">Rp</Text>
          <Text className="text-xl font-semibold">
            {isBalanceShow ? "3.340.000" : "•••••••"}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-1 mt-[6px]">
          <TrendingUp size={13} color={"#00BC7D"} />
          <Text className="text-sm text-[#00BC7D]">{`${isBalanceShow ? "50" : "••"}% from last month`}</Text>
        </View>
      </View>
      <View className="w-[170px] h-[80px] bg-white rounded-lg p-3">
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Expense
        </Text>
        <View className="flex flex-row mt-2 items-center">
          <Text className="font-semibold">Rp</Text>
          <Text className="text-xl font-semibold">
            {isBalanceShow ? "3.340.000" : "•••••••"}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-1 mt-[6px]">
          <TrendingDown size={13} color={"#bc1900"} />
          <Text className="text-sm text-[#bc1900]">{`${isBalanceShow ? "50" : "••"}% from last month`}</Text>
        </View>
      </View>
    </View>
  );
};

export default IncomeExpenseCard;

import { TrendingUp } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";

const IncomeExpenseCard = ({
  isBalanceShow,
  loading,
}: {
  isBalanceShow: boolean;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-5">
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
          className="w-[170px] bg-white rounded-lg p-3 gap-2"
        >
          <Skeleton width={50} height={10} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          <View className="mt-1 gap-2">
            <Skeleton width={110} height={22} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
            <Skeleton width={80} height={12} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          </View>
        </View>
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
          className="w-[170px] bg-white rounded-lg p-3 gap-2"
        >
          <Skeleton width={50} height={10} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          <View className="mt-1 gap-2">
            <Skeleton width={110} height={22} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
            <Skeleton width={80} height={12} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-5">
      <View className="w-[170px] bg-white rounded-lg p-3">
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
        <View className="mt-2">
          <View className="flex flex-row items-center">
            <Text className="font-semibold">Rp</Text>
            <Text className="text-xl font-semibold">
              {isBalanceShow ? "3.340.000" : "•••••••"}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <TrendingUp size={13} color={"#00BC7D"} />
            <Text className="text-sm text-[#00BC7D]">{`${isBalanceShow ? "50" : "••"}% from last month`}</Text>
          </View>
        </View>
      </View>
      <View className="w-[170px] bg-white rounded-lg p-3">
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
        <View className="mt-2">
          <View className="flex flex-row items-center">
            <Text className="font-semibold">Rp</Text>
            <Text className="text-xl font-semibold">
              {isBalanceShow ? "3.340.000" : "•••••••"}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <TrendingUp size={13} color={"#00BC7D"} />
            <Text className="text-sm text-[#00BC7D]">{`${isBalanceShow ? "50" : "••"}% from last month`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IncomeExpenseCard;

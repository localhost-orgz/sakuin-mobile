import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import React from "react";
import { Text, View } from "react-native";

const RecentTransactionItem = ({ item }: any) => {
  const getCategoryDetail = (categoryId: string) => {
    return TOP_SPENDING_CATEGORIES.find((cat) => cat.id === categoryId);
  };
  const categoryDetail = getCategoryDetail(item.categoryId);
  return (
    <View
      key={item.id}
      className="flex-1 py-3 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between"
    >
      <View className="flex flex-row items-center gap-3">
        <View
          style={{ backgroundColor: categoryDetail?.bgColor }}
          className="w-[50px] h-[50px] bg-[#FFF4E5] flex justify-center items-center rounded-full"
        >
          <Text className="text-lg">{categoryDetail?.icon}</Text>
        </View>

        <View className="flex flex-col">
          <Text className="text-lg font-semibold mb-1">{item.title}</Text>
          <Text className="text-sm text-[#9ca3af]">{item.date}</Text>
        </View>
      </View>
      <View className="flex flex-col items-end">
        <Text className="text-lg text-red-500 font-semibold mb-1">{`-Rp${item.amount}`}</Text>
        <Text className="text-sm text-[#9ca3af]">{item.wallet}</Text>
      </View>
    </View>
  );
};

export default RecentTransactionItem;

import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import React from "react";
import { Text, View } from "react-native";

const RecentTransactionItem = ({ item }: any) => {
  const getCategoryDetail = (categoryId: string) => {
    return TOP_SPENDING_CATEGORIES.find((cat) => cat.id === categoryId);
  };
  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Biar gak ada ,00 di belakang 💸
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const categoryDetail = getCategoryDetail(item.categoryId);
  return (
    <View
      key={item.id}
      className="flex-1 py-2.5 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between"
    >
      <View className="flex flex-row items-center gap-3">
        <View
          style={{ backgroundColor: categoryDetail?.bgColor }}
          className="w-[45px] h-[45px] bg-[#FFF4E5] flex justify-center items-center rounded-full"
        >
          <Text className="text-md">{categoryDetail?.icon}</Text>
        </View>

        <View className="flex flex-col gap-1">
          <Text className="text-md font-semibold">{item.title}</Text>
          <Text className="text-xs text-[#9ca3af]">{item.date}</Text>
        </View>
      </View>
      <View className="flex flex-col items-end">
        <Text className="text-md text-red-500 font-semibold mb-1">{`-${formatRupiah(item.amount)}`}</Text>
        <Text className="text-sm text-[#9ca3af]">{item.wallet}</Text>
      </View>
    </View>
  );
};

export default RecentTransactionItem;

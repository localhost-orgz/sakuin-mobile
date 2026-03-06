import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { WalletCards } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export interface WalletItem {
  id: string;
  bank: string;
  type: string;
  balance: string;
  transactions: string;
  themeId: string;
}

interface WalletCardProps {
  item: WalletItem;
  isBalanceShow: boolean;
  onBalanceShow: (show: boolean) => void;
}

const WalletCard = ({
  item,
  isBalanceShow,
  onBalanceShow,
}: WalletCardProps) => {
  const { theme } = useWalletTheme(item.themeId as WalletThemeId);
  const formatAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
    return amount.toString();
  };

  const formatBalanceToAmount = (balanceStr: string): string => {
    const cleanNumber = parseFloat(
      balanceStr.replace(/\./g, "").replace(",", "."),
    );

    return formatAmount(cleanNumber);
  };
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
        backgroundColor: theme.cardColorBack,
      }}
      className="w-[48%] h-40 relative rounded-3xl mb-5"
    >
      <View className="flex-1 h-full items-center gap-1 py-2 m-3.5 rounded-2xl bg-white">
        <View className="h-1 w-[85%] bg-gray-300 rounded-full"></View>
        <View className="h-1 w-[85%] bg-gray-300 rounded-full"></View>
        <View className="h-1 w-[50%] self-start ml-3 bg-gray-300 rounded-full"></View>
      </View>
      <View
        style={{ backgroundColor: theme.cardColor }}
        className="w-full h-[75%] absolute bottom-0 p-3 rounded-3xl flex justify-between"
      >
        <View
          style={{ backgroundColor: theme.cardColorBack }}
          className="w-9 h-9 flex items-center justify-center rounded-lg"
        >
          <WalletCards size={20} color={"white"} />
        </View>
        <View className="gap-0.5`">
          <Text className="text-white font-semibold">{item.bank}</Text>
          <View className="flex flex-row items-end gap-0.5">
            <Text className="text-white font-semibold text-sm mb-1">Rp</Text>
            <Text className="text-white font-bold text-lg">
              {isBalanceShow ? item.balance : "•••••••••"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WalletCard;

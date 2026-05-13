import { Link } from "expo-router";
import { WalletCards } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme"; //

// Update Interface sesuai Response API
export interface WalletItem {
  _id: string;
  name: string;
  balance: number;
  color: string;
  wallet_id: string;
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
  const { theme } = useWalletTheme(
    (item.color.toLowerCase() as WalletThemeId) || "ocean",
  );

  // Format ribuan Indonesia (contoh: 30.000.000)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <Link
      href={{
        pathname: "/(others)/detailWallet",
        params: { walletId: item._id },
      }}
      asChild
    >
      <Pressable
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 5,
          backgroundColor: theme.cardColorBack, // Menggunakan warna gelap gradient sebagai base shadow
        }}
        className="w-[48%] h-40 relative rounded-3xl mb-5"
      >
        {/* Dekorasi kartu bagian atas (Visual kertas) */}
        <View className="flex-1 h-full items-center gap-1 py-2 m-3.5 rounded-2xl bg-white">
          <View className="h-1 w-[85%] bg-gray-300 rounded-full"></View>
          <View className="h-1 w-[85%] bg-gray-300 rounded-full"></View>
          <View className="h-1 w-[50%] self-start ml-3 bg-gray-300 rounded-full"></View>
        </View>

        {/* Bagian utama kartu */}
        <View
          style={{ backgroundColor: theme.cardColor }}
          className="w-full h-[75%] absolute bottom-0 p-3 rounded-3xl flex justify-between"
        >
          {/* Icon Box */}
          <View
            style={{ backgroundColor: theme.cardColorBack }}
            className="w-9 h-9 flex items-center justify-center rounded-lg"
          >
            <WalletCards size={20} color={"white"} />
          </View>

          {/* Info Saldo */}
          <View className="gap-0.5">
            <Text className="text-white font-semibold">{item.name}</Text>
            <View className="flex flex-row items-end gap-0.5">
              <Text className="text-white font-semibold text-sm mb-1">Rp</Text>
              <Text className="text-white font-bold text-lg">
                {isBalanceShow ? formatCurrency(item.balance) : "•••••••••"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default WalletCard;

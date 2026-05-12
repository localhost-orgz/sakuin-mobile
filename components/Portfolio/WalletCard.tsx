import { Link } from "expo-router";
import { WalletCards } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

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

// Data Theme untuk pemetaan warna
const THEME_OPTIONS = [
  { id: "green", gradient: ["#00bf71", "#009e5f"], accent: "#00bf71" },
  { id: "blue", gradient: ["#3b82f6", "#1d4ed8"], accent: "#3b82f6" },
  { id: "violet", gradient: ["#8b5cf6", "#6d28d9"], accent: "#8b5cf6" },
  { id: "rose", gradient: ["#f43f5e", "#be123c"], accent: "#f43f5e" },
  { id: "amber", gradient: ["#f59e0b", "#b45309"], accent: "#f59e0b" },
  { id: "slate", gradient: ["#334155", "#0f172a"], accent: "#64748b" },
];

const WalletCard = ({
  item,
  isBalanceShow,
  onBalanceShow,
}: WalletCardProps) => {
  
  // Ambil tema berdasarkan warna dari API
  const activeTheme = THEME_OPTIONS.find((t) => t.id === item.color.toLowerCase()) || THEME_OPTIONS[1]; // Default ke blue jika tidak ketemu

  // Format ribuan Indonesia (contoh: 30.000.000)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <Link href={"/(others)/detailWallet"} asChild>
      <Pressable
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 5,
          backgroundColor: activeTheme.gradient[1], // Menggunakan warna gelap gradient sebagai base shadow
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
          style={{ backgroundColor: activeTheme.gradient[0] }}
          className="w-full h-[75%] absolute bottom-0 p-3 rounded-3xl flex justify-between"
        >
          {/* Icon Box */}
          <View
            style={{ backgroundColor: activeTheme.gradient[1] }}
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
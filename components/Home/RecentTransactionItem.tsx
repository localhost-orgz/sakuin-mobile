import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import React from "react";
import { Text, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";

interface RecentTransactionItemProps {
  item: {
    _id: string;
    name: string;
    amount: number;
    type: "income" | "expense" | "transfer";
    date: string;
    wallet_id: string;
    category_id: {
      _id: string;
      name: string;
      slug: string;
      emoticon: string;
      themeId?: string;
      theme_id?: string;
      color?: string;
    };
  };
}

const RecentTransactionItem = ({ item }: RecentTransactionItemProps) => {
  // Helper memformat nominal menjadi Rupiah tanpa pecahan desimal (,00)
  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper merapikan tampilan tanggal dari string ISO "2026-05-16T00:00:00.000Z" -> "16 May 2026"
  const formatDateLabel = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Tema fallback dari category_id
  const themeId = item.category_id?.themeId || item.category_id?.theme_id || item.category_id?.color || "ocean";
  const { theme } = useWalletTheme(
    (themeId as WalletThemeId) ?? "ocean"
  );

  const isIncome = item.type === "income";
  const isTransfer = item.type === "transfer";

  return (
    <View
      className="flex-1 py-3 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between"
    >
      <View className="flex flex-row items-center gap-3">
        {/* Lingkaran Icon / Emoticon Kategori */}
        <View
          style={{ backgroundColor: theme.bgColor || "#FFF4E5" }}
          className="w-[45px] h-[45px] flex justify-center items-center rounded-full"
        >
          <Text className="text-xl">
            {item.category_id?.emoticon ?? "💸"}
          </Text>
        </View>

        {/* Info Nama Transaksi & Tanggal */}
        <View className="flex flex-col gap-0.5">
          <Text numberOfLines={1} className="text-md font-semibold text-slate-800 max-w-[160px]">
            {item.name}
          </Text>
          <Text className="text-xs text-[#9ca3af]">
            {formatDateLabel(item.date)}
          </Text>
        </View>
      </View>

      {/* Info Nominal & Indikator Tipe Transaksi */}
      <View className="flex flex-col items-end">
        <Text 
          className={`text-md font-bold mb-0.5 ${
            isIncome ? "text-emerald-500" : ( isTransfer ? "text-amber-500" : "text-red-500")
          }`}
        >
          {isIncome ? `+${formatRupiah(item.amount)}` : ( isTransfer ? `${formatRupiah(item.amount) }` : `-${formatRupiah(item.amount) }`)}
        </Text>
        
        {/* Menampilkan kategori nama sebagai pelengkap context */}
        <Text className="text-xs text-[#9ca3af]">
          {item.category_id?.name}
        </Text>
      </View>
    </View>
  );
};

export const RecentTransactionItemSkeleton = () => {
  return (
    <View className="py-3 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between">
      <View className="flex flex-row items-center gap-3">
        {/* Lingkaran Icon / Emoticon Kategori */}
        <Skeleton
          width={45}
          height={45}
          borderRadius={22.5}
          style={{ backgroundColor: "#cbd5e1" }}
        />

        {/* Info Nama Transaksi & Tanggal */}
        <View className="flex flex-col gap-1.5">
          <Skeleton
            width={120}
            height={16}
            borderRadius={4}
            style={{ backgroundColor: "#cbd5e1" }}
          />
          <Skeleton
            width={70}
            height={12}
            borderRadius={3}
            style={{ backgroundColor: "#cbd5e1" }}
          />
        </View>
      </View>

      {/* Info Nominal & Indikator Tipe Transaksi */}
      <View className="flex flex-col items-end gap-1.5">
        <Skeleton
          width={90}
          height={16}
          borderRadius={4}
          style={{ backgroundColor: "#cbd5e1" }}
        />
        <Skeleton
          width={50}
          height={12}
          borderRadius={3}
          style={{ backgroundColor: "#cbd5e1" }}
        />
      </View>
    </View>
  );
};

export default RecentTransactionItem;
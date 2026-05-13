/**
 * app/(others)/allTransactions.tsx
 *
 * Full Transaction List page — searchable, filterable, grouped by date.
 * Reuses RecentTransactionItem row component pattern from Home.
 */

import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft, Filter, Search, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Extended mock transaction list ──────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: "tx_001",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-15",
  },
  {
    id: "tx_002",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-15",
  },
  {
    id: "tx_003",
    title: "Grab Car to Office",
    categoryId: "transport",
    wallet: "BCA",
    amount: 45000,
    date: "2025-03-15",
  },
  {
    id: "tx_004",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-14",
  },
  {
    id: "tx_005",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-14",
  },
  {
    id: "tx_006",
    title: "Kaos Polos Uniqlo",
    categoryId: "shopping",
    wallet: "SeaBank",
    amount: 150000,
    date: "2025-03-14",
  },
  {
    id: "tx_007",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-13",
  },
  {
    id: "tx_008",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-13",
  },
  {
    id: "tx_009",
    title: "Tagihan Listrik",
    categoryId: "bills_utilities",
    wallet: "BCA",
    amount: 200000,
    date: "2025-03-13",
  },
  {
    id: "tx_010",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-12",
  },
  {
    id: "tx_011",
    title: "Langganan Netflix",
    categoryId: "entertainment",
    wallet: "Gopay",
    amount: 54000,
    date: "2025-03-12",
  },
  {
    id: "tx_012",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-11",
  },
  {
    id: "tx_013",
    title: "Kopi Susu Gula Aren",
    categoryId: "food_beverage",
    wallet: "Gopay",
    amount: 25000,
    date: "2025-03-11",
  },
  {
    id: "tx_014",
    title: "Obat Flu",
    categoryId: "health_fitness",
    wallet: "BCA",
    amount: 35000,
    date: "2025-03-10",
  },
  {
    id: "tx_015",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-10",
  },
  {
    id: "tx_016",
    title: "Gym Bulanan",
    categoryId: "health_fitness",
    wallet: "BCA",
    amount: 300000,
    date: "2025-03-01",
  },
  {
    id: "tx_017",
    title: "Jatinangor House",
    categoryId: "food_beverage",
    wallet: "SeaBank",
    amount: 50000,
    date: "2025-03-01",
  },
];

// ─── Category filter chips ────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "food_beverage", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "shopping", label: "Shopping" },
  { id: "bills_utilities", label: "Bills" },
  { id: "health_fitness", label: "Health" },
  { id: "entertainment", label: "Entertainment" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatSectionDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

type Transaction = (typeof ALL_TRANSACTIONS)[0];

type TxSection = {
  title: string;
  data: Transaction[];
  totalAmount: number;
};

const groupByDate = (txs: Transaction[]): TxSection[] => {
  const map: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      title: formatSectionDate(date),
      data,
      totalAmount: data.reduce((s, t) => s + t.amount, 0),
    }));
};

// ─── Transaction Row — mirrors RecentTransactionItem exactly ─────────────────
const TransactionRow = ({
  item,
  onPress,
}: {
  item: Transaction;
  onPress: () => void;
}) => {
  const categoryDetail = TOP_SPENDING_CATEGORIES.find(
    (cat) => cat.id === item.categoryId,
  );

  const { theme } = useWalletTheme(
    (categoryDetail?.themeId as WalletThemeId) ?? "ocean",
  );
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View
        key={item.id}
        className="flex-1 py-2.5 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between"
      >
        {/* Left: icon + title + category label */}
        <View className="flex flex-row items-center gap-3">
          <View
            style={{ backgroundColor: theme.bgColor }}
            className="w-[45px] h-[45px] flex justify-center items-center rounded-full"
          >
            <Text className="text-md">{categoryDetail?.icon ?? "💸"}</Text>
          </View>

          <View className="flex flex-col gap-1">
            <Text className="text-md font-semibold" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs text-[#9ca3af]">
              {categoryDetail?.label ?? "Other"}
            </Text>
          </View>
        </View>

        {/* Right: amount + wallet */}
        <View className="flex flex-col items-end">
          <Text className="text-md text-red-500 font-semibold mb-1">
            {`-${formatRupiah(item.amount)}`}
          </Text>
          <Text className="text-sm text-[#9ca3af]">{item.wallet}</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ─── Filter Chip ──────────────────────────────────────────────────────────────
const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={{
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: selected ? "#00bf71" : "white",
      borderWidth: 1.5,
      borderColor: selected ? "#00bf71" : "#e5e7eb",
      marginRight: 8,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: selected ? "white" : "#6b7280",
      }}
    >
      {label}
    </Text>
  </Pressable>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AllTransactions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterBar, setShowFilterBar] = useState(false);

  const filtered = useMemo(() => {
    return ALL_TRANSACTIONS.filter((tx) => {
      const matchesSearch =
        search.trim() === "" ||
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        tx.wallet.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "all" || tx.categoryId === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── Pinned Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={["#00bf71", "#009e5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "800", color: "white" }}>
              Transaction List
            </Text>

            {/* Filter toggle */}
            <TouchableOpacity
              onPress={() => setShowFilterBar((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: showFilterBar
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter size={18} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 11,
              gap: 10,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.25)",
            }}
          >
            <Search size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari Transaksi"
              placeholderTextColor="rgba(255,255,255,0.55)"
              style={{
                flex: 1,
                fontSize: 14,
                color: "white",
                fontWeight: "500",
              }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <X size={16} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* ── Filter chip bar (collapsible) ────────────────────────────── */}
        {showFilterBar && (
          <View
            style={{
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
              paddingVertical: 12,
            }}
          >
            <FlatList
              horizontal
              data={FILTER_CHIPS}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.label}
                  selected={activeFilter === item.id}
                  onPress={() => setActiveFilter(item.id)}
                />
              )}
            />
          </View>
        )}

        {/* ── Summary strip ────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600" }}>
            {filtered.length} transactions
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#ef4444" }}>
            -{formatRupiah(totalFiltered)}
          </Text>
        </View>

        {/* ── Transaction list ──────────────────────────────────────────── */}
        <SectionList<Transaction, TxSection>
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "#f5f6fa" }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "white",
          }}
          stickySectionHeadersEnabled
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}
              >
                No transactions found
              </Text>
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                Try a different search or filter
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f5f6fa",
                paddingHorizontal: 20,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {section.title}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#ef4444",
                }}
              >
                -{formatRupiah(section.totalAmount)}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionRow
              item={item}
              onPress={() => router.push("/(others)/(transaction)/editForm")}
            />
          )}
        />
      </View>
    </>
  );
}

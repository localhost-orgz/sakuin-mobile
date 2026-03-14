/**
 * app/(others)/detailGoal.tsx
 *
 * Goal Detail Screen — shows progress, quick actions, and transaction history.
 * Usage: router.push({ pathname: "/(others)/detailGoal", params: { goalId: goal.id } })
 */

import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftRight,
  ChevronLeft,
  MoveUpRight,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Animated,
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

// ─── Mock goal data (replace with real data/store) ────────────────────────────
const MOCK_GOALS = [
  {
    id: "1",
    name: "Qurban",
    icon: "🐄",
    current: 3_600_000,
    target: 7_200_000,
    themeId: "green",
    deadline: "30 Jun 2025",
    description: "Tabungan untuk ibadah qurban tahun ini",
  },
  {
    id: "2",
    name: "Laptop Baru",
    icon: "💻",
    current: 4_500_000,
    target: 15_000_000,
    themeId: "blue",
    deadline: "31 Dec 2025",
    description: "MacBook Pro untuk produktivitas kerja",
  },
];

// ─── Mock transaction data per goal ──────────────────────────────────────────
const MOCK_TRANSACTIONS: Record<
  string,
  {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    date: string;
    wallet: string;
    type: "in" | "out";
  }[]
> = {
  "1": [
    {
      id: "t1",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-15",
      wallet: "SeaBank",
      type: "out",
    },
    {
      id: "t2",
      title: "Transfer Masuk",
      subtitle: "Dari BCA",
      amount: 500_000,
      date: "2025-03-14",
      wallet: "SeaBank",
      type: "in",
    },
    {
      id: "t3",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-14",
      wallet: "SeaBank",
      type: "out",
    },
    {
      id: "t4",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-13",
      wallet: "SeaBank",
      type: "out",
    },
    {
      id: "t5",
      title: "Setoran Rutin",
      subtitle: "Auto-debit",
      amount: 300_000,
      date: "2025-03-12",
      wallet: "BCA",
      type: "in",
    },
    {
      id: "t6",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-12",
      wallet: "SeaBank",
      type: "out",
    },
    {
      id: "t7",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-11",
      wallet: "SeaBank",
      type: "out",
    },
    {
      id: "t8",
      title: "Transfer Masuk",
      subtitle: "Dari BRI",
      amount: 200_000,
      date: "2025-03-10",
      wallet: "BCA",
      type: "in",
    },
  ],
  "2": [
    {
      id: "t9",
      title: "Setoran",
      subtitle: "Manual",
      amount: 500_000,
      date: "2025-03-15",
      wallet: "BCA",
      type: "in",
    },
    {
      id: "t10",
      title: "Makan Siang",
      subtitle: "Food & Drink",
      amount: 35_000,
      date: "2025-03-14",
      wallet: "BCA",
      type: "out",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (n: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(n);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const groupByDate = (
  txs: (typeof MOCK_TRANSACTIONS)["1"],
): { title: string; data: (typeof MOCK_TRANSACTIONS)["1"] }[] => {
  const map: Record<string, (typeof MOCK_TRANSACTIONS)["1"]> = {};
  txs.forEach((tx) => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
};

// ─── Transaction Item ─────────────────────────────────────────────────────────
const TransactionItem = ({
  item,
}: {
  item: (typeof MOCK_TRANSACTIONS)["1"][0];
}) => {
  const isIn = item.type === "in";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        backgroundColor: "white",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isIn ? "#f0fdf8" : "#fef2f2",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {isIn ? (
          <MoveUpRight size={18} color="#00bf71" strokeWidth={2.5} />
        ) : (
          <TrendingUp
            size={18}
            color="#f43f5e"
            strokeWidth={2.5}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        )}
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1f36" }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {item.subtitle}
        </Text>
      </View>

      {/* Amount + wallet */}
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: isIn ? "#00bf71" : "#1a1f36",
          }}
        >
          {isIn ? "+" : "-"}
          {formatRupiah(item.amount)}
        </Text>
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
          {item.wallet}
        </Text>
      </View>
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function DetailGoal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ goalId?: string }>();

  // Fallback to first goal if no param
  const goalId = params.goalId ?? "1";
  const goal = MOCK_GOALS.find((g) => g.id === goalId) ?? MOCK_GOALS[0];
  const allTransactions = MOCK_TRANSACTIONS[goal.id] ?? [];

  const [search, setSearch] = useState("");

  const { theme } = useWalletTheme(goal.themeId as WalletThemeId);

  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const remaining = goal.target - goal.current;
  const isCompleted = percentage >= 100;

  // Filter + group transactions
  const filtered = useMemo(() => {
    if (!search.trim()) return allTransactions;
    const q = search.toLowerCase();
    return allTransactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.subtitle.toLowerCase().includes(q) ||
        tx.wallet.toLowerCase().includes(q),
    );
  }, [search, allTransactions]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── HEADER GRADIENT ───────────────────────────────────────────── */}
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 36,
            paddingHorizontal: 20,
          }}
        >
          {/* Back button + title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
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
              Goal Detail
            </Text>

            <View style={{ width: 36 }} />
          </View>

          {/* Goal card */}
          <View style={{ alignItems: "center", gap: 8 }}>
            {/* Icon */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 32 }}>{goal.icon}</Text>
            </View>

            {/* Name */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "white",
                letterSpacing: -0.5,
              }}
            >
              {goal.name}
            </Text>

            {/* Description */}
            {goal.description ? (
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  textAlign: "center",
                }}
              >
                {goal.description}
              </Text>
            ) : null}

            {/* Amount progress */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "rgba(255,255,255,0.85)",
                marginTop: 4,
              }}
            >
              {formatRupiah(goal.current)}
              <Text
                style={{ color: "rgba(255,255,255,0.5)", fontWeight: "400" }}
              >
                /{formatRupiah(goal.target)}
              </Text>
            </Text>

            {/* Progress bar */}
            <View
              style={{
                width: "100%",
                height: 8,
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 99,
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  backgroundColor: "white",
                  borderRadius: 99,
                }}
              />
            </View>

            {/* Percentage + remaining */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "600",
                }}
              >
                {isCompleted
                  ? "✅ Completed!"
                  : `${percentage.toFixed(1)}% tercapai`}
              </Text>
              {!isCompleted && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "600",
                  }}
                >
                  Sisa {formatRupiah(remaining)}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── STATS + ACTION BUTTONS (float over gradient) ──────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: -20,
            backgroundColor: "white",
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
            gap: 12,
          }}
        >
          {/* Tambah Uang */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ flex: 1, alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.bgColor ?? "#f0fdf8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus
                size={22}
                color={theme.accentColor ?? "#00bf71"}
                strokeWidth={2.5}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#374151",
                textAlign: "center",
              }}
            >
              Tambah{"\n"}Uang
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />

          {/* Pindahkan Uang */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ flex: 1, alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.bgColor ?? "#f0fdf8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeftRight
                size={20}
                color={theme.accentColor ?? "#00bf71"}
                strokeWidth={2.5}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#374151",
                textAlign: "center",
              }}
            >
              Pindahkan{"\n"}Uang
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── DEADLINE CHIP ─────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "#fef3c7",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#fde68a",
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={{ fontSize: 11 }}>🗓️</Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#92400e" }}>
              Target: {goal.deadline}
            </Text>
          </View>
        </View>

        {/* ── SEARCH BAR ────────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 14,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderWidth: 1.5,
            borderColor: "#e5e7eb",
            gap: 10,
          }}
        >
          <Search size={16} color="#9ca3af" strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari Transaksi"
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, fontSize: 14, color: "#1a1f36" }}
          />
        </View>

        {/* ── TRANSACTION LIST ──────────────────────────────────────────── */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
          style={{ marginTop: 14 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                {search
                  ? "Transaksi tidak ditemukan 🔍"
                  : "Belum ada transaksi"}
              </Text>
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
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
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View
              style={{
                marginHorizontal: 0,
                backgroundColor: "white",
                // Top rounded corners on first item of each section
                borderTopLeftRadius: index === 0 ? 0 : 0,
                borderTopRightRadius: index === 0 ? 0 : 0,
                // Bottom rounded corners on last item
                borderBottomLeftRadius:
                  index === section.data.length - 1 ? 0 : 0,
                borderBottomRightRadius:
                  index === section.data.length - 1 ? 0 : 0,
              }}
            >
              <TransactionItem item={item} />
            </View>
          )}
        />
      </View>
    </>
  );
}

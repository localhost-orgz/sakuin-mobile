/**
 * app/(others)/detailGoal.tsx
 *
 * Goal Detail Screen — scrollable (except pinned top bar), pull-to-refresh,
 * ellipsis button in top bar, deadline shown inside the progress section.
 */

import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftRight,
  ChevronLeft,
  Edit2,
  MoreHorizontal,
  MoveUpRight,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EditGoalSheet from "./editGoal";

// ─── Mock goal data ───────────────────────────────────────────────────────────
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

// ─── Mock transactions ────────────────────────────────────────────────────────
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

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

type TxItem = (typeof MOCK_TRANSACTIONS)["1"][0];

const groupByDate = (txs: TxItem[]) => {
  const map: Record<string, TxItem[]> = {};
  txs.forEach((tx) => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
};

// ─── Transaction Item ─────────────────────────────────────────────────────────
const TransactionItem = ({ item }: { item: TxItem }) => {
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

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1f36" }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {item.subtitle}
        </Text>
      </View>

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

  const goalId = params.goalId ?? "1";
  const goal = MOCK_GOALS.find((g) => g.id === goalId) ?? MOCK_GOALS[0];
  const allTransactions = MOCK_TRANSACTIONS[goal.id] ?? [];

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Replace with your real data fetch
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const { theme } = useWalletTheme(goal.themeId as WalletThemeId);

  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const remaining = goal.target - goal.current;
  const isCompleted = percentage >= 100;

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

  const goalData = {
    id: "2",
    name: "Bali Trip",
    icon: "🏖️",
    current: 3200000,
    target: 5000000,
    themeId: "ember",
  };

  // ── Luminance-based contrast tokens ───────────────────────────────────────
  const hexLuminance = (hex: string): number => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const isLight = hexLuminance(theme.gradientColors[0]) > 0.35;

  const headerText = isLight ? "#1a1f36" : "white";
  const headerMuted = isLight ? "rgba(26,31,54,0.5)" : "rgba(255,255,255,0.65)";
  const headerIconBg = isLight ? "rgba(26,31,54,0.1)" : "rgba(255,255,255,0.2)";
  const headerChipBg = isLight
    ? "rgba(26,31,54,0.08)"
    : "rgba(255,255,255,0.2)";
  const progressTrack = isLight
    ? "rgba(26,31,54,0.15)"
    : "rgba(255,255,255,0.25)";
  const progressFill = isLight ? "#1a1f36" : "white";
  const refreshTint = isLight ? theme.gradientColors[0] : "white";
  const statusStyle = (isLight ? "dark-content" : "light-content") as
    | "dark-content"
    | "light-content";

  // ── Scrollable list header (everything below the pinned top bar) ──────────
  const ListHeader = (
    <>
      {/* ── Gradient section: goal info + progress ── */}
      <LinearGradient
        colors={theme.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: 40,
          paddingHorizontal: 20,
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: isLight
              ? "rgba(26,31,54,0.05)"
              : "rgba(255,255,255,0.07)",
            bottom: -60,
            right: -40,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: isLight
              ? "rgba(26,31,54,0.04)"
              : "rgba(255,255,255,0.05)",
            top: 10,
            right: 70,
          }}
        />

        {/* Goal card */}
        <View style={{ alignItems: "center", gap: 6 }}>
          {/* Icon avatar */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: headerIconBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 32 }}>{goal.icon}</Text>
          </View>

          {/* Goal name */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: headerText,
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
                color: headerMuted,
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
              color: headerText,
              marginTop: 4,
            }}
          >
            {formatRupiah(goal.current)}
            <Text style={{ color: headerMuted, fontWeight: "400" }}>
              /{formatRupiah(goal.target)}
            </Text>
          </Text>

          {/* Progress bar */}
          <View
            style={{
              width: "100%",
              height: 8,
              backgroundColor: progressTrack,
              borderRadius: 99,
              overflow: "hidden",
              marginTop: 6,
            }}
          >
            <View
              style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: progressFill,
                borderRadius: 99,
              }}
            />
          </View>

          {/* Percentage · deadline · remaining — all in one row */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
              gap: 8,
            }}
          >
            {/* Left: percentage */}
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: headerText }}
            >
              {isCompleted ? "✅ Selesai!" : `${percentage.toFixed(1)}%`}
            </Text>

            {/* Centre: deadline pill */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: headerChipBg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 11 }}>🗓️</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: headerText,
                }}
              >
                {goal.deadline}
              </Text>
            </View>

            {/* Right: remaining */}
            {!isCompleted && (
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: headerMuted }}
              >
                -{formatRupiah(remaining)}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ── Action buttons (floats over gradient) ── */}
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

        <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />

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

      {/* ── Search bar ── */}
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
    </>
  );

  return (
    <>
      <StatusBar barStyle={statusStyle} />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── PINNED TOP BAR — back · title · ellipsis ─────────────────── */}
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: headerIconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color={headerText} strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Title */}
            <Text
              style={{ fontSize: 18, fontWeight: "800", color: headerText }}
            >
              Goal Detail
            </Text>

            {/* Ellipsis — no background */}
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.6}
              onPress={() => setIsMenuVisible(true)}
            >
              <MoreHorizontal size={22} color={headerText} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── SCROLLABLE LIST (header + transactions) ──────────────────── */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          // Over-scroll area matches gradient colour
          style={{ backgroundColor: theme.gradientColors[0] }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "#f5f6fa",
          }}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={refreshTint}
              colors={[refreshTint]}
            />
          }
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
                marginTop: 14,
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
          renderItem={({ item }) => <TransactionItem item={item} />}
        />

        {isMenuVisible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
              zIndex: 1000,
            }}
          >
            {/* Overlay untuk nutup sheet kalo di-klik di luar */}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setIsMenuVisible(false)}
            />

            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
                paddingTop: 15,
                paddingBottom: insets.bottom + 20,
              }}
            >
              {/* 💡 Garis Handle Bar di paling atas tengah */}
              <View
                className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto"
                style={{ marginBottom: 20 }}
              />
              {/* Header Sheet */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}
                >
                  Opsi Goal
                </Text>
                <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                  <X size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {/* Opsi Edit */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f3f4f6",
                  gap: 12,
                }}
                onPress={() => {
                  setIsEditSheetVisible(true);
                  // router.push({ pathname: "/editGoal", params: { goalId } }); 💡 Contoh navigasi
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "#eff6ff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit2 size={18} color="#3b82f6" />
                </View>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1a1f36" }}
                >
                  Edit Goal
                </Text>
              </TouchableOpacity>
              {/* Opsi Delete */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  gap: 12,
                }}
                onPress={() => {
                  setIsMenuVisible(false);
                  alert("Hapus Goal?"); // 😎 Ganti dengan logic hapus beneran nanti
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "#fef2f2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                </View>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#ef4444" }}
                >
                  Hapus Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <EditGoalSheet
          isVisible={isEditSheetVisible}
          onClose={() => setIsEditSheetVisible(false)}
          initialData={goalData}
        />
      </View>
    </>
  );
}

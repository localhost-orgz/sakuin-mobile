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
  TrendingDown,
  MoveRight,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  RefreshControl,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EditGoalSheet from "./editGoal";
import { apiRequest } from "@/utils/api";

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

// ─── Transaction Type (matches detailWallet.tsx) ─────────────────────────────
type Transaction = {
  _id: string;
  name: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
  category_id: string | any;
};

// ─── Mock transactions ────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Record<string, Transaction[]> = {
  "1": [
    {
      _id: "t1",
      name: "Jatinangor House",
      amount: 50_000,
      type: "expense",
      date: "2025-03-15",
      category_id: "Food & Drink",
    },
    {
      _id: "t2",
      name: "Transfer Masuk",
      amount: 500_000,
      type: "income",
      date: "2025-03-14",
      category_id: "Dari BCA",
    },
    {
      _id: "t3",
      name: "Jatinangor House",
      amount: 50_000,
      type: "expense",
      date: "2025-03-14",
      category_id: "Food & Drink",
    },
    {
      _id: "t4",
      name: "Jatinangor House",
      amount: 50_000,
      type: "expense",
      date: "2025-03-13",
      category_id: "Food & Drink",
    },
    {
      _id: "t5",
      name: "Setoran Rutin",
      amount: 300_000,
      type: "income",
      date: "2025-03-12",
      category_id: "Auto-debit",
    },
    {
      _id: "t6",
      name: "Jatinangor House",
      amount: 50_000,
      type: "expense",
      date: "2025-03-12",
      category_id: "Food & Drink",
    },
    {
      _id: "t7",
      name: "Jatinangor House",
      amount: 50_000,
      type: "expense",
      date: "2025-03-11",
      category_id: "Food & Drink",
    },
    {
      _id: "t8",
      name: "Transfer Masuk",
      amount: 200_000,
      type: "income",
      date: "2025-03-10",
      category_id: "Dari BRI",
    },
  ],
  "2": [
    {
      _id: "t9",
      name: "Setoran",
      amount: 500_000,
      type: "income",
      date: "2025-03-15",
      category_id: "Manual",
    },
    {
      _id: "t10",
      name: "Makan Siang",
      amount: 35_000,
      type: "expense",
      date: "2025-03-14",
      category_id: "Food & Drink",
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

const groupByDate = (txs: Transaction[]) => {
  const map: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const dateKey = tx.date.split("T")[0];
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
};

// ─── Transaction Item ─────────────────────────────────────────────────────────
const TransactionItem = ({ item }: { item: Transaction }) => {
  let iconBgColor = "#f0fdf8"; // default income
  if (item.type === "expense") {
    iconBgColor = "#fef2f2";
  } else if (item.type === "transfer") {
    iconBgColor = "#fef9c3"; // Kuning muda untuk background transfer
  }

  let typeLabel = "Pemasukan";
  if (item.type === "expense") {
    typeLabel = "Pengeluaran";
  } else if (item.type === "transfer") {
    typeLabel = "Transfer / Pindahan";
  }

  let amountColor = "#00bf71"; // hijau
  let amountSign = "+";
  if (item.type === "expense") {
    amountColor = "#f43f5e"; // merah
    amountSign = "-";
  } else if (item.type === "transfer") {
    amountColor = "#eab308"; // Kuning
    amountSign = "";
  }

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
      {/* Bagian Kontainer Ikon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: iconBgColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {item.type == "income" && (
          <TrendingUp size={18} color="#00bf71" strokeWidth={2.5} />
        )}
        {item.type == "expense" && (
          <TrendingDown size={18} color="#f43f5e" strokeWidth={2.5} />
        )}
        {item.type == "transfer" && (
          <MoveRight size={18} color="#eab308" strokeWidth={2.5} /> 
        )}
      </View>

      {/* Bagian Nama & Label */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1f36" }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {typeLabel}
        </Text>
      </View>

      {/* Bagian Nominal Uang */}
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: amountColor,
          }}
        >
          {amountSign}
          {formatRupiah(item.amount)}
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
  
  const [goal, setGoal] = useState<any>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditSheetVisible, setIsEditSheetVisible] = useState(false);

  const fetchGoalDetail = useCallback(async () => {
    try {
      const res = await apiRequest(`/goals/${goalId}`, { method: "GET" });
      if (res.status === "success" && res.data) {
        setGoal(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch goal detail:", err);
    } finally {
      setLoadingGoal(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoalDetail();
  }, [fetchGoalDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGoalDetail();
    setRefreshing(false);
  }, [fetchGoalDetail]);

  const allTransactions = useMemo(() => {
    if (!goal) return [];
    return MOCK_TRANSACTIONS[goal.id] ?? MOCK_TRANSACTIONS["1"] ?? [];
  }, [goal]);

  const { theme } = useWalletTheme(goal?.themeId ? (goal.themeId as WalletThemeId) : "ocean");

  const percentage = goal ? Math.min((goal.current / goal.target) * 100, 100) : 0;
  const remaining = goal ? goal.target - goal.current : 0;
  const isCompleted = percentage >= 100;

  const filtered = useMemo(() => {
    if (!goal) return [];
    if (!search.trim()) return allTransactions;
    const q = search.toLowerCase();
    return allTransactions.filter(
      (tx) =>
        tx.name.toLowerCase().includes(q) ||
        (tx.category_id && typeof tx.category_id === "string" && tx.category_id.toLowerCase().includes(q)),
    );
  }, [search, allTransactions, goal]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  if (loadingGoal || !goal) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f6fa", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  const goalData = {
    id: goal.id || goal._id,
    name: goal.name,
    icon: goal.icon || "🎯",
    current: goal.current,
    target: goal.target,
    themeId: goal.themeId || "ocean",
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
          keyExtractor={(item) => item._id}
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
                  Alert.alert(
                    "Hapus Goal",
                    "Apakah Anda yakin ingin menghapus goal ini?",
                    [
                      { text: "Batal", style: "cancel" },
                      {
                        text: "Hapus",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const res = await apiRequest(`/goals/${goalId}`, { method: "DELETE" });
                            if (res.status === "success" || res.message) {
                              router.back();
                            }
                          } catch (err) {
                            console.error("Failed to delete goal:", err);
                            alert("Gagal menghapus goal");
                          }
                        }
                      }
                    ]
                  );
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
          initialData={goal}
          onSave={async () => {
            await fetchGoalDetail();
            setIsEditSheetVisible(false);
          }}
        />
      </View>
    </>
  );
}

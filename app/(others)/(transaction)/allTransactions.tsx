/**
 * app/(others)/allTransactions.tsx
 *
 * Full Transaction List page — searchable, filterable, grouped by date.
 * Reuses RecentTransactionItem row component pattern from Home.
 */

import { RecentTransactionItemSkeleton } from "@/components/Home/RecentTransactionItem";
import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { apiRequest } from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import {
  exportTransactionsFile,
  filterByDateRange,
  formatDisplayDate,
  type ExportFormat,
} from "@/utils/exportTransactions";
import { ChevronLeft, FileSpreadsheet, FileText, Filter, Search, X } from "lucide-react-native";
import React, { useMemo, useState, useCallback } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one). */
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatSectionDate = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getLocalDateString = (dateString: string) => {
  try {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString.substring(0, 10);
  }
};

type TxSection = {
  key: string;
  title: string;
  data: any[];
  totalAmount: number;
};

const groupByDate = (txs: any[]): TxSection[] => {
  const map: Record<string, any[]> = {};
  txs.forEach((tx) => {
    const dateKey = getLocalDateString(tx.date);
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      key: date,
      title: formatSectionDate(date),
      data,
      totalAmount: data.reduce((s, t) => {
        if (t.type === "transfer") return s;

        const amt = Number(t.amount) || 0;
        return s + (t.type === "income" ? amt : -amt);
      }, 0),
    }));
};

// ─── Transaction Row — mirrors RecentTransactionItem exactly ─────────────────
const TransactionRow = ({
  item,
  wallets,
  onPress,
}: {
  item: any;
  wallets: any[];
  onPress: () => void;
}) => {
  const categoryEmoticon = item.category_id?.emoticon || "💸";
  const categoryName = item.category_id?.name || "Other";
  
  const themeId = item.category_id?.themeId || item.category_id?.theme_id || item.category_id?.color || "ocean";
  const { theme } = useWalletTheme(
    (themeId as WalletThemeId) ?? "ocean"
  );

  const walletName = item.wallet_id ? item.wallet_id.name : "Wallet";

  const isIncome = item.type === "income";
  const isTransfer = item.type === "transfer";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <View className="py-2.5 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between">
        {/* Left: icon + title + category label */}
        <View className="flex flex-row items-center gap-3">
          <View
            style={{ backgroundColor: theme.bgColor }}
            className="w-[45px] h-[45px] flex justify-center items-center rounded-full"
          >
            <Text className="text-md">{categoryEmoticon}</Text>
          </View>

          <View className="flex flex-col gap-1">
            <Text className="text-md font-semibold text-slate-800 max-w-[160px]" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-xs text-[#9ca3af]">
              {categoryName}
            </Text>
          </View>
        </View>

        {/* Right: amount + wallet */}
        <View className="flex flex-col items-end">
          <Text
            className={`text-md font-bold mb-0.5 ${
              isIncome ? "text-emerald-500" : ( isTransfer ? "text-amber-500" : "text-red-500")
            }`}
          >
            {isIncome ? `+${formatRupiah(item.amount)}` : ( isTransfer ? `${formatRupiah(item.amount) }` : `-${formatRupiah(item.amount) }`)}
          </Text>
          <Text className="text-sm text-[#9ca3af]">{walletName}</Text>
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

// ─── Export date range modal ──────────────────────────────────────────────────
const ExportDateRangeModal = ({
  visible,
  format,
  startDate,
  endDate,
  transactionCount,
  exporting,
  onStartDatePress,
  onEndDatePress,
  onCancel,
  onExport,
}: {
  visible: boolean;
  format: ExportFormat;
  startDate: Date;
  endDate: Date;
  transactionCount: number;
  exporting: boolean;
  onStartDatePress: () => void;
  onEndDatePress: () => void;
  onCancel: () => void;
  onExport: () => void;
}) => {
  const formatLabel = format === "pdf" ? "PDF" : "Excel";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 24,
            width: "100%",
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}>
            Export {formatLabel}
          </Text>
          <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 20 }}>
            Pilih rentang tanggal transaksi yang ingin diekspor.
          </Text>

          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#9ca3af" }}>
              DARI TANGGAL
            </Text>
            <Pressable
              onPress={onStartDatePress}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#e5e7eb",
                backgroundColor: "#f9fafb",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
                {formatDisplayDate(startDate)}
              </Text>
            </Pressable>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#9ca3af",
                marginTop: 4,
              }}
            >
              SAMPAI TANGGAL
            </Text>
            <Pressable
              onPress={onEndDatePress}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#e5e7eb",
                backgroundColor: "#f9fafb",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
                {formatDisplayDate(endDate)}
              </Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600" }}>
            {transactionCount} transaksi dalam rentang ini
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={onCancel}
              disabled={exporting}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700", color: "#374151" }}>Batal</Text>
            </Pressable>
            <Pressable
              onPress={onExport}
              disabled={exporting || transactionCount === 0}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor:
                  exporting || transactionCount === 0 ? "#9ca3af" : "#00bf71",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {exporting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ fontWeight: "700", color: "white" }}>Ekspor</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AllTransactions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [exportEndDate, setExportEndDate] = useState(() => new Date());
  const [datePickerTarget, setDatePickerTarget] = useState<"start" | "end" | null>(
    null,
  );
  const [exporting, setExporting] = useState(false);

  const openExportModal = (format: ExportFormat) => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    setExportFormat(format);
    setExportStartDate(start);
    setExportEndDate(new Date());
  };

  const closeExportModal = () => {
    if (exporting) return;
    setExportFormat(null);
    setDatePickerTarget(null);
  };

  const fetchTransactionsData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("user_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch transactions first to verify authentication
      const txRes = await apiRequest("/transaction", { method: "GET" });
      if (txRes?.status === "success" && txRes.data) {
        setTransactions(txRes.data);
      } else if (Array.isArray(txRes)) {
        setTransactions(txRes);
      }

      // Fetch other dependencies in parallel only if authorized
      const [walletsRes, categoriesRes] = await Promise.all([
        apiRequest("/wallets", { method: "GET" }),
        apiRequest("/categories", { method: "GET" }),
      ]);

      if (walletsRes?.status === "success" && walletsRes.data) {
        setWallets(walletsRes.data);
      } else if (Array.isArray(walletsRes)) {
        setWallets(walletsRes);
      }

      if (categoriesRes?.status === "success" && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else if (Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }
    } catch (err) {
      console.error("Failed to fetch transactions list:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactionsData();
    }, [])
  );

  const filterChips = useMemo(() => {
    const list = [{ id: "all", label: "All" }];
    categories.forEach((cat) => {
      list.push({
        id: cat.slug || cat._id || cat.id,
        label: cat.name,
      });
    });
    return list;
  }, [categories]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const wallet = wallets.find((w) => (w._id || w.id) === tx.wallet_id);
      const walletName = wallet ? wallet.name : "Wallet";

      const matchesSearch =
        search.trim() === "" ||
        (tx.name && tx.name.toLowerCase().includes(search.toLowerCase())) ||
        walletName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        tx.category_id?.slug === activeFilter ||
        tx.category_id?._id === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [transactions, wallets, search, activeFilter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const totalFiltered = filtered.reduce((s, t) => {
    if (t.type?.toLowerCase() === "transfer") {
      return s;
    }
  
    const amt = Number(t.amount) || 0;
  
    if (t.type?.toLowerCase() === "income") {
      return s + amt;
    } else {
      return s - amt;
    }
  }, 0);

  const exportCount = useMemo(() => {
    if (!exportFormat) return 0;
    return filterByDateRange(filtered, exportStartDate, exportEndDate).length;
  }, [exportFormat, filtered, exportStartDate, exportEndDate]);

  const handleExport = async () => {
    if (!exportFormat) return;

    try {
      setExporting(true);
      const count = await exportTransactionsFile(
        filtered,
        exportFormat,
        exportStartDate,
        exportEndDate,
      );

      if (count === 0) {
        Alert.alert(
          "Tidak ada transaksi",
          "Tidak ada transaksi dalam rentang tanggal yang dipilih.",
        );
        return;
      }

      closeExportModal();
    } catch (err) {
      console.error("Export failed:", err);
      Alert.alert("Gagal", "Gagal mengekspor transaksi. Coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
          {/* Pinned Header */}
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

              <View style={{ width: 36 }} />
            </View>

            {/* Search bar skeleton */}
            <View
              style={{
                height: 48,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            />
          </LinearGradient>

          {/* List Skeleton */}
          <View style={{ flex: 1, backgroundColor: "white", marginTop: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <RecentTransactionItemSkeleton key={i} />
            ))}
          </View>
        </View>
      </>
    );
  }

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
              data={filterChips}
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
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600" }}>
              {filtered.length} transactions
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: totalFiltered >= 0 ? "#10b981" : "#ef4444",
              }}
            >
              {totalFiltered >= 0
                ? `+${formatRupiah(totalFiltered)}`
                : `-${formatRupiah(Math.abs(totalFiltered))}`}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 20,
              paddingBottom: 12,
            }}
          >
            <Pressable
              onPress={() => openExportModal("pdf")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#fef2f2",
                borderWidth: 1,
                borderColor: "#fecaca",
              }}
            >
              <FileText size={16} color="#dc2626" strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#dc2626" }}>
                PDF
              </Text>
            </Pressable>
            <Pressable
              onPress={() => openExportModal("xlsx")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#ecfdf5",
                borderWidth: 1,
                borderColor: "#a7f3d0",
              }}
            >
              <FileSpreadsheet size={16} color="#059669" strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669" }}>
                XLSX
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Transaction list ──────────────────────────────────────────── */}
        <SectionList<any, TxSection>
          sections={sections}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "#f5f6fa" }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "#f5f6fa",
          }}
          initialNumToRender={20}
          windowSize={10}
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
          renderSectionHeader={({ section }) => {
            const isNetIncome = section.totalAmount >= 0;
            const absFlow = Math.abs(section.totalAmount);
            return (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f5f6fa",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 8,
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
                    color: isNetIncome ? "#10b981" : "#ef4444",
                  }}
                >
                  {isNetIncome ? `+${formatRupiah(absFlow)}` : `-${formatRupiah(absFlow)}`}
                </Text>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "white" }}>
              <TransactionRow
                item={item}
                wallets={wallets}
                onPress={() =>
                  router.push({
                    pathname: "/(others)/(transaction)/editForm",
                    params: { id: item._id },
                  })
                }
              />
            </View>
          )}
        />

        {exportFormat && (
          <ExportDateRangeModal
            visible={!!exportFormat}
            format={exportFormat}
            startDate={exportStartDate}
            endDate={exportEndDate}
            transactionCount={exportCount}
            exporting={exporting}
            onStartDatePress={() => setDatePickerTarget("start")}
            onEndDatePress={() => setDatePickerTarget("end")}
            onCancel={closeExportModal}
            onExport={handleExport}
          />
        )}

        <DateTimePickerModal
          isVisible={datePickerTarget !== null}
          mode="date"
          date={datePickerTarget === "start" ? exportStartDate : exportEndDate}
          onConfirm={(picked) => {
            if (datePickerTarget === "start") {
              setExportStartDate(picked);
            } else {
              setExportEndDate(picked);
            }
            setDatePickerTarget(null);
          }}
          onCancel={() => setDatePickerTarget(null)}
        />
      </View>
    </>
  );
}

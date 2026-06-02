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
import { ChevronLeft, Filter, Search, X, FileSpreadsheet, FileText, CalendarDays } from "lucide-react-native";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import export/sharing modules
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DateTimePickerModal from "react-native-modal-datetime-picker";


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

const findCategory = (tx: any, categories: any[]) => {
  if (!tx || !tx.category_id) return null;
  if (typeof tx.category_id === "object") {
    const id = tx.category_id._id || tx.category_id.id;
    return categories.find(c => c._id === id || c.id === id) || tx.category_id;
  }
  return categories.find(c => c._id === tx.category_id || c.id === tx.category_id);
};

const findWallet = (tx: any, wallets: any[]) => {
  if (!tx || !tx.wallet_id) return null;
  if (typeof tx.wallet_id === "object") {
    const id = tx.wallet_id._id || tx.wallet_id.id;
    return wallets.find(w => w._id === id || w.id === id) || tx.wallet_id;
  }
  return wallets.find(w => w._id === tx.wallet_id || w.id === tx.wallet_id);
};

// ─── Transaction Row — mirrors RecentTransactionItem exactly ─────────────────
const TransactionRow = ({
  item,
  wallets,
  categories,
  onPress,
}: {
  item: any;
  wallets: any[];
  categories: any[];
  onPress: () => void;
}) => {
  const matchedCat = findCategory(item, categories);
  const matchedWallet = findWallet(item, wallets);

  const categoryEmoticon = matchedCat?.emoticon || "💸";
  const categoryName = matchedCat?.name || "Other";
  
  const themeId = matchedCat?.themeId || matchedCat?.theme_id || matchedCat?.color || "ocean";
  const { theme } = useWalletTheme(
    (themeId as WalletThemeId) ?? "ocean"
  );

  const walletName = matchedWallet ? matchedWallet.name : "Wallet";

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
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isStartPickerVisible, setIsStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setIsEndPickerVisible] = useState(false);

  const exportToExcel = () => {
    if (filtered.length === 0) {
      Alert.alert("Error", "Tidak ada transaksi untuk diekspor.");
      return;
    }
    setExportStartDate("");
    setExportEndDate("");
    setExportType("excel");
    setExportModalVisible(true);
  };

  const exportToPDF = () => {
    if (filtered.length === 0) {
      Alert.alert("Error", "Tidak ada transaksi untuk diekspor.");
      return;
    }
    setExportStartDate("");
    setExportEndDate("");
    setExportType("pdf");
    setExportModalVisible(true);
  };

  const handleConfirmExport = async () => {
    const dataToExport = filtered.filter((tx) => {
      if (!tx.date) return true;
      const txDateStr = getLocalDateString(tx.date);
      if (exportStartDate && txDateStr < exportStartDate) return false;
      if (exportEndDate && txDateStr > exportEndDate) return false;
      return true;
    });

    if (dataToExport.length === 0) {
      Alert.alert("Error", "Tidak ada transaksi dalam rentang tanggal tersebut.");
      return;
    }

    setExportModalVisible(false);

    if (exportType === "excel") {
      await runExcelExport(dataToExport);
    } else {
      const exportNetFlow = dataToExport.reduce((s, t) => {
        if (t.type?.toLowerCase() === "transfer") return s;
        const amt = Number(t.amount) || 0;
        return s + (t.type?.toLowerCase() === "income" ? amt : -amt);
      }, 0);
      await runPDFExport(dataToExport, exportNetFlow);
    }
  };

  const runExcelExport = async (dataToExport: any[]) => {
    try {
      const rows = dataToExport.map((tx, idx) => {
        const matchedCat = findCategory(tx, categories);
        const matchedWallet = findWallet(tx, wallets);
        
        let typeLabel = "Pemasukan";
        if (tx.type === "expense") typeLabel = "Pengeluaran";
        else if (tx.type === "transfer") typeLabel = "Transfer";

        return {
          "No": idx + 1,
          "Tanggal": getLocalDateString(tx.date),
          "Nama Transaksi": tx.name || "",
          "Kategori": matchedCat?.name || "Lainnya",
          "Dompet": matchedWallet?.name || "Utama",
          "Tipe": typeLabel,
          "Jumlah (IDR)": Number(tx.amount) || 0,
          "Keterangan": tx.description || "-"
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Define styled header (Green background with White bold text)
      const headerStyle = {
        font: { name: "Segoe UI", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "00BF71" } }, // Sakuin Green
        alignment: { horizontal: "center", vertical: "center" }
      };

      const cellStyle = {
        font: { name: "Segoe UI", sz: 10 },
        alignment: { vertical: "center" }
      };
      
      const numStyle = {
        font: { name: "Segoe UI", sz: 10 },
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0"
      };

      // Apply styles to all cells
      const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;

          if (R === 0) {
            worksheet[cellAddress].s = headerStyle;
          } else {
            if (C === 6) { // "Jumlah (IDR)"
              worksheet[cellAddress].s = numStyle;
            } else {
              worksheet[cellAddress].s = cellStyle;
            }
          }
        }
      }

      // Column widths
      worksheet['!cols'] = [
        { wch: 6 },   // No
        { wch: 14 },  // Tanggal
        { wch: 28 },  // Nama Transaksi
        { wch: 18 },  // Kategori
        { wch: 18 },  // Dompet
        { wch: 14 },  // Tipe
        { wch: 16 },  // Jumlah (IDR)
        { wch: 32 }   // Keterangan
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      
      // Write workbook to base64
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      
      // Save locally
      const filename = `Sakuin_Transaksi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Sukses", `Berkas tersimpan di: ${fileUri}`);
      }
    } catch (error) {
      console.error("Gagal mengekspor Excel:", error);
      Alert.alert("Gagal", "Gagal mengekspor file Excel. Silakan coba lagi.");
    }
  };

  const runPDFExport = async (dataToExport: any[], exportNetFlow: number) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add branding headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 191, 113); // Sakuin Green
      doc.text("SAKUIN", 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Laporan Riwayat Transaksi Keuangan (Mobile)", 14, 25);
      
      const todayStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      doc.text(`Tanggal Ekspor: ${todayStr}`, 14, 30);

      // Summary block background
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, 35, 182, 18, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("RINGKASAN LAPORAN", 18, 41);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Jumlah Transaksi: ${dataToExport.length}`, 18, 47);
      
      const totalText = `Arus Bersih: ${exportNetFlow >= 0 ? "+" : ""}${formatRupiah(exportNetFlow)}`;
      doc.setFont("helvetica", "bold");
      if (exportNetFlow >= 0) {
        doc.setTextColor(0, 191, 113); // Sakuin Green
      } else {
        doc.setTextColor(244, 63, 94); // rose-500
      }
      doc.text(totalText, 120, 47);

      // Table headers
      const headers = [["No", "Tanggal", "Nama Transaksi", "Kategori", "Dompet", "Tipe", "Jumlah"]];
      const tableData = dataToExport.map((tx, idx) => {
        const matchedCat = findCategory(tx, categories);
        const matchedWallet = findWallet(tx, wallets);
        
        let typeLabel = "Pemasukan";
        if (tx.type === "expense") typeLabel = "Pengeluaran";
        else if (tx.type === "transfer") typeLabel = "Transfer";

        const sign = tx.type === "expense" ? "-" : tx.type === "income" ? "+" : "";

        return [
          idx + 1,
          getLocalDateString(tx.date),
          tx.name || "",
          matchedCat?.name || "Lainnya",
          matchedWallet?.name || "Utama",
          typeLabel,
          `${sign}${formatRupiah(tx.amount).replace("Rp", "").trim()}`
        ];
      });

      autoTable(doc, {
        startY: 58,
        head: headers,
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [0, 191, 113],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 22 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 22 },
          6: { cellWidth: 28, halign: "right" },
        },
        styles: {
          font: "helvetica",
        },
        margin: { top: 58, left: 14, right: 14 },
        didDrawPage: (data) => {
          const str = "Halaman " + doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Write PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const filename = `Sakuin_Transaksi_${new Date().toISOString().slice(0, 10)}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Sukses", `Berkas tersimpan di: ${fileUri}`);
      }
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error);
      Alert.alert("Gagal", "Gagal mengekspor file PDF. Silakan coba lagi.");
    }
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
      const wallet = findWallet(tx, wallets);
      const walletName = wallet ? wallet.name : "Wallet";

      const matchesSearch =
        search.trim() === "" ||
        (tx.name && tx.name.toLowerCase().includes(search.toLowerCase())) ||
        walletName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        tx.category_id === activeFilter ||
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

        {/* ── Export buttons strip ────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={exportToExcel}
            disabled={filtered.length === 0}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: filtered.length === 0 ? "#f3f4f6" : "#ecfdf5",
              borderColor: filtered.length === 0 ? "#e5e7eb" : "#a7f3d0",
              borderWidth: 1.2,
              paddingVertical: 10,
              borderRadius: 12,
              gap: 6,
              opacity: filtered.length === 0 ? 0.65 : 1,
            }}
          >
            <FileSpreadsheet size={16} color={filtered.length === 0 ? "#9ca3af" : "#00bf71"} strokeWidth={2.5} />
            <Text style={{ color: filtered.length === 0 ? "#9ca3af" : "#00bf71", fontSize: 13, fontWeight: "700" }}>
              Export Excel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={exportToPDF}
            disabled={filtered.length === 0}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: filtered.length === 0 ? "#f3f4f6" : "#fff1f2",
              borderColor: filtered.length === 0 ? "#e5e7eb" : "#fecdd3",
              borderWidth: 1.2,
              paddingVertical: 10,
              borderRadius: 12,
              gap: 6,
              opacity: filtered.length === 0 ? 0.65 : 1,
            }}
          >
            <FileText size={16} color={filtered.length === 0 ? "#9ca3af" : "#ef4444"} strokeWidth={2.5} />
            <Text style={{ color: filtered.length === 0 ? "#9ca3af" : "#ef4444", fontSize: 13, fontWeight: "700" }}>
              Export PDF
            </Text>
          </TouchableOpacity>
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
                categories={categories}
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

        {/* ─── EXPORT DATE RANGE MODAL ─── */}
        <Modal
          visible={exportModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setExportModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                width: "100%",
                maxWidth: 360,
                padding: 24,
                borderWidth: 1,
                borderColor: "#f1f5f9",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 15,
                elevation: 10,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>
                  Export to {exportType === "excel" ? "Excel" : "PDF"}
                </Text>
                <TouchableOpacity
                  onPress={() => setExportModalVisible(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#f1f5f9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} color="#64748b" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500", lineHeight: 18, marginBottom: 16 }}>
                Pilih rentang tanggal untuk data transaksi yang ingin Anda ekspor. Saringan aktif tetap akan diterapkan.
              </Text>

              {/* Presets Grid */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {/* Preset: Semua Tanggal */}
                <TouchableOpacity
                  onPress={() => {
                    setExportStartDate("");
                    setExportEndDate("");
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: !exportStartDate && !exportEndDate ? "#00bf71" : "#f1f5f9",
                    backgroundColor: !exportStartDate && !exportEndDate ? "#ecfdf5" : "#fafafa",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: !exportStartDate && !exportEndDate ? "#00bf71" : "#64748b" }}>
                    Semua Tanggal
                  </Text>
                </TouchableOpacity>

                {/* Preset: Bulan Ini */}
                <TouchableOpacity
                  onPress={() => {
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth(), 1);
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    setExportStartDate(getLocalDateString(start.toISOString()));
                    setExportEndDate(getLocalDateString(end.toISOString()));
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) ? "#00bf71" : "#f1f5f9",
                    backgroundColor: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) ? "#ecfdf5" : "#fafafa",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()) ? "#00bf71" : "#64748b" }}>
                    Bulan Ini
                  </Text>
                </TouchableOpacity>

                {/* Preset: Bulan Lalu */}
                <TouchableOpacity
                  onPress={() => {
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const end = new Date(now.getFullYear(), now.getMonth(), 0);
                    setExportStartDate(getLocalDateString(start.toISOString()));
                    setExportEndDate(getLocalDateString(end.toISOString()));
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()) ? "#00bf71" : "#f1f5f9",
                    backgroundColor: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()) ? "#ecfdf5" : "#fafafa",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: exportStartDate === getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()) ? "#00bf71" : "#64748b" }}>
                    Bulan Lalu
                  </Text>
                </TouchableOpacity>

                {/* Preset: 30 Hari Terakhir */}
                <TouchableOpacity
                  onPress={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(end.getDate() - 30);
                    setExportStartDate(getLocalDateString(start.toISOString()));
                    setExportEndDate(getLocalDateString(end.toISOString()));
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: exportStartDate === getLocalDateString(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()) ? "#00bf71" : "#f1f5f9",
                    backgroundColor: exportStartDate === getLocalDateString(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()) ? "#ecfdf5" : "#fafafa",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: exportStartDate === getLocalDateString(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()) ? "#00bf71" : "#64748b" }}>
                    30 Hari Terakhir
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Inputs */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    Dari Tanggal
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsStartPickerVisible(true)}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderColor: "#e2e8f0",
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: exportStartDate ? "#334155" : "#94a3b8" }}>
                      {exportStartDate || "YYYY-MM-DD"}
                    </Text>
                    <CalendarDays size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 16, color: "#cbd5e1", fontWeight: "700", marginTop: 15 }}>─</Text>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    Sampai Tanggal
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsEndPickerVisible(true)}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderColor: "#e2e8f0",
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: exportEndDate ? "#334155" : "#94a3b8" }}>
                      {exportEndDate || "YYYY-MM-DD"}
                    </Text>
                    <CalendarDays size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setExportModalVisible(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#f1f5f9",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748b" }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmExport}
                  style={{
                    flex: 1,
                    backgroundColor: "#00bf71",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    shadowColor: "#00bf71",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "white" }}>Ekspor</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── DateTimePicker Modals ── */}
        <DateTimePickerModal
          isVisible={isStartPickerVisible}
          mode="date"
          date={exportStartDate ? new Date(exportStartDate) : new Date()}
          onConfirm={(date) => {
            setExportStartDate(getLocalDateString(date.toISOString()));
            setIsStartPickerVisible(false);
          }}
          onCancel={() => setIsStartPickerVisible(false)}
        />

        <DateTimePickerModal
          isVisible={isEndPickerVisible}
          mode="date"
          date={exportEndDate ? new Date(exportEndDate) : new Date()}
          onConfirm={(date) => {
            setExportEndDate(getLocalDateString(date.toISOString()));
            setIsEndPickerVisible(false);
          }}
          onCancel={() => setIsEndPickerVisible(false)}
        />
      </View>
    </>
  );
}

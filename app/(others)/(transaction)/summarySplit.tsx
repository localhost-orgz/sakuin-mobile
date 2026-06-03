import CategoryBottomSheet from "@/components/Form/CategoryBottomSheet";
import WalletBottomSheet from "@/components/Form/WalletBottomSheet";
import { apiRequest } from "@/utils/api";
import { getSplitSession } from "@/utils/splitSession";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Info,
  Tag,
  Wallet,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_SUMMARY = {
  amount: 132000,
  items: [
    { name: "Bangladesh Biasa", total: 45000 },
    { name: "Puding Isi 1", total: 16000 },
    { name: "Goreng goreng", total: 30000 },
    { name: "Mineral d", total: 10000 },
    { name: "Mandi (Manis Dingin)", total: 16000 },
    { name: "Goreng goreng", total: 15000 },
  ],
};

export default function SakuSummary() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const categoryBottomSheetRef = useRef<BottomSheet>(null);

  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isRecordTransaction, setIsRecordTransaction] = useState(true);

  const splitSession = getSplitSession();

  useEffect(() => {
    async function fetchData() {
      try {
        const walletsRes = await apiRequest("/wallets", { method: "GET" });
        if (
          walletsRes?.status === "success" &&
          Array.isArray(walletsRes.data)
        ) {
          setWallets(walletsRes.data);
        }
      } catch (error) {
        console.error("Gagal memuat dompet:", error);
      }
      try {
        const categoriesRes = await apiRequest("/categories", {
          method: "GET",
        });
        if (
          categoriesRes?.status === "success" &&
          Array.isArray(categoriesRes.data)
        ) {
          setCategories(categoriesRes.data);

          // Find the default predicted category
          let defaultCat = null;
          const targetId = splitSession?.category_id;
          const targetName = splitSession?.category_name?.toLowerCase();

          if (targetId) {
            defaultCat = categoriesRes.data.find(
              (c: any) => (c._id || c.id) === targetId,
            );
          }
          if (!defaultCat && targetName) {
            defaultCat = categoriesRes.data.find(
              (c: any) =>
                c.name?.toLowerCase() === targetName ||
                c.slug?.toLowerCase() === targetName,
            );
          }
          if (!defaultCat && categoriesRes.data.length > 0) {
            defaultCat = categoriesRes.data[0];
          }
          setSelectedCategory(defaultCat);
        }
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    }

    fetchData();
  }, [splitSession]);

  // Logic confirm
  const canConfirm = !isRecordTransaction || selectedWallet !== null;

  const openWalletSheet = () => bottomSheetRef.current?.expand();
  const openCategorySheet = () => categoryBottomSheetRef.current?.expand();
  const closeCategorySheet = () => categoryBottomSheetRef.current?.close();
  const summaryData = useMemo(
    () =>
      splitSession
        ? {
            amount: splitSession.amount,
            items: splitSession.items.map((i) => ({
              name: i.name,
              total: i.total,
            })),
          }
        : FALLBACK_SUMMARY,
    [splitSession],
  );

  const myTotalExpense = useMemo(() => {
    if (!splitSession || !splitSession.assignedProducts || !splitSession.items) {
      return summaryData.amount;
    }
    return splitSession.assignedProducts.reduce((acc: number, assignedIds: string[], idx: number) => {
      const item = splitSession.items[idx];
      if (!item) return acc;
      const productTotal = item.total;

      if (!assignedIds.includes("me") || assignedIds.length === 0) return acc;

      return acc + productTotal / assignedIds.length;
    }, 0);
  }, [splitSession, summaryData.amount]);

  const totalItems = summaryData.items.length;

  const handleConfirm = async () => {
    if (isRecordTransaction && selectedWallet) {
      try {
        // Resolve category_id dynamically from state or fallback
        let resolvedCategoryId = selectedCategory?._id || selectedCategory?.id;

        if (!resolvedCategoryId) {
          resolvedCategoryId = splitSession?.category_id;

          // Check if the resolvedCategoryId is a valid category ID in the user's category list
          const categoryExists = categories.some(
            (c) => (c._id || c.id) === resolvedCategoryId,
          );

          if (!resolvedCategoryId || !categoryExists) {
            // Match by name or slug (case-insensitive)
            const ocrCategoryName = splitSession?.category_name?.toLowerCase();
            const matchedCategory = categories.find(
              (c) =>
                c.name?.toLowerCase() === ocrCategoryName ||
                c.slug?.toLowerCase() === ocrCategoryName,
            );

            if (matchedCategory) {
              resolvedCategoryId = matchedCategory._id || matchedCategory.id;
            } else if (categories.length > 0) {
              // Fallback to first available category
              resolvedCategoryId = categories[0]._id || categories[0].id;
            } else {
              // Ultimate fallback if categories list is completely empty
              resolvedCategoryId = "asdf";
            }
          }
        }

        const payload = {
          category_id: resolvedCategoryId,
          wallet_id: selectedWallet._id || selectedWallet.id,
          amount: String(myTotalExpense),
          type: "expense",
          name: splitSession?.description
            ? splitSession.description.substring(0, 30)
            : "Scan SakuSnap",
          description: splitSession?.description || "Pembelian dari SakuSnap",
          date: splitSession?.date || new Date().toISOString().split("T")[0],
          input_method: "sakusnap",
          currency: "IDR",
        };
        console.log(resolvedCategoryId);
        await apiRequest("/transaction", {
          method: "POST",
          body: payload,
        });
      } catch (err) {
        console.error(
          "Gagal menyimpan transaksi setelah ocr:",
          splitSession?.date,
        );
      }
    }
    router.push("/(others)/(transaction)/participantBills");
  };

  return (
    <>
      {/* Top Safe Area */}
      <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />

      {/* Main Screen */}
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f5f5f7]">
        <StatusBar backgroundColor="#00bf71" barStyle="light-content" />

        {/* Header */}
        <View className="bg-[#00bf71] px-5 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-[17px] font-semibold">
            Ringkasan Transaksi
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Amount */}
          <View className="bg-white border-y border-gray-100 py-8 items-center mb-8">
            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2">
              Total Pengeluaran Saya
            </Text>

            <Text className="text-[#111827] text-[40px] font-bold tracking-tight">
              Rp {myTotalExpense.toLocaleString("id-ID")}
            </Text>

            <Text className="text-gray-400 text-xs mt-2">
              {totalItems} item terdeteksi
            </Text>
          </View>

          {/* Item List */}
          <View className="mb-8">
            <View className="px-5 mb-3">
              <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                Rincian Belanja
              </Text>
            </View>

            <View className="bg-white border-y border-gray-100">
              {summaryData.items.map((item, i) => (
                <View
                  key={i}
                  className={`px-5 py-4 flex-row justify-between items-center ${
                    i !== summaryData.items.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-[#111827] text-[15px] font-medium">
                      {item.name}
                    </Text>

                    <Text className="text-gray-400 text-xs mt-1">
                      Item struk
                    </Text>
                  </View>

                  <Text className="text-[#111827] text-sm font-semibold">
                    Rp {item.total.toLocaleString("id-ID")}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="mb-8">
            <View className="px-5 mb-3">
              <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                Kategori
              </Text>
            </View>

            <View className="bg-white border-y border-gray-100">
              <TouchableOpacity
                onPress={openCategorySheet}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-11 h-11 rounded-2xl bg-[#f3f4f6] items-center justify-center">
                    {selectedCategory ? (
                      <Text className="text-xl">
                        {selectedCategory.emoticon}
                      </Text>
                    ) : (
                      <Tag size={18} color="#111827" />
                    )}
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-[#111827] text-[15px] font-medium">
                      {selectedCategory
                        ? selectedCategory.name
                        : "Pilih Kategori"}
                    </Text>

                    <Text className="text-gray-500 text-xs mt-1">
                      {selectedCategory
                        ? "Kategori transaksi split bill"
                        : "Belum ada kategori dipilih"}
                    </Text>
                  </View>
                </View>

                <ArrowRight size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallet */}
          <View className="mb-8">
            <View className="px-5 mb-3">
              <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                Sumber Dana
              </Text>
            </View>

            <View className="bg-white border-y border-gray-100">
              <TouchableOpacity
                onPress={openWalletSheet}
                className="flex-row items-center justify-between px-5 py-4"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-11 h-11 rounded-2xl bg-[#f3f4f6] items-center justify-center">
                    <Wallet size={18} color="#111827" />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-[#111827] text-[15px] font-medium">
                      {selectedWallet ? selectedWallet.name : "Pilih Dompet"}
                    </Text>

                    <Text className="text-gray-500 text-xs mt-1">
                      {selectedWallet
                        ? "Saldo akan dikurangi otomatis"
                        : "Belum ada dompet dipilih"}
                    </Text>
                  </View>
                </View>

                <ArrowRight size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction Recording */}
          <View className="mb-10">
            <View className="px-5 mb-3">
              <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                Pencatatan
              </Text>
            </View>

            <View className="bg-white border-y border-gray-100">
              <TouchableOpacity
                onPress={() => setIsRecordTransaction(!isRecordTransaction)}
                activeOpacity={0.7}
                className="flex-row items-center px-5 py-4"
              >
                {isRecordTransaction ? (
                  <CheckCircle2 size={22} color="#00bf71" />
                ) : (
                  <Circle size={22} color="#9ca3af" />
                )}

                <View className="ml-4 flex-1">
                  <Text className="text-[#111827] text-[15px] font-medium">
                    Masukkan sebagai transaksi
                  </Text>

                  <Text className="text-gray-500 text-xs mt-1 leading-4">
                    Pengeluaran ini akan dicatat ke histori keuangan.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Warning */}
              {isRecordTransaction && !selectedWallet && (
                <View className="px-5 pb-4 flex-row items-start">
                  <Info size={14} color="#f59e0b" style={{ marginTop: 2 }} />

                  <Text className="text-[#b45309] text-xs ml-2 flex-1 leading-5">
                    Pilih dompet terlebih dahulu untuk menentukan sumber dana
                    transaksi ini.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            disabled={!canConfirm}
            className={`h-14 rounded-2xl items-center justify-center flex-row ${
              canConfirm ? "bg-[#00bf71]" : "bg-gray-300"
            }`}
            onPress={handleConfirm}
          >
            <Text className="text-white font-bold text-base mr-2">
              Konfirmasi
            </Text>

            <ArrowRight size={18} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Wallet Bottom Sheet */}
        <WalletBottomSheet
          ref={bottomSheetRef}
          wallets={wallets}
          selectedWallet={selectedWallet}
          onSelect={(item) => {
            setSelectedWallet(item);
            bottomSheetRef.current?.close();
          }}
        />

        {/* Category Bottom Sheet */}
        <CategoryBottomSheet
          ref={categoryBottomSheetRef}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(item) => {
            setSelectedCategory(item);
            closeCategorySheet();
          }}
        />
      </SafeAreaView>
    </>
  );
}

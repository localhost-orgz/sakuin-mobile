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

  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [isRecordTransaction, setIsRecordTransaction] = useState(true);

  useEffect(() => {
    async function fetchWallets() {
      try {
        const res = await apiRequest("/wallets", { method: "GET" });
        if (res?.status === "success" && Array.isArray(res.data)) {
          setWallets(res.data);
        }
      } catch (error) {
        console.error("Gagal memuat dompet:", error);
      }
    }

    fetchWallets();
  }, []);

  // Logic confirm
  const canConfirm = !isRecordTransaction || selectedWallet !== null;

  const openWalletSheet = () => bottomSheetRef.current?.expand();

  const splitSession = getSplitSession();
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

  const totalItems = summaryData.items.length;

  const handleConfirm = () => {
    console.log("Final Save:", { selectedWallet, isRecordTransaction });
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
              Total Akhir
            </Text>

            <Text className="text-[#111827] text-[40px] font-bold tracking-tight">
              Rp {summaryData.amount.toLocaleString("id-ID")}
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
      </SafeAreaView>
    </>
  );
}

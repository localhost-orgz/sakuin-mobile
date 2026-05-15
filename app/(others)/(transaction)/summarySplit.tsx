import WalletBottomSheet from "@/components/Form/WalletBottomSheet"; // Path sesuai snippet kamu
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
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Dummy Data
const SUMMARY_DATA = {
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

  // States 📝
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [isChecklistDone, setIsChecklistDone] = useState(false);

  // Logic: Checklist cuma bisa di-check kalo Wallet BELUM dipilih
  const canCheck = selectedWallet === null;

  const handleToggleCheck = () => {
    if (canCheck) {
      setIsChecklistDone(!isChecklistDone);
    }
  };

  const openWalletSheet = () => bottomSheetRef.current?.expand();

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-white/5 rounded-full mr-3"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          Ringkasan Transaksi 📑
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Main Amount Card 💰 */}
        <View className="bg-[#121212] p-8 rounded-[32px] items-center mb-6 border border-white/5">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
            Total Akhir
          </Text>
          <Text className="text-[#00bf71] text-4xl font-black">
            Rp {SUMMARY_DATA.amount.toLocaleString("id-ID")}
          </Text>
        </View>

        {/* Itemized List 📋 */}
        <View className="mb-6">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
            Rincian Belanja
          </Text>
          <View className="bg-white/5 rounded-3xl p-4 border border-white/5">
            {SUMMARY_DATA.items.map((item, i) => (
              <View
                key={i}
                className={`flex-row justify-between py-3 ${i !== SUMMARY_DATA.items.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <Text className="text-gray-300 text-sm">{item.name}</Text>
                <Text className="text-white font-bold text-sm">
                  Rp {item.total.toLocaleString("id-ID")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wallet Selector 💳 */}
        <View className="mb-6">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
            Sumber Dana
          </Text>
          <TouchableOpacity
            onPress={openWalletSheet}
            className="bg-white/5 flex-row items-center justify-between p-4 rounded-2xl border border-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#00bf71]/20 rounded-xl items-center justify-center">
                <Wallet size={20} color="#00bf71" />
              </View>
              <View className="ml-3">
                <Text className="text-white font-bold">
                  {selectedWallet ? selectedWallet.bank : "Pilih Dompet"}
                </Text>
                <Text className="text-gray-500 text-[10px]">
                  Saldo otomatis terpotong
                </Text>
              </View>
            </View>
            <ArrowRight size={18} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Checklist Section ✅ */}
        <View className="mb-10">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 ml-1">
            Checklist Khusus
          </Text>
          <TouchableOpacity
            onPress={handleToggleCheck}
            activeOpacity={canCheck ? 0.7 : 1}
            className={`flex-row items-center p-4 rounded-2xl border ${isChecklistDone ? "bg-[#00bf71]/10 border-[#00bf71]" : "bg-white/5 border-white/5"} ${!canCheck ? "opacity-40" : ""}`}
          >
            {isChecklistDone ? (
              <CheckCircle2 size={24} color="#00bf71" />
            ) : (
              <Circle size={24} color="#555" />
            )}
            <View className="ml-3 flex-1">
              <Text
                className={`font-bold ${isChecklistDone ? "text-[#00bf71]" : "text-white"}`}
              >
                Simpan sebagai Hutang/Piutang
              </Text>
              <Text className="text-gray-500 text-[10px]">
                Hanya bisa aktif jika dompet tidak dipilih.
              </Text>
            </View>
            {!canCheck && <Info size={14} color="#555" />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Save Button */}
      <View className="p-5 bg-[#0a0a0a] border-t border-white/5">
        <TouchableOpacity
          className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center shadow-lg shadow-[#00bf71]/20"
          onPress={() =>
            console.log("Final Save:", { selectedWallet, isChecklistDone })
          }
        >
          <Text className="text-black font-black text-lg">
            Konfirmasi Transaksi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Bottom Sheet */}
      <WalletBottomSheet
        ref={bottomSheetRef}
        selectedWallet={selectedWallet}
        onSelect={(item) => {
          setSelectedWallet(item);
          setIsChecklistDone(false); // Reset checklist kalo dompet kepilih
          bottomSheetRef.current?.close();
        }}
      />
    </SafeAreaView>
  );
}

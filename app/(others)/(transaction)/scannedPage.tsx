import { Link, useRouter } from "expo-router";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Edit3,
  ReceiptText,
  Utensils,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MOCK_STRUK_DATA } from "@/constants/sakusnapResponse";

export default function SakuResult() {
  const router = useRouter();
  const result = MOCK_STRUK_DATA.data;

  // Helper buat format Rupiah
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="flex flex-row items-center px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center border border-white/10"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">
          Hasil SakuSnap 🔍
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Total Card */}
        <View className="bg-[#121212] p-6 rounded-3xl border border-white/5 mb-6 items-center">
          <Text className="text-gray-400 text-sm mb-1">Total Pengeluaran</Text>
          <Text className="text-[#00bf71] text-3xl font-black">
            {formatIDR(result.amount)}
          </Text>

          <View className="flex-row mt-4 gap-2">
            <View className="bg-white/5 px-3 py-1.5 rounded-full flex-row items-center">
              <Utensils size={14} color="#00bf71" />
              <Text className="text-white text-xs ml-2 font-medium">
                {result.category_name}
              </Text>
            </View>
            <View className="bg-white/5 px-3 py-1.5 rounded-full flex-row items-center">
              <Calendar size={14} color="#00bf71" />
              <Text className="text-white text-xs ml-2 font-medium">
                {result.date}
              </Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4 gap-2">
            <ReceiptText size={18} color="#00bf71" />
            <Text className="text-white font-bold text-base">Rincian Item</Text>
          </View>

          {result.items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-3 border-b border-white/5"
            >
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {item.quantity}x @ {formatIDR(item.price)}
                </Text>
              </View>
              <Text className="text-white font-bold text-sm">
                {formatIDR(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View className="bg-white/5 p-4 rounded-2xl mb-10">
          <Text className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-widest">
            Catatan
          </Text>
          <Text className="text-gray-200 text-sm italic">
            "{result.description}"
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions - In a Row! 🚀 */}
      <View className="p-5 flex-row gap-3 bg-[#0a0a0a] border-t border-white/5">
        <Link href={"/(others)/(transaction)/editScannedPage"} asChild>
          <Pressable className="flex-1 flex-row bg-white/5 h-14 rounded-2xl items-center justify-center border border-white/10">
            <Edit3 size={18} color="white" />
            <Text className="text-white font-bold ml-2">Edit</Text>
          </Pressable>
        </Link>

        <TouchableOpacity
          onPress={() => console.log("Next Pressed")}
          className="flex-[2] flex-row bg-[#00bf71] h-14 rounded-2xl items-center justify-center shadow-lg shadow-[#00bf71]/20"
        >
          <Text className="text-[#0a0a0a] font-black text-lg mr-2">Simpan</Text>
          <ArrowRight size={20} color="#0a0a0a" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  Edit3,
  ReceiptText,
  Utensils,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MOCK_STRUK_DATA } from "@/constants/sakusnapResponse";
import { setSplitSession } from "@/utils/splitSession";

export default function SakuResult() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result?: string }>();

  const result = useMemo(() => {
    if (params.result) {
      try {
        const parsed = JSON.parse(params.result);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse SakuSnap OCR result", e);
      }
    }
    return MOCK_STRUK_DATA.data || {};
  }, [params.result]);

  // Helper buat format Rupiah
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <>
      {/* Top Safe Area (Jam iPhone / Notch) */}
      <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />

      {/* Main Screen */}
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f7f8fa]">
        <StatusBar barStyle="light-content" backgroundColor="#00bf71" />

        {/* Header */}
        <View className="bg-[#00bf71] px-5 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/20"
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold ml-4">
            Hasil SakuSnap
          </Text>
        </View>

        {/* White Content */}
        <View className="flex-1 bg-[#f7f8fa] rounded-t-[32px] overflow-hidden">
          <ScrollView
            className="flex-1 px-5 pt-5"
            showsVerticalScrollIndicator={false}
          >
            {/* Total Card */}
            <View className="bg-white p-6 rounded-xl border border-gray-200 mb-6 items-center">
              <Text className="text-gray-500 text-sm mb-1">
                Total Pengeluaran
              </Text>

              <Text className="text-[#00bf71] text-3xl font-bold mb-1">
                {formatIDR(result?.amount || 0)}
              </Text>

              <View className="flex-row mt-4 gap-2">
                <View className="bg-[#f3f4f6] px-3 py-1.5 rounded-full flex-row items-center">
                  <Utensils size={14} color="#00bf71" />

                  <Text className="text-[#111827] text-xs ml-2 font-medium">
                    {result?.category_name || "Lainnya"}
                  </Text>
                </View>

                <View className="bg-[#f3f4f6] px-3 py-1.5 rounded-full flex-row items-center">
                  <Calendar size={14} color="#00bf71" />

                  <Text className="text-[#111827] text-xs ml-2 font-medium">
                    {result?.date || new Date().toISOString().split("T")[0]}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items List */}
            <View className="bg-white rounded-xl border border-gray-200 px-5 py-5 mb-6">
              <View className="flex-row items-center mb-4 gap-2">
                <ReceiptText size={18} color="#00bf71" />

                <Text className="text-[#111827] font-bold text-base">
                  Rincian Item
                </Text>
              </View>

              {(result?.items || []).map((item: any, index: number) => (
                <View
                  key={index}
                  className={`flex-row justify-between items-center py-3 ${
                    index !== (result?.items || []).length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-[#111827] font-semibold text-sm">
                      {item.name}
                    </Text>

                    <Text className="text-gray-500 text-xs mt-0.5">
                      {item.quantity}x @ {formatIDR(item.price || 0)}
                    </Text>
                  </View>

                  <Text className="text-[#111827] font-bold text-sm">
                    {formatIDR(item.total || 0)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <View className="bg-white p-4 rounded-xl border border-gray-200 mb-10 ">
              <Text className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-widest">
                Catatan
              </Text>

              <Text className="text-gray-700 text-sm italic leading-6">
                "{result?.description || "Pembelian dari SakuSnap"}"
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View className="p-5 flex-row gap-3 bg-[#f7f8fa] border-t border-gray-200">
            <Link
              href={{
                pathname: "/(others)/(transaction)/editScannedPage",
                params: { result: JSON.stringify(result) },
              }}
              asChild
            >
              <Pressable className="flex-1 gap-2 flex-row bg-white py-4 rounded-xl items-center justify-center border border-gray-200">
                <Edit3 size={15} color="#111827" />

                <Text className="text-[#111827] font-bold ml-2">Edit</Text>
              </Pressable>
            </Link>

            <Link href={"/(others)/(transaction)/splitPage"} asChild>
              <TouchableOpacity
                onPress={() => {
                  setSplitSession({
                    amount: result?.amount || 0,
                    items: result?.items || [],
                    category_id: result?.category_id,
                    category_name: result?.category_name,
                    description: result?.description,
                    date: result?.date,
                    participants: [{ id: "me", name: "Me" }],
                    assignedProducts: (result?.items || []).map(() => ["me"]),
                  });
                }}
                className="flex-[2] flex-row bg-[#00bf71] rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold text-lg mr-2">
                  Lanjutkan
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

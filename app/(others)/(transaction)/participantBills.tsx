import {
  computeParticipantBills,
  getSplitSession,
  type ParticipantBill,
} from "@/utils/splitSession";
import { useRouter } from "expo-router";
import { CheckCircle2, ChevronLeft, Share2, User } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";

const formatRp = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

const ParticipantBillCard = ({ bill }: { bill: ParticipantBill }) => {
  const isMe = bill.participant.id === "me";

  return (
    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
      <View
        className={`px-5 py-4 flex-row items-center justify-between ${
          isMe ? "bg-[#00bf71]/10" : "bg-gray-50"
        }`}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isMe ? "bg-[#00bf71]" : "bg-white border border-gray-200"
            }`}
          >
            <User size={18} color={isMe ? "white" : "#6b7280"} />
          </View>
          <View className="flex-1">
            <Text className="text-[#111827] text-base font-bold">
              {bill.participant.name}
            </Text>
            <Text className="text-gray-500 text-xs mt-0.5">
              {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 text-[10px] font-bold uppercase">
            Total
          </Text>
          <Text
            className={`text-lg font-bold ${
              isMe ? "text-[#00bf71]" : "text-[#111827]"
            }`}
          >
            {formatRp(bill.total)}
          </Text>
        </View>
      </View>

      {bill.items.length === 0 ? (
        <View className="px-5 py-6 items-center">
          <Text className="text-gray-400 text-sm">Tidak ada item ditugaskan</Text>
        </View>
      ) : (
        <View className="px-5 py-2">
          {bill.items.map((item, i) => (
            <View
              key={`${bill.participant.id}-${item.name}-${i}`}
              className={`py-3.5 flex-row justify-between items-start ${
                i !== bill.items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-[#111827] text-[15px] font-medium">
                  {item.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {formatRp(item.itemTotal)}
                  {item.sharedWith > 1
                    ? ` · dibagi ${item.sharedWith} orang`
                    : ""}
                </Text>
              </View>
              <Text className="text-[#111827] text-sm font-semibold">
                {formatRp(item.share)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function ParticipantBills() {
  const router = useRouter();
  const session = getSplitSession();

  const bills = useMemo(
    () => (session ? computeParticipantBills(session) : []),
    [session],
  );

  const grandTotal = session?.amount ?? 0;
  const splitTotal = bills.reduce((sum, b) => sum + b.total, 0);

  const receiptRef = useRef<View>(null);

  const handleShareImage = async () => {
    try {
      if (!receiptRef.current) {
        Alert.alert("Error", "Tampilan struk belum siap.");
        return;
      }
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1.0,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Bagikan Rincian Tagihan",
        });
      } else {
        Alert.alert("Error", "Fitur berbagi tidak tersedia di platform ini.");
      }
    } catch (err) {
      console.error("Capture and share error:", err);
      Alert.alert("Gagal", "Gagal mengambil gambar rincian tagihan.");
    }
  };

  if (!session) {
    return (
      <>
        <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />
        <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f5f5f7] items-center justify-center px-8">
          <Text className="text-gray-600 text-center mb-6">
            Data pembagian tidak ditemukan. Mulai dari halaman bagi tagihan.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(others)/(transaction)/splitPage")}
            className="bg-[#00bf71] px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Ke Bagi Tagihan</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f5f5f7]">
        <StatusBar backgroundColor="#00bf71" barStyle="light-content" />

        <View className="bg-[#00bf71] px-5 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-[17px] font-semibold flex-1">
            Tagihan Per Orang
          </Text>
          <TouchableOpacity
            onPress={handleShareImage}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            activeOpacity={0.75}
          >
            <Share2 size={18} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="bg-white border-y border-gray-100 py-6 items-center mb-6">
            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2">
              Total Struk
            </Text>
            <Text className="text-[#111827] text-[32px] font-bold">
              {formatRp(grandTotal)}
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              {session.participants.length} partisipan · {bills.length} tagihan
            </Text>
          </View>

          <View className="px-5 mb-3">
            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              Rincian Per Partisipan
            </Text>
          </View>

          <View className="px-5">
            {bills.map((bill) => (
              <ParticipantBillCard key={bill.participant.id} bill={bill} />
            ))}
          </View>
        </ScrollView>

        <View className="px-5 py-4 bg-white border-t border-gray-200">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-gray-500 text-sm">Jumlah terbagi</Text>
            <Text className="text-[#111827] font-semibold">
              {formatRp(splitTotal)}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShareImage}
              activeOpacity={0.8}
              style={{ borderWidth: 2, borderColor: "#00bf71" }}
              className="flex-1 h-14 rounded-2xl items-center justify-center flex-row"
            >
              <Share2 size={18} color="#00bf71" />
              <Text className="text-[#00bf71] font-bold text-base ml-2">
                Bagikan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace("/(main)/home")}
              className="flex-1 bg-[#00bf71] h-14 rounded-2xl items-center justify-center flex-row"
            >
              <CheckCircle2 size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Hidden Receipt Card for Image Capture ── */}
      <View
        ref={receiptRef}
        collapsable={false}
        style={{
          position: "absolute",
          left: -9999,
          width: 375,
          backgroundColor: "#FFFFFF",
          padding: 24,
        }}
      >
        {/* Receipt Header */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#00bf71", letterSpacing: 1.5 }}>
            SAKUIN
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginTop: 4, letterSpacing: 2 }}>
            SPLIT BILL RECEIPT
          </Text>
        </View>

        {/* Info Grid */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>Tanggal</Text>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#1f2937" }}>
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>Status</Text>
          <View style={{ backgroundColor: "#00bf71", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>SUCCESS</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "#e5e7eb", marginVertical: 12, height: 1, width: "100%" }} />

        {/* Grand Total */}
        <View style={{ alignItems: "center", marginVertical: 16 }}>
          <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>
            Total Tagihan Terbagi
          </Text>
          <Text style={{ fontSize: 32, fontWeight: "900", color: "#1f2937", marginTop: 4 }}>
            {formatRp(splitTotal)}
          </Text>
          {grandTotal !== splitTotal && (
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              Total Struk: {formatRp(grandTotal)}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "#e5e7eb", marginVertical: 12, height: 1, width: "100%" }} />

        {/* Breakdown Title */}
        <Text style={{ fontSize: 13, fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", marginBottom: 16 }}>
          Rincian Per Partisipan
        </Text>

        {/* Bills Breakdown */}
        {bills.map((bill, index) => (
          <View key={bill.participant.id} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#1f2937" }}>
                👤 {bill.participant.name}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#00bf71" }}>
                {formatRp(bill.total)}
              </Text>
            </View>

            {bill.items.map((item, itemIdx) => (
              <View
                key={`${bill.participant.id}-${item.name}-${itemIdx}`}
                style={{ flexDirection: "row", justifyContent: "space-between", paddingLeft: 16, marginBottom: 4 }}
              >
                <Text style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>
                  • {item.name}{item.sharedWith > 1 ? ` (1/${item.sharedWith})` : ""}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {formatRp(item.share)}
                </Text>
              </View>
            ))}

            {index !== bills.length - 1 && (
              <View style={{ borderBottomWidth: 1, borderBottomColor: "#f3f4f6", marginTop: 12, width: "100%" }} />
            )}
          </View>
        ))}

        {/* Divider */}
        <View style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "#e5e7eb", marginVertical: 16, height: 1, width: "100%" }} />

        {/* Footer */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
            Thank you for using Sakuin 🌿
          </Text>
        </View>
      </View>
    </>
  );
}

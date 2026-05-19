import {
  computeParticipantBills,
  getSplitSession,
  type ParticipantBill,
} from "@/utils/splitSession";
import { useRouter } from "expo-router";
import { CheckCircle2, ChevronLeft, User, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
          <Users size={20} color="white" />
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
          <TouchableOpacity
            onPress={() => router.replace("/(main)/home")}
            className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center flex-row"
          >
            <CheckCircle2 size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Selesai</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

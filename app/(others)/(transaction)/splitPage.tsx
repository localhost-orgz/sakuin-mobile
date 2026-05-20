import { getSplitSession, setSplitSession } from "@/utils/splitSession";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, User } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy Constant
const MOCK_STRUK_DATA = {
  data: {
    amount: 150000,
    items: [
      { name: "Bangladesh Biasa", quantity: 3, price: 15000, total: 45000 },
      { name: "Puding Isi 1", quantity: 2, price: 8000, total: 16000 },
      { name: "Goreng goreng", quantity: 2, price: 15000, total: 30000 },
      { name: "Mineral d", quantity: 2, price: 5000, total: 10000 },
      { name: "Mandi (Manis Dingin)", quantity: 2, price: 8000, total: 16000 },
      { name: "Goreng goreng", quantity: 1, price: 15000, total: 15000 },
    ],
  },
};

export default function SakuSplit() {
  const router = useRouter();

  // State 👤
  const initialSession = getSplitSession();

  const strukData = useMemo(() => {
    return initialSession ? {
      amount: initialSession.amount,
      items: initialSession.items
    } : {
      amount: 132000,
      items: [
        { name: "Bangladesh Biasa", quantity: 3, price: 15000, total: 45000 },
        { name: "Puding Isi 1", quantity: 2, price: 8000, total: 16000 },
        { name: "Goreng goreng", quantity: 2, price: 15000, total: 30000 },
        { name: "Mineral d", quantity: 2, price: 5000, total: 10000 },
        { name: "Mandi (Manis Dingin)", quantity: 2, price: 8000, total: 16000 },
        { name: "Goreng goreng", quantity: 1, price: 15000, total: 15000 },
      ]
    };
  }, [initialSession]);

  const [participants, setParticipants] = useState(() => {
    return initialSession?.participants && initialSession.participants.length > 0
      ? initialSession.participants
      : [{ id: "me", name: "Me" }];
  });
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const [assignedProducts, setAssignedProducts] = useState(() => {
    if (initialSession?.assignedProducts && initialSession.assignedProducts.length === initialSession.items.length) {
      return initialSession.assignedProducts;
    }
    return strukData.items.map(() => ["me"]);
  });

  React.useEffect(() => {
    if (initialSession) {
      setParticipants(initialSession.participants || [{ id: "me", name: "Me" }]);
      if (initialSession.assignedProducts && initialSession.assignedProducts.length === initialSession.items.length) {
        setAssignedProducts(initialSession.assignedProducts);
      } else {
        setAssignedProducts(initialSession.items.map(() => ["me"]));
      }
    }
  }, [initialSession]);

  const addParticipant = () => {
    if (newPersonName.trim()) {
      setParticipants([
        ...participants,
        { id: Date.now().toString(), name: newPersonName },
      ]);

      setNewPersonName("");
      setIsSheetVisible(false);
    }
  };

  const toggleParticipantInProduct = (
    productIdx: number,
    participantId: string,
  ) => {
    const currentAssigned = [...assignedProducts[productIdx]];

    if (currentAssigned.includes(participantId)) {
      setAssignedProducts((prev) => {
        const next = [...prev];
        next[productIdx] = currentAssigned.filter((id) => id !== participantId);
        return next;
      });
    } else {
      setAssignedProducts((prev) => {
        const next = [...prev];
        next[productIdx] = [...currentAssigned, participantId];
        return next;
      });
    }
  };

  const myTotalExpense = useMemo(() => {
    return assignedProducts.reduce((acc, assignedIds, idx) => {
      const item = strukData.items[idx];
      if (!item) return acc;
      const productTotal = item.total;

      if (!assignedIds.includes("me") || assignedIds.length === 0) return acc;

      return acc + productTotal / assignedIds.length;
    }, 0);
  }, [assignedProducts, strukData]);

  const goToSummary = () => {
    setSplitSession({
      amount: strukData.amount,
      items: strukData.items,
      participants,
      assignedProducts,
    });
    router.push("/(others)/(transaction)/summarySplit");
  };

  return (
    <>
      {/* Top Safe Area */}
      <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />

      {/* Main Screen */}
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f7f8fa]">
        <StatusBar backgroundColor="#00bf71" barStyle="light-content" />

        {/* Header */}
        <View className="bg-[#00bf71] px-5 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/20 rounded-full mr-3"
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold">Bagi Tagihan</Text>
        </View>

        {/* Content */}
        <View className="flex-1 bg-[#f7f8fa] rounded-t-[32px] overflow-hidden">
          <ScrollView className="flex-1 pt-5">
            {/* Participants Bar */}
            <View className="mb-6 px-5">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                Partisipan
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {participants.map((p) => (
                  <View
                    key={p.id}
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${
                      p.id === "me"
                        ? "bg-[#00bf71]/10 border-[#00bf71]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <User
                      size={12}
                      color={p.id === "me" ? "#00bf71" : "#6b7280"}
                    />

                    <Text
                      className={`text-xs ml-2 font-bold ${
                        p.id === "me" ? "text-[#00bf71]" : "text-[#111827]"
                      }`}
                    >
                      {p.name}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => setIsSheetVisible(true)}
                  className="w-10 h-10 bg-[#00bf71] rounded-full items-center justify-center"
                >
                  <Plus size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View className="mb-16">
              {/* Section Title */}
              <View className="px-5 mb-3">
                <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                  Daftar Belanja & Pembagian
                </Text>
              </View>

              {/* Full Width List */}
              <View className="bg-white border-y border-gray-100">
                {strukData.items.map((item, idx) => {
                  const assignedCount = assignedProducts[idx]?.length || 0;

                  const myShare = assignedProducts[idx]?.includes("me")
                    ? item.total / (assignedCount || 1)
                    : 0;

                  return (
                    <View
                      key={idx}
                      className={`px-5 py-4 ${
                        idx !== strukData.items.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      {/* Top */}
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-4">
                          <Text className="text-[#111827] text-[15px] font-semibold leading-5">
                            {item.name}
                          </Text>

                          <Text className="text-gray-400 text-xs mt-1">
                            Rp {item.total.toLocaleString("id-ID")}
                          </Text>
                        </View>

                        {/* My Share */}
                        <View className="items-end">
                          <Text className="text-[#111827] text-sm font-semibold">
                            Rp {myShare.toLocaleString("id-ID")}
                          </Text>

                          <Text className="text-[#00bf71] text-[11px] mt-1 font-medium">
                            Bagian saya
                          </Text>
                        </View>
                      </View>

                      {/* Participants */}
                      <View className="flex-row flex-wrap gap-2 mt-4">
                        {participants.map((p) => {
                          const isSelected = assignedProducts[idx].includes(
                            p.id,
                          );

                          return (
                            <TouchableOpacity
                              key={p.id}
                              onPress={() =>
                                toggleParticipantInProduct(idx, p.id)
                              }
                              activeOpacity={0.7}
                              className={`h-8 px-3 rounded-full flex-row items-center ${
                                isSelected ? "bg-[#ecfdf3]" : "bg-[#f3f4f6]"
                              }`}
                            >
                              <View
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  isSelected ? "bg-[#00bf71]" : "bg-gray-300"
                                }`}
                              />

                              <Text
                                className={`text-xs font-medium ${
                                  isSelected
                                    ? "text-[#00bf71]"
                                    : "text-gray-500"
                                }`}
                              >
                                {p.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-5 bg-[#f7f8fa] border-t border-gray-200 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">
                Total Porsi Aku
              </Text>

              <Text className="text-[#111827] text-xl font-bold">
                Rp {myTotalExpense.toLocaleString("id-ID")}
              </Text>
            </View>

            <Pressable
              onPress={goToSummary}
              className="bg-[#00bf71] px-6 h-12 rounded-xl flex-row items-center justify-center"
            >
              <Text className="text-white font-bold mr-2">Simpan</Text>
            </Pressable>
          </View>
        </View>

        {/* Modal */}
        <Modal
          visible={isSheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsSheetVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsSheetVisible(false)}>
            <View className="flex-1 justify-end bg-black/40">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View className="bg-white p-6 rounded-t-[32px] border-t border-gray-200">
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                    <Text className="text-[#111827] text-lg font-bold mb-4 text-center">
                      Tambah Teman Split
                    </Text>

                    <TextInput
                      placeholder="Contoh: Budi atau Tia Monika"
                      placeholderTextColor="#9ca3af"
                      value={newPersonName}
                      onChangeText={setNewPersonName}
                      autoFocus
                      className="bg-[#f3f4f6] border border-gray-200 text-[#111827] p-4 rounded-2xl mb-6 text-center text-lg font-semibold"
                    />

                    <TouchableOpacity
                      onPress={addParticipant}
                      className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center active:opacity-80"
                    >
                      <Text className="text-white font-black text-base">
                        Konfirmasi
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setIsSheetVisible(false)}
                      className="my-4 items-center"
                    >
                      <Text className="text-gray-500 font-medium">Batal</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </>
  );
}

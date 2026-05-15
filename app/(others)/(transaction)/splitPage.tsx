import { useRouter } from "expo-router";
import { Check, ChevronLeft, Plus, User } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Dummy Constant
const MOCK_STRUK_DATA = {
  data: {
    amount: 132000,
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
  const [participants, setParticipants] = useState([{ id: "me", name: "Me" }]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [assignedProducts, setAssignedProducts] = useState(
    MOCK_STRUK_DATA.data.items.map(() => ["me"]),
  );

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
      const productTotal = MOCK_STRUK_DATA.data.items[idx].total;
      if (!assignedIds.includes("me") || assignedIds.length === 0) return acc;
      return acc + productTotal / assignedIds.length;
    }, 0);
  }, [assignedProducts]);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 py-4 border-b border-white/5 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-white/5 rounded-full mr-3"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Bagi Tagihan 🍕</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Participants Bar */}
        <View className="mb-6">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">
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
                className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${p.id === "me" ? "bg-[#00bf71]/10 border-[#00bf71]" : "bg-white/5 border-white/10"}`}
              >
                <User size={12} color={p.id === "me" ? "#00bf71" : "white"} />
                <Text
                  className={`text-xs ml-2 font-bold ${p.id === "me" ? "text-[#00bf71]" : "text-white"}`}
                >
                  {p.name}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setIsSheetVisible(true)}
              className="w-10 h-10 bg-[#00bf71] rounded-full items-center justify-center"
            >
              <Plus size={20} color="black" strokeWidth={3} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Product List */}
        <View className="mb-20">
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">
            Daftar Belanja & Pembagian
          </Text>
          {MOCK_STRUK_DATA.data.items.map((item, idx) => {
            const assignedCount = assignedProducts[idx].length;
            const myShare = assignedProducts[idx].includes("me")
              ? item.total / (assignedCount || 1)
              : 0;

            return (
              <View
                key={idx}
                className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/5"
              >
                <View className="flex-row justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm">
                      {item.name}
                    </Text>
                    <Text className="text-gray-500 text-[10px]">
                      Rp {item.total.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[#00bf71] font-black text-sm">
                      Rp {myShare.toLocaleString("id-ID")}
                    </Text>
                    <Text className="text-gray-500 text-[8px]">PORSI AKU</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2 pt-2 border-t border-white/5">
                  {participants.map((p) => {
                    const isSelected = assignedProducts[idx].includes(p.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => toggleParticipantInProduct(idx, p.id)}
                        className={`px-3 py-1.5 rounded-lg border ${isSelected ? "bg-[#00bf71] border-[#00bf71]" : "bg-transparent border-white/10"}`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${isSelected ? "text-black" : "text-gray-500"}`}
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
      </ScrollView>

      {/* Footer */}
      <View className="p-5 bg-[#0a0a0a] border-t border-white/10 flex-row items-center justify-between">
        <View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase">
            Total Porsi Aku
          </Text>
          <Text className="text-white text-xl font-black">
            Rp {myTotalExpense.toLocaleString("id-ID")}
          </Text>
        </View>
        <TouchableOpacity className="bg-[#00bf71] px-6 h-12 rounded-2xl flex-row items-center justify-center shadow-lg shadow-[#00bf71]/20">
          <Text className="text-black font-bold mr-2">Simpan</Text>
          <Check size={18} color="black" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* ── Perbaikan: Keyboard Floating Sheet ── */}
      <Modal
        visible={isSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSheetVisible(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="bg-[#121212] p-6 rounded-t-[32px] border-t border-white/10">
                  <View className="w-12 h-1 bg-white/20 rounded-full self-center mb-6" />

                  <Text className="text-white text-lg font-bold mb-4 text-center">
                    Tambah Teman Split 🤝
                  </Text>

                  <TextInput
                    placeholder="Contoh: Nayy atau Tia Monika"
                    placeholderTextColor="#555"
                    value={newPersonName}
                    onChangeText={setNewPersonName}
                    autoFocus
                    className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl mb-6 text-center text-lg font-semibold"
                  />

                  <TouchableOpacity
                    onPress={addParticipant}
                    className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center active:opacity-80"
                  >
                    <Text className="text-black font-black text-base">
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
  );
}

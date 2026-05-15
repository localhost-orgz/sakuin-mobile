import { Link, useRouter } from "expo-router";
import {
  AlignLeft,
  Calendar,
  ChevronLeft,
  DollarSign,
  Plus,
  Save,
  Trash2,
  Utensils,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Dummy Constant dari kamu
const MOCK_STRUK_DATA = {
  data: {
    category_id: "69a99efab5420796db171e00",
    category_name: "Makanan & Minuman",
    amount: 132000,
    type: "expense",
    description: "Pembelian makanan dan minuman dari Warkop Kompleks Pojok.",
    date: "2025-03-14",
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

export default function SakuEdit() {
  const router = useRouter();

  // State yang udah terisi data awal 📝
  const [formData, setFormData] = useState(MOCK_STRUK_DATA.data);

  // Fungsi buat update info item satuan
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total item
    if (field === "quantity" || field === "price") {
      const q = field === "quantity" ? value : newItems[index].quantity;
      const p = field === "price" ? value : newItems[index].price;
      newItems[index].total = Number(q) * Number(p);
    }

    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-5 py-4 border-b border-white/5">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center border border-white/10"
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold ml-4">
              Edit Data Struk ✏️
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Info Utama 🔎 */}
          <View className="mb-8">
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
              Informasi Umum
            </Text>

            {/* Amount Input */}
            <View className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
              <View className="flex-row items-center mb-2">
                <DollarSign size={16} color="#00bf71" />
                <Text className="text-gray-400 text-xs ml-2">
                  Total Pengeluaran
                </Text>
              </View>
              <TextInput
                value={String(formData.amount)}
                onChangeText={(val) =>
                  setFormData({ ...formData, amount: Number(val) })
                }
                keyboardType="numeric"
                className="text-white text-2xl font-bold p-0"
                placeholderTextColor="#444"
              />
            </View>

            <View className="flex-row gap-3">
              {/* Category (UI Mockup) */}
              <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center mb-1">
                  <Utensils size={14} color="#00bf71" />
                  <Text className="text-gray-400 text-[10px] ml-2">
                    Kategori
                  </Text>
                </View>
                <Text className="text-white font-semibold text-sm">
                  {formData.category_name}
                </Text>
              </TouchableOpacity>

              {/* Date (UI Mockup) */}
              <TouchableOpacity className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center mb-1">
                  <Calendar size={14} color="#00bf71" />
                  <Text className="text-gray-400 text-[10px] ml-2">
                    Tanggal
                  </Text>
                </View>
                <Text className="text-white font-semibold text-sm">
                  {formData.date}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Daftar Item ✅ */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Detail Item
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Plus size={14} color="#00bf71" />
                <Text className="text-[#00bf71] text-xs font-bold ml-1">
                  Tambah
                </Text>
              </TouchableOpacity>
            </View>

            {formData.items.map((item, index) => (
              <View
                key={index}
                className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/5"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <TextInput
                    value={item.name}
                    onChangeText={(val) => updateItem(index, "name", val)}
                    className="text-white font-bold text-sm flex-1 mr-2 p-0"
                    placeholder="Nama Item"
                  />
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-[10px] mb-1">Qty</Text>
                    <TextInput
                      value={String(item.quantity)}
                      onChangeText={(val) => updateItem(index, "quantity", val)}
                      keyboardType="numeric"
                      className="bg-black/20 text-white p-2 rounded-lg text-xs"
                    />
                  </View>
                  <View className="flex-[2]">
                    <Text className="text-gray-500 text-[10px] mb-1">
                      Harga Satuan
                    </Text>
                    <TextInput
                      value={String(item.price)}
                      onChangeText={(val) => updateItem(index, "price", val)}
                      keyboardType="numeric"
                      className="bg-black/20 text-white p-2 rounded-lg text-xs"
                    />
                  </View>
                  <View className="flex-[2] items-end justify-end">
                    <Text className="text-gray-500 text-[10px] mb-1">
                      Total
                    </Text>
                    <Text className="text-[#00bf71] font-bold text-sm">
                      {(item.quantity * item.price).toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Section 3: Deskripsi 💡 */}
          <View className="mb-10">
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
              Catatan Tambahan
            </Text>
            <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-start">
                <AlignLeft size={16} color="#00bf71" className="mt-1" />
                <TextInput
                  value={formData.description}
                  onChangeText={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                  multiline
                  className="text-white text-sm ml-3 flex-1 p-0"
                  style={{ textAlignVertical: "top", minHeight: 60 }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button 😎 */}
        <View className="p-5 bg-[#0a0a0a] border-t border-white/5">
          <Link href={"/(others)/(transaction)/splitPage"} asChild>
            <Pressable
              onPress={() => console.log("Final Saved Data:", formData)}
              className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center flex-row shadow-lg shadow-[#00bf71]/20"
            >
              <Save size={20} color="#0a0a0a" strokeWidth={2.5} />
              <Text className="text-[#0a0a0a] font-black text-lg ml-2">
                Simpan Perubahan
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

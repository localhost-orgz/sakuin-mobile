import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { setSplitSession } from "@/utils/splitSession";
import {
  AlignLeft,
  Calendar,
  ChevronLeft,
  DollarSign,
  Plus,
  Trash2,
  Utensils,
} from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy Constant
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
      {
        name: "Mandi (Manis Dingin)",
        quantity: 2,
        price: 8000,
        total: 16000,
      },
      { name: "Goreng goreng", quantity: 1, price: 15000, total: 15000 },
    ],
  },
};

type LineItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

const createEmptyItem = (): LineItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  quantity: 1,
  price: 0,
  total: 0,
});

const withItemIds = (
  items: Omit<LineItem, "id">[],
): LineItem[] =>
  items.map((item, index) => ({
    ...item,
    id: `item-${index}-${item.name.slice(0, 8)}`,
  }));

export default function SakuEdit() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result?: string }>();

  const initialData = useMemo(() => {
    if (params.result) {
      try {
        return JSON.parse(params.result);
      } catch (e) {
        console.error("Failed to parse edit initial data", e);
      }
    }
    return MOCK_STRUK_DATA.data;
  }, [params.result]);

  const [formData, setFormData] = useState({
    ...initialData,
    items: withItemIds(initialData.items || []),
  });

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Auto calculate
    if (field === "quantity" || field === "price") {
      const q =
        field === "quantity" ? Number(value) : Number(newItems[index].quantity);

      const p =
        field === "price" ? Number(value) : Number(newItems[index].price);

      newItems[index].total = q * p;
    }

    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index);

    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const addItemAt = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 0, createEmptyItem());

    setFormData({
      ...formData,
      items: newItems,
    });
  };

  return (
    <>
      {/* Top Safe Area */}
      <SafeAreaView edges={["top"]} className="bg-[#00bf71]" />

      {/* Main Screen */}
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#f7f8fa]">
        <StatusBar backgroundColor="#00bf71" barStyle="light-content" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="bg-[#00bf71] px-5 py-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-bold">
              Edit Data Struk
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 bg-[#f7f8fa] rounded-t-[32px] overflow-hidden">
            <ScrollView
              className="flex-1 px-5 pt-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Informasi Umum */}
              <View className="mb-8">
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Informasi Umum
                </Text>

                {/* Amount */}
                <View className="bg-white rounded-lg p-5 mb-4 border border-gray-200">
                  <View className="flex-row items-center mb-2">
                    <DollarSign size={16} color="#00bf71" />

                    <Text className="text-gray-500 text-xs ml-2">
                      Total Pengeluaran
                    </Text>
                  </View>

                  <TextInput
                    value={String(formData.amount)}
                    onChangeText={(val) =>
                      setFormData({
                        ...formData,
                        amount: Number(val),
                      })
                    }
                    keyboardType="numeric"
                    className="text-[#111827] text-2xl font-bold p-0"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View className="flex-row gap-3">
                  {/* Category */}
                  <TouchableOpacity className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                    <View className="flex-row items-center mb-1">
                      <Utensils size={14} color="#00bf71" />

                      <Text className="text-gray-500 text-[10px] ml-2">
                        Kategori
                      </Text>
                    </View>

                    <Text className="text-[#111827] font-semibold text-sm">
                      {formData.category_name}
                    </Text>
                  </TouchableOpacity>

                  {/* Date */}
                  <TouchableOpacity className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                    <View className="flex-row items-center mb-1">
                      <Calendar size={14} color="#00bf71" />

                      <Text className="text-gray-500 text-[10px] ml-2">
                        Tanggal
                      </Text>
                    </View>

                    <Text className="text-[#111827] font-semibold text-sm">
                      {formData.date}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Detail Item */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Detail Item
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => addItemAt(0)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center gap-2 py-3 mb-4 rounded-lg border border-dashed border-[#00bf71] bg-[#00bf71]/10"
                >
                  <Plus size={16} color="#00bf71" strokeWidth={2.5} />
                  <Text className="text-[#00bf71] text-sm font-bold">
                    Tambah item baru
                  </Text>
                </TouchableOpacity>

                {formData.items.map((item: any, index: number) => (
                  <View key={item.id} className="mb-3">
                    <View className="bg-white rounded-lg p-4 border border-gray-200">
                    <View className="flex-row justify-between items-start mb-4">
                      <TextInput
                        value={item.name}
                        onChangeText={(val) => updateItem(index, "name", val)}
                        className="text-[#111827] font-bold text-md flex-1 mr-2 p-0"
                        placeholder="Nama Item"
                        placeholderTextColor="#9ca3af"
                      />

                      <TouchableOpacity onPress={() => removeItem(index)}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-4">
                      {/* Qty */}
                      <View className="flex-1">
                        <Text className="text-gray-400 text-[10px] mb-1">
                          Qty
                        </Text>

                        <TextInput
                          value={String(item.quantity)}
                          onChangeText={(val) =>
                            updateItem(index, "quantity", val)
                          }
                          keyboardType="numeric"
                          className="bg-[#f3f4f6] text-[#111827] p-3 border border-gray-200 rounded-lg text-xs"
                        />
                      </View>

                      {/* Price */}
                      <View className="flex-[2]">
                        <Text className="text-gray-400 text-[10px] mb-1">
                          Harga Satuan
                        </Text>

                        <TextInput
                          value={String(item.price)}
                          onChangeText={(val) =>
                            updateItem(index, "price", val)
                          }
                          keyboardType="numeric"
                          className="bg-[#f3f4f6] border border-gray-200 text-[#111827] p-3 rounded-lg text-xs"
                        />
                      </View>

                      {/* Total */}
                      <View className="flex-[2] items-end justify-end">
                        <Text className="text-gray-400 text-[10px] mb-1">
                          Total
                        </Text>

                        <Text className="text-[#00bf71] font-bold text-sm">
                          {item.total.toLocaleString("id-ID")}
                        </Text>
                      </View>
                    </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Description */}
              <View className="mb-10">
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Catatan Tambahan
                </Text>

                <View className="bg-white rounded-lg p-4 border border-gray-200">
                  <View className="flex-row items-start">
                    <AlignLeft size={16} color="#00bf71" />

                    <TextInput
                      value={formData.description}
                      onChangeText={(val) =>
                        setFormData({
                          ...formData,
                          description: val,
                        })
                      }
                      multiline
                      className="text-[#111827] text-sm ml-3 flex-1 p-0"
                      style={{
                        textAlignVertical: "top",
                        minHeight: 60,
                      }}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className="p-5 bg-[#f7f8fa] border-t border-gray-200">
              <Link href={"/(others)/(transaction)/splitPage"} asChild>
                <Pressable
                  onPress={() => {
                    const totalAmount = formData.items.reduce((sum: number, item: any) => sum + item.total, 0);
                    setSplitSession({
                      amount: totalAmount,
                      items: formData.items.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total
                      })),
                      category_id: formData.category_id,
                      category_name: formData.category_name,
                      description: formData.description,
                      date: formData.date,
                      participants: [{ id: "me", name: "Me" }],
                      assignedProducts: formData.items.map(() => ["me"]),
                    });
                  }}
                  className="bg-[#00bf71] h-14 rounded-2xl items-center justify-center flex-row"
                >
                  <Text className="text-white font-bold text-lg ml-2">
                    Simpan Perubahan
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

import CategoryBottomSheet from "@/components/Form/CategoryBottomSheet";
import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import WalletBottomSheet from "@/components/Form/WalletBottomSheet";
import { CURRENCY_LIST } from "@/constants/currencyList";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { CalendarDays, ChevronDown } from "lucide-react-native";
import { useRef, useState, useEffect } from "react"; // 1. Tambahkan useEffect
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { apiRequest } from "@/utils/api"; // 2. Import apiRequest

import {
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddTransaction() {
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("0.00");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State untuk menampung data dari API
  const [categories, setCategories] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCY_LIST.find((c) => c.code === "IDR") ?? CURRENCY_LIST[0],
  );
  
  // Awalnya set ke null atau objek kosong sebelum data API masuk
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Fetching Data dari API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Menggunakan apiRequest wrapper yang sudah dibuat
        const categoriesRes = await apiRequest("/categories", { method: "GET" });
        const walletsRes = await apiRequest("/wallets", { method: "GET" });

        if (categoriesRes?.status === "success") {
          setCategories(categoriesRes.data);
          // Set default category pertama jika tersedia
          if (categoriesRes.data.length > 0) {
            setSelectedCategory(categoriesRes.data[0]);
          }
        }

        if (walletsRes?.status === "success") {
          setWallets(walletsRes.data);
          // Set default wallet pertama jika tersedia
          if (walletsRes.data.length > 0) {
            setSelectedWallet(walletsRes.data[0]);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data kategori atau wallet:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // -- helper
  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleConfirm = (selected: Date) => {
    setDate(selected);
    setShowDatePicker(false);
  };

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // -- sheets
  const currencyBottomSheet = useRef<BottomSheet>(null);
  const categoryBottomSheet = useRef<BottomSheet>(null);
  const walletBottomSheet = useRef<BottomSheet>(null);

  const openCurrencySheet = () => currencyBottomSheet.current?.expand();
  const closeCurrencySheet = () => currencyBottomSheet.current?.close();
  const openCategorySheet = () => categoryBottomSheet.current?.expand();
  const closeCategorySheet = () => categoryBottomSheet.current?.close();
  const openWalletSheet = () => walletBottomSheet.current?.expand();
  const closeWalletSheet = () => walletBottomSheet.current?.close();

  const handleSelectCurrency = (currency: any) => {
    setSelectedCurrency(currency);
    closeCurrencySheet();
  };

  const handleSelectWallet = (wallet: any) => {
    setSelectedWallet(wallet);
    closeWalletSheet();
  };

  const handleSelectCategory = (category: any) => {
    setSelectedCategory(category);
    closeCategorySheet();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={"dark-content"} />
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-white px-5 flex-col justify-between"
      >
        <View>
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity onPress={() => router.back()} className="z-10">
              <Text className="text-[#00bf71] font-semibold text-base">
                ← Back
              </Text>
            </TouchableOpacity>
            <View className="absolute left-0 right-0 items-center justify-center">
              <Text className="text-xl font-bold text-[#1a1f36]">
                Add Transaction
              </Text>
            </View>
            <View className="w-10" />
          </View>

          {/* Income / Expense toggle */}
          <View className="w-full mt-2 justify-center flex flex-row">
            <View className="bg-slate-200 p-1 w-[180px] rounded-md flex flex-row gap-1">
              <Pressable
                onPress={() => setTransactionType("income")}
                style={{ backgroundColor: transactionType === "income" ? "#FFF" : undefined }}
                className="flex-1 p-2 rounded"
              >
                <Text className="text-center">Income</Text>
              </Pressable>
              <Pressable
                onPress={() => setTransactionType("expense")}
                style={{ backgroundColor: transactionType === "expense" ? "#FFF" : undefined }}
                className="flex-1 p-2 rounded"
              >
                <Text className="text-center">Expense</Text>
              </Pressable>
            </View>
          </View>

          {/* Amount */}
          <View className="flex-row items-center justify-center my-10">
            <Text className="text-4xl font-bold mr-2">
              {selectedCurrency.symbol ?? selectedCurrency.code}
            </Text>
            <TextInput
              className="text-4xl font-bold text-black"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />
          </View>

          {/* Currency and Date */}
          <View className="flex flex-row items-center justify-center">
            <View className="w-1/2 flex-col items-start gap-1">
              <Text className="text-sm font-medium">Pick Currency</Text>
              <Pressable
                onPress={openCurrencySheet}
                className="w-[90%] flex flex-row p-2 bg-white border border-slate-200 rounded-lg items-center justify-between"
              >
                <View className="flex flex-row items-center gap-2">
                  <Text className="text-sm text-[#00bf71] font-semibold">
                    {selectedCurrency.code}
                  </Text>
                  <Text numberOfLines={1} className="text-xs text-gray-500">
                    {selectedCurrency.name}
                  </Text>
                </View>
                <ChevronDown stroke={"#94a3b8"} size={18} />
              </Pressable>
            </View>
            <View style={{ position: "relative" }} className="w-1/2 flex-col items-start gap-1">
              <Text className="text-sm font-medium">Pick Date</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="w-[90%] flex flex-row p-2 bg-white border border-slate-200 rounded-lg items-center justify-between"
              >
                <View className="flex flex-row gap-2 items-center">
                  <CalendarDays size={15} stroke={"#00bf71"} />
                  <Text className="text-sm">{formatDate(date)}</Text>
                </View>
                <ChevronDown stroke={"#94a3b8"} size={18} />
              </Pressable>

              {showDatePicker && (
                <View
                  style={{
                    position: "absolute",
                    top: 40,
                    left: -150,
                    zIndex: 999,
                    backgroundColor: "white",
                    borderRadius: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode="date"
                    date={date}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View className="mt-8 gap-4">
            {/* Nama */}
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Nama</Text>
              <View className="border border-gray-300 rounded-lg">
                <TextInput
                  placeholder="Masukkan Nama"
                  placeholderTextColor="#9CA3AF"
                  className="text-black px-4 py-3"
                />
              </View>
            </View>

            {/* Deskripsi */}
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Deskripsi</Text>
              <View className="border border-gray-300 rounded-lg">
                <TextInput
                  placeholder="Masukkan Deskripsi"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100, paddingTop: 12 }}
                  placeholderTextColor="#9CA3AF"
                  className="text-black px-4 py-3"
                />
              </View>
            </View>

            {/* Kategori */}
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Kategori</Text>
              <Pressable
                onPress={openCategorySheet}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
              >
                <Text className={selectedCategory ? "text-black" : "text-[#9CA3AF]"}>
                  {selectedCategory ? `${selectedCategory.emoticon} ${selectedCategory.name}` : "Pilih Kategori"}
                </Text>
                <ChevronDown size={18} />
              </Pressable>
            </View>

            {/* Wallet */}
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Wallet</Text>
              <Pressable
                onPress={openWalletSheet}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
              >
                <Text className={selectedWallet ? "text-black" : "text-[#9CA3AF]"}>
                  {selectedWallet ? selectedWallet.name : "Pilih Wallet"}
                </Text>
                <ChevronDown size={18} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={{ marginBottom: insets.bottom + 16 }}
          className="self-center w-full py-3 bg-[#00bf71] rounded-[20px] items-center justify-center active:opacity-80"
        >
          <Text className="text-white text-lg font-semibold">Submit</Text>
        </Pressable>
      </View>

      <CurrencyBottomSheet
        ref={currencyBottomSheet}
        selectedCurrency={selectedCurrency}
        onSelect={handleSelectCurrency}
      />

      <CategoryBottomSheet
        ref={categoryBottomSheet}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleSelectCategory}
      />

      <WalletBottomSheet
        ref={walletBottomSheet}
        wallets={wallets}
        selectedWallet={selectedWallet}
        onSelect={handleSelectWallet}
      />
    </>
  );
}
import CategoryBottomSheet from "@/components/Form/CategoryBottomSheet";
import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import WalletBottomSheet from "@/components/Form/WalletBottomSheet";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { WALLET_LIST } from "@/constants/walletList";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { CalendarDays, ChevronDown } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddTransaction() {
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("0.00");
  const [date, setDate] = useState(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCY_LIST.find((c) => c.code === "IDR") ?? CURRENCY_LIST[0],
  );
  const [selectedWallet, setSelectedWallet] = useState(
    WALLET_LIST.find((w) => w.bank === "BCA") ?? WALLET_LIST[0],
  );
  const [selectedCategory, setSelectedCategory] = useState("shopping");

  // -- layout
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // -- sheets
  const currencyBottomSheet = useRef<BottomSheet>(null);
  const categoryBottomSheet = useRef<BottomSheet>(null);
  const walletBottomSheet = useRef<BottomSheet>(null);

  const openCurrencySheet = () => {
    currencyBottomSheet.current?.expand();
  };
  const closeCurrencySheet = () => {
    currencyBottomSheet.current?.close();
  };
  const openCategorySheet = () => {
    categoryBottomSheet.current?.expand();
  };
  const closeCategorySheet = () => {
    categoryBottomSheet.current?.close();
  };
  const openWalletSheet = () => {
    walletBottomSheet.current?.expand();
  };
  const closeWalletSheet = () => {
    walletBottomSheet.current?.close();
  };

  const handleSelectCurrency = (currency: any) => {
    setSelectedCurrency(currency);
    closeCurrencySheet();
  };

  const handleSelectWallet = (wallet: any) => {
    setSelectedWallet(wallet);
    closeWalletSheet();
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    closeCategorySheet();
  };

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
                style={{
                  backgroundColor:
                    transactionType === "income" ? "#FFF" : undefined,
                }}
                className="flex-1 p-2 rounded"
              >
                <Text className="text-center">Income</Text>
              </Pressable>
              <Pressable
                onPress={() => setTransactionType("expense")}
                style={{
                  backgroundColor:
                    transactionType === "expense" ? "#FFF" : undefined,
                }}
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
            <View className="w-1/2 flex-col items-start gap-1">
              <Text className="text-sm font-medium">Pick Date</Text>
              <Pressable className="w-[90%] flex flex-row p-2 bg-white border border-slate-200 rounded-lg items-center justify-between">
                <View className="flex flex-row gap-2">
                  <CalendarDays size={15} stroke={"#00bf71"} />
                  <Text className="text-sm">Today</Text>
                </View>
                <ChevronDown stroke={"#94a3b8"} size={18} />
              </Pressable>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mt-8 gap-4">
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
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Deskripsi</Text>
              <View className="border border-gray-300 rounded-lg">
                <TextInput
                  placeholder="Masukkan Deskripsi"
                  placeholderTextColor="#9CA3AF"
                  className="text-black px-4 py-3"
                />
              </View>
            </View>
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Kategori</Text>
              <Pressable
                onPress={openCategorySheet}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
              >
                <Text className="text-[#9CA3AF]">Pilih Kategori</Text>
                <ChevronDown size={18} />
              </Pressable>
            </View>
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Wallet</Text>
              <Pressable
                onPress={openWalletSheet}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
              >
                <Text className="text-[#9CA3AF]">Pilih Wallet</Text>
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
        selectedCategory={selectedCategory}
        onSelect={handleSelectCategory}
      />

      <WalletBottomSheet
        ref={walletBottomSheet}
        selectedWallet={selectedWallet}
        onSelect={handleSelectWallet}
      />
    </>
  );
}

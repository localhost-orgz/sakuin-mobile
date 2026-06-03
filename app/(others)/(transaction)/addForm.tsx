import CategoryBottomSheet from "@/components/Form/CategoryBottomSheet";
import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import GoalBottomSheet from "@/components/Form/GoalBottomSheet";
import WalletBottomSheet from "@/components/Form/WalletBottomSheet";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { apiRequest } from "@/utils/api";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, ChevronDown } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddTransaction() {
  // Ambil data param autofill yang dikirim dari halaman SakuVoice
  const { walletId, autofill } = useLocalSearchParams<{
    walletId?: string;
    autofill?: string;
  }>();
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState(""); // Nilai awal string kosong agar placeholder muncul
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State baru untuk Nama dan Deskripsi
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // State untuk menampung data dari API
  const [categories, setCategories] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // State loading saat submit button ditekan

  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCY_LIST.find((c) => c.code === "IDR") ?? CURRENCY_LIST[0],
  );

  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  // Fetching Data dari API untuk Dropdown/BottomSheet
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const categoriesRes = await apiRequest("/categories", {
          method: "GET",
        });
        const walletsRes = await apiRequest("/wallets", { method: "GET" });
        const profileRes = await apiRequest("/auth/profile", { method: "GET" });
        const goalsRes = await apiRequest("/goals", { method: "GET" });

        let currentCategories = [];
        let currentWallets = [];

        if (categoriesRes?.status === "success") {
          setCategories(categoriesRes.data);
          currentCategories = categoriesRes.data;
          if (categoriesRes.data.length > 0) {
            setSelectedCategory(categoriesRes.data[0]);
          }
        }

        if (walletsRes?.status === "success") {
          setWallets(walletsRes.data);
          currentWallets = walletsRes.data;
          if (walletsRes.data.length > 0) {
            // Preselect wallet if walletId matches
            const preselectedWallet = walletsRes.data.find(
              (w: any) => (w._id || w.id) === walletId,
            );
            setSelectedWallet(preselectedWallet || walletsRes.data[0]);
          }
        }

        if (goalsRes?.status === "success") {
          setGoals(goalsRes.data);
          if (goalsRes.data.length > 0) {
            setSelectedGoal(goalsRes.data[0]);
          }
        }

        if (
          profileRes?.status === "success" &&
          profileRes.data?.default_currency
        ) {
          const userCurrency = profileRes.data.default_currency;
          const code =
            typeof userCurrency === "string" ? userCurrency : userCurrency.code;
          const matched = CURRENCY_LIST.find((c) => c.code === code);
          if (matched) {
            setSelectedCurrency(matched);
          }
        }

        // --- PROSES AUTOFILL JIKA DATA DARI SAKUVOICE TERSEDIA ---
        if (autofill) {
          try {
            const parsedData = JSON.parse(autofill);

            if (parsedData.name) setName(parsedData.name);
            if (parsedData.description) setDescription(parsedData.description);
            if (parsedData.type) setTransactionType(parsedData.type);
            if (parsedData.date) setDate(new Date(parsedData.date));

            if (parsedData.amount) {
              const formattedAmount = formatCurrencyInput(
                parsedData.amount.toString(),
              );
              setAmount(formattedAmount);
            }

            if (parsedData.currency) {
              const matchedCurrency = CURRENCY_LIST.find(
                (c) => c.code === parsedData.currency,
              );
              if (matchedCurrency) setSelectedCurrency(matchedCurrency);
            }

            if (parsedData.category_id && currentCategories.length > 0) {
              const matchedCat = currentCategories.find(
                (c: any) => (c._id || c.id) === parsedData.category_id,
              );
              if (matchedCat) setSelectedCategory(matchedCat);
            }

            if (parsedData.wallet_id && currentWallets.length > 0) {
              const matchedWall = currentWallets.find(
                (w: any) => (w._id || w.id) === parsedData.wallet_id,
              );
              if (matchedWall) setSelectedWallet(matchedWall);
            }
          } catch (jsonErr) {
            console.error("Gagal melakukan autofill data:", jsonErr);
          }
        }
        // --------------------------------------------------------
      } catch (error) {
        console.error(
          "Gagal membuat data kategori, wallet, atau profil:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [walletId, autofill]);

  // -- helper format tanggal untuk tampilan UI
  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // -- helper format tanggal untuk API (YYYY-MM-DD)
  const formatDateForApi = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // -- helper untuk mengubah angka mentah menjadi format ribuan dengan titik (e.g. 1200000 -> 1.200.000)
  const formatCurrencyInput = (text: string) => {
    const cleanNumber = text.replace(/[^0-9]/g, ""); // Hapus karakter non-angka
    return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Tambahkan titik setiap kelipatan 3 digit
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
  const goalBottomSheet = useRef<BottomSheet>(null);

  const openCurrencySheet = () => currencyBottomSheet.current?.expand();
  const closeCurrencySheet = () => currencyBottomSheet.current?.close();
  const openCategorySheet = () => categoryBottomSheet.current?.expand();
  const closeCategorySheet = () => categoryBottomSheet.current?.close();
  const openWalletSheet = () => walletBottomSheet.current?.expand();
  const closeWalletSheet = () => walletBottomSheet.current?.close();
  const openGoalSheet = () => goalBottomSheet.current?.expand();
  const closeGoalSheet = () => goalBottomSheet.current?.close();

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

  const handleSelectGoal = (goal: any) => {
    setSelectedGoal(goal);
    closeGoalSheet();
  };

  // Fungsi untuk handle submit data ke API
  const handleSubmit = async () => {
    // Hilangkan semua tanda titik untuk mendapatkan nilai angka murni
    const cleanAmountString = amount.replace(/\./g, "");
    const parsedAmount = parseFloat(cleanAmountString);

    // Validasi input dasar
    if (transactionType !== "goal" && !name.trim()) {
      Alert.alert("Error", "Nama transaksi tidak boleh kosong");
      return;
    }
    if (transactionType === "goal" && !selectedGoal) {
      Alert.alert("Error", "Silakan pilih target goal terlebih dahulu");
      return;
    }
    if (transactionType !== "goal" && !selectedCategory) {
      Alert.alert("Error", "Silakan pilih kategori terlebih dahulu");
      return;
    }
    if (!selectedWallet) {
      Alert.alert("Error", "Silakan pilih wallet terlebih dahulu");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Jumlah nominal harus lebih dari 0");
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (transactionType === "goal") {
        const payload = {
          goal_id: selectedGoal._id || selectedGoal.id,
          wallet_id: selectedWallet._id || selectedWallet.id,
          amount: cleanAmountString,
          type: "saving",
          date: formatDateForApi(date),
          description: description.trim() || "Setoran Tabungan Target",
        };
        response = await apiRequest("/goal-history", {
          method: "POST",
          body: payload,
        });
      } else {
        const payload = {
          category_id: selectedCategory._id || selectedCategory.id,
          wallet_id: selectedWallet._id || selectedWallet.id,
          amount: cleanAmountString, // Mengirim string angka murni (e.g., "12000000") ke API
          type: transactionType, // "expense" atau "income"
          name: name,
          description: description,
          date: formatDateForApi(date), // format: "YYYY-MM-DD"
          input_method: "manual",
          currency: selectedCurrency.code,
        };
        response = await apiRequest("/transaction", {
          method: "POST",
          body: payload,
        });
      }

      if (response?.status === "success" || response) {
        Alert.alert("Sukses", "Transaksi berhasil ditambahkan!");
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Gagal", error.message || "Gagal menambahkan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={"dark-content"} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{ paddingTop: insets.top }}
          className="flex-1 bg-white px-5 flex-col justify-between"
        >
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between py-4">
              <TouchableOpacity onPress={() => router.back()} className="z-10">
                <Text className="text-[#00bf71] font-semibold text-base">
                  {`← Back`}
                </Text>
              </TouchableOpacity>
              <View className="absolute left-0 right-0 items-center justify-center">
                <Text className="text-xl font-bold text-[#1a1f36]">
                  Add Transaction
                </Text>
              </View>
              <View className="w-10" />
            </View>

            {/* Income / Expense / Goal toggle */}
            <View className="w-full mt-2 justify-center flex flex-row">
              <View className="bg-slate-200 p-1 w-[270px] rounded-md flex flex-row gap-1">
                <Pressable
                  onPress={() => setTransactionType("income")}
                  style={{
                    backgroundColor:
                      transactionType === "income" ? "#FFF" : undefined,
                  }}
                  className="flex-1 p-2 rounded"
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color:
                        transactionType === "income" ? "#1a1f36" : "#4b5563",
                    }}
                    className="text-center"
                  >
                    Income
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTransactionType("expense")}
                  style={{
                    backgroundColor:
                      transactionType === "expense" ? "#FFF" : undefined,
                  }}
                  className="flex-1 p-2 rounded"
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color:
                        transactionType === "expense" ? "#1a1f36" : "#4b5563",
                    }}
                    className="text-center"
                  >
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTransactionType("goal")}
                  style={{
                    backgroundColor:
                      transactionType === "goal" ? "#FFF" : undefined,
                  }}
                  className="flex-1 p-2 rounded"
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: transactionType === "goal" ? "#1a1f36" : "#4b5563",
                    }}
                    className="text-center"
                  >
                    Goal
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Amount dengan Format Otomatis */}
            <View className="flex-row items-center justify-center my-10">
              <Text className="text-4xl font-bold mr-2">
                {selectedCurrency.symbol ?? selectedCurrency.code}
              </Text>
              <TextInput
                className="text-4xl font-bold text-black"
                keyboardType="numeric"
                value={amount}
                placeholder="0"
                onChangeText={(text) => {
                  const formatted = formatCurrencyInput(text);
                  setAmount(formatted); // Update state dengan teks yang telah diformat titik
                }}
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
              <View
                style={{ position: "relative" }}
                className="w-1/2 flex-col items-start gap-1"
              >
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
              {transactionType !== "goal" && (
                <View>
                  <Text className="mb-2 ml-1 text-sm font-medium">Nama</Text>
                  <View className="border border-gray-300 rounded-lg">
                    <TextInput
                      placeholder="Masukkan Nama"
                      placeholderTextColor="#9CA3AF"
                      className="text-black px-4 py-3"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
              )}

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
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              {/* Kategori atau Target Goal */}
              {transactionType === "goal" ? (
                <View>
                  <Text className="mb-2 ml-1 text-sm font-medium">
                    Target Saving Goal
                  </Text>
                  <Pressable
                    onPress={openGoalSheet}
                    className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={selectedGoal ? "text-black" : "text-[#9CA3AF]"}
                    >
                      {selectedGoal
                        ? `${selectedGoal.icon || selectedGoal.emoticon || "🎯"} ${selectedGoal.name}`
                        : "Pilih Target Goal"}
                    </Text>
                    <ChevronDown size={18} />
                  </Pressable>
                </View>
              ) : (
                <View>
                  <Text className="mb-2 ml-1 text-sm font-medium">
                    Kategori
                  </Text>
                  <Pressable
                    onPress={openCategorySheet}
                    className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text
                      className={
                        selectedCategory ? "text-black" : "text-[#9CA3AF]"
                      }
                    >
                      {selectedCategory
                        ? `${selectedCategory.emoticon} ${selectedCategory.name}`
                        : "Pilih Kategori"}
                    </Text>
                    <ChevronDown size={18} />
                  </Pressable>
                </View>
              )}

              {/* Wallet */}
              <View>
                <Text className="mb-2 ml-1 text-sm font-medium">Wallet</Text>
                <Pressable
                  onPress={openWalletSheet}
                  className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                >
                  <Text
                    className={selectedWallet ? "text-black" : "text-[#9CA3AF]"}
                  >
                    {selectedWallet ? selectedWallet.name : "Pilih Wallet"}
                  </Text>
                  <ChevronDown size={18} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={{ marginBottom: insets.bottom + 16 }}
            className={`self-center w-full py-3 rounded-[20px] items-center justify-center active:opacity-80 ${
              submitting ? "bg-emerald-300" : "bg-[#00bf71]"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white text-lg font-semibold">Submit</Text>
            )}
          </Pressable>
        </View>
      </TouchableWithoutFeedback>

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

      <GoalBottomSheet
        ref={goalBottomSheet}
        goals={goals}
        selectedGoal={selectedGoal}
        onSelect={handleSelectGoal}
      />
    </>
  );
}

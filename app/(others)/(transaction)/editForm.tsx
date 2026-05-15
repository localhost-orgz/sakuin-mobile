/**
 * app/(others)/(transaction)/editForm.tsx
 *
 * Edit Transaction — mirrors addForm.tsx structure exactly,
 * pre-filled with dummy transaction data. Adds a Delete button.
 */

import CategoryBottomSheet from "@/components/Form/CategoryBottomSheet";
import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import WalletBottomSheet from "@/components/Form/WalletBottomSheet";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { WALLET_LIST } from "@/constants/walletList";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { CalendarDays, ChevronDown, Trash2 } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Dummy pre-filled data ────────────────────────────────────────────────────
const DUMMY_TRANSACTION = {
  transactionType: "expense" as "expense" | "income",
  amount: "50000",
  name: "Jatinangor House",
  description: "Makan siang bareng temen-temen kost",
  date: new Date("2025-03-15"),
  categoryId: "food_beverage",
  currencyCode: "IDR",
  walletId: "3", // SeaBank
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 28,
          width: "100%",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#fef2f2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Trash2 size={28} color="#ef4444" strokeWidth={2} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}>
          Hapus Transaksi?
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Transaksi ini akan dihapus secara permanen dan tidak dapat
          dikembalikan.
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            width: "100%",
            marginTop: 8,
          }}
        >
          <Pressable
            onPress={onCancel}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: "#f3f4f6",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700", color: "#374151" }}>Batal</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: "#ef4444",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700", color: "white" }}>Hapus</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function EditTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Form state — pre-filled from dummy data ────────────────────────────────
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    DUMMY_TRANSACTION.transactionType,
  );
  const [amount, setAmount] = useState(DUMMY_TRANSACTION.amount);
  const [name, setName] = useState(DUMMY_TRANSACTION.name);
  const [description, setDescription] = useState(DUMMY_TRANSACTION.description);
  const [date, setDate] = useState(DUMMY_TRANSACTION.date);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCY_LIST.find((c) => c.code === DUMMY_TRANSACTION.currencyCode) ??
      CURRENCY_LIST[0],
  );
  const [selectedWallet, setSelectedWallet] = useState(
    WALLET_LIST.find((w) => w.id === DUMMY_TRANSACTION.walletId) ??
      WALLET_LIST[0],
  );
  const [selectedCategory, setSelectedCategory] = useState(
    DUMMY_TRANSACTION.categoryId,
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleConfirmDate = (selected: Date) => {
    setDate(selected);
    setShowDatePicker(false);
  };

  // ── Bottom sheet refs ──────────────────────────────────────────────────────
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
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    closeCategorySheet();
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    // TODO: call delete API, then navigate back
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-white px-5 flex-col justify-between"
      >
        <View>
          {/* ── Header ──────────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity onPress={() => router.back()} className="z-10">
              <Text className="text-[#00bf71] font-semibold text-base">
                ← Back
              </Text>
            </TouchableOpacity>

            <View className="absolute left-0 right-0 items-center justify-center">
              <Text className="text-xl font-bold text-[#1a1f36]">
                Edit Transaction
              </Text>
            </View>

            {/* Delete button — top right */}
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "#fef2f2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* ── Income / Expense toggle ──────────────────────────────────── */}
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

          {/* ── Amount ──────────────────────────────────────────────────── */}
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

          {/* ── Currency and Date ────────────────────────────────────────── */}
          <View className="flex flex-row items-center justify-center">
            {/* Currency picker */}
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
                <ChevronDown stroke="#94a3b8" size={18} />
              </Pressable>
            </View>

            {/* Date picker */}
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
                  <CalendarDays size={15} stroke="#00bf71" />
                  <Text className="text-sm">{formatDate(date)}</Text>
                </View>
                <ChevronDown stroke="#94a3b8" size={18} />
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
                    onConfirm={handleConfirmDate}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </View>
              )}
            </View>
          </View>

          {/* ── Form Fields ──────────────────────────────────────────────── */}
          <View className="mt-8 gap-4">
            {/* Nama */}
            <View>
              <Text className="mb-2 ml-1 text-sm font-medium">Nama</Text>
              <View className="border border-gray-300 rounded-lg">
                <TextInput
                  value={name}
                  onChangeText={setName}
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
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100, paddingTop: 12 }}
                  placeholder="Masukkan Deskripsi"
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
                <Text
                  style={{
                    color: selectedCategory ? "#1a1f36" : "#9CA3AF",
                    fontSize: 14,
                  }}
                >
                  {selectedCategory
                    ? selectedCategory
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Pilih Kategori"}
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
                <Text style={{ color: "#1a1f36", fontSize: 14 }}>
                  {selectedWallet.bank}
                </Text>
                <ChevronDown size={18} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Save Button ───────────────────────────────────────────────── */}
        <Pressable
          style={{ marginBottom: insets.bottom + 16 }}
          className="self-center w-full py-3 bg-[#00bf71] rounded-[20px] items-center justify-center active:opacity-80"
          onPress={() => router.back()}
        >
          <Text className="text-white text-lg font-semibold">
            Simpan Perubahan
          </Text>
        </Pressable>
      </View>

      {/* ── Bottom Sheets ─────────────────────────────────────────────────── */}
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

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <DeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

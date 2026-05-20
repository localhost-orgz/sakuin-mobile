import useWalletTheme from "@/hooks/useWalletTheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowDownUp, CheckCircle2, ChevronDown } from "lucide-react-native";
import { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AmountSection from "@/components/Transfer/AmountSection";
import HeaderTransfer from "@/components/Transfer/HeaderTransition";
import MiniWalletCard from "@/components/Transfer/MiniWalletCard";
import NoteSection from "@/components/Transfer/NoteSection";
import WalletBottomSheet from "@/components/Transfer/WalletBottomSheet";
import { apiRequest } from "@/utils/api";
import type { WalletThemeId } from "@/hooks/useWalletTheme";
import BottomSheet from "@gorhom/bottom-sheet";

const SuccessModal = ({ visible, amount, from, to, onClose }: any) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const { width } = Dimensions.get("window");

  if (visible) {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: "white",
            borderRadius: 28,
            padding: 32,
            width: width - 48,
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#e6faf3",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <CheckCircle2 size={40} color="#00bf71" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#1a1f36" }}>
            Transfer Successful!
          </Text>
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#00bf71" }}>
            Rp{amount}
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center" }}>
            From{" "}
            <Text style={{ fontWeight: "700", color: "#1a1f36" }}>
              {from?.bank}
            </Text>{" "}
            →{" "}
            <Text style={{ fontWeight: "700", color: "#1a1f36" }}>
              {to?.bank}
            </Text>
          </Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{
              marginTop: 16,
              width: "100%",
              backgroundColor: "#00bf71",
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              Done
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TransferPage() {
  const router = useRouter();
  const { walletId } = useLocalSearchParams<{ walletId?: string }>();
  const insets = useSafeAreaInsets();

  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fromWalletBottomSheet = useRef<BottomSheet>(null);
  const toWalletBottomSheet = useRef<BottomSheet>(null);

  const [selectedFromWallet, setSelectedFromWallet] = useState<any>(null);
  const [selectedToWallet, setSelectedToWallet] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [walletsRes, categoriesRes] = await Promise.all([
          apiRequest("/wallets", { method: "GET" }),
          apiRequest("/categories", { method: "GET" }),
        ]);

        let rawWallets = [];
        if (walletsRes?.status === "success" && walletsRes?.data) {
          rawWallets = walletsRes.data;
        } else if (Array.isArray(walletsRes)) {
          rawWallets = walletsRes;
        }

        let rawCats = [];
        if (categoriesRes?.status === "success" && categoriesRes?.data) {
          rawCats = categoriesRes.data;
        } else if (Array.isArray(categoriesRes)) {
          rawCats = categoriesRes;
        }

        setCategories(rawCats);

        // Normalize wallet formats
        const mappedWallets = rawWallets.map((w: any) => ({
          id: w._id || w.id,
          bank: w.name || "Unnamed",
          type: w.type || "E-Wallet",
          balance: new Intl.NumberFormat("id-ID").format(w.balance || 0),
          rawBalance: w.balance || 0,
          themeId: (w.color || "ocean").toLowerCase() as WalletThemeId,
        }));

        setWallets(mappedWallets);

        if (mappedWallets.length > 0) {
          // Preselect source wallet if walletId matches
          const preselectedFrom = mappedWallets.find((w: any) => w.id === walletId);
          const fromWalletObj = preselectedFrom || mappedWallets[0];
          setSelectedFromWallet(fromWalletObj);
          
          // Find next wallet to set as default destination
          const remainingWallets = mappedWallets.filter((w: any) => w.id !== fromWalletObj.id);
          setSelectedToWallet(remainingWallets[0] || fromWalletObj);
        }
      } catch (err) {
        console.error("Failed to load transfer page data:", err);
        Alert.alert("Error", "Gagal memuat data dompet.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [walletId]);

  const openFromWalletSheet = () => {
    fromWalletBottomSheet.current?.expand();
  };
  const closeFromWalletSheet = () => {
    fromWalletBottomSheet.current?.close();
  };
  const openToWalletSheet = () => {
    toWalletBottomSheet.current?.expand();
  };
  const closeToWalletSheet = () => {
    toWalletBottomSheet.current?.close();
  };

  const handleSelectFromWallet = (wallet: any) => {
    setSelectedFromWallet(wallet);
    closeFromWalletSheet();
  };
  const handleSelectToWallet = (wallet: any) => {
    setSelectedToWallet(wallet);
    closeToWalletSheet();
  };

  const swapWallets = () => {
    const temp = selectedFromWallet;
    setSelectedFromWallet(selectedToWallet);
    setSelectedToWallet(temp);
  };

  const fromTheme = useWalletTheme((selectedFromWallet?.themeId || "ocean") as WalletThemeId);
  const toTheme = useWalletTheme((selectedToWallet?.themeId || "ocean") as WalletThemeId);

  const canSubmit =
    amount.length > 0 &&
    parseFloat(amount.replace(/\./g, "").replace(",", ".")) > 0;

  const handleTransfer = async () => {
    if (!selectedFromWallet || !selectedToWallet) {
      Alert.alert("Error", "Silakan pilih wallet asal dan tujuan.");
      return;
    }

    const fromId = selectedFromWallet.id;
    const toId = selectedToWallet.id;

    if (fromId === toId) {
      Alert.alert("Error", "Wallet asal dan tujuan tidak boleh sama.");
      return;
    }

    const cleanAmountString = amount.replace(/\./g, "").replace(",", ".");
    const parsedAmount = parseFloat(cleanAmountString);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Jumlah nominal harus lebih dari 0.");
      return;
    }

    // CHECK: Check if selectedFromWallet has enough money to transfer.
    if (parsedAmount > selectedFromWallet.rawBalance) {
      Alert.alert(
        "Saldo Tidak Cukup",
        `Saldo ${selectedFromWallet.bank} Anda (Rp${selectedFromWallet.balance}) tidak mencukupi untuk melakukan transfer sebesar Rp${amount}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      // Find transfer category or fallback to others
      let transferCategory = categories.find((c: any) => {
        const name = (c.name || c.label || "").toLowerCase();
        return name.includes("transfer") || name.includes("pindahan") || name.includes("kirim");
      });

      if (!transferCategory) {
        transferCategory = categories.find((c: any) => {
          const name = (c.name || c.label || "").toLowerCase();
          return name.includes("lain") || name.includes("other");
        });
      }

      const categoryId = transferCategory
        ? (transferCategory._id || transferCategory.id)
        : (categories[0]?._id || categories[0]?.id || "6a02f8a7de59afc0c23a95c9");

      // Format date
      const formatDateForApi = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const today = formatDateForApi(new Date());

      // Create two transactions: one expense from source wallet, one income to destination wallet
      await Promise.all([
        apiRequest("/transaction", {
          method: "POST",
          body: {
            category_id: categoryId,
            wallet_id: fromId,
            amount: cleanAmountString,
            type: "transfer",
            name: `Transfer ke ${selectedToWallet.bank}`,
            description: note || `Transfer saldo ke ${selectedToWallet.bank}`,
            date: today,
            input_method: "manual",
          },
        }),
        apiRequest("/transaction", {
          method: "POST",
          body: {
            category_id: categoryId,
            wallet_id: toId,
            amount: cleanAmountString,
            type: "income",
            name: `Transfer dari ${selectedFromWallet.bank}`,
            description: note || `Transfer saldo dari ${selectedFromWallet.bank}`,
            date: today,
            input_method: "manual",
          },
        }),
      ]);

      setShowSuccess(true);
    } catch (err: any) {
      console.error("Transfer error:", err);
      Alert.alert("Gagal", err.message || "Gagal melakukan transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{ flex: 1, backgroundColor: "#ffff", paddingTop: insets.top }}
        >
        <HeaderTransfer />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 120,
            gap: 20,
          }}
        >
          {/* ── FROM → TO WALLET SECTION ── */}
          <View className="mt-5">
            <Text className="text-sm font-semibold text-[#9ca3af] mb-2 uppercase">
              From → To
            </Text>

            <View style={{ gap: 10 }}>
              {/* FROM card */}
              <View>
                <View className="flex flex-row items-end justify-between mb-3 px-2">
                  <Text className="text-sm font-semibold mb-0.5 text-[#6b7280]">
                    From
                  </Text>
                  <TouchableOpacity
                    onPress={openFromWalletSheet}
                    style={{
                      backgroundColor: fromTheme.theme.bgColor,
                    }}
                    className="flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                  >
                    <Text
                      style={{
                        color: fromTheme.theme.accentColor,
                      }}
                      className="text-sm font-bold"
                    >
                      Change
                    </Text>
                    <ChevronDown
                      size={13}
                      color={fromTheme.theme.accentColor}
                    />
                  </TouchableOpacity>
                </View>
                <MiniWalletCard wallet={selectedFromWallet} height={170} />
              </View>

              {/* SWAP BUTTON */}
              <View style={{ alignItems: "center", zIndex: 10 }}>
                <TouchableOpacity
                  onPress={swapWallets}
                  activeOpacity={0.8}
                  className="w-14 h-14 rounded-full bg-slate-100/50 items-center justify-center border-2 border-slate-300 border-dashed mt-3 -mb-3"
                >
                  <ArrowDownUp size={18} color={"#94a3b8"} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* TO card */}
              <View>
                <View className="flex flex-row items-end justify-between mb-3 px-2">
                  <Text className="text-sm font-semibold mb-0.5 text-[#6b7280]">
                    To
                  </Text>
                  <TouchableOpacity
                    onPress={openToWalletSheet}
                    style={{
                      backgroundColor: toTheme.theme.bgColor,
                    }}
                    className="flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                  >
                    <Text
                      style={{
                        color: toTheme.theme.accentColor,
                      }}
                      className="text-sm font-bold"
                    >
                      Change
                    </Text>
                    <ChevronDown size={13} color={toTheme.theme.accentColor} />
                  </TouchableOpacity>
                </View>
                <MiniWalletCard wallet={selectedToWallet} height={170} />
              </View>
            </View>
          </View>

          {/* ── AMOUNT SECTION ── */}
          <AmountSection amount={amount} onAmount={setAmount} />

          {/* ── NOTE SECTION ── */}
          <NoteSection note={note} onNote={setNote} />

          {/* ── TRANSFER SUMMARY ── */}
          {canSubmit && (
            <View
              style={{
                backgroundColor: "#f0fdf8",
                borderRadius: 18,
                padding: 16,
                borderWidth: 1.5,
                borderColor: "#bbf7d0",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#059669",
                }}
              >
                Summary
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 13, color: "#6b7280" }}>From</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#1a1f36" }}
                >
                  {selectedFromWallet?.bank} ({selectedFromWallet?.type})
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 13, color: "#6b7280" }}>To</Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#1a1f36" }}
                >
                  {selectedToWallet?.bank} ({selectedToWallet?.type})
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: "#d1fae5" }} />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#1a1f36" }}
                >
                  Total
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "800", color: "#00bf71" }}
                >
                  Rp{amount}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── SUBMIT BUTTON ── */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom,
            paddingTop: 12,
            backgroundColor: "#f5f6fa",
          }}
        >
          <TouchableOpacity
            onPress={() => canSubmit && !submitting && handleTransfer()}
            disabled={!canSubmit || submitting}
            activeOpacity={canSubmit && !submitting ? 0.85 : 1}
            style={{
              backgroundColor: (canSubmit && !submitting) ? "#00bf71" : "#e5e7eb",
              borderRadius: 20,
              paddingVertical: 17,
              alignItems: "center",
              shadowColor: (canSubmit && !submitting) ? "#00bf71" : "transparent",
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: (canSubmit && !submitting) ? 6 : 0,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: (canSubmit && !submitting) ? "white" : "#9ca3af",
                }}
              >
                {canSubmit ? `Transfer Rp${amount}` : "Enter Amount"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </TouchableWithoutFeedback>

      {/* ── Modals ── */}
      <WalletBottomSheet
        ref={fromWalletBottomSheet}
        wallets={wallets}
        selectedWallet={selectedFromWallet}
        onSelect={handleSelectFromWallet}
      />
      <WalletBottomSheet
        ref={toWalletBottomSheet}
        wallets={wallets}
        selectedWallet={selectedToWallet}
        onSelect={handleSelectToWallet}
      />
      <SuccessModal
        visible={showSuccess}
        amount={amount}
        from={selectedFromWallet}
        to={selectedToWallet}
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </>
  );
}

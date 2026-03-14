import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowDownUp,
  CheckCircle2,
  ChevronDown,
  WalletMinimal,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Wallet Theme (mirrors useWalletTheme hook) ───────────────────────────────
const THEMES: Record<string, any> = {
  green: {
    gradientColors: ["#00bf71", "#00a05e"],
    textColor: "#ffffff",
    bgColor: "#e6faf3",
    iconBgColor: "#00bf71",
    accentColor: "#00bf71",
    shadowColor: "#00bf71",
    cardColor: "#00bf71",
    cardColorBack: "#007a48",
  },
  blue: {
    gradientColors: ["#3b82f6", "#2563eb"],
    textColor: "#ffffff",
    bgColor: "#eff6ff",
    iconBgColor: "#3b82f6",
    accentColor: "#3b82f6",
    shadowColor: "#3b82f6",
    cardColor: "#3b82f6",
    cardColorBack: "#1d4ed8",
  },
  amber: {
    gradientColors: ["#f59e0b", "#d97706"],
    textColor: "#ffffff",
    bgColor: "#fffbeb",
    iconBgColor: "#f59e0b",
    accentColor: "#d97706",
    shadowColor: "#f59e0b",
    cardColor: "#f59e0b",
    cardColorBack: "#b45309",
  },
  violet: {
    gradientColors: ["#8b5cf6", "#7c3aed"],
    textColor: "#ffffff",
    bgColor: "#f5f3ff",
    iconBgColor: "#8b5cf6",
    accentColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    cardColor: "#8b5cf6",
    cardColorBack: "#5b21b6",
  },
  rose: {
    gradientColors: ["#f43f5e", "#e11d48"],
    textColor: "#ffffff",
    bgColor: "#fff1f2",
    iconBgColor: "#f43f5e",
    accentColor: "#f43f5e",
    shadowColor: "#f43f5e",
    cardColor: "#f43f5e",
    cardColorBack: "#9f1239",
  },
};

// ─── Mock Wallet Data ─────────────────────────────────────────────────────────
const WALLETS = [
  {
    id: "1",
    bank: "BCA",
    type: "Savings",
    balance: "8.500.000",
    themeId: "green",
  },
  {
    id: "2",
    bank: "Mandiri",
    type: "Savings",
    balance: "3.200.000",
    themeId: "blue",
  },
  {
    id: "3",
    bank: "BNI",
    type: "Giro",
    balance: "2.100.000",
    themeId: "amber",
  },
  {
    id: "4",
    bank: "CIMB",
    type: "Savings",
    balance: "1.874.522",
    themeId: "violet",
  },
];

const { width } = Dimensions.get("window");
const CARD_W = width - 80;

// ─── Mini Wallet Card (reuses WalletCard blob aesthetic) ──────────────────────
const MiniWalletCard = ({
  wallet,
  height = 150,
}: {
  wallet: any;
  height?: number;
}) => {
  const theme = THEMES[wallet.themeId] ?? THEMES.green;
  const blobA = "rgba(255,255,255,0.08)";
  const blobB = "rgba(255,255,255,0.13)";

  return (
    <LinearGradient
      colors={theme.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        padding: 18,
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* blobs */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: blobB,
          bottom: -30,
          right: -20,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: blobA,
          bottom: 15,
          right: 55,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: blobB,
          top: 14,
          right: 20,
        }}
      />

      {/* bank + type */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            padding: 7,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 9,
          }}
        >
          <WalletMinimal color="white" size={16} />
        </View>
        <View>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 17 }}>
            {wallet.bank}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
            {wallet.type}
          </Text>
        </View>
      </View>

      {/* balance */}
      <View>
        <Text
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          Balance
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 2,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "500",
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            Rp
          </Text>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 22 }}>
            {wallet.balance}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// ─── Wallet Picker Modal ──────────────────────────────────────────────────────
const WalletPickerModal = ({
  visible,
  onClose,
  onSelect,
  excludeId,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (w: any) => void;
  excludeId?: string;
  title: string;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: "white",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: insets.bottom + 20,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 30,
          elevation: 20,
        }}
      >
        {/* handle */}
        <View style={{ alignItems: "center", paddingTop: 12, marginBottom: 4 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#e5e7eb",
            }}
          />
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}>
            {title}
          </Text>
          <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
            Choose a wallet
          </Text>
        </View>

        <ScrollView
          style={{ maxHeight: 340 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {WALLETS.filter((w) => w.id !== excludeId).map((wallet) => {
            const theme = THEMES[wallet.themeId] ?? THEMES.green;
            return (
              <TouchableOpacity
                key={wallet.id}
                onPress={() => {
                  onSelect(wallet);
                  onClose();
                }}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.bgColor,
                  borderRadius: 14,
                  padding: 14,
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: `${theme.accentColor}30`,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: theme.iconBgColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WalletMinimal color="white" size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1a1f36",
                    }}
                  >
                    {wallet.bank}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}
                  >
                    {wallet.type}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      fontWeight: "600",
                    }}
                  >
                    Balance
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.accentColor,
                    }}
                  >
                    Rp{wallet.balance}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Success Modal ────────────────────────────────────────────────────────────
const SuccessModal = ({ visible, amount, from, to, onClose }: any) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

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

// ─── QUICK AMOUNT CHIPS ───────────────────────────────────────────────────────
const QUICK_AMOUNTS = ["50.000", "100.000", "250.000", "500.000"];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TransferPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fromWallet, setFromWallet] = useState(WALLETS[0]);
  const [toWallet, setToWallet] = useState(WALLETS[1]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const swapWallets = () => {
    setFromWallet(toWallet);
    setToWallet(fromWallet);
  };

  const fromTheme = THEMES[fromWallet.themeId] ?? THEMES.green;
  const toTheme = THEMES[toWallet.themeId] ?? THEMES.green;

  const canSubmit =
    amount.length > 0 &&
    parseFloat(amount.replace(/\./g, "").replace(",", ".")) > 0;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={{ flex: 1, backgroundColor: "#ffff", paddingTop: insets.top }}
      >
        <View className="px-5">
          {/* ── Header ── */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity onPress={() => router.back()} className="z-10">
              <Text className="text-[#00bf71] font-semibold text-base">
                ← Back
              </Text>
            </TouchableOpacity>
            <View className="absolute left-0 right-0 items-center justify-center">
              <Text className="text-xl font-bold text-[#1a1f36]">Transfer</Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

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
                    onPress={() => setShowFromPicker(true)}
                    style={{
                      backgroundColor: fromTheme.bgColor,
                    }}
                    className="flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                  >
                    <Text
                      style={{
                        color: fromTheme.accentColor,
                      }}
                      className="text-sm font-bold"
                    >
                      Change
                    </Text>
                    <ChevronDown size={13} color={fromTheme.accentColor} />
                  </TouchableOpacity>
                </View>
                <MiniWalletCard wallet={fromWallet} height={170} />
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
                    onPress={() => setShowToPicker(true)}
                    style={{
                      backgroundColor: toTheme.bgColor,
                    }}
                    className="flex flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                  >
                    <Text
                      style={{
                        color: toTheme.accentColor,
                      }}
                      className="text-sm font-bold"
                    >
                      Change
                    </Text>
                    <ChevronDown size={13} color={toTheme.accentColor} />
                  </TouchableOpacity>
                </View>
                <MiniWalletCard wallet={toWallet} height={170} />
              </View>
            </View>
          </View>

          {/* ── AMOUNT SECTION ── */}
          <View
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
            className="bg-white rounded-2xl p-5"
          >
            <Text className="text-sm mb-4 font-bold uppercase text-[#9ca3af]">
              Amount
            </Text>

            {/* Amount input */}
            <View
              style={{
                borderBottomColor: amount.length > 0 ? "#00bf71" : "#f3f4f6",
                marginBottom: 20,
              }}
              className="flex flex-row items-end gap-2 border-b-2 py-2"
            >
              <Text className="text-2xl font-bold text-[#9ca3af]">Rp</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  fontSize: 34,
                  fontWeight: "700",
                  color: "#1a1f36",
                }}
              />
            </View>

            {/* Quick amounts */}
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {QUICK_AMOUNTS.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => setAmount(q)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 5,
                    backgroundColor: amount === q ? "#00bf71" : "#f3f4f6",
                    borderWidth: 1.5,
                    borderColor: amount === q ? "#00bf71" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: amount === q ? "white" : "#6b7280",
                    }}
                  >
                    Rp{q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── NOTE SECTION ── */}
          <View
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
            className="bg-white rounded-lg p-5"
          >
            <Text className="text-base font-semibold tracking-wide upperacase text-[#9ca3af] mb-3">
              Note (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Rent, Groceries, Gift..."
              placeholderTextColor="#d1d5db"
              style={{ fontSize: 15, color: "#1a1f36", paddingVertical: 4 }}
              className="border-b-2 border-slate-200"
            />
          </View>

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
                  {fromWallet.bank} ({fromWallet.type})
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
                  {toWallet.bank} ({toWallet.type})
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
            onPress={() => canSubmit && setShowSuccess(true)}
            activeOpacity={canSubmit ? 0.85 : 1}
            style={{
              backgroundColor: canSubmit ? "#00bf71" : "#e5e7eb",
              borderRadius: 20,
              paddingVertical: 17,
              alignItems: "center",
              shadowColor: canSubmit ? "#00bf71" : "transparent",
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: canSubmit ? 6 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: canSubmit ? "white" : "#9ca3af",
              }}
            >
              {canSubmit ? `Transfer Rp${amount}` : "Enter Amount"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Modals ── */}
      <WalletPickerModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={setFromWallet}
        excludeId={toWallet.id}
        title="Select Source Wallet"
      />
      <WalletPickerModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={setToWallet}
        excludeId={fromWallet.id}
        title="Select Destination Wallet"
      />
      <SuccessModal
        visible={showSuccess}
        amount={amount}
        from={fromWallet}
        to={toWallet}
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </>
  );
}

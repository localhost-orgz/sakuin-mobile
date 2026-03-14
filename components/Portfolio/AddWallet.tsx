import { LinearGradient } from "expo-linear-gradient";
import { Check, Plus, WalletMinimal, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── Theme definitions (mirrors useWalletTheme) ───────────────────────────────
const THEME_OPTIONS = [
  {
    id: "green",
    label: "Forest",
    gradient: ["#00bf71", "#009e5f"] as [string, string],
    accent: "#00bf71",
    dot: "#00bf71",
  },
  {
    id: "blue",
    label: "Ocean",
    gradient: ["#3b82f6", "#1d4ed8"] as [string, string],
    accent: "#3b82f6",
    dot: "#3b82f6",
  },
  {
    id: "violet",
    label: "Dusk",
    gradient: ["#8b5cf6", "#6d28d9"] as [string, string],
    accent: "#8b5cf6",
    dot: "#8b5cf6",
  },
  {
    id: "rose",
    label: "Bloom",
    gradient: ["#f43f5e", "#be123c"] as [string, string],
    accent: "#f43f5e",
    dot: "#f43f5e",
  },
  {
    id: "amber",
    label: "Ember",
    gradient: ["#f59e0b", "#b45309"] as [string, string],
    accent: "#f59e0b",
    dot: "#f59e0b",
  },
  {
    id: "slate",
    label: "Ink",
    gradient: ["#334155", "#0f172a"] as [string, string],
    accent: "#64748b",
    dot: "#334155",
  },
];

// ─── Mini wallet preview card ─────────────────────────────────────────────────
const WalletPreview = ({
  name,
  theme,
}: {
  name: string;
  theme: (typeof THEME_OPTIONS)[0];
}) => (
  <LinearGradient
    colors={theme.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: "100%",
      height: 130,
      borderRadius: 16,
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
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.1)",
        bottom: -28,
        right: -20,
      }}
    />
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.07)",
        bottom: 12,
        right: 55,
      }}
    />
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.09)",
        top: 12,
        right: 18,
      }}
    />

    {/* icon + label */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          padding: 6,
          backgroundColor: "rgba(255,255,255,0.18)",
          borderRadius: 8,
        }}
      >
        <WalletMinimal color="white" size={15} />
      </View>
      <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
        {name || "My Wallet"}
      </Text>
    </View>

    {/* balance placeholder */}
    <View>
      <Text
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 9,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontWeight: "600",
          marginBottom: 2,
        }}
      >
        Balance
      </Text>
      <Text style={{ color: "white", fontWeight: "700", fontSize: 20 }}>
        Rp •••••••••
      </Text>
    </View>
  </LinearGradient>
);

// ─── Theme circle picker ──────────────────────────────────────────────────────
const ThemeCircle = ({
  theme,
  selected,
  onPress,
  index,
  revealAnim,
}: {
  theme: (typeof THEME_OPTIONS)[0];
  selected: boolean;
  onPress: () => void;
  index: number;
  revealAnim: Animated.Value;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 220,
        friction: 8,
      }),
    ]).start();
    onPress();
  };

  const itemOpacity = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const itemTranslateY = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: itemOpacity,
        transform: [{ translateY: itemTranslateY }, { scale }],
        alignItems: "center",
        gap: 6,
      }}
    >
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            // ring
            borderWidth: selected ? 3 : 0,
            borderColor: "transparent",
          }}
        >
          {selected && <Check size={18} color="white" strokeWidth={3} />}
        </LinearGradient>
        {/* selection ring */}
        {selected && (
          <View
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: 30,
              borderWidth: 2.5,
              borderColor: theme.accent,
            }}
          />
        )}
      </Pressable>
      <Text
        style={{
          fontSize: 10,
          fontWeight: selected ? "700" : "500",
          color: selected ? theme.accent : "#9ca3af",
        }}
      >
        {theme.label}
      </Text>
    </Animated.View>
  );
};

// ─── ADD WALLET MODAL ─────────────────────────────────────────────────────────
const AddWalletModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd?: (name: string, themeId: string) => void;
}) => {
  const [walletName, setWalletName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);

  // Animations
  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0.9)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const circleReveal = useRef(new Animated.Value(0)).current;
  const inputReveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      slideAnim.setValue(400);
      backdropOpacity.setValue(0);
      previewScale.setValue(0.9);
      previewOpacity.setValue(0);
      circleReveal.setValue(0);
      inputReveal.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Sequence inner content
        Animated.stagger(80, [
          Animated.parallel([
            Animated.spring(previewScale, {
              toValue: 1,
              tension: 80,
              friction: 9,
              useNativeDriver: true,
            }),
            Animated.timing(previewOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(inputReveal, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(circleReveal, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    setWalletName("");
    setSelectedTheme(THEME_OPTIONS[0]);
    onClose();
  };

  const handleAdd = () => {
    if (!walletName.trim()) return;
    onAdd?.(walletName.trim(), selectedTheme.id);
    setWalletName("");
    setSelectedTheme(THEME_OPTIONS[0]);
    onClose();
  };

  const canSubmit = walletName.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            opacity: backdropOpacity,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 22,
              paddingTop: 14,
              paddingBottom: 36,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: -6 },
              elevation: 20,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 38,
                height: 4,
                backgroundColor: "#e2e8f0",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#0f172a",
                    letterSpacing: -0.4,
                  }}
                >
                  New Wallet
                </Text>
                <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  Set it up however you like
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color="#64748b" strokeWidth={2.5} />
              </Pressable>
            </View>

            {/* Preview Card */}
            <Animated.View
              style={{
                opacity: previewOpacity,
                transform: [{ scale: previewScale }],
                marginBottom: 24,
              }}
            >
              <WalletPreview name={walletName} theme={selectedTheme} />
            </Animated.View>

            {/* Name input */}
            <Animated.View
              style={{
                opacity: inputReveal,
                transform: [
                  {
                    translateY: inputReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                Wallet Name
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: walletName ? selectedTheme.accent : "#e2e8f0",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  gap: 10,
                }}
              >
                <WalletMinimal
                  size={16}
                  color={walletName ? selectedTheme.accent : "#cbd5e1"}
                />
                <TextInput
                  value={walletName}
                  onChangeText={setWalletName}
                  placeholder="e.g. BCA Main, Savings..."
                  placeholderTextColor="#cbd5e1"
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                  maxLength={30}
                  returnKeyType="done"
                />
                {walletName.length > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#cbd5e1",
                      fontWeight: "600",
                    }}
                  >
                    {walletName.length}/30
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Color theme picker */}
            <Animated.View
              style={{
                opacity: circleReveal,
                transform: [
                  {
                    translateY: circleReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                ],
                marginBottom: 28,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Card Theme
                </Text>
                <View
                  style={{
                    backgroundColor: `${selectedTheme.accent}18`,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: selectedTheme.accent,
                    }}
                  >
                    {selectedTheme.label}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 4,
                }}
              >
                {THEME_OPTIONS.map((theme, index) => (
                  <ThemeCircle
                    key={theme.id}
                    theme={theme}
                    selected={selectedTheme.id === theme.id}
                    onPress={() => setSelectedTheme(theme)}
                    index={index}
                    revealAnim={circleReveal}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Submit */}
            <Pressable
              onPress={handleAdd}
              disabled={!canSubmit}
              style={({ pressed }) => ({
                backgroundColor: canSubmit
                  ? pressed
                    ? selectedTheme.gradient[1]
                    : selectedTheme.accent
                  : "#e2e8f0",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                shadowColor: canSubmit ? selectedTheme.accent : "transparent",
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
                elevation: canSubmit ? 6 : 0,
              })}
            >
              <Plus
                size={18}
                color={canSubmit ? "white" : "#94a3b8"}
                strokeWidth={2.5}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: canSubmit ? "white" : "#94a3b8",
                  letterSpacing: -0.2,
                }}
              >
                {canSubmit ? `Add "${walletName}"` : "Enter a wallet name"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── ADD WALLET BUTTON (replaces existing AddWallet component) ────────────────
const AddWallet = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    setModalVisible(true);
  };

  const handleAdd = (name: string, themeId: string) => {
    // plug into your wallet store / state here
    console.log("New wallet:", { name, themeId });
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 5,
            width: "100%",
            aspectRatio: width < 400 ? 0.9 : 1,
          }}
          className="w-[48%] h-40 bg-slate-200/50 border-[2px] flex justify-center items-center border-dashed border-slate-400 relative rounded-3xl mb-5"
        >
          <View className="p-2 rounded-full bg-slate-400/30">
            <Plus strokeWidth={4} color={"#90a1b9"} />
          </View>
          <Text className="mt-3 font-semibold text-slate-400">Add Wallet</Text>
        </Animated.View>
      </Pressable>

      <AddWalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
      />
    </>
  );
};

export default AddWallet;

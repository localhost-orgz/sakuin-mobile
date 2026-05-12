import { MONEY_TRACKER_EMOJIS } from "@/constants/emojiList";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Plus, Target, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
const { width } = Dimensions.get("window");

// ─── Theme definitions (mirrors AddWallet) ────────────────────────────────────
const THEME_OPTIONS = [
  {
    id: "green",
    label: "Forest",
    gradient: ["#00bf71", "#009e5f"] as [string, string],
    accent: "#00bf71",
  },
  {
    id: "blue",
    label: "Ocean",
    gradient: ["#3b82f6", "#1d4ed8"] as [string, string],
    accent: "#3b82f6",
  },
  {
    id: "violet",
    label: "Dusk",
    gradient: ["#8b5cf6", "#6d28d9"] as [string, string],
    accent: "#8b5cf6",
  },
  {
    id: "rose",
    label: "Bloom",
    gradient: ["#f43f5e", "#be123c"] as [string, string],
    accent: "#f43f5e",
  },
  {
    id: "amber",
    label: "Ember",
    gradient: ["#f59e0b", "#b45309"] as [string, string],
    accent: "#f59e0b",
  },
  {
    id: "slate",
    label: "Ink",
    gradient: ["#334155", "#0f172a"] as [string, string],
    accent: "#64748b",
  },
];

// ─── ThemeCircle ──────────────────────────────────────────────────────────────
const ThemeCircle = ({
  theme,
  selected,
  onPress,
  revealAnim,
}: {
  theme: (typeof THEME_OPTIONS)[0];
  selected: boolean;
  onPress: () => void;
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

  return (
    <Animated.View
      style={{
        opacity: revealAnim,
        transform: [
          {
            translateY: revealAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
          { scale },
        ],
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
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && <Check size={16} color="white" strokeWidth={3} />}
        </LinearGradient>
        {selected && (
          <View
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: 26,
              borderWidth: 2.5,
              borderColor: theme.accent,
            }}
          />
        )}
      </Pressable>
      <Text
        style={{
          fontSize: 9,
          fontWeight: selected ? "700" : "500",
          color: selected ? theme.accent : "#9ca3af",
        }}
      >
        {theme.label}
      </Text>
    </Animated.View>
  );
};

// ─── Formatted amount helper ──────────────────────────────────────────────────
const formatDisplayAmount = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(digits, 10));
};

// ─── ADD GOAL MODAL ───────────────────────────────────────────────────────────
const AddGoalModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd?: (goal: {
    name: string;
    icon: string;
    target: number;
    themeId: string;
  }) => void;
}) => {
  const [goalName, setGoalName] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeField, setActiveField] = useState<
    "name" | "amount" | "emoji" | null
  >(null);

  // Sheet animations
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const inputReveal = useRef(new Animated.Value(0)).current;
  const emojiReveal = useRef(new Animated.Value(0)).current;
  const amountReveal = useRef(new Animated.Value(0)).current;
  const themeReveal = useRef(new Animated.Value(0)).current;
  const [emojiSearch, setEmojiSearch] = useState("");

  // Keyboard offset
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration || 250 : 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
    const onHide = (e: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration || 250 : 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600);
      backdropOpacity.setValue(0);
      inputReveal.setValue(0);
      emojiReveal.setValue(0);
      amountReveal.setValue(0);
      themeReveal.setValue(0);

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
        Animated.stagger(70, [
          Animated.timing(inputReveal, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(emojiReveal, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(amountReveal, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(themeReveal, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    setGoalName("");
    setGoalEmoji("");
    setTargetAmount("");
    setSelectedTheme(THEME_OPTIONS[0]);
    setShowEmojiPicker(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const rawDigits = targetAmount.replace(/\D/g, "");
    onAdd?.({
      name: goalName.trim(),
      icon: goalEmoji || "🎯",
      target: parseInt(rawDigits, 10),
      themeId: selectedTheme.id,
    });
    handleClose();
  };

  const handleAmountChange = (text: string) => {
    // Strip non-digits, then reformat
    const digits = text.replace(/\D/g, "");
    if (!digits) {
      setTargetAmount("");
      return;
    }
    setTargetAmount(formatDisplayAmount(digits));
  };

  const handleEmojiSelect = (emoji: string) => {
    setGoalEmoji(emoji);
    setShowEmojiPicker(false);
    Keyboard.dismiss();
  };

  const canSubmit =
    goalName.trim().length > 0 && targetAmount.replace(/\D/g, "").length > 0;

  const LABEL_STYLE = {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
  };

  const INPUT_CONTAINER = (focused: boolean, accent: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: focused ? accent : "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  });

  const filteredEmojis = MONEY_TRACKER_EMOJIS.filter((item) => {
    const search = emojiSearch.toLowerCase();

    return (
      item.label.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  });

  const groupedEmojis = filteredEmojis.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }

      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof MONEY_TRACKER_EMOJIS>,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15,23,42,0.6)",
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
          transform: [
            { translateY: slideAnim },
            { translateY: Animated.multiply(keyboardOffset, -1) },
          ],
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
            shadowOpacity: 0.2,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: -8 },
            elevation: 24,
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
              marginBottom: 24,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${selectedTheme.accent}18`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Target
                  size={18}
                  color={selectedTheme.accent}
                  strokeWidth={2.5}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#0f172a",
                    letterSpacing: -0.4,
                  }}
                >
                  New Goal
                </Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                  Set a target and start saving
                </Text>
              </View>
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

          {/* ── Row: Goal Name + Emoji ── */}
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
              flexDirection: "row",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {/* Goal name — takes most of the width */}
            <View style={{ flex: 1 }}>
              <Text style={LABEL_STYLE}>Goal Name</Text>
              <View
                style={INPUT_CONTAINER(
                  activeField === "name",
                  selectedTheme.accent,
                )}
              >
                <TextInput
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="e.g. Macbook Pro, Bali Trip..."
                  placeholderTextColor="#cbd5e1"
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                  maxLength={30}
                  returnKeyType="next"
                  onFocus={() => {
                    setActiveField("name");
                    setShowEmojiPicker(false);
                  }}
                  onBlur={() => setActiveField(null)}
                />
                {goalName.length > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#cbd5e1",
                      fontWeight: "600",
                    }}
                  >
                    {goalName.length}/30
                  </Text>
                )}
              </View>
            </View>

            {/* Emoji picker button */}
            <View>
              <Text style={LABEL_STYLE}>Icon</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEmojiPicker((v) => !v);
                  setActiveField("emoji");
                }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor:
                    activeField === "emoji" ? selectedTheme.accent : "#e2e8f0",
                  backgroundColor:
                    activeField === "emoji"
                      ? `${selectedTheme.accent}10`
                      : "#f8fafc",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: goalEmoji ? 24 : 20 }}>
                  {goalEmoji || "😊"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* ── Modern Emoji Picker ── */}
          {showEmojiPicker && (
            <Animated.View
              style={{
                opacity: emojiReveal,
                position: "absolute",
                top: 165,
                right: 20,
                width: width * 0.82,
                maxHeight: 320,

                backgroundColor: "white",
                borderRadius: 24,

                borderWidth: 1,
                borderColor: "#e2e8f0",

                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 20,
                shadowOffset: {
                  width: 0,
                  height: 10,
                },

                elevation: 20,
                zIndex: 999,
                overflow: "hidden",

                transform: [
                  {
                    scale: emojiReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                  {
                    translateY: emojiReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Emoji List */}
              <ScrollView
                style={{
                  maxHeight: 280,
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  padding: 14,
                  gap: 18,
                }}
              >
                {Object.entries(groupedEmojis).map(([category, emojis]) => (
                  <View key={category}>
                    {/* Category Title */}
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: selectedTheme.accent,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {category}
                    </Text>

                    {/* Emoji Grid */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {emojis.map((item) => {
                        const selected = goalEmoji === item.emoji;

                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => handleEmojiSelect(item.emoji)}
                            style={({ pressed }) => ({
                              width: 58,
                              height: 58,
                              borderRadius: 16,
                              backgroundColor: selected
                                ? `${selectedTheme.accent}15`
                                : pressed
                                  ? "#e2e8f0"
                                  : "white",
                              borderWidth: 1.5,
                              borderColor: selected
                                ? selectedTheme.accent
                                : "#e2e8f0",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                            })}
                          >
                            {/* Emoji */}
                            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>

                            {/* Selected Badge */}
                            {selected && (
                              <View
                                style={{
                                  position: "absolute",
                                  top: -4,
                                  right: -4,
                                  width: 18,
                                  height: 18,
                                  borderRadius: 999,
                                  backgroundColor: selectedTheme.accent,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Check
                                  size={10}
                                  color="white"
                                  strokeWidth={3}
                                />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* ── Target Amount ── */}
          <Animated.View
            style={{
              opacity: amountReveal,
              transform: [
                {
                  translateY: amountReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
              marginBottom: 20,
            }}
          >
            <Text style={LABEL_STYLE}>Target Amount</Text>
            <View
              style={INPUT_CONTAINER(
                activeField === "amount",
                selectedTheme.accent,
              )}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color:
                    activeField === "amount" ? selectedTheme.accent : "#94a3b8",
                }}
              >
                Rp
              </Text>
              <TextInput
                value={targetAmount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor="#cbd5e1"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#0f172a",
                }}
                returnKeyType="done"
                onFocus={() => {
                  setActiveField("amount");
                  setShowEmojiPicker(false);
                }}
                onBlur={() => setActiveField(null)}
                onSubmitEditing={Keyboard.dismiss}
              />
              {targetAmount.length > 0 && (
                <View
                  style={{
                    backgroundColor: `${selectedTheme.accent}12`,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: selectedTheme.accent,
                    }}
                  >
                    {(() => {
                      const n = parseInt(targetAmount.replace(/\D/g, ""), 10);
                      if (n >= 1_000_000_000)
                        return `${(n / 1_000_000_000).toFixed(1)}M`;
                      if (n >= 1_000_000)
                        return `${(n / 1_000_000).toFixed(1)}jt`;
                      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
                      return String(n);
                    })()}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* ── Color Theme ── */}
          <Animated.View
            style={{
              opacity: themeReveal,
              transform: [
                {
                  translateY: themeReveal.interpolate({
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
              <Text style={LABEL_STYLE}>Card Theme</Text>
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
                  revealAnim={themeReveal}
                />
              ))}
            </View>
          </Animated.View>

          {/* ── Preview chip ── */}
          {canSubmit && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: `${selectedTheme.accent}10`,
                borderRadius: 14,
                padding: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: `${selectedTheme.accent}30`,
              }}
            >
              <Text style={{ fontSize: 22 }}>{goalEmoji || "🎯"}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: "#0f172a" }}
                >
                  {goalName}
                </Text>
                <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                  Target: Rp{targetAmount}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: selectedTheme.accent,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: "white" }}
                >
                  Ready
                </Text>
              </View>
            </View>
          )}

          {/* ── Submit ── */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: canSubmit
                ? selectedTheme.accent
                : `${selectedTheme.accent}40`,
              shadowColor: canSubmit ? selectedTheme.accent : "transparent",
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 5 },
              elevation: canSubmit ? 6 : 0,
            }}
          >
            <Plus
              size={18}
              color={canSubmit ? "white" : "#ffffff80"}
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: canSubmit ? "white" : "#ffffff80",
                letterSpacing: -0.2,
              }}
            >
              {canSubmit ? `Save "${goalName}" Goal` : "Fill in goal details"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── ADD GOAL BUTTON ──────────────────────────────────────────────────────────
const AddGoal = () => {
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

  const handleAdd = (goal: {
    name: string;
    icon: string;
    target: number;
    themeId: string;
  }) => {
    // Wire up to your goals store here
    console.log("New goal:", goal);
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
          <Text className="mt-3 font-semibold text-slate-400">Add Goal</Text>
        </Animated.View>
      </Pressable>

      <AddGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
      />
    </>
  );
};

export default AddGoal;

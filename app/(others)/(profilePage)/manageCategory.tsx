import { MONEY_TRACKER_EMOJIS } from "@/constants/emojiList";
import { LinearGradient } from "expo-linear-gradient";
import { Check, ChevronLeft, Plus, Search, Tag, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
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

const CATEGORY_THEMES = [
  {
    id: "green",
    label: "Mint",
    gradient: ["#22c55e", "#16a34a"] as [string, string],
    accent: "#22c55e",
  },
  {
    id: "blue",
    label: "Ocean",
    gradient: ["#3b82f6", "#2563eb"] as [string, string],
    accent: "#3b82f6",
  },
  {
    id: "violet",
    label: "Purple",
    gradient: ["#8b5cf6", "#7c3aed"] as [string, string],
    accent: "#8b5cf6",
  },
  {
    id: "orange",
    label: "Sunset",
    gradient: ["#f97316", "#ea580c"] as [string, string],
    accent: "#f97316",
  },
  {
    id: "rose",
    label: "Rose",
    gradient: ["#f43f5e", "#e11d48"] as [string, string],
    accent: "#f43f5e",
  },
];

const ThemeCircle = ({
  theme,
  selected,
  onPress,
  revealAnim,
}: {
  theme: (typeof CATEGORY_THEMES)[0];
  selected: boolean;
  onPress: () => void;
  revealAnim: Animated.Value;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.86,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
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
              outputRange: [14, 0],
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
            width: 48,
            height: 48,
            borderRadius: 999,
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
              borderRadius: 999,
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
          color: selected ? theme.accent : "#94a3b8",
        }}
      >
        {theme.label}
      </Text>
    </Animated.View>
  );
};

const AddCategoryModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(CATEGORY_THEMES[0]);

  const [activeField, setActiveField] = useState<"name" | "emoji" | null>(null);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const inputReveal = useRef(new Animated.Value(0)).current;
  const emojiReveal = useRef(new Animated.Value(0)).current;
  const themeReveal = useRef(new Animated.Value(0)).current;

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration || 250 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration || 250 : 220,
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
            useNativeDriver: true,
          }),

          Animated.timing(emojiReveal, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),

          Animated.timing(themeReveal, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Keyboard.dismiss();

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    setCatName("");
    setCatEmoji("");
    setShowEmojiPicker(false);
    setSelectedTheme(CATEGORY_THEMES[0]);

    onClose();
  };

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

  const canSubmit = catName.trim().length > 0;

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
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: focused ? accent : "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  });

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
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: 22,
            paddingTop: 14,
            paddingBottom: 36,

            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 24,
            shadowOffset: {
              width: 0,
              height: -8,
            },

            elevation: 24,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: "#e2e8f0",
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
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: `${selectedTheme.accent}15`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tag size={18} color={selectedTheme.accent} strokeWidth={2.5} />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  Add Category
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 1,
                  }}
                >
                  Create custom spending category
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                backgroundColor: "#f1f5f9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color="#64748b" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Input + Emoji */}
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
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={LABEL_STYLE}>Category Name</Text>

              <View
                style={INPUT_CONTAINER(
                  activeField === "name",
                  selectedTheme.accent,
                )}
              >
                <Tag size={16} color="#94a3b8" />

                <TextInput
                  value={catName}
                  onChangeText={setCatName}
                  placeholder="e.g. Gaming, Food..."
                  placeholderTextColor="#cbd5e1"
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                  onFocus={() => {
                    setActiveField("name");
                    setShowEmojiPicker(false);
                  }}
                  onBlur={() => setActiveField(null)}
                />
              </View>
            </View>

            <View>
              <Text style={LABEL_STYLE}>Icon</Text>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEmojiPicker((v) => !v);
                  setActiveField("emoji");
                }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,

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
                <Text style={{ fontSize: catEmoji ? 24 : 20 }}>
                  {catEmoji || "🏷️"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Emoji Picker */}
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
                ],
              }}
            >
              {/* Search */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  margin: 14,
                  backgroundColor: "#f8fafc",
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Search size={16} color="#94a3b8" />

                <TextInput
                  value={emojiSearch}
                  onChangeText={setEmojiSearch}
                  placeholder="Search emoji..."
                  placeholderTextColor="#94a3b8"
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 14,
                  paddingBottom: 16,
                  gap: 18,
                }}
              >
                {Object.entries(groupedEmojis).map(([category, emojis]) => (
                  <View key={category}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: selectedTheme.accent,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {category}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {emojis.map((item) => {
                        const selected = catEmoji === item.emoji;

                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => {
                              setCatEmoji(item.emoji);
                              setShowEmojiPicker(false);
                            }}
                            style={{
                              width: 58,
                              height: 58,
                              borderRadius: 16,

                              backgroundColor: selected
                                ? `${selectedTheme.accent}15`
                                : "#fff",

                              borderWidth: 1.5,

                              borderColor: selected
                                ? selectedTheme.accent
                                : "#e2e8f0",

                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Theme */}
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
                marginBottom: 16,
              }}
            >
              <Text style={LABEL_STYLE}>Category Theme</Text>

              <View
                style={{
                  backgroundColor: `${selectedTheme.accent}15`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
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
              {CATEGORY_THEMES.map((theme) => (
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

          {/* Preview */}
          {canSubmit && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,

                backgroundColor: `${selectedTheme.accent}10`,
                borderRadius: 18,

                padding: 14,

                borderWidth: 1,
                borderColor: `${selectedTheme.accent}25`,

                marginBottom: 18,
              }}
            >
              <LinearGradient
                colors={selectedTheme.gradient}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>{catEmoji || "🏷️"}</Text>
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {catName}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginTop: 2,
                  }}
                >
                  Ready to use in transactions
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: selectedTheme.accent,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  Ready
                </Text>
              </View>
            </View>
          )}

          {/* Submit */}
          <Pressable
            disabled={!canSubmit}
            onPress={() => {
              console.log({
                name: catName,
                icon: catEmoji || "🏷️",
                theme: selectedTheme.id,
              });

              handleClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,

              paddingVertical: 16,

              borderRadius: 18,

              backgroundColor: canSubmit
                ? selectedTheme.accent
                : `${selectedTheme.accent}40`,

              shadowColor: selectedTheme.accent,
              shadowOpacity: canSubmit ? 0.4 : 0,
              shadowRadius: 12,

              shadowOffset: {
                width: 0,
                height: 5,
              },

              elevation: canSubmit ? 6 : 0,
            }}
          >
            <Plus
              size={18}
              color={canSubmit ? "white" : "#ffffff90"}
              strokeWidth={2.5}
            />

            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: canSubmit ? "white" : "#ffffff90",
              }}
            >
              {canSubmit
                ? `Save "${catName}" Category`
                : "Fill category details"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default function ManageCategory() {
  const [modalVisible, setModalVisible] = useState(false);

  const MOCK_DATA = [
    {
      id: "1",
      icon: "🍔",
      label: "Food",
      bg: "#fed7aa",
    },
    {
      id: "2",
      icon: "🎮",
      label: "Gaming",
      bg: "#ddd6fe",
    },
  ];

  return (
    <View className="flex-1 bg-white pt-14 px-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-extrabold text-slate-900">
            Categories
          </Text>

          <Text className="text-slate-400 font-medium">
            Manage your spending tags 🏷️
          </Text>
        </View>

        <Pressable
          onPress={() => setModalVisible(true)}
          className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center"
        >
          <Plus color="white" size={22} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            className="flex-row items-center p-4 rounded-3xl mb-3 border border-slate-100"
            style={{
              backgroundColor: "#fafafa",
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                backgroundColor: item.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-base font-bold text-slate-900">
                {item.label}
              </Text>

              <Text className="text-xs text-slate-400 uppercase tracking-widest">
                Tap to edit
              </Text>
            </View>

            <ChevronLeft
              size={18}
              color="#cbd5e1"
              style={{
                transform: [{ rotate: "180deg" }],
              }}
            />
          </View>
        )}
        ListFooterComponent={<View className="h-32" />}
      />

      <AddCategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

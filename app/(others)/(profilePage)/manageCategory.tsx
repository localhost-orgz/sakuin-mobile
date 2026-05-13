/**
 * app/(others)/(profilePage)/manageCategory.tsx
 *
 * Redesigned to match the app design system (green gradient header,
 * search bar, flat white list). Tapping a row opens an Edit bottom sheet
 * pre-filled with that category's data. The Edit sheet has "Simpan Perubahan"
 * and "Hapus Kategori" buttons. Delete shows an Alert before proceeding.
 * The Add (+) button reuses the original AddCategoryModal.
 */

import { MONEY_TRACKER_EMOJIS } from "@/constants/emojiList";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ─── Theme definitions ────────────────────────────────────────────────────────
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

// ─── Category type ────────────────────────────────────────────────────────────
type Category = {
  id: string;
  icon: string;
  label: string;
  bg: string;
  themeId: string;
};

// ─── Initial category list ────────────────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    icon: "🍔",
    label: "Food & Beverage",
    bg: "#dcfce7",
    themeId: "green",
  },
  { id: "2", icon: "🎮", label: "Gaming", bg: "#ede9fe", themeId: "violet" },
  { id: "3", icon: "🚕", label: "Transport", bg: "#dbeafe", themeId: "blue" },
  { id: "4", icon: "🛍️", label: "Shopping", bg: "#fce7f3", themeId: "rose" },
  {
    id: "5",
    icon: "💊",
    label: "Health & Fitness",
    bg: "#dcfce7",
    themeId: "green",
  },
  {
    id: "6",
    icon: "▶️",
    label: "Entertainment",
    bg: "#dbeafe",
    themeId: "blue",
  },
  {
    id: "7",
    icon: "🧾",
    label: "Bills & Utilities",
    bg: "#ffedd5",
    themeId: "orange",
  },
  { id: "8", icon: "📚", label: "Education", bg: "#ede9fe", themeId: "violet" },
];

// ─── ThemeCircle ──────────────────────────────────────────────────────────────
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

// ─── Shared Category Sheet (used for both Add & Edit) ─────────────────────────
type SheetMode = "add" | "edit";

const CategorySheet = ({
  visible,
  mode,
  initialData,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  mode: SheetMode;
  initialData?: Category;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; themeId: string }) => void;
  onDelete?: () => void;
}) => {
  const [catName, setCatName] = useState(initialData?.label ?? "");
  const [catEmoji, setCatEmoji] = useState(initialData?.icon ?? "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(
    CATEGORY_THEMES.find((t) => t.id === initialData?.themeId) ??
      CATEGORY_THEMES[0],
  );
  const [activeField, setActiveField] = useState<"name" | "emoji" | null>(null);

  // Reset when initialData or mode changes
  useEffect(() => {
    if (visible) {
      setCatName(initialData?.label ?? "");
      setCatEmoji(initialData?.icon ?? "");
      setSelectedTheme(
        CATEGORY_THEMES.find((t) => t.id === initialData?.themeId) ??
          CATEGORY_THEMES[0],
      );
      setShowEmojiPicker(false);
      setEmojiSearch("");
    }
  }, [visible, initialData]);

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
    const onShow = (e: KeyboardEvent) =>
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration || 250 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    const onHide = (e: KeyboardEvent) =>
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration || 250 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    const s1 = Keyboard.addListener(showEvent, onShow);
    const s2 = Keyboard.addListener(hideEvent, onHide);
    return () => {
      s1.remove();
      s2.remove();
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
    setShowEmojiPicker(false);
    onClose();
  };

  const filteredEmojis = useMemo(
    () =>
      MONEY_TRACKER_EMOJIS.filter((item) => {
        const s = emojiSearch.toLowerCase();
        return (
          item.label.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s)
        );
      }),
    [emojiSearch],
  );

  const groupedEmojis = useMemo(
    () =>
      filteredEmojis.reduce(
        (acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        },
        {} as Record<string, typeof MONEY_TRACKER_EMOJIS>,
      ),
    [filteredEmojis],
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
            shadowOffset: { width: 0, height: -8 },
            elevation: 24,
          }}
        >
          {/* Drag handle */}
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
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
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
                  style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}
                >
                  {mode === "add" ? "Add Category" : "Edit Category"}
                </Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                  {mode === "add"
                    ? "Create custom spending category"
                    : "Update or remove category"}
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

          {/* Name + Emoji row */}
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

          {/* Emoji picker */}
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
                shadowOffset: { width: 0, height: 10 },
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
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {emojis.map((item) => {
                        const sel = catEmoji === item.emoji;
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
                              backgroundColor: sel
                                ? `${selectedTheme.accent}15`
                                : "#fff",
                              borderWidth: 1.5,
                              borderColor: sel
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

          {/* Theme picker */}
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
                  style={{ fontSize: 15, fontWeight: "800", color: "#0f172a" }}
                >
                  {catName}
                </Text>
                <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
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
                  style={{ fontSize: 10, fontWeight: "700", color: "white" }}
                >
                  Ready
                </Text>
              </View>
            </View>
          )}

          {/* Action buttons */}
          {mode === "edit" ? (
            <View style={{ gap: 10 }}>
              {/* Save changes */}
              <Pressable
                disabled={!canSubmit}
                onPress={() => {
                  onSave({
                    name: catName,
                    icon: catEmoji || "🏷️",
                    themeId: selectedTheme.id,
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
                  shadowColor: canSubmit ? selectedTheme.accent : "transparent",
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 5 },
                  elevation: canSubmit ? 6 : 0,
                }}
              >
                <Check
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
                  Simpan Perubahan
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={() => {
                  handleClose();
                  // slight delay so sheet closes before Alert shows
                  setTimeout(() => {
                    Alert.alert(
                      "Hapus Kategori?",
                      `Kategori "${catName}" akan dihapus secara permanen. Transaksi yang menggunakan kategori ini tidak akan terpengaruh.`,
                      [
                        { text: "Batal", style: "cancel" },
                        {
                          text: "Hapus",
                          style: "destructive",
                          onPress: () => onDelete?.(),
                        },
                      ],
                    );
                  }, 350);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: 18,
                  backgroundColor: "#fef2f2",
                  borderWidth: 1.5,
                  borderColor: "#fecaca",
                }}
              >
                <Trash2 size={18} color="#ef4444" strokeWidth={2.5} />
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: "#ef4444" }}
                >
                  Hapus Kategori
                </Text>
              </Pressable>
            </View>
          ) : (
            // Add mode — single save button
            <Pressable
              disabled={!canSubmit}
              onPress={() => {
                onSave({
                  name: catName,
                  icon: catEmoji || "🏷️",
                  themeId: selectedTheme.id,
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
                shadowColor: canSubmit ? selectedTheme.accent : "transparent",
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
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
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ManageCategory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");

  // Sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("add");
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  );

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.label.toLowerCase().includes(q));
  }, [categories, search]);

  const openAdd = () => {
    setEditingCategory(undefined);
    setSheetMode("add");
    setSheetVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setSheetMode("edit");
    setSheetVisible(true);
  };

  const handleSave = (data: {
    name: string;
    icon: string;
    themeId: string;
  }) => {
    const theme =
      CATEGORY_THEMES.find((t) => t.id === data.themeId) ?? CATEGORY_THEMES[0];
    if (sheetMode === "add") {
      const newCat: Category = {
        id: Date.now().toString(),
        label: data.name,
        icon: data.icon,
        bg: `${theme.accent}22`,
        themeId: data.themeId,
      };
      setCategories((prev) => [...prev, newCat]);
    } else if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                label: data.name,
                icon: data.icon,
                bg: `${theme.accent}22`,
                themeId: data.themeId,
              }
            : c,
        ),
      );
    }
  };

  const handleDelete = () => {
    if (editingCategory) {
      setCategories((prev) => prev.filter((c) => c.id !== editingCategory.id));
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── Pinned green header ───────────────────────────────────────── */}
        <LinearGradient
          colors={["#00bf71", "#009e5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "800", color: "white" }}>
              Categories
            </Text>

            {/* Add button */}
            <TouchableOpacity
              onPress={openAdd}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 11,
              gap: 10,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.25)",
            }}
          >
            <Search size={16} color="rgba(255,255,255,0.7)" strokeWidth={2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search category"
              placeholderTextColor="rgba(255,255,255,0.55)"
              style={{
                flex: 1,
                fontSize: 14,
                color: "white",
                fontWeight: "500",
              }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <X size={16} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* ── Count strip ──────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "600" }}>
            {filteredCategories.length} categories
          </Text>
          <Pressable
            onPress={openAdd}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#f0fdf8",
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#bbf7d0",
            }}
          >
            <Plus size={12} color="#00bf71" strokeWidth={2.5} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#00bf71" }}>
              Add New
            </Text>
          </Pressable>
        </View>

        {/* ── Category list ─────────────────────────────────────────────── */}
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "white",
          }}
          style={{ backgroundColor: "white" }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🏷️</Text>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#374151" }}
              >
                No categories found
              </Text>
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                Try a different search or add a new one
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const theme =
              CATEGORY_THEMES.find((t) => t.id === item.themeId) ??
              CATEGORY_THEMES[0];

            return (
              <Pressable
                onPress={() => openEdit(item)}
                style={({ pressed }) => ({
                  marginHorizontal: 16,
                  marginTop: 14,
                  borderRadius: 24,
                  overflow: "hidden",
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                })}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 24,
                    padding: 16,

                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 3,

                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                  }}
                >
                  {/* top accent */}
                  <LinearGradient
                    colors={[`${theme.accent}22`, `${theme.accent}05`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 5,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {/* icon */}
                    <LinearGradient
                      colors={theme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,

                        shadowColor: theme.accent,
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 5 },
                        elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                    </LinearGradient>

                    {/* text */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: "#0f172a",
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: theme.accent,
                          }}
                        />

                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#94a3b8",
                          }}
                        >
                          {theme.label} Theme
                        </Text>
                      </View>
                    </View>

                    {/* right action */}
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: `${theme.accent}12`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRight
                        size={18}
                        color={theme.accent}
                        strokeWidth={2.8}
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ── Category Sheet (Add / Edit) ───────────────────────────────────── */}
      <CategorySheet
        visible={sheetVisible}
        mode={sheetMode}
        initialData={editingCategory}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}

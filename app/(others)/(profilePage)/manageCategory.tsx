/**
 * app/(others)/(profilePage)/manageCategory.tsx
 *
 * Redesigned to match the app design system (green gradient header,
 * search bar, flat white list). Tapping a row opens an Edit bottom sheet
 * pre-filled with that category's data. The Edit sheet has "Simpan Perubahan"
 * and "Hapus Kategori" buttons. Delete shows an Alert before proceeding.
 * The Add (+) button reuses the original AddCategoryModal.
 *
 * Theme picker is now fully dynamic via useWalletTheme (same as AddGoal.tsx).
 */

import { MONEY_TRACKER_EMOJIS } from "@/constants/emojiList";
import {
  WalletTheme,
  WalletThemeId,
  getWalletTheme,
  getWalletThemeIds,
} from "@/hooks/useWalletTheme";
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
import { apiRequest } from "@/utils/api";
import { Skeleton } from "@/components/Skeleton";
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

// ─── Category type ────────────────────────────────────────────────────────────
type Category = {
  id: string;
  icon: string;
  label: string;
  themeId: WalletThemeId;
};

// ─── Initial category list ────────────────────────────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  { id: "1", icon: "🍔", label: "Food & Beverage", themeId: "forest" },
  { id: "2", icon: "🎮", label: "Gaming", themeId: "violet" },
  { id: "3", icon: "🚕", label: "Transport", themeId: "ocean" },
  { id: "4", icon: "🛍️", label: "Shopping", themeId: "rose" },
  { id: "5", icon: "💊", label: "Health & Fitness", themeId: "forest" },
  { id: "6", icon: "▶️", label: "Entertainment", themeId: "indigo" },
  { id: "7", icon: "🧾", label: "Bills & Utilities", themeId: "ember" },
  { id: "8", icon: "📚", label: "Education", themeId: "violet" },
];

// ─── ThemeCircle — now driven by WalletTheme ─────────────────────────────────
const ThemeCircle = ({
  theme,
  selected,
  onPress,
  revealAnim,
}: {
  theme: WalletTheme;
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
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            backgroundColor: theme.accentColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && <Check size={16} color="white" strokeWidth={3} />}
        </View>
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
              borderColor: theme.accentColor,
            }}
          />
        )}
      </Pressable>
      <Text
        style={{
          fontSize: 10,
          fontWeight: selected ? "700" : "500",
          color: selected ? theme.accentColor : "#94a3b8",
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
  onSave: (data: {
    name: string;
    icon: string;
    themeId: WalletThemeId;
  }) => void;
  onDelete?: () => void;
}) => {
  const allThemeIds = getWalletThemeIds();

  const [catName, setCatName] = useState(initialData?.label ?? "");
  const [catEmoji, setCatEmoji] = useState(initialData?.icon ?? "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<WalletThemeId>(
    initialData?.themeId ?? allThemeIds[0],
  );
  const [activeField, setActiveField] = useState<"name" | "emoji" | null>(null);

  const selectedTheme = getWalletTheme(selectedThemeId);

  // Reset when sheet opens
  useEffect(() => {
    if (visible) {
      setCatName(initialData?.label ?? "");
      setCatEmoji(initialData?.icon ?? "");
      setSelectedThemeId(initialData?.themeId ?? allThemeIds[0]);
      setShowEmojiPicker(false);
      setEmojiSearch("");
    }
  }, [visible, initialData]);

  // Animations
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

  const INPUT_CONTAINER = (focused: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: focused ? selectedTheme.accentColor : "#e2e8f0",
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
                  backgroundColor: `${selectedTheme.iconBgColor}`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tag
                  size={18}
                  color={selectedTheme.accentColor}
                  strokeWidth={2.5}
                />
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
              <View style={INPUT_CONTAINER(activeField === "name")}>
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
                    activeField === "emoji"
                      ? selectedTheme.accentColor
                      : "#e2e8f0",
                  backgroundColor:
                    activeField === "emoji"
                      ? `${selectedTheme.accentColor}10`
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
                        color: selectedTheme.accentColor,
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
                                ? `${selectedTheme.accentColor}15`
                                : "#fff",
                              borderWidth: 1.5,
                              borderColor: sel
                                ? selectedTheme.accentColor
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

          {/* ── Theme picker — now dynamic via useWalletTheme ── */}
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
                  backgroundColor: `${selectedTheme.accentColor}15`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {selectedTheme.label}
                </Text>
              </View>
            </View>

            {/* Show first 6 themes in a row — same pattern as AddGoal */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              }}
            >
              {getWalletThemeIds()
                .slice(0, 6)
                .map((id) => (
                  <ThemeCircle
                    key={id}
                    theme={getWalletTheme(id)}
                    selected={selectedThemeId === id}
                    onPress={() => setSelectedThemeId(id)}
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
                backgroundColor: `${selectedTheme.iconBgColor}`,
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: `${selectedTheme.accentColor}25`,
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  backgroundColor: selectedTheme.accentColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>{catEmoji || "🏷️"}</Text>
              </View>
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
                  backgroundColor: selectedTheme.accentColor,
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
              <Pressable
                disabled={!canSubmit}
                onPress={() => {
                  onSave({
                    name: catName,
                    icon: catEmoji || "🏷️",
                    themeId: selectedThemeId,
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
                    ? selectedTheme.accentColor
                    : `${selectedTheme.accentColor}40`,
                  shadowColor: canSubmit
                    ? selectedTheme.accentColor
                    : "transparent",
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

              <Pressable
                onPress={() => {
                  handleClose();
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
            <Pressable
              disabled={!canSubmit}
              onPress={() => {
                onSave({
                  name: catName,
                  icon: catEmoji || "🏷️",
                  themeId: selectedThemeId,
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
                  ? selectedTheme.accentColor
                  : `${selectedTheme.accentColor}40`,
                shadowColor: canSubmit
                  ? selectedTheme.accentColor
                  : "transparent",
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("add");
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/categories", { method: "GET" });
      if (res?.status === "success" && res.data) {
        const mapped = res.data.map((c: any) => ({
          id: c._id || c.id,
          icon: c.emoticon || c.icon || "🏷️",
          label: c.name || c.label || "Unnamed",
          themeId: (c.themeId || c.theme_id || "ocean") as WalletThemeId,
        }));
        setCategories(mapped);
      } else if (Array.isArray(res)) {
        const mapped = res.map((c: any) => ({
          id: c._id || c.id,
          icon: c.emoticon || c.icon || "🏷️",
          label: c.name || c.label || "Unnamed",
          themeId: (c.themeId || c.theme_id || "ocean") as WalletThemeId,
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSave = async (data: {
    name: string;
    icon: string;
    themeId: WalletThemeId;
  }) => {
    try {
      setSheetVisible(false);
      setLoading(true);
      if (sheetMode === "add") {
        await apiRequest("/categories", {
          method: "POST",
          body: {
            name: data.name,
            emoticon: data.icon,
            themeId: data.themeId,
          },
        });
      } else if (editingCategory) {
        let updateSuccess = false;
        try {
          await apiRequest(`/categories/${editingCategory.id}`, {
            method: "PUT",
            body: {
              name: data.name,
              emoticon: data.icon,
              themeId: data.themeId,
            },
          });
          updateSuccess = true;
        } catch (putErr) {
          console.warn("PUT failed, trying PATCH...", putErr);
        }

        if (!updateSuccess) {
          await apiRequest(`/categories/${editingCategory.id}`, {
            method: "PATCH",
            body: {
              name: data.name,
              emoticon: data.icon,
              themeId: data.themeId,
            },
          });
        }
      }
      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      Alert.alert("Error", "Failed to save category. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (editingCategory) {
      try {
        setSheetVisible(false);
        setLoading(true);
        await apiRequest(`/categories/${editingCategory.id}`, {
          method: "DELETE",
        });
        await fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        Alert.alert("Error", "Failed to delete category. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── Pinned green header ── */}
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

        {/* ── Count strip ── */}
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

        {/* ── Category list ── */}
        <FlatList
          data={loading ? [] : filteredCategories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "white",
          }}
          style={{ backgroundColor: "white" }}
          ListEmptyComponent={
            loading ? (
              <View style={{ paddingHorizontal: 16, gap: 14, paddingTop: 14 }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 24,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton
                      width={58}
                      height={58}
                      borderRadius={20}
                      style={{ marginRight: 16, backgroundColor: "#e2e8f0" }}
                    />
                    <View style={{ flex: 1, gap: 8 }}>
                      <Skeleton
                        width={140}
                        height={16}
                        borderRadius={6}
                        style={{ backgroundColor: "#e2e8f0" }}
                      />
                      <Skeleton
                        width={90}
                        height={12}
                        borderRadius={4}
                        style={{ backgroundColor: "#e2e8f0" }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
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
            )
          }
          renderItem={({ item }) => {
            // Derive colors live from useWalletTheme
            const theme = getWalletTheme(item.themeId);

            return (
              <Pressable
                onPress={() => openEdit(item)}
                style={({ pressed }) => ({
                  marginHorizontal: 16,
                  marginTop: 14,
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* Icon */}
                    <View
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 20,
                        backgroundColor: theme.iconBgColor,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                        shadowColor: theme.accentColor,
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 5 },
                        elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                    </View>

                    {/* Text */}
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
                            backgroundColor: theme.accentColor,
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

                    {/* Chevron */}
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        backgroundColor: `transparent`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRight
                        size={18}
                        color={theme.accentColor}
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

      {/* ── Category Sheet (Add / Edit) ── */}
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

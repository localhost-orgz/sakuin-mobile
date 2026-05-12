import { CURRENCY_LIST } from "@/constants/currencyList";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
  link?: string;
};

// ─── Currency Picker Overlay ──────────────────────────────────────────────────
const CurrencyPickerOverlay = ({
  visible,
  current,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  current: string;
  onConfirm: (code: string) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState(current);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const prevVisible = useRef<boolean | null>(null);

  if (visible && prevVisible.current !== true) {
    prevVisible.current = true;
    setDraft(current);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 70,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  } else if (!visible && prevVisible.current === true) {
    prevVisible.current = false;
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const selected = CURRENCY_LIST.find((c) => c.code === draft);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 9999,
        opacity: opacityAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-8, 0],
            }),
          },
          {
            scaleY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 16,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          {/* Close */}
          <Pressable
            onPress={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={13} color="#6b7280" strokeWidth={2.5} />
          </Pressable>

          {/* Live preview of selection */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#1a1f36",
              flex: 1,
              textAlign: "center",
              marginHorizontal: 8,
            }}
            numberOfLines={1}
          >
            {selected?.flag} {selected?.code} — {selected?.name}
          </Text>

          {/* Apply / confirm */}
          <Pressable
            onPress={() => {
              onConfirm(draft);
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#00bf71",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Check size={12} color="white" strokeWidth={3} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
              Apply
            </Text>
          </Pressable>
        </View>

        {/* Picker — spins freely, nothing committed until Apply */}
        <Picker
          selectedValue={draft}
          onValueChange={(val) => setDraft(val as string)}
          style={{
            height: Platform.OS === "ios" ? 180 : 52,
            color: "#1a1f36",
          }}
          dropdownIconColor="#00bf71"
          mode="dropdown"
        >
          {CURRENCY_LIST.map((c) => (
            <Picker.Item
              key={c.code}
              label={`${c.flag}  ${c.code} — ${c.name}`}
              value={c.code}
              color={c.code === draft ? "#00bf71" : "#1a1f36"}
            />
          ))}
        </Picker>
      </View>
    </Animated.View>
  );
};

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({ item, isLast }: { item: MenuItem; isLast: boolean }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(item.value ?? "IDR");
  const [pickerOpen, setPickerOpen] = useState(false);

  if (item.type === "logout") return null;

  // ── Currency dropdown ─────────────────────────────────────────────────────
  if (item.type === "dropdown") {
    const selected = CURRENCY_LIST.find((c) => c.code === selectedCurrency);

    return (
      <View style={{ position: "relative", zIndex: pickerOpen ? 100 : 1 }}>
        {/* Tappable row */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setPickerOpen((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 15, color: "#1f2937" }}>{item.label}</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: pickerOpen ? "#e6faf3" : "#f3f4f6",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: pickerOpen ? "#00bf71" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: pickerOpen ? "#00bf71" : "#374151",
              }}
            >
              {selected?.flag} {selected?.code}
            </Text>
            <ChevronDown
              size={13}
              color={pickerOpen ? "#00bf71" : "#6b7280"}
              strokeWidth={2.5}
            />
          </View>
        </TouchableOpacity>

        {/* Floating overlay — absolutely positioned, doesn't push other rows */}
        <CurrencyPickerOverlay
          visible={pickerOpen}
          current={selectedCurrency}
          onConfirm={(code) => setSelectedCurrency(code)}
          onClose={() => setPickerOpen(false)}
        />
      </View>
    );
  }

  // ── Arrow row ─────────────────────────────────────────────────────────────
  return (
    <Link href={item.link || "/"} asChild>
      <Pressable
        // activeOpacity={0.6}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 15, color: "#1f2937" }}>{item.label}</Text>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={14} color="#6b7280" strokeWidth={2.5} />
        </View>
      </Pressable>
    </Link>
  );
};

export default MenuRow;

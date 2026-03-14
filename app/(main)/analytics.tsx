/**
 * app/(main)/analytics.tsx
 *
 * Install (run once):
 *   npx expo install react-native-gifted-charts expo-linear-gradient react-native-svg
 */

import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN = "#00bf71";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const VIOLET = "#8b5cf6";
const TEAL = "#14b8a6";

const CAT_COLORS: Record<string, string> = {
  food: GREEN,
  transport: BLUE,
  shopping: AMBER,
  health: ROSE,
  other: VIOLET,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type MonthKey =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

type CatId = "food" | "transport" | "shopping" | "health" | "other";

type DayExpense = {
  day: DayKey;
  total: number;
  breakdown: Record<CatId, number>;
};

type MonthExpense = {
  month: MonthKey;
  total: number;
  breakdown: Record<CatId, number>;
};

// ─── Mock weekly data (4 weeks per "week index") ──────────────────────────────
const ALL_WEEKS: DayExpense[][] = [
  // Week 0: Feb 1–7
  [
    {
      day: "Mon",
      total: 150_000,
      breakdown: {
        food: 70_000,
        transport: 30_000,
        shopping: 20_000,
        health: 20_000,
        other: 10_000,
      },
    },
    {
      day: "Tue",
      total: 380_000,
      breakdown: {
        food: 120_000,
        transport: 80_000,
        shopping: 100_000,
        health: 50_000,
        other: 30_000,
      },
    },
    {
      day: "Wed",
      total: 200_000,
      breakdown: {
        food: 80_000,
        transport: 40_000,
        shopping: 50_000,
        health: 10_000,
        other: 20_000,
      },
    },
    {
      day: "Thu",
      total: 120_000,
      breakdown: {
        food: 50_000,
        transport: 25_000,
        shopping: 20_000,
        health: 15_000,
        other: 10_000,
      },
    },
    {
      day: "Fri",
      total: 500_000,
      breakdown: {
        food: 180_000,
        transport: 100_000,
        shopping: 140_000,
        health: 50_000,
        other: 30_000,
      },
    },
    {
      day: "Sat",
      total: 90_000,
      breakdown: {
        food: 40_000,
        transport: 10_000,
        shopping: 25_000,
        health: 5_000,
        other: 10_000,
      },
    },
    {
      day: "Sun",
      total: 60_000,
      breakdown: {
        food: 30_000,
        transport: 5_000,
        shopping: 10_000,
        health: 5_000,
        other: 10_000,
      },
    },
  ],
  // Week 1: Feb 8–14
  [
    {
      day: "Mon",
      total: 210_000,
      breakdown: {
        food: 90_000,
        transport: 50_000,
        shopping: 30_000,
        health: 20_000,
        other: 20_000,
      },
    },
    {
      day: "Tue",
      total: 330_000,
      breakdown: {
        food: 110_000,
        transport: 70_000,
        shopping: 90_000,
        health: 40_000,
        other: 20_000,
      },
    },
    {
      day: "Wed",
      total: 180_000,
      breakdown: {
        food: 70_000,
        transport: 40_000,
        shopping: 40_000,
        health: 20_000,
        other: 10_000,
      },
    },
    {
      day: "Thu",
      total: 250_000,
      breakdown: {
        food: 100_000,
        transport: 60_000,
        shopping: 50_000,
        health: 20_000,
        other: 20_000,
      },
    },
    {
      day: "Fri",
      total: 400_000,
      breakdown: {
        food: 140_000,
        transport: 80_000,
        shopping: 110_000,
        health: 40_000,
        other: 30_000,
      },
    },
    {
      day: "Sat",
      total: 110_000,
      breakdown: {
        food: 50_000,
        transport: 20_000,
        shopping: 20_000,
        health: 10_000,
        other: 10_000,
      },
    },
    {
      day: "Sun",
      total: 80_000,
      breakdown: {
        food: 30_000,
        transport: 15_000,
        shopping: 20_000,
        health: 5_000,
        other: 10_000,
      },
    },
  ],
  // Week 2: Feb 15–21
  [
    {
      day: "Mon",
      total: 180_000,
      breakdown: {
        food: 75_000,
        transport: 40_000,
        shopping: 35_000,
        health: 15_000,
        other: 15_000,
      },
    },
    {
      day: "Tue",
      total: 290_000,
      breakdown: {
        food: 100_000,
        transport: 60_000,
        shopping: 80_000,
        health: 30_000,
        other: 20_000,
      },
    },
    {
      day: "Wed",
      total: 140_000,
      breakdown: {
        food: 55_000,
        transport: 30_000,
        shopping: 30_000,
        health: 10_000,
        other: 15_000,
      },
    },
    {
      day: "Thu",
      total: 310_000,
      breakdown: {
        food: 120_000,
        transport: 70_000,
        shopping: 80_000,
        health: 25_000,
        other: 15_000,
      },
    },
    {
      day: "Fri",
      total: 450_000,
      breakdown: {
        food: 160_000,
        transport: 90_000,
        shopping: 120_000,
        health: 50_000,
        other: 30_000,
      },
    },
    {
      day: "Sat",
      total: 75_000,
      breakdown: {
        food: 30_000,
        transport: 10_000,
        shopping: 20_000,
        health: 5_000,
        other: 10_000,
      },
    },
    {
      day: "Sun",
      total: 95_000,
      breakdown: {
        food: 40_000,
        transport: 20_000,
        shopping: 15_000,
        health: 10_000,
        other: 10_000,
      },
    },
  ],
  // Week 3: Feb 22–28
  [
    {
      day: "Mon",
      total: 220_000,
      breakdown: {
        food: 90_000,
        transport: 50_000,
        shopping: 40_000,
        health: 20_000,
        other: 20_000,
      },
    },
    {
      day: "Tue",
      total: 170_000,
      breakdown: {
        food: 65_000,
        transport: 35_000,
        shopping: 40_000,
        health: 15_000,
        other: 15_000,
      },
    },
    {
      day: "Wed",
      total: 260_000,
      breakdown: {
        food: 100_000,
        transport: 55_000,
        shopping: 65_000,
        health: 20_000,
        other: 20_000,
      },
    },
    {
      day: "Thu",
      total: 195_000,
      breakdown: {
        food: 80_000,
        transport: 40_000,
        shopping: 45_000,
        health: 15_000,
        other: 15_000,
      },
    },
    {
      day: "Fri",
      total: 380_000,
      breakdown: {
        food: 130_000,
        transport: 75_000,
        shopping: 100_000,
        health: 45_000,
        other: 30_000,
      },
    },
    {
      day: "Sat",
      total: 120_000,
      breakdown: {
        food: 50_000,
        transport: 25_000,
        shopping: 25_000,
        health: 10_000,
        other: 10_000,
      },
    },
    {
      day: "Sun",
      total: 70_000,
      breakdown: {
        food: 28_000,
        transport: 12_000,
        shopping: 15_000,
        health: 5_000,
        other: 10_000,
      },
    },
  ],
];

const WEEK_LABELS = ["Feb 1–7", "Feb 8–14", "Feb 15–21", "Feb 22–28"];

// ─── Mock annual data ─────────────────────────────────────────────────────────
const ANNUAL_DATA: Record<number, MonthExpense[]> = {
  2025: [
    {
      month: "Jan",
      total: 1_800_000,
      breakdown: {
        food: 630_000,
        transport: 450_000,
        shopping: 360_000,
        health: 216_000,
        other: 144_000,
      },
    },
    {
      month: "Feb",
      total: 1_500_000,
      breakdown: {
        food: 525_000,
        transport: 375_000,
        shopping: 300_000,
        health: 180_000,
        other: 120_000,
      },
    },
    {
      month: "Mar",
      total: 2_100_000,
      breakdown: {
        food: 735_000,
        transport: 525_000,
        shopping: 420_000,
        health: 252_000,
        other: 168_000,
      },
    },
    {
      month: "Apr",
      total: 1_650_000,
      breakdown: {
        food: 577_500,
        transport: 412_500,
        shopping: 330_000,
        health: 198_000,
        other: 132_000,
      },
    },
    {
      month: "May",
      total: 1_950_000,
      breakdown: {
        food: 682_500,
        transport: 487_500,
        shopping: 390_000,
        health: 234_000,
        other: 156_000,
      },
    },
    {
      month: "Jun",
      total: 2_400_000,
      breakdown: {
        food: 840_000,
        transport: 600_000,
        shopping: 480_000,
        health: 288_000,
        other: 192_000,
      },
    },
    {
      month: "Jul",
      total: 2_200_000,
      breakdown: {
        food: 770_000,
        transport: 550_000,
        shopping: 440_000,
        health: 264_000,
        other: 176_000,
      },
    },
    {
      month: "Aug",
      total: 1_750_000,
      breakdown: {
        food: 612_500,
        transport: 437_500,
        shopping: 350_000,
        health: 210_000,
        other: 140_000,
      },
    },
    {
      month: "Sep",
      total: 1_600_000,
      breakdown: {
        food: 560_000,
        transport: 400_000,
        shopping: 320_000,
        health: 192_000,
        other: 128_000,
      },
    },
    {
      month: "Oct",
      total: 1_900_000,
      breakdown: {
        food: 665_000,
        transport: 475_000,
        shopping: 380_000,
        health: 228_000,
        other: 152_000,
      },
    },
    {
      month: "Nov",
      total: 2_050_000,
      breakdown: {
        food: 717_500,
        transport: 512_500,
        shopping: 410_000,
        health: 246_000,
        other: 164_000,
      },
    },
    {
      month: "Dec",
      total: 2_800_000,
      breakdown: {
        food: 980_000,
        transport: 700_000,
        shopping: 560_000,
        health: 336_000,
        other: 224_000,
      },
    },
  ],
  2026: [
    {
      month: "Jan",
      total: 1_560_000,
      breakdown: {
        food: 546_000,
        transport: 390_000,
        shopping: 312_000,
        health: 187_200,
        other: 124_800,
      },
    },
    {
      month: "Feb",
      total: 1_500_000,
      breakdown: {
        food: 525_000,
        transport: 375_000,
        shopping: 300_000,
        health: 180_000,
        other: 120_000,
      },
    },
    {
      month: "Mar",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Apr",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "May",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Jun",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Jul",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Aug",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Sep",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Oct",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Nov",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
    {
      month: "Dec",
      total: 0,
      breakdown: { food: 0, transport: 0, shopping: 0, health: 0, other: 0 },
    },
  ],
};

const YEAR_RANGE = [2025, 2026];

// ─── Category definitions ─────────────────────────────────────────────────────
type CatDef = { id: CatId; label: string; icon: string; color: string };
const CATS: CatDef[] = [
  { id: "food", label: "Food & Drink", icon: "🍔", color: GREEN },
  { id: "transport", label: "Transport", icon: "🚗", color: BLUE },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: AMBER },
  { id: "health", label: "Health", icon: "💊", color: ROSE },
  { id: "other", label: "Other", icon: "📦", color: VIOLET },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rp = (n: number) =>
  n === 0 ? "Rp 0" : "Rp " + new Intl.NumberFormat("id-ID").format(n);

const rpShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

// ─── FilterPill ───────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: selected ? GREEN : "white",
          borderWidth: 1.5,
          borderColor: selected ? GREEN : "#e5e7eb",
          shadowColor: selected ? GREEN : "transparent",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: selected ? 4 : 0,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: selected ? "white" : "#6b7280",
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── CategoryRow ──────────────────────────────────────────────────────────────
const CategoryRow = ({
  cat,
  amount,
  totalAmount,
  rowAnim,
  selected,
  onPress,
}: {
  cat: CatDef;
  amount: number;
  totalAmount: number;
  rowAnim: Animated.Value;
  selected: boolean;
  onPress: () => void;
}) => {
  const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderRadius: 14,
          padding: 12,
          backgroundColor: selected ? `${cat.color}12` : "#f9fafb",
          borderWidth: 1.5,
          borderColor: selected ? cat.color : "transparent",
          opacity: rowAnim,
          // slide-in from right
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: `${cat.color}22`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1a1f36" }}>
              {cat.label}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: cat.color }}>
              {rp(amount)}
            </Text>
          </View>
          <View
            style={{
              height: 5,
              backgroundColor: "#e5e7eb",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                borderRadius: 99,
                backgroundColor: cat.color,
                width: rowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", `${pct.toFixed(1)}%`],
                }),
              }}
            />
          </View>
        </View>
        <View
          style={{
            backgroundColor: `${cat.color}18`,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "800", color: cat.color }}>
            {pct.toFixed(0)}%
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function Analytics() {
  const insets = useSafeAreaInsets();

  // ── View mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"weekly" | "annual">("weekly");
  const [weekIdx, setWeekIdx] = useState(0); // 0-3
  const [year, setYear] = useState(2026);

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedBar, setSelectedBar] = useState<string | null>(null); // day or month label
  const [selectedCat, setSelectedCat] = useState<CatId | null>(null);

  // ── Animation keys / values ────────────────────────────────────────────────
  const [animKey, setAnimKey] = useState(0);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const pieAnim = useRef(new Animated.Value(0)).current;
  const catAnims = useRef(CATS.map(() => new Animated.Value(0))).current;

  const runAnims = () => {
    cardAnim.setValue(0);
    pieAnim.setValue(0);
    catAnims.forEach((a) => a.setValue(0));
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(pieAnim, {
      toValue: 1,
      duration: 750,
      delay: 100,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: true,
    }).start();
    Animated.stagger(
      65,
      catAnims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: false,
        }),
      ),
    ).start();
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    runAnims();
  }, []);

  const triggerRefresh = () => {
    setAnimKey((k) => k + 1);
    setSelectedBar(null);
    runAnims();
  };

  const handleMode = (m: "weekly" | "annual") => {
    setMode(m);
    setSelectedCat(null);
    triggerRefresh();
  };

  const handleWeekNav = (dir: 1 | -1) => {
    const next = weekIdx + dir;
    if (next < 0 || next >= ALL_WEEKS.length) return;
    setWeekIdx(next);
    setSelectedCat(null);
    triggerRefresh();
  };

  const handleYearNav = (dir: 1 | -1) => {
    const next = year + dir;
    if (!YEAR_RANGE.includes(next)) return;
    setYear(next);
    setSelectedCat(null);
    triggerRefresh();
  };

  const handleBarPress = (label: string) => {
    // Intentionally NOT calling triggerRefresh — bar selection must never
    // remount the BarChart (which would restart the grow animation).
    // We only update selectedBar so frontColor/opacity recalculates in-place.
    setSelectedBar((prev) => (prev === label ? null : label));
    setSelectedCat(null);
  };

  const handleCatPress = (id: CatId) => {
    setSelectedCat((prev) => (prev === id ? null : id));
    setSelectedBar(null);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const weekRows = ALL_WEEKS[weekIdx];
  const annualRows = ANNUAL_DATA[year] ?? ANNUAL_DATA[2025];

  // The "active" breakdown source — either selected bar OR all bars summed
  const getBreakdown = (): Record<CatId, number> => {
    if (mode === "weekly") {
      if (selectedBar) {
        const row = weekRows.find((r) => r.day === selectedBar);
        return row ? row.breakdown : zeroBreakdown();
      }
      return sumBreakdowns(weekRows.map((r) => r.breakdown));
    } else {
      if (selectedBar) {
        const row = annualRows.find((r) => r.month === selectedBar);
        return row ? row.breakdown : zeroBreakdown();
      }
      return sumBreakdowns(annualRows.map((r) => r.breakdown));
    }
  };

  const breakdown = getBreakdown();

  // If a category is selected, filter total to show only that category
  const displayBreakdown: Record<CatId, number> = selectedCat
    ? (Object.fromEntries(
        CATS.map((c) => [c.id, c.id === selectedCat ? breakdown[c.id] : 0]),
      ) as Record<CatId, number>)
    : breakdown;

  const totalExpense = Object.values(displayBreakdown).reduce(
    (s, v) => s + v,
    0,
  );

  // Build bar chart data
  // When a bar is selected: that bar → full active color, others → faded (30% alpha)
  // When a category is selected: all bars use that category's color (faded/full based on selectedBar)
  const activeColor = selectedCat ? CAT_COLORS[selectedCat] : GREEN;
  const dimmedColor = activeColor + "38"; // ~22% opacity hex suffix

  const barData =
    mode === "weekly"
      ? weekRows.map((r) => {
          const val = selectedCat ? r.breakdown[selectedCat] : r.total;
          const isSel = selectedBar === r.day;
          const hasSel = selectedBar !== null;
          return {
            value: Math.round(val / 1000),
            label: r.day,
            labelWidth: 32,
            labelTextStyle: {
              color: hasSel ? (isSel ? "#1a1f36" : "#c0c8d0") : "#9ca3af",
              fontSize: 9,
              fontWeight: isSel ? "700" : "400",
            },
            frontColor: hasSel
              ? isSel
                ? activeColor
                : dimmedColor
              : activeColor,
            topLabelComponent: isSel
              ? () => (
                  <View
                    style={{
                      backgroundColor: activeColor,
                      borderRadius: 6,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      marginBottom: 3,
                    }}
                  >
                    <Text
                      style={{ color: "white", fontSize: 7, fontWeight: "700" }}
                    >
                      {rpShort(val)}
                    </Text>
                  </View>
                )
              : undefined,
            roundedTop: true,
            onPress: () => handleBarPress(r.day),
          };
        })
      : annualRows.map((r) => {
          const val = selectedCat ? r.breakdown[selectedCat] : r.total;
          const isSel = selectedBar === r.month;
          const hasSel = selectedBar !== null;
          return {
            value: Math.round(val / 1000),
            label: r.month.slice(0, 3),
            labelWidth: 28,
            labelTextStyle: {
              color: hasSel ? (isSel ? "#1a1f36" : "#c0c8d0") : "#9ca3af",
              fontSize: 8,
              fontWeight: isSel ? "700" : "400",
            },
            frontColor: hasSel
              ? isSel
                ? activeColor
                : dimmedColor
              : activeColor,
            topLabelComponent: isSel
              ? () => (
                  <View
                    style={{
                      backgroundColor: activeColor,
                      borderRadius: 6,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      marginBottom: 3,
                    }}
                  >
                    <Text
                      style={{ color: "white", fontSize: 7, fontWeight: "700" }}
                    >
                      {rpShort(val)}
                    </Text>
                  </View>
                )
              : undefined,
            roundedTop: true,
            onPress: () => handleBarPress(r.month),
          };
        });

  const maxBarVal = Math.max(...barData.map((d) => d.value), 1);
  const pieData = CATS.map((c) => ({
    value: displayBreakdown[c.id],
    color: displayBreakdown[c.id] === 0 ? "#e5e7eb" : c.color,
    focused: selectedCat === c.id,
  })).filter((d) => d.value > 0 || selectedCat === null);

  // Navigation label
  const navLabel = mode === "weekly" ? WEEK_LABELS[weekIdx] : String(year);
  const canPrev =
    mode === "weekly" ? weekIdx > 0 : YEAR_RANGE.indexOf(year) > 0;
  const canNext =
    mode === "weekly"
      ? weekIdx < ALL_WEEKS.length - 1
      : YEAR_RANGE.indexOf(year) < YEAR_RANGE.length - 1;

  // Active filter chip label
  const filterLabel = selectedBar
    ? `${mode === "weekly" ? selectedBar : selectedBar} only`
    : selectedCat
      ? `${CATS.find((c) => c.id === selectedCat)?.label} only`
      : null;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={["#00bf71", "#009e5f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 18,
            paddingBottom: 40,
            paddingHorizontal: 22,
          }}
        >
          <Animated.View
            style={{
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            }}
          >
            <Text
              style={{
                fontSize: 30,
                color: "white",
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              Analytics
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 3,
              }}
            >
              Expense overview
            </Text>
          </Animated.View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: -22 }}>
          {/* ── Expense Card ─────────────────────────────────────────────── */}
          <View style={$card}>
            {/* Mode toggle */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <FilterPill
                label="Weekly"
                selected={mode === "weekly"}
                onPress={() => handleMode("weekly")}
              />
              <FilterPill
                label="Annual"
                selected={mode === "annual"}
                onPress={() => handleMode("annual")}
              />
            </View>

            {/* Navigation row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  mode === "weekly" ? handleWeekNav(-1) : handleYearNav(-1)
                }
                disabled={!canPrev}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: canPrev ? "#f3f4f6" : "transparent",
                }}
              >
                <ChevronLeft
                  size={18}
                  color={canPrev ? "#1a1f36" : "#d1d5db"}
                />
              </TouchableOpacity>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#1a1f36" }}
                >
                  {navLabel}
                </Text>
                {filterLabel && (
                  <Pressable
                    onPress={() => {
                      setSelectedBar(null);
                      setSelectedCat(null);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                      backgroundColor: `${GREEN}18`,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, fontWeight: "700", color: GREEN }}
                    >
                      {filterLabel}
                    </Text>
                    <Text
                      style={{ fontSize: 10, fontWeight: "800", color: GREEN }}
                    >
                      ✕
                    </Text>
                  </Pressable>
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  mode === "weekly" ? handleWeekNav(1) : handleYearNav(1)
                }
                disabled={!canNext}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: canNext ? "#f3f4f6" : "transparent",
                }}
              >
                <ChevronRight
                  size={18}
                  color={canNext ? "#1a1f36" : "#d1d5db"}
                />
              </TouchableOpacity>
            </View>

            {/* Total expense chip */}
            <Animated.View
              style={{
                alignSelf: "flex-start",
                marginBottom: 16,
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              }}
            >
              <View
                style={{
                  backgroundColor: "#f0fdf8",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderWidth: 1.5,
                  borderColor: "#bbf7d0",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Total Expense
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: GREEN }}>
                  {rp(totalExpense)}
                </Text>
              </View>
            </Animated.View>

            {/* ── gifted-charts BarChart ────────────────────────────────── */}
            <BarChart
              key={`bar-${animKey}-${selectedCat}`}
              data={barData}
              width={SW - 88}
              height={160}
              barWidth={mode === "annual" ? 18 : 26}
              isAnimated
              animationDuration={700}
              initialSpacing={mode === "annual" ? 6 : 14}
              endSpacing={8}
              spacing={mode === "annual" ? 8 : 14}
              noOfSections={4}
              maxValue={Math.ceil(maxBarVal / 100) * 100 + 50}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#e9eef4"
              yAxisTextStyle={{ color: "#b0bac8", fontSize: 9 }}
              rulesColor="#f1f5f9"
              rulesType="solid"
              yAxisLabelSuffix="k"
              disableScroll={mode === "annual"}
              showScrollIndicator={false}
              xAxisLabelTextStyle={{ color: "#9ca3af", fontSize: 9 }}
              activeOpacity={1}
            />

            {/* Tap hint */}
            <Text
              style={{
                fontSize: 10,
                color: "#b0bac8",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              Tap a bar to filter by {mode === "weekly" ? "day" : "month"}
            </Text>
          </View>

          {/* ── Breakdown Card ───────────────────────────────────────────── */}
          <View style={[$card, { marginTop: 14 }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={$sectionTitle}>Breakdown</Text>
              {(selectedBar || selectedCat) && (
                <Pressable
                  onPress={() => {
                    setSelectedBar(null);
                    setSelectedCat(null);
                  }}
                  style={{
                    backgroundColor: "#f3f4f6",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#6b7280",
                    }}
                  >
                    Clear ✕
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Pie chart */}
            <Animated.View
              style={{
                alignItems: "center",
                marginTop: 12,
                marginBottom: 8,
                opacity: pieAnim,
                transform: [
                  {
                    scale: pieAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              <PieChart
                key={`pie-${animKey}-${selectedCat}-${selectedBar}`}
                data={
                  pieData.length > 0
                    ? pieData
                    : [{ value: 1, color: "#e5e7eb" }]
                }
                donut
                radius={95}
                innerRadius={60}
                isAnimated
                animationDuration={800}
                innerCircleColor="white"
                focusOnPress
                toggleFocusOnPress
                onPress={(item: any, index: number) => {
                  const cat = CATS[index];
                  if (cat) handleCatPress(cat.id);
                }}
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#9ca3af",
                        fontWeight: "600",
                      }}
                    >
                      {selectedCat
                        ? CATS.find((c) => c.id === selectedCat)?.label
                        : "Total"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#1a1f36",
                      }}
                    >
                      {rp(totalExpense)}
                    </Text>
                  </View>
                )}
              />
            </Animated.View>

            {/* Pie legend */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {CATS.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => handleCatPress(c.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    opacity: selectedCat && selectedCat !== c.id ? 0.4 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: c.color,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      fontWeight: "600",
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Category rows */}
            <View style={{ gap: 8 }}>
              {CATS.map((cat, i) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  amount={displayBreakdown[cat.id]}
                  totalAmount={Object.values(displayBreakdown).reduce(
                    (s, v) => s + v,
                    0,
                  )}
                  rowAnim={catAnims[i]}
                  selected={selectedCat === cat.id}
                  onPress={() => handleCatPress(cat.id)}
                />
              ))}
            </View>

            <Text
              style={{
                fontSize: 10,
                color: "#b0bac8",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Tap a category to filter
            </Text>
          </View>

          {/* ── Smart insight ─────────────────────────────────────────────── */}
          <Animated.View
            style={{
              marginTop: 14,
              backgroundColor: "#f0fdf8",
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderWidth: 1.5,
              borderColor: "#bbf7d0",
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={{ fontSize: 24 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: "#1a1f36" }}
              >
                Smart Insight
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  marginTop: 3,
                  lineHeight: 17,
                }}
              >
                {selectedCat
                  ? `You spent ${rp(breakdown[selectedCat])} on ${CATS.find((c) => c.id === selectedCat)?.label}${selectedBar ? ` on ${selectedBar}` : ` this ${mode === "weekly" ? "week" : "year"}`}.`
                  : selectedBar
                    ? `Total expense on ${selectedBar}: ${rp(Object.values(breakdown).reduce((s, v) => s + v, 0))}. Food & Drink is the top category.`
                    : mode === "weekly"
                      ? `Your highest spend day is Friday. Food & Drink takes the largest share.`
                      : `December is your highest spending month. Plan ahead for year-end expenses.`}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function zeroBreakdown(): Record<CatId, number> {
  return { food: 0, transport: 0, shopping: 0, health: 0, other: 0 };
}
function sumBreakdowns(bds: Record<CatId, number>[]): Record<CatId, number> {
  const result = zeroBreakdown();
  bds.forEach((bd) => {
    (Object.keys(result) as CatId[]).forEach((k) => {
      result[k] += bd[k];
    });
  });
  return result;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const $card: ViewStyle = {
  backgroundColor: "white",
  borderRadius: 20,
  padding: 18,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};
const $sectionTitle: TextStyle = {
  fontSize: 17,
  fontWeight: "800",
  color: "#1a1f36",
  marginBottom: 14,
};

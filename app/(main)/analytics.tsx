/**
 * app/(main)/analytics.tsx
 *
 * Install (run once):
 *   npx expo install react-native-gifted-charts expo-linear-gradient react-native-svg
 */

import useWalletTheme, { getWalletTheme } from "@/hooks/useWalletTheme";
import { apiRequest } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

type CatId = string;

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

type WeekData = {
  label: string;
  days: DayExpense[];
};

const DAYS_OF_WEEK: DayKey[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];
const DAY_MAP: Record<number, DayKey> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  0: "Sun",
};

const MONTHS_OF_YEAR: MonthKey[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getWeekKey = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatWeekLabel = (monday: Date) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startMonth = MONTH_NAMES[monday.getMonth()];
  const startDay = monday.getDate();

  const endMonth = MONTH_NAMES[sunday.getMonth()];
  const endDay = sunday.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  } else {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  }
};

// ─── Category definitions ─────────────────────────────────────────────────────
type CatDef = {
  id: CatId;
  label: string;
  icon: string;
  color: string;
  themeId: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rp = (n: number) =>
  n === 0 ? "Rp 0" : "Rp " + new Intl.NumberFormat("id-ID").format(n);

const rpShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

const dimColor = (color: string, opacity: number = 0.22) => {
  if (!color) return `rgba(0, 191, 113, ${opacity})`;
  if (color.startsWith("rgba")) {
    const lastCommaIdx = color.lastIndexOf(",");
    if (lastCommaIdx !== -1) {
      return color.substring(0, lastCommaIdx + 1) + ` ${opacity})`;
    }
  }
  if (color.startsWith("#")) {
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, "0");
    return color + hexOpacity;
  }
  return color;
};

const parseDateSafe = (dateStr: any) => {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();
  
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date(dateStr);
};

const getLocalDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const widthAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useWalletTheme(cat.themeId as any);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

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
          backgroundColor: selected ? dimColor(cat.color, 0.1) : "#f9fafb",
          borderWidth: 1.5,
          borderColor: selected ? cat.color : "transparent",
          opacity: rowAnim,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: theme.iconBgColor,
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
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>
        <View
          style={{
            backgroundColor: theme.iconBgColor,
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

const mapCategoryToId = (category: any): CatId => {
  if (!category) return "other";

  const slug = (category.slug || "").toLowerCase();
  const name = (category.name || "").toLowerCase();

  if (
    slug.includes("food") ||
    slug.includes("beverage") ||
    slug.includes("drink") ||
    name.includes("food") ||
    name.includes("drink") ||
    name.includes("makan") ||
    name.includes("minum")
  ) {
    return "food";
  }

  if (
    slug.includes("transport") ||
    slug.includes("car") ||
    slug.includes("ride") ||
    name.includes("transport") ||
    name.includes("perjalanan") ||
    name.includes("kendaraan")
  ) {
    return "transport";
  }

  if (
    slug.includes("shop") ||
    slug.includes("belanja") ||
    slug.includes("market") ||
    name.includes("shop") ||
    name.includes("belanja") ||
    name.includes("beli")
  ) {
    return "shopping";
  }

  if (
    slug.includes("health") ||
    slug.includes("fit") ||
    slug.includes("medic") ||
    slug.includes("doctor") ||
    name.includes("health") ||
    name.includes("sehat") ||
    name.includes("obat") ||
    name.includes("dokter")
  ) {
    return "health";
  }

  return "other";
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function Analytics() {
  const insets = useSafeAreaInsets();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── View mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"weekly" | "annual">("weekly");
  const [weekIdx, setWeekIdx] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedBar, setSelectedBar] = useState<string | null>(null); // day or month label
  const [selectedCat, setSelectedCat] = useState<CatId | null>(null);

  const resolveCategory = (catIdOrObj: any) => {
    if (!catIdOrObj) return null;
    if (typeof catIdOrObj === "object") return catIdOrObj;
    return categories.find((c) => (c._id || c.id) === catIdOrObj) || null;
  };

  const dynamicCats = useMemo<CatDef[]>(() => {
    const list = categories.map((cat: any) => {
      const id = cat._id || cat.id;
      const themeId = cat.themeId || cat.theme_id || cat.color || "ocean";
      const theme = getWalletTheme(themeId as any);
      return {
        id,
        label: cat.name || cat.label || "Unnamed",
        icon: cat.emoticon || cat.icon || "🏷️",
        color: theme.accentColor || GREEN,
        themeId,
      };
    });

    const categoryIds = new Set(categories.map((c) => c._id || c.id));
    const hasOtherSpending = transactions.some((tx: any) => {
      if (tx.type !== "expense") return false;
      const catObj = resolveCategory(tx.category_id);
      if (!catObj) return true;
      const catId = catObj._id || catObj.id;
      return !categoryIds.has(catId);
    });

    if (hasOtherSpending && !list.some((c) => c.id === "other")) {
      list.push({
        id: "other",
        label: "Other",
        icon: "📦",
        color: VIOLET,
        themeId: "violet",
      });
    }
    return list;
  }, [categories, transactions]);

  const zeroBreakdown = () => {
    const res: Record<string, number> = {};
    dynamicCats.forEach((c) => {
      res[c.id] = 0;
    });
    return res;
  };

  const sumBreakdowns = (bds: Record<string, number>[]) => {
    const result = zeroBreakdown();
    bds.forEach((bd) => {
      dynamicCats.forEach((c) => {
        result[c.id] += bd[c.id] || 0;
      });
    });
    return result;
  };

  // ── Animation keys / values ────────────────────────────────────────────────
  const [animKey, setAnimKey] = useState(0);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const pieAnim = useRef(new Animated.Value(0)).current;
  const catAnims = useMemo(
    () => dynamicCats.map(() => new Animated.Value(1)),
    [dynamicCats],
  );

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [txRes, catsRes] = await Promise.all([
        apiRequest("/transaction", { method: "GET" }),
        apiRequest("/categories", { method: "GET" }),
      ]);

      if (catsRes?.status === "success" && catsRes.data) {
        setCategories(catsRes.data);
      } else if (Array.isArray(catsRes)) {
        setCategories(catsRes);
      }

      if (txRes?.status === "success" && txRes.data) {
        setTransactions(txRes.data);
      } else if (Array.isArray(txRes)) {
        setTransactions(txRes);
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

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
    if (!loading) {
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      runAnims();
    }
  }, [loading]);

  // Generate weeks dynamically from transactions
  const dynamicWeeks = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");

    // Default to last 4 weeks if no transactions
    if (expenses.length === 0) {
      const weeks: WeekData[] = [];
      const now = new Date();
      let monday = getWeekKey(now);
      monday.setDate(monday.getDate() - 21);
      for (let i = 0; i < 4; i++) {
        const label = formatWeekLabel(monday);
        const days: DayExpense[] = DAYS_OF_WEEK.map((d) => ({
          day: d,
          total: 0,
          breakdown: zeroBreakdown(),
        }));
        weeks.push({ label, days });
        monday = new Date(monday);
        monday.setDate(monday.getDate() + 7);
      }
      return weeks;
    }

    let minDate = new Date();
    let maxDate = new Date();
    expenses.forEach((tx, idx) => {
      const d = parseDateSafe(tx.date);
      if (idx === 0) {
        minDate = d;
        maxDate = d;
      } else {
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });

    const startMon = getWeekKey(minDate);
    const endMon = getWeekKey(maxDate);

    const weeksMap: Record<string, WeekData> = {};
    let currentMon = new Date(startMon);

    while (currentMon <= endMon) {
      const keyStr = getLocalDateString(currentMon);
      const label = formatWeekLabel(currentMon);
      const days: DayExpense[] = DAYS_OF_WEEK.map((d) => ({
        day: d,
        total: 0,
        breakdown: zeroBreakdown(),
      }));
      weeksMap[keyStr] = { label, days };

      currentMon.setDate(currentMon.getDate() + 7);
    }

    expenses.forEach((tx) => {
      const txDate = parseDateSafe(tx.date);
      const mon = getWeekKey(txDate);
      const keyStr = getLocalDateString(mon);
      const week = weeksMap[keyStr];
      if (week) {
        const dayIdx = txDate.getDay();
        const dayKey = DAY_MAP[dayIdx];
        const dayObj = week.days.find((d) => d.day === dayKey);
        if (dayObj) {
          const amt = Number(tx.amount) || 0;
          dayObj.total += amt;

          const catObj = resolveCategory(tx.category_id);
          const catId = catObj ? catObj._id || catObj.id : "other";

          if (dayObj.breakdown[catId] !== undefined) {
            dayObj.breakdown[catId] += amt;
          } else {
            if (dayObj.breakdown["other"] !== undefined) {
              dayObj.breakdown["other"] += amt;
            }
          }
        }
      }
    });

    return Object.entries(weeksMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, val]) => val);
  }, [transactions, dynamicCats]);

  // Group annual data dynamically from transactions
  const annualData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const years = new Set<number>();
    expenses.forEach((tx) => {
      const date = parseDateSafe(tx.date);
      const yearVal = date.getFullYear();
      if (!isNaN(yearVal)) {
        years.add(yearVal);
      }
    });

    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }

    const yearRange = Array.from(years).sort((a, b) => a - b);

    const dataMap: Record<number, MonthExpense[]> = {};
    yearRange.forEach((yr) => {
      dataMap[yr] = MONTHS_OF_YEAR.map((m) => ({
        month: m,
        total: 0,
        breakdown: zeroBreakdown(),
      }));
    });

    expenses.forEach((tx) => {
      const date = parseDateSafe(tx.date);
      const yr = date.getFullYear();
      const monthIdx = date.getMonth();
      const monthKey = MONTHS_OF_YEAR[monthIdx];
      const yearMonths = dataMap[yr];
      if (yearMonths) {
        const monthObj = yearMonths.find((m) => m.month === monthKey);
        if (monthObj) {
          const amt = Number(tx.amount) || 0;
          monthObj.total += amt;

          const catObj = resolveCategory(tx.category_id);
          const catId = catObj ? catObj._id || catObj.id : "other";

          if (monthObj.breakdown[catId] !== undefined) {
            monthObj.breakdown[catId] += amt;
          } else {
            if (monthObj.breakdown["other"] !== undefined) {
              monthObj.breakdown["other"] += amt;
            }
          }
        }
      }
    });

    return {
      years: yearRange,
      data: dataMap,
    };
  }, [transactions, dynamicCats]);

  // Sync index hooks to use latest datasets by default
  useEffect(() => {
    if (dynamicWeeks.length > 0) {
      setWeekIdx(dynamicWeeks.length - 1);
    }
  }, [dynamicWeeks.length]);

  useEffect(() => {
    if (annualData.years.length > 0) {
      setYear(annualData.years[annualData.years.length - 1]);
    }
  }, [annualData.years]);

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
    if (next < 0 || next >= dynamicWeeks.length) return;
    setWeekIdx(next);
    setSelectedCat(null);
    triggerRefresh();
  };

  const handleYearNav = (dir: 1 | -1) => {
    const next = year + dir;
    if (!annualData.years.includes(next)) return;
    setYear(next);
    setSelectedCat(null);
    triggerRefresh();
  };

  const handleBarPress = (label: string) => {
    setSelectedBar((prev) => (prev === label ? null : label));
    setSelectedCat(null);
  };

  const handleCatPress = (id: CatId) => {
    setSelectedCat((prev) => (prev === id ? null : id));
    setSelectedBar(null);
  };

  // ── Derived active datasets ───────────────────────────────────────────────
  const weekRows = dynamicWeeks[weekIdx]?.days || [];
  const annualRows = annualData.data[year] || [];

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

  const totalExpense = selectedCat
    ? (breakdown[selectedCat] || 0)
    : Object.values(breakdown).reduce((s, v) => s + v, 0);

  const selectedCatObj = dynamicCats.find((c) => c.id === selectedCat);
  const activeColor = selectedCatObj ? selectedCatObj.color : GREEN;
  const dimmedColor = dimColor(activeColor, 0.22);

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
              fontWeight: (isSel ? "700" : "400") as any,
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
              fontWeight: (isSel ? "700" : "400") as any,
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
  
  const pieData = dynamicCats
    .map((c) => ({
      value: breakdown[c.id] || 0,
      color: breakdown[c.id] === 0 ? "#e5e7eb" : c.color,
      focused: selectedCat === c.id,
      catId: c.id,
    }))
    .filter((d) => d.value > 0);

  const navLabel =
    mode === "weekly" ? dynamicWeeks[weekIdx]?.label || "" : String(year);
  const canPrev =
    mode === "weekly" ? weekIdx > 0 : annualData.years.indexOf(year) > 0;
  const canNext =
    mode === "weekly"
      ? weekIdx < dynamicWeeks.length - 1
      : annualData.years.indexOf(year) < annualData.years.length - 1;

  const filterLabel = selectedBar
    ? `${mode === "weekly" ? selectedBar : selectedBar} only`
    : selectedCat
      ? `${dynamicCats.find((c) => c.id === selectedCat)?.label} only`
      : null;

  if (loading) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <ScrollView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
          {/* Header */}
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
            <View
              style={{
                height: 36,
                width: 140,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 8,
              }}
            />
            <View
              style={{
                height: 16,
                width: 100,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 6,
                marginTop: 8,
              }}
            />
          </LinearGradient>

          {/* Cards skeleton */}
          <View style={{ paddingHorizontal: 16, marginTop: -22, gap: 14 }}>
            <View style={$card}>
              <View
                style={{
                  height: 32,
                  width: 180,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  height: 60,
                  width: "100%",
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  height: 160,
                  width: "100%",
                  backgroundColor: "#f9fafb",
                  borderRadius: 8,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

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
                onPress={(item: any) => {
                  if (item && item.catId) {
                    handleCatPress(item.catId);
                  }
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
                        ? dynamicCats.find((c) => c.id === selectedCat)?.label
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
              {dynamicCats.map((c) => (
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
              {dynamicCats.map((cat, i) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  amount={breakdown[cat.id] || 0}
                  totalAmount={Object.values(breakdown).reduce(
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
                  ? `You spent ${rp(breakdown[selectedCat])} on ${dynamicCats.find((c) => c.id === selectedCat)?.label}${selectedBar ? ` on ${selectedBar}` : ` this ${mode === "weekly" ? "week" : "year"}`}.`
                  : selectedBar
                    ? `Total expense on ${selectedBar}: ${rp(Object.values(breakdown).reduce((s, v) => s + v, 0))}.`
                    : mode === "weekly"
                      ? `Your expenses are grouped by week. Tap a category or a daily bar to get smart stats.`
                      : `Your expenses are grouped by month. Tap a category or a monthly bar to get smart stats.`}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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

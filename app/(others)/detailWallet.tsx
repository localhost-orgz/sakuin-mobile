import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftRight,
  ChevronLeft,
  Ellipsis,
  MoveUpRight,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  WalletMinimal,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_WALLETS = [
  {
    id: "w1",
    bank: "BCA",
    type: "Tabungan",
    balance: "1.500.000",
    transactions: "850.000",
    themeId: "lavender",
    accountNumber: "•••• •••• 4821",
  },
  {
    id: "w2",
    bank: "SeaBank",
    type: "Digital",
    balance: "3.250.000",
    transactions: "1.200.000",
    themeId: "green",
    accountNumber: "•••• •••• 9034",
  },
  {
    id: "w3",
    bank: "BRI",
    type: "Tabungan",
    balance: "5.400.000",
    transactions: "2.100.000",
    themeId: "orange",
    accountNumber: "•••• •••• 3317",
  },
];

type TxItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: "in" | "out";
};

const MOCK_TRANSACTIONS: Record<string, TxItem[]> = {
  w1: [
    {
      id: "t1",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-15",
      type: "out",
    },
    {
      id: "t2",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-15",
      type: "out",
    },
    {
      id: "t3",
      title: "Gaji Bulanan",
      subtitle: "Income",
      amount: 5_000_000,
      date: "2025-03-14",
      type: "in",
    },
    {
      id: "t4",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-14",
      type: "out",
    },
    {
      id: "t5",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-13",
      type: "out",
    },
    {
      id: "t6",
      title: "Transfer Masuk",
      subtitle: "Dari SeaBank",
      amount: 200_000,
      date: "2025-03-13",
      type: "in",
    },
    {
      id: "t7",
      title: "Jatinangor House",
      subtitle: "Food & Drink",
      amount: 50_000,
      date: "2025-03-12",
      type: "out",
    },
    {
      id: "t8",
      title: "Belanja Online",
      subtitle: "Shopping",
      amount: 250_000,
      date: "2025-03-11",
      type: "out",
    },
    {
      id: "t9",
      title: "Refund Shopee",
      subtitle: "Shopping",
      amount: 120_000,
      date: "2025-03-10",
      type: "in",
    },
  ],
  w2: [
    {
      id: "t10",
      title: "Makan Siang",
      subtitle: "Food & Drink",
      amount: 35_000,
      date: "2025-03-15",
      type: "out",
    },
    {
      id: "t11",
      title: "Transfer Masuk",
      subtitle: "Dari BCA",
      amount: 300_000,
      date: "2025-03-13",
      type: "in",
    },
  ],
  w3: [
    {
      id: "t12",
      title: "Tagihan Listrik",
      subtitle: "Utilities",
      amount: 180_000,
      date: "2025-03-15",
      type: "out",
    },
    {
      id: "t13",
      title: "Gaji Freelance",
      subtitle: "Income",
      amount: 2_500_000,
      date: "2025-03-10",
      type: "in",
    },
  ],
};

const formatRupiah = (n: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(n);

const parseBalance = (str: string): number =>
  parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const groupByDate = (txs: TxItem[]) => {
  const map: Record<string, TxItem[]> = {};
  txs.forEach((tx) => {
    if (!map[tx.date]) map[tx.date] = [];
    map[tx.date].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
};

const TransactionItem = ({ item }: { item: TxItem }) => {
  const isIn = item.type === "in";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isIn ? "#f0fdf8" : "#fef2f2",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {isIn ? (
          <MoveUpRight size={18} color="#00bf71" strokeWidth={2.5} />
        ) : (
          <TrendingDown size={18} color="#f43f5e" strokeWidth={2.5} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1a1f36" }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {item.subtitle}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: isIn ? "#00bf71" : "#f43f5e",
          }}
        >
          {isIn ? "+" : "-"}
          {formatRupiah(item.amount)}
        </Text>
      </View>
    </View>
  );
};

export default function DetailWallet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ walletId?: string }>();

  const walletId = params.walletId ?? "w1";
  const wallet = MOCK_WALLETS.find((w) => w.id === walletId) ?? MOCK_WALLETS[0];
  const allTransactions = MOCK_TRANSACTIONS[wallet.id] ?? [];

  const [search, setSearch] = useState("");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const { theme } = useWalletTheme(wallet.themeId as WalletThemeId);

  const totalIn = allTransactions
    .filter((t) => t.type === "in")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = allTransactions
    .filter((t) => t.type === "out")
    .reduce((s, t) => s + t.amount, 0);

  const filtered = useMemo(() => {
    if (!search.trim()) return allTransactions;
    const q = search.toLowerCase();
    return allTransactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.subtitle.toLowerCase().includes(q),
    );
  }, [search, allTransactions]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const isDark =
    theme.gradientColors[0].startsWith("#0") ||
    theme.gradientColors[0].startsWith("#1") ||
    theme.gradientColors[0].startsWith("#2") ||
    theme.gradientColors[0].startsWith("#3");

  const textPrimary = isDark ? "white" : theme.textColor;
  const textMuted = isDark ? "rgba(255,255,255,0.35)" : `${theme.textColor}88`;
  const iconBg = isDark ? "rgba(255,255,255,0.10)" : `${theme.textColor}18`;

  // Blob color — on dark cards use white blobs, on light cards use the accent color
  const blobColor = isDark
    ? "rgba(255,255,255,0.07)"
    : `${theme.shadowColor}22`;
  const blobColorStrong = isDark
    ? "rgba(255,255,255,0.11)"
    : `${theme.shadowColor}38`;

  const ListHeader = (
    <>
      <View
        style={{
          paddingBottom: 40,
          paddingHorizontal: 20,
          overflow: "hidden",
          backgroundColor: theme.accentColor,
        }}
      >
        {/* Wallet icon + name */}
        <View style={{ alignItems: "center", gap: 6, paddingTop: 20 }}>
          <View
            style={{
              width: 65,
              height: 65,
              borderRadius: 36,
              backgroundColor: theme.cardColor,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 2,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: "800", color: "white" }}>
              <WalletMinimal strokeWidth={2.5} color="white" />
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "white",
              letterSpacing: -0.4,
            }}
          >
            {wallet.bank}
          </Text>

          {/* Balance */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 6,
            }}
          >
            <View className="flex flex-row items-end gap-1">
              <Text className="text-white text-lg font-semibold mb-0.5">
                Rp
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: "white",
                  letterSpacing: -0.5,
                }}
              >
                {isBalanceVisible ? `${wallet.balance}` : "Rp •••••••••"}
              </Text>
            </View>
          </View>

          {/* Income / Expense summary chips */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
              }}
            >
              <TrendingUp size={13} color="white" strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                {formatRupiah(totalIn)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.18)",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
              }}
            >
              <TrendingDown size={13} color="white" strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                {formatRupiah(totalOut)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: -20,
          backgroundColor: "white",
          borderRadius: 20,
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-around",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flex: 1, alignItems: "center", gap: 8 }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.bgColor ?? "#f0fdf8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus
              size={22}
              color={theme.accentColor ?? "#00bf71"}
              strokeWidth={2.5}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              textAlign: "center",
            }}
          >
            Tambah{"\n"}Uang
          </Text>
        </TouchableOpacity>

        <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flex: 1, alignItems: "center", gap: 8 }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.bgColor ?? "#f0fdf8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeftRight
              size={20}
              color={theme.accentColor ?? "#00bf71"}
              strokeWidth={2.5}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#374151",
              textAlign: "center",
            }}
          >
            Pindahkan{"\n"}Uang
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 14,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderWidth: 1.5,
          borderColor: "#e5e7eb",
          gap: 10,
        }}
      >
        <Search size={16} color="#9ca3af" strokeWidth={2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari Transaksi"
          placeholderTextColor="#9ca3af"
          style={{ flex: 1, fontSize: 14, color: "#1a1f36" }}
        />
      </View>
    </>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* ── PINNED TOP BAR (back button + title only) ─────────────────── */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: theme.accentColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
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
              Wallet Detail
            </Text>
            <Pressable>
              <Ellipsis color={"white"} />
            </Pressable>
          </View>
        </View>

        {/* ── SCROLLABLE CONTENT (wallet card + actions + search + list) ── */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: theme.gradientColors[0] }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 110,
            backgroundColor: "#f5f6fa",
          }}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="white"
              colors={["white"]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                {search
                  ? "Transaksi tidak ditemukan 🔍"
                  : "Belum ada transaksi"}
              </Text>
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                backgroundColor: "#f5f6fa",
                paddingHorizontal: 20,
                paddingVertical: 8,
                marginTop: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <TransactionItem item={item} />}
        />
      </View>
    </>
  );
}

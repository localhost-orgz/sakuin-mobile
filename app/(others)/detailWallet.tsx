import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { apiRequest } from "@/utils/api"; //
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

// Sesuaikan tipe data dengan Response API
type Transaction = {
  _id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category_id: string | any;
};

type WalletData = {
  _id: string;
  name: string;
  balance: number;
  color: string;
  transactions: Transaction[];
  currency_id: {
    symbol: string;
  };
};

const formatRupiah = (n: number, symbol: string = "Rp") =>
  symbol + new Intl.NumberFormat("id-ID").format(n);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const groupByDate = (txs: Transaction[]) => {
  const map: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const dateKey = tx.date.split("T")[0];
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(tx);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
};

const TransactionItem = ({
  item,
  symbol,
}: {
  item: Transaction;
  symbol: string;
}) => {
  const isIn = item.type === "income";
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
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {isIn ? "Pemasukan" : "Pengeluaran"}
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
          {formatRupiah(item.amount, symbol)}
        </Text>
      </View>
    </View>
  );
};

export default function DetailWallet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { walletId } = useLocalSearchParams<{ walletId: string }>(); // Terima _id dari card

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data dari API
  const fetchWalletDetail = async () => {
    try {
      const response = await apiRequest(`/wallets/${walletId}`);
      if (response.status === "success") {
        setWallet(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletDetail();
  }, [walletId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetail();
  }, [walletId]);

  // Tema dinamis berdasarkan field 'color' dari API
  // const { theme } = useWalletTheme((wallet?.color as WalletThemeId) || "blue");

  const themeId = (wallet?.color as WalletThemeId) || "forest"; // Pakai ocean sesuai fallback di hook kamu
  const { theme } = useWalletTheme(themeId);

  const totalIn = useMemo(
    () =>
      wallet?.transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0) || 0,
    [wallet],
  );

  const totalOut = useMemo(
    () =>
      wallet?.transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0) || 0,
    [wallet],
  );

  const filtered = useMemo(() => {
    const allTxs = wallet?.transactions || [];
    if (!search.trim()) return allTxs;
    const q = search.toLowerCase();
    return allTxs.filter((tx) => tx.name.toLowerCase().includes(q));
  }, [search, wallet]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!wallet) return null;

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
            <WalletMinimal strokeWidth={2.5} color="white" size={30} />
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "white",
              letterSpacing: -0.4,
            }}
          >
            {wallet.name}
          </Text>

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
                {wallet.currency_id.symbol}
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: "white",
                  letterSpacing: -0.5,
                }}
              >
                {new Intl.NumberFormat("id-ID").format(wallet.balance)}
              </Text>
            </View>
          </View>

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
                {formatRupiah(totalIn, wallet.currency_id.symbol)}
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
                {formatRupiah(totalOut, wallet.currency_id.symbol)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tombol Action tetap sama */}
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
        <TouchableOpacity style={{ flex: 1, alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.bgColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={22} color={theme.accentColor} strokeWidth={2.5} />
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

        <TouchableOpacity style={{ flex: 1, alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.bgColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeftRight
              size={20}
              color={theme.accentColor}
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

        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
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
          renderItem={({ item }) => (
            <TransactionItem item={item} symbol={wallet.currency_id.symbol} />
          )}
        />
      </View>
    </>
  );
}

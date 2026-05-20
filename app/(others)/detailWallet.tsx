import useWalletTheme, {
  WalletThemeId,
  getWalletTheme,
  getWalletThemeIds,
} from "@/hooks/useWalletTheme";
import { apiRequest } from "@/utils/api"; //
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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
  Edit2,
  Trash2,
  X,
  Check,
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
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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

const ThemeCircle = ({
  theme,
  selected,
  onPress,
}: {
  theme: any;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <Pressable
        onPress={onPress}
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.accentColor,
          }}
        >
          {selected && <Check size={16} color="white" strokeWidth={3} />}
        </View>
        {selected && (
          <View
            style={{
              position: "absolute",
              top: 1,
              left: 1,
              right: 1,
              bottom: 1,
              borderRadius: 23,
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
          color: selected ? theme.accentColor : "#9ca3af",
        }}
      >
        {theme.label}
      </Text>
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

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetView, setSheetView] = useState<"options" | "edit">("options");
  const [editName, setEditName] = useState("");
  const [editThemeId, setEditThemeId] = useState<WalletThemeId>("ocean");

  // Fetch data dari API
  const fetchWalletDetail = useCallback(async () => {
    try {
      const response = await apiRequest(`/wallets/${walletId}`);
      if (response.status === "success") {
        setWallet(response.data);
        setEditName(response.data.name);
        setEditThemeId(response.data.color as WalletThemeId);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [walletId]);

  const openSheet = () => {
    if (wallet) {
      setEditName(wallet.name);
      setEditThemeId(wallet.color as WalletThemeId);
    }
    setSheetView("options");
    setSheetVisible(true);
  };

  const handleEditWallet = async () => {
    if (!editName.trim()) {
      Alert.alert("Input Salah", "Nama dompet tidak boleh kosong.");
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiRequest(`/wallets/${walletId}`, {
        method: "PUT",
        body: {
          name: editName.trim(),
          color: editThemeId,
          balance: wallet?.balance || 0,
          currency_id: "6a02f8a7de59afc0c23a95c9",
        },
      });

      if (response && response.status === "success") {
        setSheetVisible(false);
        fetchWalletDetail();
        Alert.alert("Sukses", "Informasi dompet berhasil diperbarui.");
      } else {
        Alert.alert("Error", "Gagal memperbarui dompet.");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    Alert.alert(
      "Hapus Dompet",
      `Apakah Anda yakin ingin menghapus dompet "${wallet?.name}"? Semua riwayat transaksi di dompet ini juga akan terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              setSheetVisible(false);
              const response = await apiRequest(`/wallets/${walletId}`, {
                method: "DELETE",
              });
              if (response) {
                Alert.alert("Sukses", "Dompet berhasil dihapus.");
                router.replace("/(main)/portfolio");
              } else {
                Alert.alert("Error", "Gagal menghapus dompet.");
              }
            } catch (error) {
              console.error("Error deleting wallet:", error);
              Alert.alert("Error", "Terjadi kesalahan saat menghapus dompet.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletDetail();
    }, [fetchWalletDetail])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletDetail();
  }, [fetchWalletDetail]);

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
        <ActivityIndicator size="large" color="#00bf71" />
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
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(others)/(transaction)/addForm",
              params: { walletId },
            })
          }
          style={{ flex: 1, alignItems: "center", gap: 8 }}
        >
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

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(others)/(transaction)/transferForm",
              params: { walletId },
            })
          }
          style={{ flex: 1, alignItems: "center", gap: 8 }}
        >
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
            <Pressable onPress={openSheet}>
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

        {/* Options & Edit Bottom Sheet */}
        <Modal
          visible={sheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSheetVisible(false)}
          statusBarTranslucent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.4)" }}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetVisible(false)} />
            
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: insets.bottom + 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 25,
              }}
            >
              {/* Drag Handle */}
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

              {sheetView === "options" ? (
                // ─── OPTIONS VIEW ───────────────────────────────────────────────
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#0f172a",
                      letterSpacing: -0.4,
                      marginBottom: 6,
                    }}
                  >
                    Pengaturan Dompet
                  </Text>
                  <Text style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                    Kelola informasi atau hapus dompet Anda
                  </Text>

                  {/* Option: Edit Info */}
                  <TouchableOpacity
                    onPress={() => setSheetView("edit")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f1f5f9",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: "#eff6ff",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Edit2 size={20} color="#2563eb" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                        Edit Info Dompet
                      </Text>
                      <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Ubah nama dan tema warna dompet ini
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Option: Delete Wallet */}
                  <TouchableOpacity
                    onPress={handleDeleteWallet}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: "#fef2f2",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Trash2 size={20} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444" }}>
                        Hapus Dompet
                      </Text>
                      <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Hapus dompet ini secara permanen
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Button: Cancel */}
                  <TouchableOpacity
                    onPress={() => setSheetVisible(false)}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#f1f5f9",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#475569" }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // ─── EDIT VIEW ──────────────────────────────────────────────────
                <View>
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
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
                        Edit Info Dompet
                      </Text>
                      <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        Sesuaikan tampilan dompet Anda
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSheetView("options")}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#f1f5f9",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  {/* Input: Wallet Name */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#475569",
                        marginBottom: 8,
                      }}
                    >
                      Nama Dompet
                    </Text>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Nama Dompet"
                      placeholderTextColor="#94a3b8"
                      style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: "#e2e8f0",
                        paddingHorizontal: 16,
                        fontSize: 15,
                        color: "#0f172a",
                        fontWeight: "600",
                      }}
                    />
                  </View>

                  {/* Theme List */}
                  <View style={{ marginBottom: 26 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#475569",
                        marginBottom: 10,
                      }}
                    >
                      Pilih Tema Warna
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingVertical: 4,
                        paddingHorizontal: 2,
                        gap: 12,
                      }}
                    >
                      {getWalletThemeIds().map((tid) => {
                        const tObj = getWalletTheme(tid);
                        const selected = editThemeId === tid;
                        return (
                          <ThemeCircle
                            key={tid}
                            theme={tObj}
                            selected={selected}
                            onPress={() => setEditThemeId(tid)}
                          />
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => setSheetView("options")}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: "#f1f5f9",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#475569" }}>
                        Kembali
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleEditWallet}
                      disabled={!editName.trim()}
                      style={{
                        flex: 2,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: editName.trim() ? theme.accentColor : "#cbd5e1",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: theme.accentColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: editName.trim() ? 0.2 : 0,
                        shadowRadius: 6,
                        elevation: editName.trim() ? 4 : 0,
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "white" }}>
                        Simpan ✓
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  );
}

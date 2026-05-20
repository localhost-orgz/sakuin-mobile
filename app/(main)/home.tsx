import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CurrentGoals from "@/components/Home/CurrentGoals";
import RecentTransactions from "@/components/Home/RecentTransactions";
import {
  PinnedGreeting,
  ScrollableTopContent,
} from "@/components/Home/TopSection";
import TopSpendCategory from "@/components/Home/TopSpendCategory";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { apiRequest } from "@/utils/api";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]); // State untuk menyimpan data transaksi dari API
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchWallets = async () => {
    try {
      const res = await apiRequest("/wallets", { method: "GET" });
      if (res.status === "success" && res.data) {
        setWallets(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest("/categories", { method: "GET" });
      if (res.status === "success" && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // Fungsi fetch transactions disamakan polanya dengan fetchWallets
  const fetchTransactions = async () => {
    try {
      const res = await apiRequest("/transaction", { method: "GET" });
      if (res.status === "success" && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const initHomeData = async () => {
    try {
      setLoading(true);
      // Menjalankan fetch paralel untuk user, wallets, dan transactions bersamaan
      await Promise.all([
        fetchUser(),
        fetchWallets(),
        fetchTransactions(),
        fetchCategories(),
      ]);
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initHomeData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Ditambahkan fetchTransactions di dalam Promise.all onRefresh
    await Promise.all([
      fetchUser(),
      fetchWallets(),
      fetchTransactions(),
      fetchCategories(),
    ]);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const [seeding, setSeeding] = useState(false);

  const seedTransactions = async () => {
    try {
      setSeeding(true);
      // Fetch categories & wallets to map
      const [catsRes, walletsRes] = await Promise.all([
        apiRequest("/categories", { method: "GET" }),
        apiRequest("/wallets", { method: "GET" })
      ]);

      if (catsRes?.status !== "success" || !catsRes.data || catsRes.data.length === 0) {
        alert("No categories found to seed transactions!");
        return;
      }
      if (walletsRes?.status !== "success" || !walletsRes.data || walletsRes.data.length === 0) {
        alert("No wallets found to seed transactions!");
        return;
      }

      const categoriesList = catsRes.data;
      const walletsList = walletsRes.data;

      // 10 Random transactions data
      const names = [
        "GoFood Dinner", "Indomaret Snacks", "Gas Station Petrol",
        "Salary Bonus", "Electricity Bill", "Cinema Tickets",
        "Coffee Shop Latte", "Gym Membership", "Book Store",
        "Freelance Payment"
      ];

      const descriptions = [
        "Ordered McDonald's with friends", "Bought snacks and sodas", "Filled up motorcycle tank",
        "Monthly performance bonus", "Paid PLN token", "Watched latest action movie",
        "Ice caramel macchiato", "Monthly subscription", "Bought React Native programming book",
        "UI design project milestone 1"
      ];

      const types = [
        "expense", "expense", "expense",
        "income", "expense", "expense",
        "expense", "expense", "expense",
        "income"
      ];

      const amounts = [
        "75000", "42000", "50000",
        "1500000", "200000", "85000",
        "48000", "350000", "125000",
        "2500000"
      ];

      // Call API sequentially or in parallel
      const seedPromises = Array.from({ length: 10 }).map((_, i) => {
        const cat = categoriesList[i % categoriesList.length];
        const wallet = walletsList[i % walletsList.length];
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - (i + 1)); // last 10 days
        const dateStr = randomDate.toISOString().split("T")[0]; // YYYY-MM-DD

        return apiRequest("/transaction", {
          method: "POST",
          body: {
            category_id: cat._id || cat.id,
            wallet_id: wallet._id || wallet.id,
            amount: amounts[i],
            type: types[i],
            name: names[i],
            description: descriptions[i],
            date: dateStr,
            input_method: "manual"
          }
        });
      });

      await Promise.all(seedPromises);
      alert("Successfully seeded 10 transactions!");
      await fetchTransactions(); // Refresh the list!
    } catch (err: any) {
      console.error("Failed to seed transactions:", err);
      alert("Failed to seed: " + (err.message || err));
    } finally {
      setSeeding(false);
    }
  };

  const topCategoriesData = useMemo(() => {
    const expenses = transactions.filter((t: any) => t.type === "expense");

    const sums: Record<string, number> = {};
    expenses.forEach((tx: any) => {
      const catId =
        typeof tx.category_id === "object" && tx.category_id
          ? tx.category_id._id || tx.category_id.id
          : tx.category_id;
      if (catId) {
        sums[catId] = (sums[catId] || 0) + (Number(tx.amount) || 0);
      }
    });

    const mapped = categories.map((cat: any) => {
      const catId = cat._id || cat.id;
      const totalSpend = sums[catId] || 0;
      return {
        id: catId,
        label: cat.name || cat.label,
        icon: cat.emoticon || cat.icon || "🏷️",
        amount: new Intl.NumberFormat("id-ID").format(totalSpend),
        themeId: cat.themeId || cat.theme_id || "ocean",
        rawAmount: totalSpend,
      };
    });

    const spendingOnly = mapped.filter((c) => c.rawAmount > 0);
    const listToReturn = spendingOnly.length > 0 ? spendingOnly : mapped;

    return [...listToReturn].sort((a, b) => b.rawAmount - a.rawAmount);
  }, [transactions, categories]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <StatusBar style="light" />

      {/* ── PINNED GREETING (never scrolls) ───────────────────────────── */}
      <PinnedGreeting userData={user} loading={loading} />

      {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: "#00bf71" }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 110,
          backgroundColor: "#f5f6fa",
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
            colors={["white"]}
          />
        }
      >
        {/* Wallet carousel + income/expense card */}
        <ScrollableTopContent
          isBalanceShow={isBalanceShow}
          setIsBalanceShow={setIsBalanceShow}
          wallets={wallets}
          loading={loading}
        />

        {/* ── Content sections ── */}
        <View style={{ marginTop: 56, marginBottom: 0 }}>
          <TopSpendCategory TopCategories={topCategoriesData} loading={loading} />
          <CurrentGoals goalsList={CURRENT_GOALS} loading={loading} />
          {/* Properti transactions sekarang dialirkan dari state API bukan dari konstanta RECENT_TRANSACTIONS mock lagi */}
          <RecentTransactions transactions={transactions} loading={loading} />

          {/* Seeder button */}
          <View style={{ marginHorizontal: 20, marginTop: 20 }}>
            <TouchableOpacity
              onPress={seedTransactions}
              disabled={seeding}
              style={{
                backgroundColor: "#00bf71",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                opacity: seeding ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
                {seeding ? "Seeding 10 Transactions..." : "⚡ Seed 10 Random Transactions"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
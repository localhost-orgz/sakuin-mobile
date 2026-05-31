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
import { useFocusEffect } from "expo-router";
import { apiRequest } from "@/utils/api";
import * as SecureStore from "expo-secure-store";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]); // State untuk menyimpan data transaksi dari API
  const [goals, setGoals] = useState([]);
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

  const fetchGoals = async () => {
    try {
      const res = await apiRequest("/goals", { method: "GET" });
      if (res.status === "success" && res.data) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  const initHomeData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("user_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch user profile first (acts as our authorization check)
      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
        // Only if profile succeeded, load other data in parallel
        await Promise.all([
          fetchWallets(),
          fetchTransactions(),
          fetchCategories(),
          fetchGoals(),
        ]);
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initHomeData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await SecureStore.getItemAsync("user_token");
      if (!token) {
        setRefreshing(false);
        return;
      }

      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
        await Promise.all([
          fetchWallets(),
          fetchTransactions(),
          fetchCategories(),
          fetchGoals(),
        ]);
      }
    } catch (err) {
      console.error("Failed to refresh home data:", err);
    } finally {
      setRefreshing(false);
    }
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

      // Transactions for currentMonth (May 2026) totaling 15,000,000 IDR
      const mayTransactions = [
        { name: "Salary Payment", amount: "5000000", type: "income", description: "Monthly corporate salary payout", date: "2026-05-01" },
        { name: "Rent & Housing", amount: "3500000", type: "expense", description: "Apartment rental cost", date: "2026-05-03" },
        { name: "Freelance Project", amount: "4000000", type: "income", description: "Web app development milestone", date: "2026-05-10" },
        { name: "Groceries & Supplies", amount: "1500000", type: "expense", description: "Monthly supermarket groceries", date: "2026-05-15" },
        { name: "Weekend Dinner", amount: "1000000", type: "expense", description: "Fine dining restaurant bill", date: "2026-05-24" }
      ];

      // Transactions for lastMonth (April 2026) totaling 10,000,000 IDR
      const aprilTransactions = [
        { name: "Dividends Payout", amount: "3000000", type: "income", description: "Quarterly stock market dividend", date: "2026-04-05" },
        { name: "Electricity & WiFi", amount: "1500000", type: "expense", description: "Home utilities bill payment", date: "2026-04-12" },
        { name: "Consulting Gig", amount: "4000000", type: "income", description: "Technical architecture consulting", date: "2026-04-18" },
        { name: "Gym Membership", amount: "1500000", type: "expense", description: "Annual premium gym subscription", date: "2026-04-26" }
      ];

      const allSeedTxs = [...mayTransactions, ...aprilTransactions];

      // Call API sequentially or in parallel
      const seedPromises = allSeedTxs.map((item, idx) => {
        const cat = categoriesList[idx % categoriesList.length];
        const wallet = walletsList[idx % walletsList.length];

        return apiRequest("/transaction", {
          method: "POST",
          body: {
            category_id: cat._id || cat.id,
            wallet_id: wallet._id || wallet.id,
            amount: item.amount,
            type: item.type,
            name: item.name,
            description: item.description,
            date: item.date,
            input_method: "manual"
          }
        });
      });

      await Promise.all(seedPromises);
      alert("Successfully seeded transactions for May (15M) and April (10M)!");
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
        themeId: cat.themeId || cat.theme_id || cat.color || "ocean",
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
          transactions={transactions}
          user={user}
          loading={loading}
        />

        {/* ── Content sections ── */}
        <View style={{ marginTop: 56, marginBottom: 0 }}>
          <TopSpendCategory TopCategories={topCategoriesData} loading={loading} />
          <CurrentGoals goalsList={goals} loading={loading} />
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
                {seeding ? "Seeding Transactions..." : "⚡ Seed May (15M) & April (10M) Transactions"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
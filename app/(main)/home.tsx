import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
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
import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import { apiRequest } from "@/utils/api";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
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
      await Promise.all([fetchUser(), fetchWallets(), fetchTransactions()]);
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
    await Promise.all([fetchUser(), fetchWallets(), fetchTransactions()]);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);



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
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} loading={loading} />
          <CurrentGoals goalsList={CURRENT_GOALS} loading={loading} />
          {/* Properti transactions sekarang dialirkan dari state API bukan dari konstanta RECENT_TRANSACTIONS mock lagi */}
          <RecentTransactions transactions={transactions} loading={loading} />
        </View>
      </ScrollView>
    </View>
  );
}
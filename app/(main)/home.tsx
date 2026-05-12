/**
 * app/(main)/home.tsx
 *
 * - "Hi, User" greeting + avatar is pinned (never scrolls)
 * - Everything else (wallet carousel, stats, sections) is in one ScrollView
 * - Pull-to-refresh triggers a data refresh
 */

import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
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
import { RECENT_TRANSACTIONS } from "@/constants/transactionList";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Replace with your real data fetch (re-fetch wallet balances, transactions, etc.)
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <StatusBar style="light" />

      {/* ── PINNED GREETING (never scrolls) ───────────────────────────── */}
      <PinnedGreeting />

      {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        // Over-scroll bounce area matches the green header — no white gap
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
        />

        {/* ── Content sections ── */}
        <View style={{ marginTop: 56, marginBottom: 0 }}>
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} />
          <CurrentGoals goalsList={CURRENT_GOALS} />
          <RecentTransactions transactions={RECENT_TRANSACTIONS} />

          {/* Dev links — remove in production */}
          <Link href={"/(others)/(transaction)/addForm"}>
            <View
              style={{
                padding: 12,
                backgroundColor: "#0ea5e9",
                borderRadius: 8,
                margin: 16,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Add form
              </Text>
            </View>
          </Link>
          <Link href={"/(others)/detailWallet"}>
            <View
              style={{
                padding: 12,
                backgroundColor: "#0ea5e9",
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Detail wallet
              </Text>
            </View>
          </Link>
          <Link href={"/(others)/detailGoal"}>
            <View
              style={{
                padding: 12,
                backgroundColor: "#0ea5e9",
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Detail goal
              </Text>
            </View>
          </Link>
          <Link href={"/(auth)/welcome"}>
            <View
              style={{
                padding: 12,
                backgroundColor: "#0ea5e9",
                borderRadius: 8,
                marginHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Onboarding
              </Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

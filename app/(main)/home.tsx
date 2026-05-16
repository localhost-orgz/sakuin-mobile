import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import SakuSnapModal from "@/components/Home/SakuSnapModal";
import {
  PinnedGreeting,
  ScrollableTopContent,
} from "@/components/Home/TopSection";
import TopSpendCategory from "@/components/Home/TopSpendCategory";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import { apiRequest } from "@/utils/api";
import { Link } from "expo-router";
import { Camera, LogIn, Mic, Pen, Plus, Receipt } from "lucide-react-native";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]); // State untuk menyimpan data transaksi dari API
  const [loading, setLoading] = useState(true);
  const [snapModalVisible, setSnapModalVisible] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/wallets", { method: "GET" });
      if (res.status === "success" && res.data) {
        setWallets(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi fetch transactions disamakan polanya dengan fetchWallets
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/transaction", { method: "GET" });
      if (res.status === "success" && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <StatusBar style="light" />

      {/* ── PINNED GREETING (never scrolls) ───────────────────────────── */}
      <PinnedGreeting userData={user} />

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
        />

        {/* ── Content sections ── */}
        <View style={{ marginTop: 56, marginBottom: 0 }}>
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} />
          <CurrentGoals goalsList={CURRENT_GOALS} />
          {/* Properti transactions sekarang dialirkan dari state API bukan dari konstanta RECENT_TRANSACTIONS mock lagi */}
          <RecentTransactions transactions={transactions} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSnapModalVisible(true)}
          className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5"
        >
          <View className="flex-row items-center">
            <View className="bg-amber-100 p-3 rounded-2xl mr-4">
              <Camera size={24} color="#f59e0b" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-slate-900 font-bold text-lg">
                Saku Snap
              </Text>
              <Text className="text-slate-400 text-xs">
                Scan struk otomatis pake AI
              </Text>
            </View>
          </View>
          <View className="bg-slate-50 p-2 rounded-full">
            <Plus size={20} color="#cbd5e1" />
          </View>
        </TouchableOpacity>

        <Link href="/(others)/(transaction)/addForm" asChild>
          <Pressable className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-2xl mr-4">
                <Pen size={24} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  Add Manual
                </Text>
                <Text className="text-slate-400 text-xs">
                  Scan struk manual input
                </Text>
              </View>
            </View>
            <View className="bg-slate-50 p-2 rounded-full">
              <Plus size={20} color="#cbd5e1" />
            </View>
          </Pressable>
        </Link>

        <Link href="/(others)/(transaction)/transferForm" asChild>
          <Pressable className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-2xl mr-4">
                <LogIn size={24} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  Transfer
                </Text>
                <Text className="text-slate-400 text-xs">
                  Pindahkan uang dari Wallet satu ke wallet yang lainnya
                </Text>
              </View>
            </View>
            <View className="bg-slate-50 p-2 rounded-full">
              <Plus size={20} color="#cbd5e1" />
            </View>
          </Pressable>
        </Link>

        <Link href="/(others)/(transaction)/sakuSnap" asChild>
          <Pressable className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-2xl mr-4">
                <Camera size={24} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  SakuSnap
                </Text>
                <Text className="text-slate-400 text-xs">
                  Pindahkan uang dari Wallet satu ke wallet yang lainnya
                </Text>
              </View>
            </View>
            <View className="bg-slate-50 p-2 rounded-full">
              <Plus size={20} color="#cbd5e1" />
            </View>
          </Pressable>
        </Link>

        <Link href="/(others)/(transaction)/sakuVoice" asChild>
          <Pressable className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-3 rounded-2xl mr-4">
                <Camera size={24} color="#f59e0b" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  SakuSnap
                </Text>
                <Text className="text-slate-400 text-xs">
                  Pindahkan uang dari Wallet satu ke wallet yang lainnya
                </Text>
              </View>
            </View>
            <View className="bg-slate-50 p-2 rounded-full">
              <Plus size={20} color="#cbd5e1" />
            </View>
          </Pressable>
        </Link>

        <Link href="/(others)/(transaction)/scannedPage" asChild>
          <Pressable className="bg-white mx-4 mt-4 p-5 rounded-[24px] flex-row items-center justify-between border border-gray-100 shadow-sm shadow-black/5s">
            <View className="flex-row items-center">
              <View className="bg-sky-100 p-3 rounded-2xl mr-4">
                <Receipt size={24} className="text-sky-500" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  Figma Sakusnap 3
                </Text>
                <Text className="text-slate-400 text-xs">
                  Pindahkan uang dari Wallet satu ke wallet yang lainnya
                </Text>
              </View>
            </View>
            <View className="bg-slate-50 p-2 rounded-full">
              <Plus size={20} color="#cbd5e1" />
            </View>
          </Pressable>
        </Link>

        <SakuSnapModal
          visible={snapModalVisible}
          onClose={() => setSnapModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
}
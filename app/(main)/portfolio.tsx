import HeaderPage from "@/components/HeaderPage";
import GoalCardsSection from "@/components/Portfolio/GoalCardsSection";
import TotalBalance from "@/components/Portfolio/TotalBalance";
import WalletCardsSection from "@/components/Portfolio/WalletCardsSection";
import { apiRequest } from "@/utils/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortfolioScreen() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletRes, goalsRes] = await Promise.all([
        apiRequest("/wallets", { method: "GET" }),
        apiRequest("/goals", { method: "GET" })
      ]);
      if (walletRes.status === "success" && walletRes.data) {
        setWallets(walletRes.data);
      }
      if (goalsRes.status === "success" && goalsRes.data) {
        setGoals(goalsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f6fa" }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeaderPage title={"Portfolio"} />

      <TotalBalance
        isBalanceShow={isBalanceShow}
        onBalanceShow={setIsBalanceShow}
        wallets={wallets}
        goals={goals}
        loading={loading}
      />

      <View>
        <WalletCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          wallets={wallets}
          onRefreshNeeded={fetchData}
          loading={loading}
        />
        <GoalCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          goals={goals}
          loading={loading}
          onRefreshNeeded={fetchData}
        />
      </View>
    </ScrollView>
  );
}

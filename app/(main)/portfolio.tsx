import HeaderPage from "@/components/HeaderPage";
import GoalCardsSection from "@/components/Portfolio/GoalCardsSection";
import TotalBalance from "@/components/Portfolio/TotalBalance";
import WalletCardsSection from "@/components/Portfolio/WalletCardsSection";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { apiRequest } from "@/utils/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortfolioScreen() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallets, setWallets] = useState([]); // State untuk data wallet
  const [loading, setLoading] = useState(true); // State loading
  const insets = useSafeAreaInsets();

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/wallets", { method: "GET" }); //
      if (res.status === "success" && res.data) {
        setWallets(res.data); //
      }
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWallets();
    }, [fetchWallets])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWallets();
    setRefreshing(false);
  }, [fetchWallets]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f6fa" }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      <HeaderPage title={"Portfolio"} />

      <TotalBalance
        isBalanceShow={isBalanceShow}
        onBalanceShow={setIsBalanceShow}
        wallets={wallets}
        loading={loading}
      />

      <View>
        <WalletCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          wallets={wallets}
          onRefreshNeeded={fetchWallets}
          loading={loading}
        />
        <GoalCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          goals={CURRENT_GOALS}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

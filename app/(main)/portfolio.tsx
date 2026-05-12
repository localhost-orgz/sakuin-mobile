import HeaderPage from "@/components/HeaderPage";
import GoalCardsSection from "@/components/Portfolio/GoalCardsSection";
import TotalBalance from "@/components/Portfolio/TotalBalance";
import WalletCardsSection from "@/components/Portfolio/WalletCardsSection";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { WALLET_LIST } from "@/constants/walletList";
import { apiRequest } from "@/utils/api";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortfolioScreen() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [wallets, setWallets] = useState([]); // State untuk data wallet
  const [loading, setLoading] = useState(true); // State loading
  const insets = useSafeAreaInsets();

  const fetchWallets = async () => {
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
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

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
      />

      <View>
        <WalletCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          wallets={wallets}
        />
        <GoalCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          goals={CURRENT_GOALS}
        />
      </View>
    </ScrollView>
  );
}

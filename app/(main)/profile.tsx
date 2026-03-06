import HeaderPage from "@/components/HeaderPage";
import GoalCardsSection from "@/components/Portfolio/GoalCardsSection";
import TotalBalance from "@/components/Portfolio/TotalBalance";
import WalletCardsSection from "@/components/Portfolio/WalletCardsSection";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { WALLET_LIST } from "@/constants/walletList";
import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const insets = useSafeAreaInsets();

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
      />

      <View>
        <WalletCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          wallets={WALLET_LIST}
        />
        <GoalCardsSection
          isBalanceShow={isBalanceShow}
          onBalanceShow={setIsBalanceShow}
          goals={CURRENT_GOALS}
        />
      </View>
      <Link href={"/(auth)/welcome"}>
        <Text>Halo</Text>
      </Link>
    </ScrollView>
  );
}

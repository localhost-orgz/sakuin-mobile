import { Skeleton } from "@/components/Skeleton";
import React from "react";
import { Text, View } from "react-native";
import AddWallet from "./AddWallet";
import WalletCard from "./WalletCard";

interface WalletCardsSectionProps {
  isBalanceShow: boolean;
  onBalanceShow: (show: boolean) => void;
  wallets: any[];
  onRefreshNeeded: any;
  loading?: boolean;
}

const WalletCardsSection = ({
  isBalanceShow,
  onBalanceShow,
  wallets = [],
  onRefreshNeeded,
  loading,
}: WalletCardsSectionProps) => {
  if (loading) {
    return (
      <>
        <View className="flex-1 mt-5">
          <Text className="text-3xl px-[20] font-bold mb-3">Wallets</Text>
        </View>

        <View className="flex-row flex-wrap px-5 mt-3 justify-between">
          <Skeleton width="48%" height={160} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="48%" height={160} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="48%" height={160} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="48%" height={160} borderRadius={24} style={{ marginBottom: 20 }} />
        </View>
      </>
    );
  }
  return (
    <>
      <View className="flex-1 mt-5">
        <Text className="text-3xl px-[20] font-bold mb-3">Wallets</Text>
      </View>

      <View className="flex-row flex-wrap px-5 mt-3 justify-between">
        {/* Item Wallet */}
        <AddWallet onRefreshSuccess={onRefreshNeeded} />
        {wallets.map((item: any) => (
          <WalletCard
            key={item._id || item.wallet_id}
            isBalanceShow={isBalanceShow}
            onBalanceShow={onBalanceShow}
            item={item}
          />
        ))}
      </View>
    </>
  );
};

export default WalletCardsSection;

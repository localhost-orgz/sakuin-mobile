import React from "react";
import { Text, View } from "react-native";
import AddWallet from "./AddWallet";
import WalletCard from "./WalletCard";

const WalletCardsSection = ({ wallets, isBalanceShow, onBalanceShow }: any) => {
  return (
    <>
      <View className="flex-1 mt-5">
        <Text className="text-3xl px-[20] font-bold mb-3">Wallets</Text>
      </View>

      <View className="flex-row flex-wrap px-5 mt-3 justify-between">
        {/* Item Wallet */}
        <AddWallet />
        {wallets.map((item: any) => (
          <WalletCard
            isBalanceShow={isBalanceShow}
            onBalanceShow={onBalanceShow}
            key={item.id}
            item={item}
          />
        ))}
      </View>
    </>
  );
};

export default WalletCardsSection;

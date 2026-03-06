import React from "react";
import { Text, View } from "react-native";
import AddWallet from "./AddWallet";
import GoalCard from "./GoalCard";

const GoalCardsSection = ({ goals, isBalanceShow, onBalanceShow }: any) => {
  return (
    <>
      <View className="flex-1 mt-5">
        <Text className="text-3xl px-[20] font-bold mb-3">Goals</Text>
      </View>
      <View className="flex-row flex-wrap px-5 mt-3 justify-between">
        {/* Item Wallet */}
        <AddWallet />
        {goals.map((goal: any) => (
          <GoalCard
            isBalanceShow={isBalanceShow}
            onBalanceShow={onBalanceShow}
            key={goal.id}
            goal={goal}
          />
        ))}
      </View>
    </>
  );
};

export default GoalCardsSection;

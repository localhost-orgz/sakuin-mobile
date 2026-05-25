import { Skeleton } from "@/components/Skeleton";
import React from "react";
import { Text, View } from "react-native";
import AddGoal from "./AddGoal";
import GoalCard from "./GoalCard";

const GoalCardsSection = ({ goals, isBalanceShow, onBalanceShow, loading, onRefreshNeeded }: any) => {
  if (loading) {
    return (
      <>
        <View className="flex-1 mt-5">
          <Text className="text-3xl px-[20] font-bold mb-3">Goals</Text>
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
        <Text className="text-3xl px-[20] font-bold mb-3">Goals</Text>
      </View>
      <View className="flex-row flex-wrap px-5 mt-3 justify-between">
        {/* Item Wallet */}
        <AddGoal onRefreshNeeded={onRefreshNeeded} />
        {goals.map((goal: any) => (
          <GoalCard
            isBalanceShow={isBalanceShow}
            onBalanceShow={onBalanceShow}
            key={goal.id || goal._id}
            goal={goal}
          />
        ))}
      </View>
    </>
  );
};

export default GoalCardsSection;

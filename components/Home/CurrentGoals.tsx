import React from "react";
import { ScrollView, View } from "react-native";
import CardGoals, { CardGoalsSkeleton } from "./CardGoals";
import HomeSectionHeader from "./HomeSectionHeader";

interface GoalItem {
  id: string | number;
  _id?: string;
  name: string;
  icon: string;
  current: number;
  target: number;
}

interface CurrentGoalsProps {
  goalsList: GoalItem[];
  loading?: boolean;
}

const CurrentGoals = ({ goalsList, loading }: CurrentGoalsProps) => {
  if (loading) {
    return (
      <View className="mt-8 mb-8 px-5">
        <HomeSectionHeader title="Current Goals" href="/portfolio" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 4 }}
        >
          <CardGoalsSkeleton key="skeleton-1" />
          <CardGoalsSkeleton key="skeleton-2" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="mt-8 mb-8 px-5">
      <HomeSectionHeader title="Current Goals" href="/portfolio" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingRight: 4 }}
      >
        {goalsList.map((goal) => {
          return <CardGoals key={goal.id || goal._id} goal={goal} />;
        })}
      </ScrollView>
    </View>
  );
};

export default CurrentGoals;

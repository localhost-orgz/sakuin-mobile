import React from "react";
import { ScrollView, View } from "react-native";
import CardGoals from "./CardGoals";
import HomeSectionHeader from "./HomeSectionHeader";
// 1. Definisikan dulu bentuk satu data 'goal'
interface GoalItem {
  id: string | number;
  name: string;
  icon: string;
  current: number;
  target: number;
  bgColor: string;
  accentColor: string;
}

interface CurrentGoalsProps {
  goalsList: GoalItem[];
}

const CurrentGoals = ({ goalsList }: CurrentGoalsProps) => {
  return (
    <View className="mt-8 mb-8 px-5">
      <HomeSectionHeader title="Current Goals" href="/portfolio" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingRight: 4 }}
      >
        {goalsList.map((goal) => {
          return <CardGoals key={goal.id} goal={goal} />;
        })}
      </ScrollView>
    </View>
  );
};

export default CurrentGoals;

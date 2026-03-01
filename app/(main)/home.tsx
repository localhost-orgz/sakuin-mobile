import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";

import CurrentGoals from "@/components/Home/CurrentGoals";
import TopSection from "@/components/Home/TopSection";
import TopSpendCategory from "@/components/Home/TopSpendCategory";
import { CURRENT_GOALS } from "../../constants/goalsList";
import { TOP_SPENDING_CATEGORIES } from "../../constants/topCatList";

export default function Home() {
  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
      >
        <TopSection />

        {/* below */}
        <View className="mt-[450px] mb-[100px]">
          {/* top spending category */}
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} />

          {/* current goals */}
          <CurrentGoals goalsList={CURRENT_GOALS} />
        </View>
      </ScrollView>
    </>
  );
}

import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

import CurrentGoals from "@/components/Home/CurrentGoals";
import RecentTransactions from "@/components/Home/RecentTransactions";
import TopSection from "@/components/Home/TopSection";
import TopSpendCategory from "@/components/Home/TopSpendCategory";
import { CURRENT_GOALS } from "@/constants/goalsList";
import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import { RECENT_TRANSACTIONS } from "@/constants/transactionList";
import { Link } from "expo-router";

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
        <View className="mt-[450px] mb-[110px] ">
          {/* top spending category */}
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} />

          {/* current goals */}
          <CurrentGoals goalsList={CURRENT_GOALS} />

          {/* recent transactions */}
          <RecentTransactions transactions={RECENT_TRANSACTIONS} />
          <Link href={"/(others)/addForm"}>
            <View className="p-3 bg-sky-500 rounded">
              <Text>Add form</Text>
            </View>
          </Link>
          <Link href={"/(others)/sakuVoice"}>
            <View className="p-3 bg-sky-500 rounded">
              <Text>Halo page</Text>
            </View>
          </Link>
          <Link href={"/(auth)/welcome"}>
            <View className="p-3 bg-sky-500 rounded">
              <Text>Halo page</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}

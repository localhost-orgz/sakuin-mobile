import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

import CurrentGoals from "@/components/Home/CurrentGoals";
import HomeSectionHeader from "@/components/Home/HomeSectionHeader";
import TopSection from "@/components/Home/TopSection";
import TopSpendCategory from "@/components/Home/TopSpendCategory";
import { CURRENT_GOALS } from "../../constants/goalsList";
import { TOP_SPENDING_CATEGORIES } from "../../constants/topCatList";
import { RECENT_TRANSACTIONS } from "../../constants/transactionList";

export default function Home() {
  const getCategoryDetail = (categoryId: string) => {
    return TOP_SPENDING_CATEGORIES.find((cat) => cat.id === categoryId);
  };
  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
      >
        <TopSection />

        {/* below */}
        <View className="mt-[450px] mb-[60px] ">
          {/* top spending category */}
          <TopSpendCategory TopCategories={TOP_SPENDING_CATEGORIES} />

          {/* current goals */}
          <CurrentGoals goalsList={CURRENT_GOALS} />

          <View className="">
            <View className="px-5">
              <HomeSectionHeader
                title="Latest Transactions"
                href={"/analytics"}
              />
            </View>

            <View className="flex flex-row bg-white py-3 mt-2 rounded-t-xl border-b border-slate-300/30 justify-between items-center px-6">
              <Text className="text-md text-[#9ca3af]">Name</Text>
              <Text className="text-md text-[#9ca3af]">Amount</Text>
            </View>

            {/* list */}
            <View className="flex-1 flex-col gap-0 bg-white">
              {RECENT_TRANSACTIONS.map((item) => {
                const categoryDetail = getCategoryDetail(item.categoryId);
                return (
                  <View
                    key={item.id}
                    className="flex-1 py-3 mx-5 flex flex-row items-center border-b border-slate-300/30 justify-between"
                  >
                    <View className="flex flex-row items-center gap-3">
                      <View
                        style={{ backgroundColor: categoryDetail?.bgColor }}
                        className="w-[50px] h-[50px] bg-[#FFF4E5] flex justify-center items-center rounded-full"
                      >
                        <Text className="text-lg">{categoryDetail?.icon}</Text>
                      </View>

                      <View className="flex flex-col">
                        <Text className="text-lg font-semibold mb-1">
                          {item.title}
                        </Text>
                        <Text className="text-sm text-[#9ca3af]">
                          {item.date}
                        </Text>
                      </View>
                    </View>
                    <View className="flex flex-col items-end">
                      <Text className="text-lg text-red-500 font-semibold mb-1">{`-Rp${item.amount}`}</Text>
                      <Text className="text-sm text-[#9ca3af]">
                        {item.wallet}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

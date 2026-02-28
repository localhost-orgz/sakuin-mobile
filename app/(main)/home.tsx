import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, WalletMinimal } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40; // padding 20 on each side

const cards = [
  {
    id: "1",
    bank: "Mandiri",
    type: "Wallet",
    balance: "3.324.522,02",
    transactions: "323.000",
    gradientColors: ["#1a1f36", "#252b48"] as [string, string],
    accentColor: "rgba(81, 162, 255, 0.8)",
  },
  {
    id: "2",
    bank: "BCA",
    type: "Wallet",
    balance: "12.500.000,00",
    transactions: "1.200.000",
    gradientColors: ["#1a2a1a", "#1e3a2a"] as [string, string],
    accentColor: "rgba(0, 188, 125, 0.8)",
  },
  {
    id: "3",
    bank: "Wallet",
    type: "E-Wallet",
    balance: "850.000,00",
    transactions: "75.000",
    gradientColors: ["#2a1a1a", "#3a1e1e"] as [string, string],
    accentColor: "rgba(255, 100, 100, 0.8)",
  },
];

// constants/categories.js 📂

export const EXPENSE_CATEGORIES = [
  { id: "bills_utilities", label: "Bills & Utilities", icon: "🧾" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "entertainment", label: "Entertainment", icon: "▶️" },
  { id: "food_beverage", label: "Food & Beverage", icon: "🍔" },
  { id: "groceries", label: "Groceries", icon: "🛒" },
  { id: "health_fitness", label: "Health & Fitness", icon: "💊" },
  { id: "other", label: "Other", icon: "🟢" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "transport", label: "Transport", icon: "🚕" },
  { id: "travel", label: "Travel", icon: "✈️" },
];

export default function Home() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full h-[390px] pt-5 bg-[#00BC7D] absolute top-0 left-0">
          <SafeAreaView>
            <View className="flex flex-row items-center justify-between px-5">
              <View className="flex gap-0.5">
                <Text className="text-[24px] text-white font-bold">
                  Hi, User
                </Text>
                <Text className="text-[16px] text-white/50">welcome back</Text>
              </View>
              <View className="h-[40px] w-[40px] rounded-full bg-black" />
            </View>

            {/* card carousel */}
            <View className="mt-5">
              <FlatList
                ref={flatListRef}
                data={cards}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16} // card width + gap
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                  <View style={{ width: CARD_WIDTH, height: 180 }}>
                    <LinearGradient
                      colors={item.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1,
                        borderRadius: 15,
                        padding: 20,
                      }}
                    >
                      <View className="flex flex-row items-center gap-2">
                        <View className="p-2.5 self-start bg-white/10 rounded-lg">
                          <WalletMinimal color={"white"} />
                        </View>
                        <View className="flex">
                          <Text className="text-white font-semibold text-[20px]">
                            {item.bank}
                          </Text>
                          <Text className="text-white/30">{item.type}</Text>
                        </View>
                      </View>

                      <View className="flex mt-5 gap-1.5">
                        <Text className="uppercase text-sm tracking-widest font-semibold text-white/20">
                          Balance
                        </Text>
                        <View className="flex flex-row items-center gap-4">
                          <View className="flex flex-row gap-1">
                            <Text className="text-white text-xl font-medium self-end">
                              Rp
                            </Text>
                            <Text className="text-white text-3xl font-semibold">
                              {isBalanceShow ? item.balance : "•••••••••"}
                            </Text>
                          </View>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setIsBalanceShow(!isBalanceShow)}
                          >
                            {isBalanceShow ? (
                              <Eye color={"white"} strokeWidth={1.5} />
                            ) : (
                              <EyeOff color={"white"} strokeWidth={1.5} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text className="text-md text-white/30 mt-2">
                        {`Total Transactions This Month: Rp${isBalanceShow ? item.transactions : "•••••"}`}
                      </Text>
                    </LinearGradient>

                    {/* accent glow */}
                    <LinearGradient
                      colors={[item.accentColor, "transparent"]}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 130,
                        height: 130,
                        borderBottomLeftRadius: 130,
                        borderTopEndRadius: 15,
                      }}
                    />
                  </View>
                )}
              />

              {/* dot indicators */}
              <View className="flex flex-row justify-center gap-1.5 mt-4">
                {cards.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                      });
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          activeIndex === index
                            ? "white"
                            : "rgba(255,255,255,0.3)",
                        // transition: "width 0.3s",
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* income expense */}
            <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-10">
              <View className="w-[150px] h-[80px] bg-white rounded-lg py-2 px-3">
                <Text className="uppercase text-sm font-semibold">Income</Text>
                <View className="flex flex-row mt-2 items-center">
                  <Text>Rp</Text>
                  <Text className="text-xl">3.340.000</Text>
                </View>
              </View>
              <View className="w-[150px] h-[80px] bg-red-500/50"></View>
            </View>
          </SafeAreaView>
        </View>

        {/* below */}
        <View className="mt-[450px] px-5">
          {/* top spending */}
          <View>
            <Text className="text-xl font-bold mb-5">
              Top Spending Category
            </Text>
            <View className="flex flex-row gap-3">
              <FlatList
                data={EXPENSE_CATEGORIES}
                keyExtractor={(item) => item.id}
                horizontal // Tambahin ini kalo mau list-nya ke samping kayak di gambar sebelumnya 🚕
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className="p-4 bg-white rounded-xl mr-3">
                    <Text className="text-xl">{item.icon}</Text>
                  </View>
                )}
              />
            </View>
          </View>

          {/* curr goals */}
        </View>
      </ScrollView>
    </>
  );
}

import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WalletCard from "./WalletCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

import { WALLET_LIST } from "../../constants/walletList";
import IncomeExpenseCard from "./IncomeExpenseCard";

const TopSection = () => {
  const flatListRef = useRef<FlatList>(null);
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
    <View className="w-full h-[390px] pt-5 bg-[#00BC7D] absolute top-0 left-0">
      <SafeAreaView>
        {/* User info */}
        <View className="flex flex-row items-center justify-between px-5">
          <View className="flex gap-0.5">
            <Text className="text-[24px] text-white font-bold">Hi, User</Text>
            <Text className="text-[16px] text-white/50">welcome back</Text>
          </View>
          <View className="h-[40px] w-[40px] rounded-full bg-black" />
        </View>

        {/* card carousel */}
        <View className="mt-5">
          <FlatList
            ref={flatListRef}
            data={WALLET_LIST}
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
              <WalletCard
                item={item}
                isBalanceShow={isBalanceShow}
                onBalanceShow={setIsBalanceShow}
              />
            )}
          />

          {/* dot indicators */}
          <View className="flex flex-row justify-center gap-1.5 mt-4">
            {WALLET_LIST.map((_, index) => (
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
                      activeIndex === index ? "white" : "rgba(255,255,255,0.3)",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* income expense */}
        <IncomeExpenseCard isBalanceShow={isBalanceShow} />
      </SafeAreaView>
    </View>
  );
};

export default TopSection;

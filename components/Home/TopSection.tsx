/**
 * components/Home/TopSection.tsx
 *
 * Greeting row is pinned (not in scroll).
 * Wallet carousel + dots + IncomeExpenseCard live inside the parent ScrollView
 * as a ListHeader, so they scroll along with all other content.
 */

import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IncomeExpenseCard from "./IncomeExpenseCard";
import WalletCard from "./WalletCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

interface UserProps {
  userData: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
}

// ─── PinnedGreeting ───────────────────────────────────────────────────────────
// Exported separately so home.tsx can render it above the ScrollView.
export const PinnedGreeting = ({ userData }: UserProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: "#00bf71",
        paddingTop: insets.top + 12,
        paddingBottom: 14,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 2 }}>
          <Text
            style={{
              fontSize: 24,
              color: "white",
              fontWeight: "800",
              letterSpacing: -0.3,
            }}
          >
            Hi, {userData?.name?.split(" ")[0]}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              fontWeight: "500",
            }}
          >
            welcome back
          </Text>
        </View>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "black",
            overflow: "hidden",
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.3)",
          }}
        >
          <Image
            source={
              userData?.avatar_url
                ? { uri: userData.avatar_url }
                : require("../../assets/images/profile.jpg")
            }
            style={{ width: "100%", height: "100%", borderRadius: 21 }}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

// ─── ScrollableTopContent ─────────────────────────────────────────────────────
// Wallet carousel + dots + income/expense card.
// Rendered as ListHeaderComponent inside home.tsx's FlatList/SectionList.
export const ScrollableTopContent = ({
  isBalanceShow,
  setIsBalanceShow,
  wallets = [],
}: {
  isBalanceShow: boolean;
  setIsBalanceShow: (v: boolean) => void;
  wallets: any[];
}) => {
  const flatListRef = useRef<FlatList>(null);
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
    <View
      style={{ backgroundColor: "#00bf71", paddingTop: 16, paddingBottom: 40 }}
    >
      {/* Wallet carousel */}
      <FlatList
        ref={flatListRef}
        data={wallets}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
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

      {/* Dot indicators */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
          marginTop: 14,
        }}
      >
        {wallets.map((item: any, index: number) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
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

      {/* Income / Expense card — floats below */}
      <IncomeExpenseCard isBalanceShow={isBalanceShow} />
    </View>
  );
};

// ─── Default export (kept for backward compat if anything imports TopSection) ─
export default function TopSection({ userData }: UserProps) {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  return (
    <>
      <PinnedGreeting userData={userData} />
      <ScrollableTopContent
        isBalanceShow={isBalanceShow}
        setIsBalanceShow={setIsBalanceShow}
        wallets={[]}
      />
    </>
  );
}

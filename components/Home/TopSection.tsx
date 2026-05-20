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
import WalletCard, { WalletCardSkeleton } from "./WalletCard";
import { Skeleton } from "@/components/Skeleton";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

interface UserProps {
  userData: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  loading?: boolean;
}

// ─── PinnedGreeting ───────────────────────────────────────────────────────────
// Exported separately so home.tsx can render it above the ScrollView.
export const PinnedGreeting = ({ userData, loading }: UserProps) => {
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
        {loading || !userData ? (
          <View style={{ gap: 6 }}>
            <Skeleton width={120} height={28} borderRadius={6} style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
            <Skeleton width={80} height={14} borderRadius={4} style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          </View>
        ) : (
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
        )}
        {loading || !userData ? (
          <Skeleton width={42} height={42} borderRadius={21} style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
        ) : (
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
        )}
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
  transactions = [],
  user = null,
  loading,
}: {
  isBalanceShow: boolean;
  setIsBalanceShow: (v: boolean) => void;
  wallets: any[];
  transactions?: any[];
  user?: any;
  loading?: boolean;
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

  if (loading) {
    return (
      <View
        style={{ backgroundColor: "#00bf71", paddingTop: 16, paddingBottom: 40 }}
      >
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 16 }}>
          <WalletCardSkeleton />
          <View style={{ opacity: 0.6, overflow: "hidden", width: 40 }}>
            <WalletCardSkeleton />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginTop: 14,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
        </View>

        <IncomeExpenseCard isBalanceShow={isBalanceShow} loading={true} />
      </View>
    );
  }

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
      <IncomeExpenseCard
        isBalanceShow={isBalanceShow}
        transactions={transactions}
        user={user}
      />
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

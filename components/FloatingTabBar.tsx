import { usePathname, useSegments } from "expo-router";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { ChartArea, Home, Plus, User, Wallet } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FloatingMenu from "./BottomBar/FloatingMenu";
import TabItem, { ACTIVE_COLOR, INACTIVE_COLOR } from "./BottomBar/TabItem";
import SakuSnapSourceSheet from "./SakuSnap/SakuSnapSourceSheet";

const PLUS_ROUTES = new Set([
  "sakuSnap",
  "sakuVoice",
  "addForm",
  "transferForm",
  "editForm",
]);

const HOME_ROUTES = new Set(["home", "allTransactions"]);
const ANALYTICS_ROUTES = new Set(["analytics"]);
const PORTFOLIO_ROUTES = new Set(["portfolio", "detailWallet", "detailGoal"]);
const PROFILE_ROUTES = new Set([
  "profile",
  "editProfile",
  "manageCategory",
  "privacy",
  "aboutUs",
]);

const segmentSet = (segments: string[]) => new Set(segments);

const isActiveGroup = (segments: string[], routes: Set<string>) => {
  const set = segmentSet(segments);
  for (const route of routes) {
    if (set.has(route)) return true;
  }
  return false;
};

const FloatingTabBar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [sakuSnapSheetVisible, setSakuSnapSheetVisible] = React.useState(false);
  const rotation = useSharedValue(0);
  const segments = useSegments();
  const pathname = usePathname();

  const closeMenu = () => {
    setIsMenuOpen(false);
    rotation.value = withTiming(0, { duration: 250 });
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    rotation.value = withTiming(newState ? 135 : 0, { duration: 250 });
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const segList = segments as string[];
  const isHome = isActiveGroup(segList, HOME_ROUTES);
  const isAnalytics = isActiveGroup(segList, ANALYTICS_ROUTES);
  const isPortfolio = isActiveGroup(segList, PORTFOLIO_ROUTES);
  const isProfile = isActiveGroup(segList, PROFILE_ROUTES);
  const isPlusRoute =
    isActiveGroup(segList, PLUS_ROUTES) ||
    [...PLUS_ROUTES].some((r) => pathname.includes(r));

  return (
    <View
      className="absolute bottom-5 left-0 right-0 items-center justify-center z-50"
      style={{ overflow: "visible" }}
      pointerEvents="box-none"
    >
      {isMenuOpen && (
        <Pressable
          className="absolute inset-0 -top-[800px] -bottom-5"
          onPress={closeMenu}
          style={{ zIndex: 40 }}
        />
      )}

      {isMenuOpen && (
        <FloatingMenu
          onClose={closeMenu}
          onOpenSakuSnap={() => setSakuSnapSheetVisible(true)}
        />
      )}

      <SakuSnapSourceSheet
        visible={sakuSnapSheetVisible}
        onClose={() => setSakuSnapSheetVisible(false)}
      />

      <View className="flex-row w-[90%] py-2.5 px-2 rounded-[25px] items-center justify-around bg-white elevation-10 shadow-[0px_10px_20px_rgba(0,0,0,0.15)] z-50">
        <TabItem
          href="/(main)/home"
          label="Home"
          active={isHome}
          icon={
            <Home
              color={isHome ? ACTIVE_COLOR : INACTIVE_COLOR}
              size={24}
            />
          }
        />
        <TabItem
          href="/(main)/analytics"
          label="Analytics"
          active={isAnalytics}
          icon={
            <ChartArea
              color={isAnalytics ? ACTIVE_COLOR : INACTIVE_COLOR}
              size={24}
            />
          }
        />

        <TouchableOpacity
          onPress={toggleMenu}
          className={`p-3 rounded-full -mt-[60px] border-[5px] border-white ${
            isPlusRoute || isMenuOpen ? "bg-[#009e5f]" : "bg-[#00bf71]"
          }`}
          activeOpacity={0.8}
          style={
            isPlusRoute
              ? {
                  shadowColor: ACTIVE_COLOR,
                  shadowOpacity: 0.45,
                  shadowRadius: 8,
                  elevation: 8,
                }
              : undefined
          }
        >
          <Animated.View style={animatedIconStyle}>
            <Plus color="white" size={28} strokeWidth={3} />
          </Animated.View>
        </TouchableOpacity>

        <TabItem
          href="/(main)/portfolio"
          label="Portfolio"
          active={isPortfolio}
          icon={
            <Wallet
              color={isPortfolio ? ACTIVE_COLOR : INACTIVE_COLOR}
              size={24}
            />
          }
        />
        <TabItem
          href="/(main)/profile"
          label="Profile"
          active={isProfile}
          icon={
            <User
              color={isProfile ? ACTIVE_COLOR : INACTIVE_COLOR}
              size={24}
            />
          }
        />
      </View>
    </View>
  );
};

export default FloatingTabBar;

import React from "react";
import { TouchableOpacity, View } from "react-native";
// 1. Import icon yang kamu mau dari lucide 🔎
import { ChartArea, Home, Plus, User, Wallet } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FloatingMenu from "./BottomBar/FloatingMenu";
import TabItem from "./BottomBar/TabItem";

const FloatingTabBar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const rotation = useSharedValue(0);

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    rotation.value = withTiming(newState ? 135 : 0, { duration: 250 });
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      className="absolute bottom-5 left-0 right-0 items-center justify-center"
      style={{ overflow: "visible" }}
    >
      {isMenuOpen && <FloatingMenu />}

      <View className="flex-row w-[90%] py-2.5 px-2 rounded-[25px] items-center justify-around bg-white elevation-10 shadow-[0px_10px_20px_rgba(0,0,0,0.15)]">
        <TabItem
          href="/home"
          label="Home"
          icon={<Home color="black" size={24} />}
        />
        <TabItem
          href="/analytics"
          label="Analytics"
          icon={<ChartArea color="black" size={24} />}
        />

        {/* Plus Button Tetap di Sini karena punya logic state */}
        <TouchableOpacity
          onPress={toggleMenu}
          className="bg-[#00bf71] p-3 rounded-full -mt-[60px] border-[5px] border-white"
          activeOpacity={0.8}
        >
          <Animated.View style={animatedIconStyle}>
            <Plus color="white" size={28} strokeWidth={3} />
          </Animated.View>
        </TouchableOpacity>

        <TabItem
          href="/portfolio"
          label="Portfolio"
          icon={<Wallet color="black" size={24} />}
        />
        <TabItem
          href="/profile"
          label="Profile"
          icon={<User color="black" size={24} />}
        />
      </View>
    </View>
  );
};

export default FloatingTabBar;

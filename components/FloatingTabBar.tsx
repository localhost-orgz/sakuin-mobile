import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
// 1. Import icon yang kamu mau dari lucide 🔎
import { ChartArea, Home, Mic, Plus, User, Wallet } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const FloatingTabBar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const rotation = useSharedValue(0); // 👈 track rotation value

  const handlePress = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    rotation.value = withTiming(newState ? 135 : 0, { duration: 250 }); // 👈 animate to 45deg or back to 0
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }], // 👈 apply rotation
  }));

  return (
    <View
      className="absolute bottom-5 left-0 right-0 items-center justify-center"
      style={{ overflow: "visible" }}
    >
      <View
        className="flex-row white w-[90%] py-4 px-2 rounded-[25px] items-center justify-around bg-white"
        style={{
          overflow: "visible",
          // iOS shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          // Android shadow
          elevation: 10,
        }}
      >
        {/* Home Icon */}
        <TouchableOpacity className="p-2 items-center">
          <Home color="black" size={24} />
        </TouchableOpacity>

        {/* Search Icon */}
        <TouchableOpacity className="p-2 items-center">
          <ChartArea color="black" size={24} />
        </TouchableOpacity>

        {/* Plus Icon (Aksen Tengah) */}
        <TouchableOpacity
          onPress={handlePress}
          className="bg-[#00bf71] p-3 rounded-full -mt-[60px] border-[5px] border-white"
          activeOpacity={0.8}
        >
          <Animated.View style={animatedIconStyle}>
            <Plus color="white" size={28} strokeWidth={3} />
          </Animated.View>
        </TouchableOpacity>

        {/* Search Icon */}
        <TouchableOpacity className="p-2 items-center">
          <Wallet color="black" size={24} />
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity className="p-2 items-center">
          <User color="black" size={24} />
        </TouchableOpacity>
      </View>

      {/* options */}
      {isMenuOpen && (
        <View className="absolute w-[150px] p-1 left-1/2 -translate-x-1/2 -top-[100px] bg-white border border-gray-200 rounded-lg gap-1">
          <View className="gap-2 p-1.5 rounded-md flex-row items-center">
            <Mic className="" size={15} />
            <Text>Voice-to-Note</Text>
          </View>
          <View className="gap-2 p-1.5 rounded-md flex-row items-center">
            <Mic className="" size={15} />
            <Text>Voice-to-Note</Text>
          </View>
          <View className="gap-2 p-1.5 rounded-md flex-row items-center">
            <Mic className="" size={15} />
            <Text>Voice-to-Note</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default FloatingTabBar;

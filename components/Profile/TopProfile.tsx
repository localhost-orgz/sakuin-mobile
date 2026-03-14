import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TopProfile = () => {
  const insets = useSafeAreaInsets();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <View
      className="bg-[#00bf71] items-center pb-10"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="w-full flex-row items-center justify-center px-5 mb-6">
        <Text className="text-white text-lg font-bold">Account</Text>
      </View>

      <View className="relative mb-4">
        <View className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden">
          {!avatarError ? (
            <Image
              source={require("../../assets/images/profile.jpg")}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View className="w-full h-full bg-gray-300 items-center justify-center">
              <Text className="text-3xl font-bold text-white">U</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-gray-900 items-center justify-center border-2 border-white"
        >
          <Plus size={13} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <Text className="text-white text-xl font-bold mb-1">User</Text>
      <Text className="text-white/70 text-sm">blablabla@gmail.com</Text>
    </View>
  );
};

export default TopProfile;

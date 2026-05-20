import { Skeleton } from "@/components/Skeleton";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UserProps {
  userData: {
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  loading?: boolean;
}

const TopProfile = ({ userData, loading }: UserProps) => {
  const insets = useSafeAreaInsets();
  const [avatarError, setAvatarError] = useState(false);

  if (loading) {
    return (
      <View
        className="bg-[#00bf71] items-center pb-10"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="w-full flex-row items-center justify-center px-5 mb-6">
          <Text className="text-white text-lg font-bold">Account</Text>
        </View>

        <View className="relative mb-4">
          <Skeleton
            width={96}
            height={96}
            borderRadius={48}
            style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          />
        </View>

        <Skeleton
          width={140}
          height={20}
          borderRadius={10}
          style={{ backgroundColor: "rgba(255,255,255,0.25)", marginBottom: 8 }}
        />

        <Skeleton
          width={180}
          height={14}
          borderRadius={7}
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        />
      </View>
    );
  }

  const profileImage = userData?.avatar_url
    ? { uri: userData.avatar_url }
    : require("../../assets/images/profile.jpg");

  return (
    <View
      className="bg-[#00bf71] items-center pb-10"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="w-full flex-row items-center justify-center px-5 mb-6">
        <Text className="text-white text-lg font-bold">Account</Text>
      </View>

      <View className="relative mb-4">
        {/* Tambahin border-[3px] biar lebih kelihatan premium ✨ */}
        <View className="w-24 h-24 rounded-full bg-gray-300 border-[3px] border-white/30 overflow-hidden">
          {!avatarError ? (
            <Image
              source={profileImage}
              // KUNCI: Kasih rounded-full juga di gambarnya langsung! 🔑
              className="w-full h-full rounded-full"
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View className="w-full h-full bg-gray-400 items-center justify-center">
              <Text className="text-3xl font-bold text-white">
                {userData?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-white text-xl font-bold mb-1">
        {userData?.name || "Loading..."}
      </Text>

      <Text className="text-white/70 text-sm font-medium tracking-wide">
        {userData?.email || "..."}
      </Text>
    </View>
  );
};

export default TopProfile;

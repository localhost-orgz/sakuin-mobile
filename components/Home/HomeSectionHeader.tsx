import { Href, Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HomeSectionHeaderProps {
  title: string;
  href: Href; // Kamu juga bisa pake Href dari expo-router kalo mau lebih strict
}

const HomeSectionHeader = ({ title, href }: HomeSectionHeaderProps) => {
  return (
    <View className="flex flex-row items-center justify-between mb-4">
      <Text className="text-[18px] font-bold text-[#1a1f36]">{title}</Text>
      <Link href={href} asChild>
        <TouchableOpacity>
          <Text className="text-sm text-[#00BC7D] font-semibold underline">
            See All
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default HomeSectionHeader;

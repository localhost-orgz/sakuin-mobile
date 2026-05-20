import { Href, Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  href: Href;
  active?: boolean;
}

const ACTIVE_COLOR = "#00bf71";
const INACTIVE_COLOR = "#111827";

const TabItem = ({ icon, label, href, active = false }: TabItemProps) => {
  return (
    <Link href={href} asChild>
      <Pressable className="p-2 items-center flex flex-col gap-1 min-w-[56px]">
        <View
          className={`p-1 rounded-xl ${active ? "bg-[#00bf71]/15" : ""}`}
        >
          {icon}
        </View>
        <Text
          className={`text-xs font-semibold ${
            active ? "text-[#00bf71]" : "text-[#6b7280]"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
};

export { ACTIVE_COLOR, INACTIVE_COLOR };
export default TabItem;

import { Link } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  href: any;
}

const TabItem = ({ icon, label, href }: TabItemProps) => {
  return (
    <Link href={href} asChild>
      <Pressable className="p-2 items-center flex flex-col gap-1">
        {icon}
        <Text className="text-xs font-semibold">{label}</Text>
      </Pressable>
    </Link>
  );
};

export default TabItem;

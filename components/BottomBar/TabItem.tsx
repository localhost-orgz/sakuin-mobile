import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  href: any;
}

const TabItem = ({ icon, label, href }: TabItemProps) => {
  return (
    <Link href={href} asChild>
      <TouchableOpacity className="p-2 items-center flex flex-col gap-1">
        {icon}
        <Text className="text-xs font-semibold">{label}</Text>
      </TouchableOpacity>
    </Link>
  );
};

export default TabItem;

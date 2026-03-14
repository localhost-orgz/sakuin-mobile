import { LogOut } from "lucide-react-native";
import React from "react";
import { Pressable, Text } from "react-native";

const LogOutBtn = ({ onModalOpen, isModalOpen }: any) => {
  return (
    <Pressable
      onPress={onModalOpen(() => !isModalOpen)}
      className="mx-5 flex-row items-center justify-between px-4 py-4 rounded-2xl border border-red-300 bg-red-100"
    >
      <Text className="text-red-500 text-[15px] font-medium">Logout</Text>
      <LogOut size={15} strokeWidth={2.5} color={"#ef4444"} />
    </Pressable>
  );
};

export default LogOutBtn;

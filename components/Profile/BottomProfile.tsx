import { GROUP_1, GROUP_2 } from "@/constants/ProfileList";
import React from "react";
import { View } from "react-native";
import LogOutBtn from "./LogOutBtn";
import MenuGroup from "./MenuGroup";

const BottomProfile = ({ onModalOpen, isModalOpen }: any) => {
  return (
    <View className="mt-[-20px]">
      <View className="bg-[#f5f6fa] rounded-t-3xl pt-5 gap-4">
        <MenuGroup items={GROUP_1} />
        <MenuGroup items={GROUP_2} />

        <LogOutBtn isModalOpen={isModalOpen} onModalOpen={onModalOpen} />
      </View>
    </View>
  );
};

export default BottomProfile;

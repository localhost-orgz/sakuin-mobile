import { GROUP_1, GROUP_2 } from "@/constants/ProfileList";
import { CURRENCY_LIST } from "@/constants/currencyList";
import React from "react";
import { View } from "react-native";
import LogOutBtn from "./LogOutBtn";
import MenuGroup from "./MenuGroup";

type Currency = (typeof CURRENCY_LIST)[0];

type BottomProfileProps = {
  isModalOpen: boolean;
  onModalOpen: (open: boolean) => void;
  selectedCurrency: Currency;
  onCurrencyPress: () => void;
};

const BottomProfile = ({
  onModalOpen,
  isModalOpen,
  selectedCurrency,
  onCurrencyPress,
}: BottomProfileProps) => {
  return (
    <View className="mt-[-20px]">
      <View className="bg-[#f5f6fa] rounded-t-3xl pt-5 gap-4">
        <MenuGroup items={GROUP_1} />
        <MenuGroup
          items={GROUP_2}
          selectedCurrency={selectedCurrency}
          onCurrencyPress={onCurrencyPress}
        />

        <LogOutBtn isModalOpen={isModalOpen} onModalOpen={onModalOpen} />
      </View>
    </View>
  );
};

export default BottomProfile;

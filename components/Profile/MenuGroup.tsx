import { CURRENCY_LIST } from "@/constants/currencyList";
import { View } from "react-native";
import MenuRow, { MenuItem } from "./MenuRow";

type Currency = (typeof CURRENCY_LIST)[0];

type MenuGroupProps = {
  items: MenuItem[];
  selectedCurrency?: Currency;
  onCurrencyPress?: () => void;
};

const MenuGroup = ({
  items,
  selectedCurrency,
  onCurrencyPress,
}: MenuGroupProps) => (
  <View className="mx-5 rounded-2xl border border-gray-200 bg-white overflow-hidden">
    {items.map((item, i) => (
      <View key={item.label}>
        <MenuRow
          item={item}
          selectedCurrency={selectedCurrency}
          onCurrencyPress={onCurrencyPress}
        />
        {i < items.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
      </View>
    ))}
  </View>
);

export default MenuGroup;

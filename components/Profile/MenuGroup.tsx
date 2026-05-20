import { Skeleton } from "@/components/Skeleton";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { View } from "react-native";
import MenuRow, { MenuItem } from "./MenuRow";

type Currency = (typeof CURRENCY_LIST)[0];

type MenuGroupProps = {
  items: MenuItem[];
  selectedCurrency?: Currency;
  onCurrencyPress?: () => void;
  loading?: boolean;
};

const MenuGroup = ({
  items,
  selectedCurrency,
  onCurrencyPress,
  loading,
}: MenuGroupProps) => {
  if (loading) {
    return (
      <View className="mx-5 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {items.map((item, i) => (
          <View key={i}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              {/* Label skeleton */}
              <Skeleton width={120} height={16} borderRadius={8} />

              {/* Indicator skeleton */}
              {item.type === "dropdown" ? (
                <Skeleton width={80} height={28} borderRadius={14} />
              ) : (
                <Skeleton width={28} height={28} borderRadius={14} />
              )}
            </View>
            {i < items.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="mx-5 rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {items.map((item, i) => (
        <View key={item.label}>
          <MenuRow
            item={item}
            isLast={i === items.length - 1}
            selectedCurrency={selectedCurrency}
            onCurrencyPress={onCurrencyPress}
          />
          {i < items.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
        </View>
      ))}
    </View>
  );
};

export default MenuGroup;

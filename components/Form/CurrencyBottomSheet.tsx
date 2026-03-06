import { CURRENCY_LIST } from "@/constants/currencyList";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { CheckCheck, Search } from "lucide-react-native";
import { forwardRef, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Currency = (typeof CURRENCY_LIST)[0];

interface Props {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
}

const CurrencyBottomSheet = forwardRef<BottomSheet, Props>(
  ({ selectedCurrency, onSelect }, ref) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");

    const snapPoints = useMemo(() => ["70%"], []);

    const filteredCurrencies = useMemo(() => {
      if (!searchQuery.trim()) return CURRENCY_LIST;
      const q = searchQuery.toLowerCase();

      return CURRENCY_LIST.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.symbol?.toLowerCase().includes(q),
      );
    }, [searchQuery]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={false}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        }}
        backgroundStyle={{
          backgroundColor: "#fff",
          borderRadius: 32,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#e5e7eb",
          width: 40,
        }}
      >
        <BottomSheetFlatList
          data={filteredCurrencies}
          keyExtractor={(item: any) => item.code}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
          }}
          ListHeaderComponent={
            <View className="bg-white px-5 pt-2 pb-4">
              <View className="pb-3 border-b border-gray-100 items-center">
                <Text className="text-lg font-bold text-gray-900">
                  Select Currency
                </Text>
              </View>

              <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-2xl mt-5 gap-3">
                <Search size={15} stroke="#9CA3AF" />
                <BottomSheetTextInput
                  placeholder="Search currency name or code..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    flex: 1,
                    color: "#111827",
                    fontSize: 13,
                  }}
                />
              </View>

              {filteredCurrencies.length === 0 && (
                <View className="items-center py-12">
                  <Text className="text-gray-400 text-base">
                    Oops, currency not found 😵‍💫
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }: any) => {
            const isSelected = selectedCurrency.code === item.code;

            return (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => ({
                  backgroundColor: isSelected
                    ? "#f0fdf8"
                    : pressed
                      ? "#f9fafb"
                      : "transparent",
                })}
                className="mx-5 flex-row items-center justify-between py-4 px-4 rounded-xl mb-1"
              >
                <View>
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "font-bold text-[#00bf71]"
                        : "font-semibold text-gray-900"
                    }`}
                  >
                    {item.code}
                  </Text>
                  <Text className="text-gray-500 text-xs">{item.name}</Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <Text
                    className={`text-lg ${
                      isSelected
                        ? "font-semibold text-[#00bf71]"
                        : "text-gray-400"
                    }`}
                  >
                    {item.symbol}
                  </Text>

                  {isSelected && <CheckCheck color={"#00bf71"} size={18} />}
                </View>
              </Pressable>
            );
          }}
        />
      </BottomSheet>
    );
  },
);

export default CurrencyBottomSheet;

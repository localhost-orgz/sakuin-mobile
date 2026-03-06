import { TOP_SPENDING_CATEGORIES } from "@/constants/topCatList";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoryItem from "./CategoryItem";

interface Props {
  selectedCategory: any;
  onSelect: (item: any) => void;
}

const CategoryBottomSheet = forwardRef<BottomSheet, Props>(
  ({ selectedCategory, onSelect }, ref) => {
    const snapPoints = useMemo(() => ["50%"], []);
    const insets = useSafeAreaInsets();

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
          data={TOP_SPENDING_CATEGORIES}
          keyExtractor={(item: any) => item.id}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
          }}
          ListHeaderComponent={
            <View className="w-full bg-white pt-2 pb-4 px-5">
              <View className="pb-3 border-b border-gray-200 items-center">
                <Text className="text-center text-lg font-bold text-gray-900">
                  Select Wallet
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }: any) => {
            return (
              <CategoryItem
                item={item}
                selectedCategory={selectedCategory}
                onSelect={onSelect}
              />
            );
          }}
        />
      </BottomSheet>
    );
  },
);

export default CategoryBottomSheet;

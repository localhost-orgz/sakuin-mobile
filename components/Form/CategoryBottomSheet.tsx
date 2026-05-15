import React, { forwardRef, useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface Category {
  _id: string;
  name: string;
  slug: string;
  emoticon: string;
  user_id: string | null;
  __v: number;
}

interface CategoryBottomSheetProps {
  categories: Category[]; // Ganti any[] dengan tipe Category[]
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
}

const CategoryBottomSheet = forwardRef<BottomSheet, CategoryBottomSheetProps>(
  ({ categories, selectedCategory, onSelect }, ref) => {
    const snapPoints = useMemo(() => ["40%", "60%"], []);

    const renderBackdrop = React.useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View className="flex-1 p-4">
          <Text className="text-lg font-bold text-[#1a1f36] mb-4 text-center">
            Pilih Kategori
          </Text>

          <BottomSheetFlatList
            data={categories}
            keyExtractor={(item: { _id: any; }) => item._id}
            renderItem={({ item }: { item: Category }) => {
              const isSelected = selectedCategory?._id === item._id;
              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
                    isSelected ? "bg-emerald-50 border-[#00bf71]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">{item.emoticon}</Text>
                    <Text className={`text-base ${isSelected ? "font-semibold text-[#00bf71]" : "text-slate-700"}`}>
                      {item.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-[#00bf71] items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </BottomSheet>
    );
  }
);

CategoryBottomSheet.displayName = "CategoryBottomSheet";
export default CategoryBottomSheet;
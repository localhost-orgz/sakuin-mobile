import React, { forwardRef, useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface Goal {
  _id: string;
  id?: string;
  name: string;
  icon?: string;
  emoticon?: string;
  current: number;
  target: number;
}

interface GoalBottomSheetProps {
  goals: Goal[];
  selectedGoal: Goal | null;
  onSelect: (goal: Goal) => void;
}

const GoalBottomSheet = forwardRef<BottomSheet, GoalBottomSheetProps>(
  ({ goals, selectedGoal, onSelect }, ref) => {
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

    const formatRupiah = (value: number) => {
      return "Rp" + new Intl.NumberFormat("id-ID").format(value);
    };

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
            Pilih Target (Goal)
          </Text>

          <BottomSheetFlatList
            data={goals}
            keyExtractor={(item: Goal) => item._id || item.id || ""}
            renderItem={({ item }: { item: Goal }) => {
              const itemId = item._id || item.id;
              const selectedId = selectedGoal?._id || selectedGoal?.id;
              const isSelected = selectedId === itemId;
              
              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
                    isSelected ? "bg-emerald-50 border-[#00bf71]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">{item.icon || item.emoticon || "🎯"}</Text>
                    <View className="flex-1">
                      <Text className={`text-base ${isSelected ? "font-semibold text-[#00bf71]" : "text-slate-700"}`}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatRupiah(item.current)} / {formatRupiah(item.target)}
                      </Text>
                    </View>
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

GoalBottomSheet.displayName = "GoalBottomSheet";
export default GoalBottomSheet;

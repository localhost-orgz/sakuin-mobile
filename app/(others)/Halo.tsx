import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";

export default function Example() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["60%", "40%"], []);

  const openSheet = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Pressable onPress={openSheet} className="bg-black px-5 py-3 rounded-lg">
        <Text className="text-white">Open Bottom Sheet</Text>
      </Pressable>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 items-center justify-center">
          <Text>Halo dari Bottom Sheet 😎</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

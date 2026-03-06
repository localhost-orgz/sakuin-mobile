import { WALLET_LIST } from "@/constants/walletList";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  selectedWallet: any;
  onSelect: (item: any) => void;
}

const WalletBottomSheet = forwardRef<BottomSheet, Props>(
  ({ selectedWallet, onSelect }, ref) => {
    const snapPoints = useMemo(() => ["70%"], []);
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
          data={WALLET_LIST}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
          }}
          renderItem={({ item }: any) => {
            const isSelected = selectedWallet.code === item.code;
            return (
              <Pressable onPress={() => onSelect(item)}>
                <View>
                  <Text>Nama Wallet</Text>
                  <View className="h-5 w-5 bg-black rounded-full"></View>
                </View>
              </Pressable>
            );
          }}
        />
      </BottomSheet>
    );
  },
);

export default WalletBottomSheet;

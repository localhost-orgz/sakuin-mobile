import { WALLET_LIST } from "@/constants/walletList";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WalletItem from "./WalletItem";

interface Props {
  selectedWallet: any;
  onSelect: (item: any) => void;
}

const WalletBottomSheet = forwardRef<BottomSheet, Props>(
  ({ selectedWallet, onSelect }, ref) => {
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
          data={WALLET_LIST}
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
              <WalletItem
                item={item}
                selectedWallet={selectedWallet}
                onSelect={onSelect}
              />
            );
          }}
        />
      </BottomSheet>
    );
  },
);

export default WalletBottomSheet;

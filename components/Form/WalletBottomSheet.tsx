import { WalletThemeId } from "@/hooks/useWalletTheme"; // 1. Import tipe warna
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WalletItem from "./WalletItem";

// 2. Samakan interface data Wallet sesuai response API
interface CurrencyId {
  _id: string;
  name: string;
  symbol: string;
  code: string;
  flag: string;
  __v: number;
}

interface Wallet {
  _id: string;
  user_id: string;
  currency_id: CurrencyId;
  wallet_id: string;
  name: string;
  color: WalletThemeId; 
  balance: number;
  __v: number;
  transactions: any[];
}

interface Props {
  wallets: Wallet[]; // 3. Ganti data dari static list ke dynamic array hasil API
  selectedWallet: Wallet | null;
  onSelect: (item: Wallet) => void;
}

const WalletBottomSheet = forwardRef<BottomSheet, Props>(
  ({ wallets, selectedWallet, onSelect }, ref) => {
    const snapPoints = useMemo(() => ["50%"], []);
    const insets = useSafeAreaInsets();

    // 4. Mempertahankan backdropComponent yang mulus dari After
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

    const formatCurrency = (amount: number, symbol: string = "Rp") => {
      return `${symbol} ${amount.toLocaleString("id-ID")}`;
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop} // Ditambahkan agar backdrop gelap bekerja
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
          data={wallets} // Menggunakan data dinamis hasil fetch
          keyExtractor={(item: Wallet) => item._id} // Menggunakan item._id dari MongoDB API
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
          renderItem={({ item }: { item: Wallet }) => {
            const isSelected = selectedWallet?._id === item._id; // Logika pencocokan ID dari After

            return (
              <WalletItem
                item={item}
                isSelected={isSelected} // Kirim boolean penanda aktif ke WalletItem
                onSelect={onSelect}
                formatCurrency={formatCurrency} // Teruskan fungsi format mata uang ke dalam row item
              />
            );
          }}
        />
      </BottomSheet>
    );
  },
);

WalletBottomSheet.displayName = "WalletBottomSheet";
export default WalletBottomSheet;
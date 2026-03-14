import useWalletTheme from "@/hooks/useWalletTheme";
import { WalletCards } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

// Buat komponen terpisah di luar WalletBottomSheet
const WalletItem = ({ item, selectedWallet, onSelect }: any) => {
  const { theme } = useWalletTheme(item.themeId);
  const isSelected = selectedWallet.id === item.id;

  return (
    <Pressable onPress={() => onSelect(item)}>
      <View
        style={{
          borderColor: isSelected ? "#00bf71" : "#d1d5db",
          backgroundColor: isSelected ? "#f0fdf8" : "transparent",
        }}
        className="border rounded-xl px-3 py-3 mx-5 my-1 flex flex-row items-center justify-between"
      >
        <View className="flex flex-row items-center gap-2">
          <View
            style={{ backgroundColor: theme.iconBgColor }}
            className="h-8 w-8 flex justify-center items-center rounded-lg"
          >
            <WalletCards color={theme.textColor} size={18} />
          </View>
          <Text className="text-base font-semibold">{item.bank}</Text>
        </View>

        {/* Radio button */}
        <View
          style={{ borderColor: isSelected ? "#00bf71" : "#d1d5db" }}
          className="h-5 w-5 border-2 rounded-full items-center justify-center"
        >
          {isSelected && (
            <View
              style={{ backgroundColor: "#00bf71" }}
              className="h-2.5 w-2.5 rounded-full"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default WalletItem;

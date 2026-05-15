import useWalletTheme from "@/hooks/useWalletTheme";
import { WalletCards } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

// Gunakan parameter destructuring dari before, namun ganti selectedWallet menjadi isSelected & tambahkan formatCurrency
const WalletItem = ({ item, isSelected, onSelect, formatCurrency }: any) => {
  // Ambil warna tema berdasarkan properti data API (item.color)
  const { theme } = useWalletTheme(item.color);

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
          
          {/* Mengubah layout teks menjadi susunan kolom (flex-col) agar Saldo bisa diselipkan di bawah nama bank */}
          <View className="flex flex-col">
            <Text className="text-base font-semibold">{item.name}</Text>
            {/* Menampilkan total saldo dinamis dari API */}
            <Text style={{ color: theme.textColor }} className="text-xs font-medium">
              {formatCurrency ? formatCurrency(item.balance, item.currency_id?.symbol) : item.balance}
            </Text>
          </View>
        </View>

        {/* Radio button (dipertahankan 100% dari style before) */}
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
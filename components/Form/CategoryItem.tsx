import { Pressable, Text, View } from "react-native";

// Buat komponen terpisah di luar WalletBottomSheet
const CategoryItem = ({ item, selectedCategory, onSelect }: any) => {
  const isSelected = selectedCategory === item.id;

  return (
    <Pressable onPress={() => onSelect(item.id)}>
      <View
        style={{
          borderColor: isSelected ? "#00bf71" : "#d1d5db",
          backgroundColor: isSelected ? "#f0fdf8" : "transparent",
        }}
        className="border rounded-xl px-3 py-3 mx-5 my-1 flex flex-row items-center justify-between"
      >
        <View className="flex flex-row items-center gap-2">
          <View
            style={{ backgroundColor: item.bgColor }}
            className="h-8 w-8 flex justify-center items-center rounded-lg"
          >
            <Text className="text-sm">{item.icon}</Text>
          </View>
          <Text className="text-base font-semibold">{item.label}</Text>
        </View>
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

export default CategoryItem;

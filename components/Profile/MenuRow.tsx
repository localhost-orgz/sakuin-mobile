import { ChevronDown, ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
};

const MenuRow = ({ item, isLast }: { item: MenuItem; isLast: boolean }) => {
  if (item.type === "logout") return null; // rendered separately

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className="flex-row items-center justify-between px-4 py-4"
    >
      <Text className="text-[15px] text-gray-800 font-normal">
        {item.label}
      </Text>

      {item.type === "arrow" && (
        <View className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center">
          <ChevronRight size={14} color="#6b7280" strokeWidth={2.5} />
        </View>
      )}

      {item.type === "dropdown" && (
        <View className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
          <Text className="text-[13px] font-semibold text-gray-700">
            {item.value}
          </Text>
          <ChevronDown size={13} color="#6b7280" strokeWidth={2.5} />
        </View>
      )}
    </TouchableOpacity>
  );
};
export default MenuRow;

import { View } from "react-native";
import MenuRow from "./MenuRow";

type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
};

const MenuGroup = ({ items }: { items: MenuItem[] }) => (
  <View className="mx-5 rounded-2xl border border-gray-200 bg-white overflow-hidden">
    {items.map((item, i) => (
      <View key={item.label}>
        <MenuRow item={item} isLast={i === items.length - 1} />
        {i < items.length - 1 && <View className="h-px bg-gray-100 mx-4" />}
      </View>
    ))}
  </View>
);

export default MenuGroup;

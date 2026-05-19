import { CURRENCY_LIST } from "@/constants/currencyList";
import { Link, type Href } from "expo-router";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

type Currency = (typeof CURRENCY_LIST)[0];

export type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
  link?: string;
};

type MenuRowProps = {
  item: MenuItem;
  isLast: boolean;
  selectedCurrency?: Currency;
  onCurrencyPress?: () => void;
};

const MenuRow = ({
  item,
  selectedCurrency,
  onCurrencyPress,
}: MenuRowProps) => {
  if (item.type === "logout") return null;

  if (item.type === "dropdown") {
    const selected =
      selectedCurrency ??
      CURRENCY_LIST.find((c) => c.code === (item.value ?? "IDR")) ??
      CURRENCY_LIST[0];

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onCurrencyPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 15, color: "#1f2937" }}>{item.label}</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#f3f4f6",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>
            {selected.flag} {selected.code}
          </Text>
          <ChevronDown size={13} color="#6b7280" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Link href={(item.link || "/") as Href} asChild>
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 15, color: "#1f2937" }}>{item.label}</Text>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={14} color="#6b7280" strokeWidth={2.5} />
        </View>
      </Pressable>
    </Link>
  );
};

export default MenuRow;

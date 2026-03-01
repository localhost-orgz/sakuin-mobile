import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import HomeSectionHeader from "./HomeSectionHeader";

const TopSpendCategory = ({ TopCategories }: any) => {
  return (
    <View className="px-5">
      <HomeSectionHeader title="Top Spending Category" href={"/analytics"} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4, paddingTop: 8 }}
      >
        {TopCategories.map((item: any, index: any) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            style={{
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                backgroundColor: item.bgColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            </View>

            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#6b7280",
                textAlign: "center",
                maxWidth: 64,
              }}
              numberOfLines={2}
            >
              {item.label}
            </Text>

            <View
              style={{
                backgroundColor: "#f0fdf8",
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#00BC7D",
                }}
              >
                Rp{item.amount}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TopSpendCategory;

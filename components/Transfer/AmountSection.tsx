import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const AmountSection = ({ amount, onAmount }: any) => {
  const QUICK_AMOUNTS = ["50.000", "100.000", "250.000", "500.000"];

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="bg-white rounded-2xl p-5"
    >
      <Text className="text-sm mb-4 font-bold uppercase text-[#9ca3af]">
        Amount
      </Text>

      {/* Amount input */}
      <View
        style={{
          borderBottomColor: amount.length > 0 ? "#00bf71" : "#f3f4f6",
          marginBottom: 20,
        }}
        className="flex flex-row items-end gap-2 border-b-2 py-2"
      >
        <Text className="text-2xl font-bold text-[#9ca3af]">Rp</Text>
        <TextInput
          value={amount}
          onChangeText={onAmount}
          placeholder="0"
          placeholderTextColor="#d1d5db"
          keyboardType="numeric"
          style={{
            flex: 1,
            fontSize: 34,
            fontWeight: "700",
            color: "#1a1f36",
          }}
        />
      </View>

      {/* Quick amounts */}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {QUICK_AMOUNTS.map((q) => (
          <TouchableOpacity
            key={q}
            onPress={() => onAmount(q)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 5,
              backgroundColor: amount === q ? "#00bf71" : "#f3f4f6",
              borderWidth: 1.5,
              borderColor: amount === q ? "#00bf71" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: amount === q ? "white" : "#6b7280",
              }}
            >
              Rp{q}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AmountSection;

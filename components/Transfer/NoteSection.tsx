import React from "react";
import { Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

const NoteSection = ({ note, onNote }: any) => {
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="bg-white rounded-lg p-5"
    >
      <Text className="text-base font-semibold tracking-wide upperacase text-[#9ca3af] mb-3">
        Note (optional)
      </Text>
      <TextInput
        value={note}
        onChangeText={onNote}
        placeholder="e.g. Rent, Groceries, Gift..."
        placeholderTextColor="#d1d5db"
        style={{ fontSize: 15, color: "#1a1f36", paddingVertical: 4 }}
        className="border-b-2 border-slate-200"
      />
    </View>
  );
};

export default NoteSection;

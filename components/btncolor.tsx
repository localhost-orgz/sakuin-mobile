import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWalletTheme, getWalletThemeIds } from "./../hooks/useWalletTheme"; // Sesuaikan path-nya

const ThemePickerSheet = ({ onSelectTheme }: any) => {
  // Ambil semua ID tema secara dinamis
  const allThemes = useMemo(() => getWalletThemeIds(), []);

  return (
    <View className="p-4 bg-white rounded-t-3xl">
      <Text className="text-lg font-bold mb-4 text-center">
        Pilih Tema Dompet 🎨
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {allThemes.map((id) => {
          const theme = getWalletTheme(id); // Ambil data lengkap tiap tema

          return (
            <TouchableOpacity
              key={id}
              onPress={() => onSelectTheme(id)}
              className="items-center mr-6"
            >
              {/* Bulat Berwarna menggunakan cardColor dari tema */}
              <View
                style={{ backgroundColor: theme.cardColor }}
                className="w-14 h-14 rounded-full border-2 border-gray-100 shadow-sm"
              />

              {/* Teks Kecil di bawahnya */}
              <Text className="text-xs mt-2 text-gray-600 capitalize">
                {theme.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Button untuk men-trigger (Contoh implementasi sederhana)
export const TriggerThemeButton = ({ onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-primary p-4 rounded-xl items-center justify-center"
  >
    <Text className="text-white font-semibold">Ganti Warna Dompet ✨</Text>
  </TouchableOpacity>
);

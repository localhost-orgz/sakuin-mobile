import { useLocalSearchParams, useRouter } from "expo-router";
import { Loader2 } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  Text,
  View,
} from "react-native";

const { height: SH, width: SW } = Dimensions.get("window");

export default function SakuLoading() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams(); // Nerima foto dari SakuSnap

  // 1. Animation States 🌀
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 2. Dummy Loading & Navigation Logic ⏳
  useEffect(() => {
    // Animasi Line Scanning naik-turun
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: SH * 0.7, // Sesuaikan dengan tinggi area gambar
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade in konten
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 💡 Dummy Timer: Pindah ke scannedPage setelah 4 detik
    const timer = setTimeout(() => {
      router.replace("/(others)/(transaction)/scannedPage");
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Background Image (Foto yang diambil) 📸 */}
        <Image
          source={{ uri: imageUri as string }}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-60"
          resizeMode="cover"
        />

        {/* Overlay Gelap biar teks kebaca */}
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40" />

        {/* Scanning Line Animation ⚡️ */}
        <Animated.View
          style={{
            transform: [{ translateY: scanAnim }],
            zIndex: 20,
          }}
          className="absolute top-0 left-0 right-0"
        >
          {/* Garis Hijau Sakuin */}
          <View className="h-[3px] bg-[#00bf71] shadow-lg shadow-[#00bf71]/80" />
          {/* Gradient-like Glow */}
          <View className="h-20 bg-gradient-to-b from-[#00bf71]/20 to-transparent" />
        </Animated.View>

        {/* Content Info 🔎 */}
        <View className="flex-1 items-center justify-end pb-20 px-10">
          <View className="bg-black/60 p-6 rounded-xl border border-white/10 items-center w-full">
            <View className="w-12 h-12 bg-[#00bf71]/20 rounded-full items-center justify-center mb-4">
              <Animated.View style={{ transform: [{ rotate: "0deg" }] }}>
                <Loader2 size={24} color="#00bf71" className="animate-spin" />
              </Animated.View>
            </View>

            <Text className="text-white text-xl font-bold mb-2 tracking-tight">
              Mengekstrak Data... 🔎
            </Text>
            <Text className="text-gray-400 text-center text-sm leading-5">
              AI Sakuin lagi baca struk kamu. Pastikan koneksi aman biar
              hasilnya cepat ya!
            </Text>

            {/* Progress Hint */}
            <View className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
              <Animated.View
                className="h-full bg-[#00bf71]"
                style={{
                  width: scanAnim.interpolate({
                    inputRange: [0, SH * 0.7],
                    outputRange: ["10%", "100%"],
                  }),
                }}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

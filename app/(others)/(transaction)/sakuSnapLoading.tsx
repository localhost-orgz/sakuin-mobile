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
  Alert,
} from "react-native";
import { apiRequest } from "@/utils/api";

const { height: SH, width: SW } = Dimensions.get("window");

export default function SakuLoading() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams(); // Nerima foto dari SakuSnap

  // 1. Animation States 🌀
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 2. OCR API Integration Logic ⏳
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

    let active = true;

    async function performOcr() {
      try {
        const formData = new FormData();
        
        // Prepare file name and type
        const uriParts = (imageUri as string).split('/');
        const fileName = uriParts[uriParts.length - 1] || "receipt.jpg";
        
        // Append file
        formData.append("receipt", {
          uri: imageUri,
          name: fileName,
          type: "image/jpeg",
        } as any);

        const res = await apiRequest("/ai/sakusnap", {
          method: "POST",
          body: formData,
          isFormData: true,
        });

        if (active) {
          if (res.status === "success" && res.data) {
            // Fetch wallets list to find a default wallet
            let walletId = "w_1";
            try {
              const walletsRes = await apiRequest("/wallets", { method: "GET" });
              if (walletsRes?.status === "success" && Array.isArray(walletsRes.data) && walletsRes.data.length > 0) {
                walletId = walletsRes.data[0]._id || walletsRes.data[0].id;
              }
            } catch (wErr) {
              console.warn("Failed to fetch wallets for default transaction mapping", wErr);
            }

            // Post transaction automatically to /transaction
            try {
              await apiRequest("/transaction", {
                method: "POST",
                body: {
                  category_id: res.data.category_id || "69a99efab5420796db171e00",
                  wallet_id: walletId,
                  amount: String(res.data.amount || 0),
                  type: "expense",
                  name: res.data.description ? res.data.description.substring(0, 30) : "Scan SakuSnap",
                  description: res.data.description || "Pembelian dari SakuSnap",
                  date: res.data.date || new Date().toISOString().split("T")[0],
                  input_method: "snap"
                }
              });
            } catch (tErr) {
              console.warn("Failed to post transaction automatically after OCR", tErr);
            }

            router.replace({
              pathname: "/(others)/(transaction)/scannedPage",
              params: { result: JSON.stringify(res.data) }
            });
          } else {
            throw new Error(res.message || "Failed to parse receipt");
          }
        }
      } catch (err: any) {
        console.error("OCR API error:", err);
        if (active) {
          Alert.alert(
            "Gagal Scan Struk",
            err.message || "Koneksi bermasalah atau AI gagal membaca struk.",
            [
              {
                text: "Kembali",
                onPress: () => router.back(),
              }
            ]
          );
        }
      }
    }

    performOcr();

    return () => {
      active = false;
    };
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

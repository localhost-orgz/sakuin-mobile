import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

// ─── Onboarding data ──────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "1",
    title: "Catat Manual dalam Sekejap",
    description:
      "Kontrol penuh atas setiap pengeluaranmu. Masukkan detail transaksi dengan navigasi yang simpel dan intuitif.",
    image: require("../../assets/images/onboarding-image1.png"),
    height: 240,
    width: 240,
  },
  {
    id: "2",
    title: "Foto Struk & Split Bill",
    description:
      "Gak perlu hitung manual lagi! Foto struk belanjaanmu, biarkan AI mencatatnya, dan bagi tagihan dengan teman secara otomatis.",
    image: require("../../assets/images/onboarding-image2.png"),
    height: 230,
    width: 230,
  },
  {
    id: "3",
    title: "Tinggal Ngomong Saja",
    description:
      'Sedang di jalan? Gunakan perintah suara untuk mencatat transaksi. "Makan siang 50 ribu", semudah bicara dengan teman.',
    image: require("../../assets/images/onboarding-image3.png"),
    height: 190,
    width: 190,
  },
  {
    id: "4",
    title: "Import Bukti Transfer Instan",
    description:
      "Langsung bagikan bukti transfer dari m-banking ke Sakuin. Transaksi otomatis tercatat tanpa perlu input ulang satu per satu.",
    image: require("../../assets/images/onboarding-image4.png"),
    height: 200,
    width: 250,
  },
];

// ─── Dot indicator ────────────────────────────────────────────────────────────
const Dots = ({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) => (
  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={{
          height: 8,
          width: i === activeIndex ? 16 : 8,
          borderRadius: 4,
          backgroundColor: i === activeIndex ? "#00bf71" : "#c7f0dc",
        }}
      />
    ))}
  </View>
);

// ─── Slide item ───────────────────────────────────────────────────────────────
const SlideItem = ({ item }: { item: (typeof SLIDES)[0] }) => {
  return (
    <View
      style={{
        width: SW,
        alignItems: "center",
        paddingHorizontal: 32,
        flex: 1,
        justifyContent: "center",
        gap: 36,
      }}
    >
      {/* Image */}
      <Image
        source={item.image}
        style={{
          width: item.width,
          height: item.height,
          resizeMode: "contain",
        }}
      />

      {/* Text */}
      <View className="items-center gap-3">
        <Text className="text-2xl font-bold text-[#1a1f36] text-center tracking-tighter">
          {item.title}
        </Text>
        <Text className="text-base text-[#6b7280] text-center leading-6">
          {item.description}
        </Text>
      </View>
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.replace("/(auth)/auth");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/sign-in");
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <StatusBar barStyle="dark-content" />

      {/* Full-screen top-to-bottom gradient background */}
      <LinearGradient
        colors={["#d4f5e6", "#edfaf3", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.45, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Skip button */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          alignItems: "flex-end",
        }}
      >
        {!isLast ? (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: pressed ? "rgba(0,191,113,0.1)" : "transparent",
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#00bf71" }}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={{ height: 36 }} />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => <SlideItem item={item} />}
        style={{ flex: 1 }}
      />

      {/* Bottom section */}
      <View
        style={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom,
          gap: 24,
          alignItems: "center",
        }}
      >
        <Dots count={SLIDES.length} activeIndex={activeIndex} />

        <Pressable
          className={`w-full py-4 bg-[#00bf71] flex items-center justify-center rounded-full`}
          onPress={handleNext}
        >
          <Text className="font-medium text-white text-base">
            {!isLast ? "Next" : "Get started 🚀"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

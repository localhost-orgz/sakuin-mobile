import { useRouter } from "expo-router";
import { ChevronDown, ChevronRight, LogOut, Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Menu item types ──────────────────────────────────────────────────────────
type MenuItem = {
  label: string;
  type: "arrow" | "dropdown" | "logout";
  value?: string;
};

const GROUP_1: MenuItem[] = [
  { label: "Edit Profile", type: "arrow" },
  { label: "Wallet", type: "arrow" },
  { label: "Manage Categories", type: "arrow" },
];

const GROUP_2: MenuItem[] = [
  { label: "Change Default Currency", type: "dropdown", value: "IDR" },
  { label: "Transaction History", type: "arrow" },
  { label: "Privacy", type: "arrow" },
  { label: "About Us", type: "arrow" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single row inside a settings group */
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

/** A bordered card group of menu rows */
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

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* ── Green header section ──────────────────────────────────────── */}
        <View
          className="bg-[#00bf71] items-center pb-10"
          style={{ paddingTop: insets.top + 8 }}
        >
          {/* Top bar */}
          <View className="w-full flex-row items-center justify-center px-5 mb-6">
            <Text className="text-white text-lg font-bold">Account</Text>
          </View>

          {/* Avatar */}
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden">
              {!avatarError ? (
                <Image
                  source={require("../../assets/images/profile.jpg")}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                // Fallback initials placeholder
                <View className="w-full h-full bg-gray-300 items-center justify-center">
                  <Text className="text-3xl font-bold text-white">U</Text>
                </View>
              )}
            </View>

            {/* + badge */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-gray-900 items-center justify-center border-2 border-white"
            >
              <Plus size={13} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Name & email */}
          <Text className="text-white text-xl font-bold mb-1">User</Text>
          <Text className="text-white/70 text-sm">blablabla@gmail.com</Text>
        </View>

        {/* ── White wave overlap ────────────────────────────────────────── */}
        {/* The cards start slightly overlapping the green header */}
        <View className="mt-[-20px]">
          {/* Rounded top filler so cards appear to come up from bottom of green */}
          <View className="bg-[#f5f6fa] rounded-t-3xl pt-5 gap-4">
            {/* Group 1 */}
            <MenuGroup items={GROUP_1} />

            {/* Group 2 */}
            <MenuGroup items={GROUP_2} />

            {/* Logout button */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="mx-5 flex-row items-center justify-between px-4 py-4 rounded-2xl border border-red-300 bg-red-100"
            >
              <Text className="text-red-500 text-[15px] font-medium">
                Logout
              </Text>
              <LogOut size={15} strokeWidth={2.5} color={"#ef4444"} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

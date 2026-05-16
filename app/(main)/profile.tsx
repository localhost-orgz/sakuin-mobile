import React, { useCallback, useState } from "react"; // Tambah useState ✨
import { ActivityIndicator, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomProfile from "@/components/Profile/BottomProfile";
import LogoutModal from "@/components/Profile/LogoutModa";
import TopProfile from "@/components/Profile/TopProfile";
import { apiRequest } from "@/utils/api"; // Import helper yang kita buat tadi
import { useFocusEffect } from "expo-router";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State modal 🔑

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, []),
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <TopProfile userData={user} />
        {/* Oper fungsi buat buka modal ke komponen bawah kalau perlu */}
        <BottomProfile
          isModalOpen={isLogoutModalOpen}
          onModalOpen={setIsLogoutModalOpen}
        />
      </ScrollView>

      {/* ─── LOGOUT CONFIRMATION MODAL ─────────────────────────────────── */}
      <LogoutModal
        isModalOpen={isLogoutModalOpen}
        onModalOpen={setIsLogoutModalOpen}
      />
    </>
  );
}

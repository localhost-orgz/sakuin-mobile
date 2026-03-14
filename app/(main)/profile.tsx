import React, { useState } from "react"; // Tambah useState ✨
import { ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomProfile from "@/components/Profile/BottomProfile";
import LogoutModal from "@/components/Profile/LogoutModa";
import TopProfile from "@/components/Profile/TopProfile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State modal 🔑

  return (
    <>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <TopProfile />
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

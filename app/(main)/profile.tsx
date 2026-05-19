import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import BottomProfile from "@/components/Profile/BottomProfile";
import LogoutModal from "@/components/Profile/LogoutModa";
import TopProfile from "@/components/Profile/TopProfile";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { apiRequest } from "@/utils/api";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currencyBottomSheet = useRef<BottomSheet>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(
    () => CURRENCY_LIST.find((c) => c.code === "IDR") ?? CURRENCY_LIST[0],
  );

  const openCurrencySheet = () => currencyBottomSheet.current?.expand();
  const closeCurrencySheet = () => currencyBottomSheet.current?.close();

  const handleSelectCurrency = (currency: (typeof CURRENCY_LIST)[0]) => {
    setSelectedCurrency(currency);
    closeCurrencySheet();
  };

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
          selectedCurrency={selectedCurrency}
          onCurrencyPress={openCurrencySheet}
        />
      </ScrollView>

      <CurrencyBottomSheet
        ref={currencyBottomSheet}
        selectedCurrency={selectedCurrency}
        onSelect={handleSelectCurrency}
      />

      <LogoutModal
        isModalOpen={isLogoutModalOpen}
        onModalOpen={setIsLogoutModalOpen}
      />
    </>
  );
}

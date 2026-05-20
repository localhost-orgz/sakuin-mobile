import CurrencyBottomSheet from "@/components/Form/CurrencyBottomSheet";
import BottomProfile from "@/components/Profile/BottomProfile";
import LogoutModal from "@/components/Profile/LogoutModa";
import TopProfile from "@/components/Profile/TopProfile";
import { CURRENCY_LIST } from "@/constants/currencyList";
import { apiRequest } from "@/utils/api";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
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

  const handleSelectCurrency = async (currency: (typeof CURRENCY_LIST)[0]) => {
    setSelectedCurrency(currency);
    closeCurrencySheet();
    try {
      await apiRequest("/auth/profile", {
        method: "PUT",
        body: {
          default_currency: currency.code,
        },
      });
    } catch (err) {
      console.error("Failed to update default currency:", err);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/auth/profile", {
        method: "GET",
      });

      if (res.status === "success" && res.data) {
        setUser(res.data);
        if (res.data.default_currency) {
          const code = typeof res.data.default_currency === "string"
            ? res.data.default_currency
            : res.data.default_currency.code;
          const matched = CURRENCY_LIST.find((c) => c.code === code);
          if (matched) {
            setSelectedCurrency(matched);
          }
        }
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

  return (
    <>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f6fa" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <TopProfile userData={user} loading={loading} />
        {/* Oper fungsi buat buka modal ke komponen bawah kalau perlu */}
        <BottomProfile
          isModalOpen={isLogoutModalOpen}
          onModalOpen={setIsLogoutModalOpen}
          selectedCurrency={selectedCurrency}
          onCurrencyPress={openCurrencySheet}
          loading={loading}
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

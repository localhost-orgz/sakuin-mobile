import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { apiRequest } from "@/utils/api";
import "../global.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!navigationState?.key) return;

    let active = true;

    async function verifyAuth() {
      try {
        const token = await SecureStore.getItemAsync("user_token");
        const inAuthGroup = segments[0] === "(auth)";

        if (!token) {
          if (!inAuthGroup) {
            router.replace("/(auth)/welcome");
          }
          if (active) {
            setChecking(false);
            setVerified(false);
          }
          return;
        }

        // If already verified, we only check if user is in auth group and needs redirecting
        if (verified) {
          if (inAuthGroup) {
            router.replace("/(main)/home");
          }
          if (active) setChecking(false);
          return;
        }

        // Token exists but not verified yet, perform fetch verification check
        try {
          const profile = await apiRequest("/auth/profile");
          if (profile && profile.status === "success") {
            if (active) setVerified(true);
            if (inAuthGroup) {
              router.replace("/(main)/home");
            }
          } else {
            throw new Error("Invalid session profile response");
          }
        } catch (fetchErr) {
          console.error("AuthGuard profile fetch failed:", fetchErr);
          await SecureStore.deleteItemAsync("user_token");
          if (active) setVerified(false);
          if (!inAuthGroup) {
            router.replace("/(auth)/welcome");
          }
        }
      } catch (err) {
        console.error("AuthGuard check error:", err);
      } finally {
        if (active) setChecking(false);
      }
    }

    verifyAuth();

    return () => {
      active = false;
    };
  }, [segments, navigationState?.key, verified]);

  const inAuthGroup = segments[0] === "(auth)";

  if (checking && !inAuthGroup) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(others)" />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}

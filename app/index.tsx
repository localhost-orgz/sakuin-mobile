import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    async function checkToken() {
      try {
        const token = await SecureStore.getItemAsync("user_token");
        setHasToken(!!token);
      } catch (e) {
        console.error("Error reading token in Index:", e);
      } finally {
        setLoading(false);
      }
    }
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  if (hasToken) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

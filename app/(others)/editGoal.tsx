import GoalCard from "@/components/Portfolio/GoalCard"; // ✅ Import component portfolio
import { Check, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WALLET_THEMES } from "../../hooks/useWalletTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EditGoalSheet({
  isVisible,
  onClose,
  initialData,
}: any) {
  const insets = useSafeAreaInsets();
  const walletThemes = WALLET_THEMES;
  // 💡 State dengan dummy pre-filled data
  const [goalName, setGoalName] = useState(
    initialData?.title || "Tabungan Macbook M3",
  );
  const [selectedColor, setSelectedColor] = useState(
    initialData?.themeId || "violet",
  );
  const [goalTarget, setGoalTarget] = useState(
    initialData?.target?.toString() || "",
  );
  const formatNumber = (val: string | number) => {
    const clean = String(val).replace(/[^0-9]/g, "");

    return clean === "" ? "" : parseInt(clean, 10).toLocaleString("id-ID");
  };

  const currentTheme =
    walletThemes[selectedColor as keyof typeof walletThemes] ||
    walletThemes.ocean;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            height: SCREEN_HEIGHT * 0.85, // 📏 Almost full page
            backgroundColor: "white",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 20,
          }}
        >
          {/* --- HANDLE BAR --- */}
          <View className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

          {/* --- HEADER --- */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#1a1f36" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}>
              Edit Goal
            </Text>
            <TouchableOpacity
              onPress={() => {
                alert("Saved!");
                onClose();
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: currentTheme.accentColor,
                }}
              >
                Simpan
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 40,
            }}
          >
            {/* --- 1. PREVIEW GOAL --- */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#9ca3af",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Preview
            </Text>
            <View style={{ marginBottom: 32 }}>
              <GoalCard
                goal={{
                  ...initialData,
                  name: goalName,
                  target: Number(goalTarget),
                  themeId: selectedColor,
                }}
              />
            </View>

            {/* --- 2. INPUT NAMA --- */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#9ca3af",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Nama Goal
            </Text>
            <TextInput
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 16,
                padding: 16,
                fontSize: 16,
                fontWeight: "600",
                color: "#1a1f36",
                borderWidth: 1,
                borderColor: "#f3f4f6",
                marginBottom: 32,
              }}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Mau nabung apa?"
            />

            <Text style={styles.label}>Target Nominal (Rp)</Text>
            <View style={styles.targetInputWrapper}>
              <Text style={styles.currencyPrefix}>Rp</Text>
              <TextInput
                style={styles.targetInput}
                value={formatNumber(goalTarget)}
                onChangeText={(val) =>
                  setGoalTarget(val.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* --- 3. WARNA DINAMIS --- */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#9ca3af",
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Pilih Tema Warna
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {Object.keys(walletThemes).map((themeKey) => {
                const themeData =
                  walletThemes[themeKey as keyof typeof walletThemes];
                const isActive = selectedColor === themeKey;

                return (
                  <TouchableOpacity
                    key={themeKey}
                    onPress={() => setSelectedColor(themeKey)}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: themeData.accentColor,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: isActive ? "#1a1f36" : "transparent",
                      elevation: isActive ? 4 : 0,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    {isActive && (
                      <Check size={24} color="white" strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1a1f36" },
  saveBtn: { fontSize: 16, fontWeight: "700" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9ca3af",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  previewContainer: { marginBottom: 32 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1f36",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 24,
  },

  // Styling khusus input target 💡
  targetInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 32,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1f36",
    marginRight: 8,
  },
  targetInput: {
    flex: 1,
    height: 60,
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1f36",
  },

  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
});

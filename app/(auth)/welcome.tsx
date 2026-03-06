import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const App = () => {
  const data = ["Faza Mumtaz Ramadhan", "J0403241117"];

  return (
    <SafeAreaView style={styles.container}>
      {/* List Baris Oranye */}
      <View style={styles.listContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.text}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Background putih bersih ⚪
  },
  listContainer: {
    marginTop: 10,
  },
  row: {
    backgroundColor: "#FFC34D", // Warna oranye sesuai gambar 🟠
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 5, // Jarak antar baris putih tipis
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "400",
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: "#E6E0F8", // Warna ungu muda FAB 💜
    borderRadius: 15,
    elevation: 8, // Shadow buat Android 🤖
    shadowColor: "#000", // Shadow buat iOS 🍎
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabIcon: {
    fontSize: 30,
    color: "#1D1B20",
  },
});

export default App;

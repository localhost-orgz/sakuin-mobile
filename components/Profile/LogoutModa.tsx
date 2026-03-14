import { AlertCircle } from "lucide-react-native";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const LogoutModal = ({ isModalOpen, onModalOpen }: any) => {
  const handleLogout = () => {
    console.log("User logged out! 💨");
    onModalOpen(false);
    // Tambahin logika navigasi atau clear session di sini 💡
  };
  return (
    <Modal
      visible={isModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onModalOpen(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-6 items-center">
          {/* Icon Warning */}
          <View className="p-2 bg-red-50 rounded-full mb-4">
            <View className="bg-red-100 p-4 rounded-full">
              <AlertCircle size={32} color="#ef4444" strokeWidth={2.5} />
            </View>
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-2">
            Konfirmasi Keluar Akun
          </Text>

          <Text className="text-gray-500 text-center mb-8 leading-5">
            Apakah Anda yakin ingin keluar? Anda perlu memasukkan kembali akun
            untuk mengakses data keuangan pada perangkat ini.{" "}
          </Text>

          <View className="flex-row gap-3 w-full">
            {/* Tombol Batal */}
            <TouchableOpacity
              onPress={() => onModalOpen(false)}
              className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
            >
              <Text className="text-gray-600 font-bold">Batal</Text>
            </TouchableOpacity>

            {/* Tombol Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-1 bg-red-500 py-4 rounded-2xl items-center shadow-sm shadow-red-300"
            >
              <Text className="text-white font-bold">Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

import { router } from "expo-router";
import { Camera, ChevronLeft, Mail, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "@/utils/api";

const EditProfile = () => {
  const insets = useSafeAreaInsets();
  
  // State menyimpan objek user sesuai permintaan
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar_url: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Ambil data profil saat ini (GET /auth/profile)
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const res = await apiRequest("/auth/profile", { method: "GET" });
        if (res.status === "success" && res.data) {
          setUser({
            name: res.data.name || "",
            email: res.data.email || "",
            avatar_url: res.data.avatar_url || ""
          });
        }
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil data profil");
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentProfile();
  }, []);

  // Simpan perubahan profil (PUT /auth/profile)
  const handleSave = async () => {
    if (!user.name) {
      return Alert.alert("Error", "Nama tidak boleh kosong");
    }

    try {
      setLoading(true);
      // Menggunakan endpoint /auth/profile sesuai log API terbaru
      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: { 
          name: user.name 
        },
      });

      if (res.status === "success") {
        Alert.alert("Sukses", "Profil berhasil diperbarui", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      Alert.alert("Error", "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8f9fd]">
        <ActivityIndicator size="large" color="#00bf71" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f8f9fd]"
    >
      {/* ─── HEADER SECTION ─────────────────────────────────────────── */}
      <View
        className="bg-[#00bf71] px-6 pb-10 rounded-b-[32px] shadow-xl shadow-[#00bf71]/20"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
          >
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Edit Profile</Text>
          <View className="w-10" />
        </View>

        {/* ─── AVATAR EDIT SECTION ───────────────────────────────────── */}
        <View className="items-center">
          <View className="relative shadow-2xl shadow-black/30">
            <View className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-[3px] border-white">
              {user.avatar_url && !avatarError ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View className="w-full h-full bg-gray-400 items-center justify-center">
                  <Text className="text-4xl font-bold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white items-center justify-center shadow-md shadow-black/20"
            >
              <View className="w-8 h-8 rounded-full bg-gray-900 items-center justify-center">
                <Camera size={16} color="white" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── FORM INPUT SECTION ─────────────────────────────────────── */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-6">
          <View>
            <View className="flex-row items-center mb-3 ml-1">
              <User size={14} color="#00bf71" />
              <Text className="text-gray-400 text-[11px] font-black ml-2 uppercase tracking-widest">
                Nama Lengkap
              </Text>
            </View>
            <TextInput
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
              placeholder="Masukkan nama kamu"
              className="bg-white px-5 py-4 rounded-2xl text-gray-800 font-semibold border border-gray-50"
            />
          </View>

          <View>
            <View className="flex-row items-center mb-3 ml-1">
              <Mail size={14} color="#00bf71" />
              <Text className="text-gray-400 text-[11px] font-black ml-2 uppercase tracking-widest">
                Alamat Email
              </Text>
            </View>
            <TextInput
              editable={false}
              value={user.email}
              className="bg-gray-100 px-5 py-4 rounded-2xl text-gray-400 font-semibold border border-gray-200"
            />
            <Text className="text-[10px] text-gray-400 mt-2 ml-1 italic">
              * Email tidak dapat diubah
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className={`mt-12 py-5 rounded-2xl items-center shadow-lg ${loading ? 'bg-gray-400' : 'bg-[#00bf71] shadow-[#00bf71]/40'}`}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">
              Simpan Perubahan
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
import { router } from "expo-router";
import { Camera, ChevronLeft, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import {
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

const EditProfile = () => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("blablabla@gmail.com");
  const [avatarError, setAvatarError] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f8f9fd]" // Sedikit lebih terang biar shadow kontras
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/0"
          >
            {/* <Check size={22} color="white" /> */}
          </TouchableOpacity>
        </View>

        {/* ─── AVATAR EDIT SECTION ───────────────────────────────────── */}
        <View className="items-center">
          <View className="relative shadow-2xl shadow-black/30">
            <View className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-[3px] border-white">
              {!avatarError ? (
                <Image
                  source={require("../../../assets/images/profile.jpg")}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View className="w-full h-full bg-gray-400 items-center justify-center">
                  <Text className="text-4xl font-bold text-white">U</Text>
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
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama kamu"
              placeholderTextColor="#a0a0a0"
              className="bg-white px-5 py-4 rounded-2xl text-gray-800 font-semibold shadow-sm shadow-black/5 border border-gray-50"
              style={{ elevation: 2 }} // Khusus Android biar dapet shadow halus
            />
          </View>
          {/* Input Email */}
          <View>
            <View className="flex-row items-center mb-3 ml-1">
              <Mail size={14} color="#00bf71" />
              <Text className="text-gray-400 text-[11px] font-black ml-2 uppercase tracking-widest">
                Alamat Email
              </Text>
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nama@email.com"
              placeholderTextColor="#a0a0a0"
              className="bg-white px-5 py-4 rounded-2xl text-gray-800 font-semibold shadow-sm shadow-black/5 border border-gray-50"
              style={{ elevation: 2 }}
            />
          </View>
        </View>

        {/* ─── SAVE BUTTON ──────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-[#00bf71] mt-12 py-5 rounded-2xl items-center shadow-lg shadow-[#00bf71]/40"
          style={{ elevation: 8 }}
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-lg tracking-wide">
            Simpan Perubahan
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

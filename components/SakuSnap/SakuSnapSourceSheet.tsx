import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SakuSnapSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const SakuSnapSourceSheet = ({ visible, onClose }: SakuSnapSourceSheetProps) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const handleTakePhoto = () => {
    onClose();
    router.push("/(others)/(transaction)/sakuSnap");
  };

  const handlePickGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Izin galeri diperlukan",
        "Aktifkan akses galeri untuk memilih foto struk.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    onClose();
    router.push({
      pathname: "/(others)/(transaction)/sakuSnap",
      params: { imageUri: result.assets[0].uri },
    });
  };

  const OptionButton = ({
    icon: Icon,
    label,
    subtitle,
    onPress,
  }: {
    icon: typeof Camera;
    label: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-1 flex-col items-center bg-gray-50 p-5 rounded-2xl border border-gray-100 gap-3"
    >
      <View className="bg-[#00bf71]/10 p-3 rounded-xl">
        <Icon size={24} color="#00bf71" strokeWidth={2.5} />
      </View>
      <View className="items-center">
        <Text className="text-gray-900 font-bold text-base">{label}</Text>
        <Text className="text-gray-400 text-xs text-center mt-1">{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(15,23,42,0.5)",
          opacity: backdropOpacity,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="bg-white rounded-t-[32px] px-6 pt-4 pb-12 shadow-2xl">
          <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-slate-900">SakuSnap</Text>
              <Text className="text-gray-400 font-medium mt-1">
                Pilih cara upload struk kamu
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 p-2 rounded-full"
            >
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <OptionButton
              icon={ImageIcon}
              label="Galeri"
              subtitle="Pilih dari perangkat"
              onPress={handlePickGallery}
            />
            <OptionButton
              icon={Camera}
              label="Ambil Foto"
              subtitle="Buka kamera SakuSnap"
              onPress={handleTakePhoto}
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default SakuSnapSourceSheet;

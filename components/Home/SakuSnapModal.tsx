import { Link } from "expo-router";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- SAKU SNAP MODAL COMPONENT ---
const SakuSnapModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const slideAnim = React.useRef(new Animated.Value(400)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
  }, [visible]);

  const MenuButton = ({
    icon: Icon,
    label,
    href,
  }: {
    icon: any;
    label: string;
    href: string;
  }) => (
    <Link href={href as any} asChild onPress={onClose}>
      <TouchableOpacity
        activeOpacity={0.7}
        className="w-1/2 flex-col items-center justify-center bg-gray-50 p-5 rounded-2xl gap-3 mb-3 border border-gray-100"
      >
        <View className="bg-[#00bf71]/10 p-3 rounded-xl mr-4">
          <Icon size={22} color="#00bf71" strokeWidth={2.5} />
        </View>
        <Text className="text-gray-800 font-semibold text-md">{label}</Text>
      </TouchableOpacity>
    </Link>
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
          <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center self-center mb-6" />

          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-semibold text-slate-900">
                SakuSnap
              </Text>
              <Text className="text-gray-400 font-medium">
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

          <View className="flex flex-row items-center gap-3 mt-3">
            <MenuButton
              icon={ImageIcon}
              label="Image from Device"
              href="/(main)/home"
            />
            <MenuButton
              icon={Camera}
              label="Take a Photo"
              href="/(main)/home"
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default SakuSnapModal;

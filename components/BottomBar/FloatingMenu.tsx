import { Href, Link } from "expo-router";
import {
  ArrowLeftRight,
  Camera,
  Mic,
  NotebookPen,
} from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

type FloatingMenuProps = {
  onClose: () => void;
  onOpenSakuSnap: () => void;
};

const OTHER_MENU_ITEMS: {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: Href;
}[] = [
  {
    id: "voice",
    icon: <Mic size={18} color="#111827" />,
    label: "SakuVoice",
    href: "/(others)/(transaction)/sakuVoice",
  },
  {
    id: "manual",
    icon: <NotebookPen size={18} color="#111827" />,
    label: "Manual Input",
    href: "/(others)/(transaction)/addForm",
  },
  {
    id: "transfer",
    icon: <ArrowLeftRight size={18} color="#111827" />,
    label: "Transfer",
    href: "/(others)/(transaction)/transferForm",
  },
];

const FloatingMenu = ({ onClose, onOpenSakuSnap }: FloatingMenuProps) => {
  return (
    <View className="absolute w-[170px] p-1 left-1/2 -translate-x-1/2 -top-[188px] bg-white border border-gray-200 rounded-xl gap-0.5 shadow-[0px_10px_20px_rgba(0,0,0,0.15)] z-50">
      <Pressable
        onPress={() => {
          onClose();
          onOpenSakuSnap();
        }}
        className="gap-2.5 px-3 py-2.5 rounded-lg flex-row items-center active:bg-gray-100"
      >
        <Camera size={18} color="#111827" />
        <Text className="text-sm font-semibold text-[#111827]">SakuSnap</Text>
      </Pressable>

      {OTHER_MENU_ITEMS.map((item) => (
        <Link key={item.id} href={item.href} asChild>
          <Pressable
            onPress={onClose}
            className="gap-2.5 px-3 py-2.5 rounded-lg flex-row items-center active:bg-gray-100"
          >
            {item.icon}
            <Text className="text-sm font-semibold text-[#111827]">
              {item.label}
            </Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
};

export default FloatingMenu;

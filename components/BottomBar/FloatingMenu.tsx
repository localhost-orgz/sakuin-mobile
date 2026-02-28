import { CloudUpload, Mic, NotebookPen } from "lucide-react-native";
import { Text, View } from "react-native";

const FloatingMenu = () => {
  const menuItems = [
    {
      id: "voice",
      icon: <Mic size={18} />,
      label: "Voice-to-Note",
      active: false,
    },
    {
      id: "upload",
      icon: <CloudUpload size={18} />,
      label: "Upload",
      active: true,
    },
    {
      id: "manual",
      icon: <NotebookPen size={18} />,
      label: "Manual",
      active: false,
    },
  ];

  return (
    <View className="absolute w-[150px] p-1 left-1/2 -translate-x-1/2 -top-[140px] bg-white border border-gray-200 rounded-lg gap-1 shadow-[0px_10px_20px_rgba(0,0,0,0.15)]">
      {menuItems.map((item, index) => (
        <View
          key={item.id}
          className={`gap-2 p-2 rounded-md flex-row items-center ${item.active ? "bg-black/10" : ""}`}
        >
          {item.icon}
          <Text className="text-md">{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default FloatingMenu;

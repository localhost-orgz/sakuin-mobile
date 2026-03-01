import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, WalletMinimal } from "lucide-react-native";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

const WalletCard = ({ item, isBalanceShow, onBalanceShow }: any) => {
  return (
    <View style={{ width: CARD_WIDTH, height: 180 }}>
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 15,
          padding: 20,
        }}
      >
        <View className="flex flex-row items-center gap-2">
          <View className="p-2.5 self-start bg-white/10 rounded-lg">
            <WalletMinimal color={"white"} />
          </View>
          <View className="flex">
            <Text className="text-white font-semibold text-[20px]">
              {item.bank}
            </Text>
            <Text className="text-white/30">{item.type}</Text>
          </View>
        </View>

        <View className="flex mt-5 gap-1.5">
          <Text className="uppercase text-sm tracking-widest font-semibold text-white/20">
            Balance
          </Text>
          <View className="flex flex-row items-center gap-4">
            <View className="flex flex-row gap-1">
              <Text className="text-white text-xl font-medium self-end">
                Rp
              </Text>
              <Text className="text-white text-3xl font-semibold">
                {isBalanceShow ? item.balance : "•••••••••"}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onBalanceShow(!isBalanceShow)}
            >
              {isBalanceShow ? (
                <Eye color={"white"} strokeWidth={1.5} />
              ) : (
                <EyeOff color={"white"} strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-md text-white/30 mt-2">
          {`Total Transactions This Month: Rp${isBalanceShow ? item.transactions : "•••••"}`}
        </Text>
      </LinearGradient>

      {/* accent glow */}
      <LinearGradient
        colors={[item.accentColor, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 130,
          height: 130,
          borderBottomLeftRadius: 130,
          borderTopEndRadius: 15,
        }}
      />
    </View>
  );
};

export default WalletCard;

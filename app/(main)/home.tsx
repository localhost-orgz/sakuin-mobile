import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, WalletMinimal } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [isBalanceShow, setIsBalanceShow] = useState(false);
  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <View className="w-full h-[330px] absolute top-0 left-0">
          <LinearGradient
            colors={["#00bc7d", "#00bc7d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderBottomStartRadius: 20,
              borderBottomEndRadius: 20,
            }}
          />
        </View>

        {/* SafeAreaView with top excluded so content respects safe area but gradient bleeds through */}
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          {/* greeting and profile */}
          <View className="flex flex-row items-center justify-between">
            <View className="flex gap-0.5">
              <Text className="text-[24px] text-white font-bold">Hi, User</Text>
              <Text className="text-[16px] text-white/50">welcome back</Text>
            </View>
            <View className="h-[40px] w-[40px] rounded-full bg-black"></View>
          </View>

          {/* card */}
          <View className="w-full h-[180px] mt-5">
            <LinearGradient
              colors={["#1a1f36", "#252b48"]}
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
                    Mandiri
                  </Text>
                  <Text className="text-white/30">Wallet</Text>
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
                      {isBalanceShow ? "3.324.522,02" : "•••••••••"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsBalanceShow(!isBalanceShow)}
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
                {`Total Transactions This Month: Rp${isBalanceShow ? "323.000" : "•••••"}`}
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={["rgba(81, 162, 255, 0.8)", "transparent"]}
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
        </SafeAreaView>
      </View>
    </>
  );
}

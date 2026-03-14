import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

function AnimatedBubble({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 60, // controls stiffness — lower = softer bounce
        friction: 8, // controls damping — higher = less oscillation
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}

export default function SignIn() {
  return (
    <>
      <LinearGradient
        colors={["#c4f5e6", "#ffffff"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        locations={[0, 0.45, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-1 items-center justify-start mt-[150px] gap-[60px]">
        <View>
          {/* Row 1 — avatar + first bubble */}
          <View className="flex flex-row items-center -mb-10 ml-5">
            <AnimatedBubble delay={0}>
              <Image source={require("../../assets/images/auth-image1.png")} />
            </AnimatedBubble>
            <AnimatedBubble delay={120}>
              <View className="bg-white border py-3 px-7 -ml-[13px] rounded-full border-gray-500">
                <Text className="text-sm font-medium">Hi, Welcome Back</Text>
              </View>
            </AnimatedBubble>
          </View>

          {/* Row 2 — second bubble + avatar */}
          <View className="flex flex-row items-center justify-end gap-3 mr-5">
            <AnimatedBubble delay={280}>
              <View className="bg-white border py-3 px-7 rounded-full border-gray-500">
                <Text className="text-sm font-medium">
                  Hello again, Sakuin!
                </Text>
              </View>
            </AnimatedBubble>
            <AnimatedBubble delay={160}>
              <Image source={require("../../assets/images/auth-image2.png")} />
            </AnimatedBubble>
          </View>
        </View>

        {/* Bottom section */}
        <AnimatedBubble delay={420}>
          <View className="items-center gap-3">
            <Text className="text-xl font-bold">Ready to dive in?</Text>
            <Pressable className="w-full">
              {({ pressed }) => (
                <View
                  className={`
                    flex-row items-center justify-center 
                    rounded-2xl border border-gray-200 py-3 px-4 
                    ${pressed ? "bg-gray-100" : "bg-white"} 
                  `}
                  style={{ elevation: pressed ? 0 : 2 }}
                >
                  <Image
                    source={{
                      uri: "https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Logo-google-icon-PNG.png",
                    }}
                    style={{ width: 20, height: 20, marginRight: 6 }}
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 font-semibold text-md">
                    Continue with Google
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </AnimatedBubble>
      </View>
    </>
  );
}

import { CURRENT_GOALS } from "@/constants/goalsList";
import { WALLET_LIST } from "@/constants/walletList";
import { Eye, EyeOff, Target, Wallet } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TotalBalance = ({ isBalanceShow, onBalanceShow }: any) => {
  const walletCount = WALLET_LIST.length;
  const completedGoals = CURRENT_GOALS.filter(
    (g: any) => g.current >= g.target,
  ).length;
  const totalGoals = CURRENT_GOALS.length;
  const goalsPercent = Math.round((completedGoals / totalGoals) * 100);

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: -24,
        borderRadius: 15,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        overflow: "hidden",
      }}
    >
      <View style={{ padding: 20, gap: 16 }}>
        {/* Label + eye toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#9ca3af",
            }}
          >
            Total Simpanan
          </Text>
          <Pressable
            onPress={() => onBalanceShow(!isBalanceShow)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: "#f3f4f6",
            }}
          >
            {isBalanceShow ? (
              <Eye size={14} color="#6b7280" />
            ) : (
              <EyeOff size={14} color="#6b7280" />
            )}
          </Pressable>
        </View>

        {/* Balance */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#9ca3af",
              marginBottom: 4,
            }}
          >
            Rp
          </Text>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#1a1f36",
              letterSpacing: -0.5,
            }}
          >
            {isBalanceShow ? "16.674.522" : "•••••••••"}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#f3f4f6" }} />

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Wallets */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#f0fdf8",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#d1fae5",
            }}
          >
            <View
              style={{
                backgroundColor: "#00bf71",
                borderRadius: 10,
                padding: 7,
              }}
            >
              <Wallet size={14} color="white" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Wallets
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}
              >
                {walletCount}
                <Text
                  style={{ fontSize: 12, fontWeight: "500", color: "#9ca3af" }}
                >
                  {" "}
                  linked
                </Text>
              </Text>
            </View>
          </View>

          {/* Goals */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#f0fdf8",
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: "#d1fae5",
              gap: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  backgroundColor: "#00bf71",
                  borderRadius: 10,
                  padding: 7,
                }}
              >
                <Target size={14} color="white" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Goals
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#1a1f36" }}
                >
                  {completedGoals}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#9ca3af",
                    }}
                  >
                    /{totalGoals} done
                  </Text>
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View
              style={{
                height: 5,
                backgroundColor: "#d1fae5",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${goalsPercent}%`,
                  height: "100%",
                  backgroundColor: "#00bf71",
                  borderRadius: 99,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TotalBalance;

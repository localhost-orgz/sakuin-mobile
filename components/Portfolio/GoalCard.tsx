import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import React from "react";
import { Text, View } from "react-native";

const GoalCard = ({ goal, isBalanceShow, onBalanceShow }: any) => {
  const { theme } = useWalletTheme(goal.themeId as WalletThemeId);
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = percentage >= 100;

  const formatAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}Jt`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toString();
  };
  return (
    <View
      key={goal.id}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.09,
        shadowRadius: 3,
        elevation: 5,
        backgroundColor: theme.bgColor,
      }}
      className="w-[48%] p-4 relative rounded-3xl mb-5 flex justify-between"
    >
      {/* icon and name */}
      <View style={{ gap: 5 }}>
        <View>
          <View className="flex flex-row items-start justify-between">
            <View
              style={{ backgroundColor: theme.iconBgColor }}
              className="rounded-full justify-center items-center h-[48px] w-[48px]"
            >
              <Text className="text-lg">{goal.icon}</Text>
            </View>
            <Text
              className="font-bold text-lg"
              style={{ color: theme.accentColor }}
            >
              {`${percentage.toFixed(0)}%`}
            </Text>
          </View>
          <Text className="text-lg font-bold mt-2">{goal.name}</Text>
        </View>
        {/* balance and bar */}
        <View className="gap-1.5">
          <View className="flex flex-row items-end">
            <Text className="text-sm font-bold">
              Rp{formatAmount(goal.current)}
            </Text>
            <Text className="text-xs font-semibold mt-2">
              /Rp{formatAmount(goal.target)}
            </Text>
          </View>
          <View>
            <View
              style={{
                height: 5,
                backgroundColor: "#fff",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: isCompleted ? "#00BC7D" : theme.accentColor,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GoalCard;

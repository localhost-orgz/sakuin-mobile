import { Text, TouchableOpacity, View } from "react-native";

const CardGoals = ({ goal }: any) => {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = percentage >= 100;

  const formatAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}Jt`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toString();
  };
  return (
    <TouchableOpacity
      key={goal.id}
      activeOpacity={0.8}
      style={{
        width: 250,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        padding: 16,
        shadowColor: "#9ca3af",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
        gap: 12,
      }}
    >
      {/* Icon + Name */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 7,
            backgroundColor: goal.bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>{goal.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#1a1f36",
            }}
            numberOfLines={1}
          >
            {goal.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginTop: 1,
            }}
          >
            {isCompleted ? "✅ Completed" : `${percentage.toFixed(0)}% done`}
          </Text>
        </View>
      </View>

      {/* Balances */}
      <View style={{ gap: 3 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "#9ca3af",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Saved
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "#9ca3af",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Target
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: goal.accentColor,
            }}
          >
            Rp{formatAmount(goal.current)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#6b7280",
            }}
          >
            Rp{formatAmount(goal.target)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View>
        <View
          style={{
            height: 7,
            backgroundColor: "#f3f4f6",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${percentage}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: isCompleted ? "#00BC7D" : goal.accentColor,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CardGoals;

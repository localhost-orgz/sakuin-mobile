import useWalletTheme, { WalletThemeId } from "@/hooks/useWalletTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, WalletMinimal } from "lucide-react-native";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

const WalletCard = ({ item, isBalanceShow, onBalanceShow }: any) => {
  // const { theme } = useWalletTheme(item.themeId);

  const { theme } = useWalletTheme(
    (item.color.toLowerCase() as WalletThemeId) || "ocean",
  );

  const isDark =
    theme.gradientColors[0].startsWith("#0") ||
    theme.gradientColors[0].startsWith("#1") ||
    theme.gradientColors[0].startsWith("#2") ||
    theme.gradientColors[0].startsWith("#3");

  const textPrimary = isDark ? "white" : theme.textColor;
  const textMuted = isDark ? "rgba(255,255,255,0.35)" : `${theme.textColor}88`;
  const iconBg = isDark ? "rgba(255,255,255,0.10)" : `${theme.textColor}18`;

  // Blob color — on dark cards use white blobs, on light cards use the accent color
  const blobColor = isDark
    ? "rgba(255,255,255,0.07)"
    : `${theme.shadowColor}22`;
  const blobColorStrong = isDark
    ? "rgba(255,255,255,0.11)"
    : `${theme.shadowColor}38`;

  const transactionList = Array.isArray(item.transactions)
    ? item.transactions
    : [];
  const totalExpenseAmount = transactionList
    .filter((tx: any) => tx.type === "expense")
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  const formattedExpense = new Intl.NumberFormat("id-ID").format(
    totalExpenseAmount,
  );

  const formattedBalance = new Intl.NumberFormat("id-ID").format(item.balance);

  return (
    <View style={{ width: CARD_WIDTH, height: 180 }}>
      <LinearGradient
        colors={theme.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          justifyContent: "center",
          gap: 5,
          borderRadius: 15,
          padding: 18,
          overflow: "hidden",
        }}
      >
        {/* ── BLOB ACCENTS ────────────────────── ──────────── */}

        {/* Large blob — bottom right */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: blobColorStrong,
            bottom: -40,
            right: -30,
          }}
        />

        {/* Medium blob — overlapping large */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: blobColor,
            bottom: 10,
            right: 60,
          }}
        />

        {/* Small blob — top right floating */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: blobColorStrong,
            top: 18,
            right: 24,
          }}
        />

        {/* Tiny blob — mid right */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: blobColor,
            top: 72,
            right: 52,
          }}
        />

        {/* ── CONTENT ─────────────────────────────────────── */}

        {/* Bank + type */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{ padding: 8, backgroundColor: iconBg, borderRadius: 10 }}
          >
            <WalletMinimal color={textPrimary} />
          </View>
          <View>
            <Text
              style={{ color: textPrimary, fontWeight: "700", fontSize: 20 }}
            >
              {item.name}
            </Text>
            <Text style={{ color: textMuted, fontSize: 13 }}>Wallet</Text>
          </View>
        </View>

        <View>
          {/* Balance */}
          <View style={{ marginTop: 20, gap: 1 }}>
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 12,
                letterSpacing: 1,
                fontWeight: "600",
                color: textMuted,
              }}
            >
              Balance
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 18,
                    fontWeight: "500",
                    alignSelf: "flex-end",
                  }}
                >
                  Rp
                </Text>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 26,
                    fontWeight: "700",
                  }}
                >
                  {isBalanceShow ? formattedBalance : "•••••••••"}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onBalanceShow(!isBalanceShow)}
              >
                {isBalanceShow ? (
                  <Eye color={textPrimary} strokeWidth={1.5} />
                ) : (
                  <EyeOff color={textPrimary} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions */}
          <Text style={{ fontSize: 12, color: textMuted, marginTop: 8 }}>
            {`Total Transactions This Month: Rp${isBalanceShow ? formattedExpense : "•••••"}`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export const WalletCardSkeleton = () => {
  return (
    <View style={{ width: CARD_WIDTH, height: 180, borderRadius: 15, backgroundColor: "#ffffff", padding: 18, justifyContent: "center", gap: 5, borderWidth: 1, borderColor: "#e2e8f0" }}>
      {/* Bank + type */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Skeleton width={40} height={40} borderRadius={10} style={{ backgroundColor: "#cbd5e1" }} />
        <View style={{ gap: 4 }}>
          <Skeleton width={120} height={20} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
          <Skeleton width={60} height={12} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
        </View>
      </View>

      <View style={{ gap: 5 }}>
        {/* Balance */}
        <View style={{ marginTop: 20, gap: 6 }}>
          <Skeleton width={50} height={10} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          <Skeleton width={180} height={28} borderRadius={6} style={{ backgroundColor: "#cbd5e1" }} />
        </View>

        {/* Transactions */}
        <Skeleton width={220} height={12} borderRadius={3} style={{ backgroundColor: "#cbd5e1", marginTop: 8 }} />
      </View>
    </View>
  );
};

export default WalletCard;

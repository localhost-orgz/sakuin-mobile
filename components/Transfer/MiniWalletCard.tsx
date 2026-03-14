import useWalletTheme from "@/hooks/useWalletTheme";
import { LinearGradient } from "expo-linear-gradient";
import { WalletMinimal } from "lucide-react-native";
import { Dimensions, Text, View } from "react-native";

// Import WalletThemeId type
import type { WalletThemeId } from "@/hooks/useWalletTheme";

// ─── Wallet Theme (mirrors useWalletTheme hook) ───────────────────────────────

const { width } = Dimensions.get("window");
const CARD_W = width - 80;

// ─── Mini Wallet Card (reuses WalletCard blob aesthetic) ──────────────────────
const MiniWalletCard = ({
  wallet,
  height = 150,
}: {
  wallet: any;
  height?: number;
}) => {
  // const theme = THEMES[wallet.themeId] ?? THEMES.green;
  const { theme } = useWalletTheme(wallet.themeId as WalletThemeId);

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

  return (
    <LinearGradient
      colors={theme.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        padding: 18,
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* blobs */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: blobColorStrong,
          bottom: -30,
          right: -20,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: blobColorStrong,
          bottom: 15,
          right: 55,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: blobColor,
          top: 14,
          right: 20,
        }}
      />

      {/* bank + type */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            padding: 7,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 9,
          }}
        >
          <WalletMinimal color={textPrimary} size={16} />
        </View>
        <View>
          <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 17 }}>
            {wallet.bank}
          </Text>
          <Text style={{ color: textPrimary, fontSize: 12 }}>
            {wallet.type}
          </Text>
        </View>
      </View>

      {/* balance */}
      <View>
        <Text
          style={{
            color: textMuted,
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          Balance
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 2,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              color: textPrimary,
              fontWeight: "500",
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            Rp
          </Text>
          <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 22 }}>
            {wallet.balance}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default MiniWalletCard;

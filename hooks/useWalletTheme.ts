import { useMemo } from "react";

export type WalletThemeId =
  | "ocean"
  | "forest"
  | "ember"
  | "violet"
  | "indigo"
  | "rose"
  | "mint"
  | "peach"
  | "sky"
  | "lavender"
  | "blush"
  | "sand";

export type WalletColorKey =
  | "bgColor"
  | "shadowColor"
  | "textColor"
  | "accentColor";

export interface WalletTheme {
  id: WalletThemeId;
  label: string;
  gradientColors: [string, string];
  accentColor: string;
  bgColor: string;
  shadowColor: string;
  textColor: string;
  cardColor: string;
  cardColorBack: string;
  iconBgColor: string;
}

export interface UseWalletThemeReturn {
  theme: WalletTheme;
  getColor: (colorKey: WalletColorKey) => string;
  gradient: (direction?: string) => string;
  allThemeIds: WalletThemeId[];
}

export const WALLET_THEMES: Record<WalletThemeId, WalletTheme> = {
  // 🆕 Mint — fresh, airy, on-brand with the app's #00bf71 green
  peach: {
    id: "peach",
    label: "Peach",
    gradientColors: ["#fff7f2", "#ffe8d6"],
    accentColor: "rgba(249, 115, 22, 0.9)",
    bgColor: "#fff7f2",
    shadowColor: "#f97316",
    textColor: "#b8440a",
    cardColor: "#f97316",
    cardColorBack: "#c2410c",
    iconBgColor: "#ffe8d6",
  },

  sky: {
    id: "sky",
    label: "Sky",
    gradientColors: ["#f0f9ff", "#d0eeff"],
    accentColor: "rgba(14, 165, 233, 0.9)",
    bgColor: "#f0f9ff",
    shadowColor: "#0ea5e9",
    textColor: "#0369a1",
    cardColor: "#0ea5e9",
    cardColorBack: "#0284c7",
    iconBgColor: "#d0eeff",
  },

  lavender: {
    id: "lavender",
    label: "Lavender",
    gradientColors: ["#faf5ff", "#ead5ff"],
    accentColor: "rgba(168, 85, 247, 0.9)",
    bgColor: "#faf5ff",
    shadowColor: "#a855f7",
    textColor: "#6b21a8",
    cardColor: "#a855f7",
    cardColorBack: "#7e22ce",
    iconBgColor: "#ead5ff",
  },

  blush: {
    id: "blush",
    label: "Blush",
    gradientColors: ["#fff1f2", "#ffd6db"],
    accentColor: "rgba(244, 63, 94, 0.9)",
    bgColor: "#fff1f2",
    shadowColor: "#f43f5e",
    textColor: "#9f1239",
    cardColor: "#f43f5e",
    cardColorBack: "#be123c",
    iconBgColor: "#ffd6db",
  },

  sand: {
    id: "sand",
    label: "Sand",
    gradientColors: ["#fffbeb", "#fde68a"],
    accentColor: "rgba(234, 179, 8, 0.9)",
    bgColor: "#fffbeb",
    shadowColor: "#eab308",
    textColor: "#854d0e",
    cardColor: "#eab308",
    cardColorBack: "#a16207",
    iconBgColor: "#fde68a",
  },

  mint: {
    id: "mint",
    label: "Mint",
    gradientColors: ["#e8faf2", "#c6f6e0"], // very light green, almost white-green
    accentColor: "rgba(0, 191, 113, 0.9)",
    bgColor: "#f0fdf8",
    shadowColor: "#00bf71",
    textColor: "#00845f",
    cardColor: "#00bf71", // brand green for the card face
    cardColorBack: "#009958", // slightly deeper for the back layer
    iconBgColor: "#d1fae5",
  },

  ocean: {
    id: "ocean",
    label: "Ocean",
    gradientColors: ["#0c2233", "#0f3a52"],
    accentColor: "rgba(14, 165, 233, 0.85)",
    bgColor: "#F0F9FF",
    shadowColor: "#0ea5e9",
    textColor: "#0369a1",
    cardColor: "#1A9FD4",
    cardColorBack: "#0F6A93",
    iconBgColor: "#D6F0FF",
  },
  forest: {
    id: "forest",
    label: "Forest",
    gradientColors: ["#0a2218", "#0d3324"],
    accentColor: "rgba(34, 197, 94, 0.85)",
    bgColor: "#F0FDF4",
    shadowColor: "#22c55e",
    textColor: "#15803d",
    cardColor: "#1DB954",
    cardColorBack: "#117A38",
    iconBgColor: "#D7F5E4",
  },
  ember: {
    id: "ember",
    label: "Ember",
    gradientColors: ["#2a1200", "#3d1f08"],
    accentColor: "rgba(249, 115, 22, 0.85)",
    bgColor: "#FFF4E5",
    shadowColor: "#f97316",
    textColor: "#c2410c",
    cardColor: "#E8620A",
    cardColorBack: "#A84208",
    iconBgColor: "#FFE2C2",
  },
  violet: {
    id: "violet",
    label: "Violet",
    gradientColors: ["#1a0a2e", "#280f45"],
    accentColor: "rgba(168, 85, 247, 0.85)",
    bgColor: "#FDF4FF",
    shadowColor: "#a855f7",
    textColor: "#7e22ce",
    cardColor: "#7B3FD4",
    cardColorBack: "#4E1F96",
    iconBgColor: "#F4D8FF",
  },
  indigo: {
    id: "indigo",
    label: "Indigo",
    gradientColors: ["#0f0f2e", "#181840"],
    accentColor: "rgba(99, 102, 241, 0.85)",
    bgColor: "#EEF2FF",
    shadowColor: "#6366f1",
    textColor: "#4338ca",
    cardColor: "#4F52E0",
    cardColorBack: "#2D2FA8",
    iconBgColor: "#D9DEFF",
  },
  rose: {
    id: "rose",
    label: "Rose",
    gradientColors: ["#2a0a12", "#3d0f1c"],
    accentColor: "rgba(244, 63, 94, 0.85)",
    bgColor: "#FFF1F2",
    shadowColor: "#f43f5e",
    textColor: "#be123c",
    cardColor: "#E8244A",
    cardColorBack: "#A3122E",
    iconBgColor: "#FFD6DB",
  },
};

const FALLBACK_THEME = WALLET_THEMES.ocean;

export const getWalletTheme = (themeId: WalletThemeId): WalletTheme =>
  WALLET_THEMES[themeId] ?? FALLBACK_THEME;

export const getWalletColor = (
  themeId: WalletThemeId,
  colorKey: WalletColorKey,
): string => getWalletTheme(themeId)[colorKey];

export const getWalletGradient = (
  themeId: WalletThemeId,
  direction: string = "135deg",
): string => {
  const { gradientColors } = getWalletTheme(themeId);
  return `linear-gradient(${direction}, ${gradientColors[0]}, ${gradientColors[1]})`;
};

export const getWalletThemeIds = (): WalletThemeId[] =>
  Object.keys(WALLET_THEMES) as WalletThemeId[];

const useWalletTheme = (themeId: WalletThemeId): UseWalletThemeReturn => {
  const theme = useMemo(() => getWalletTheme(themeId), [themeId]);

  const getColor = useMemo(
    () =>
      (colorKey: WalletColorKey): string =>
        theme[colorKey],
    [theme],
  );

  const gradient = useMemo(
    () =>
      (direction: string = "135deg"): string =>
        `linear-gradient(${direction}, ${theme.gradientColors[0]}, ${theme.gradientColors[1]})`,
    [theme],
  );

  return {
    theme,
    getColor,
    gradient,
    allThemeIds: getWalletThemeIds(),
  };
};

export default useWalletTheme;

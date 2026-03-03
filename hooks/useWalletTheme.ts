import { useMemo } from "react";

export type WalletThemeId =
  | "ocean"
  | "forest"
  | "ember"
  | "violet"
  | "indigo"
  | "rose";

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
}

export interface UseWalletThemeReturn {
  theme: WalletTheme;
  getColor: (colorKey: WalletColorKey) => string;
  gradient: (direction?: string) => string;
  allThemeIds: WalletThemeId[];
}

export const WALLET_THEMES: Record<WalletThemeId, WalletTheme> = {
  ocean: {
    id: "ocean",
    label: "Ocean",
    gradientColors: ["#0c2233", "#0f3a52"],
    accentColor: "rgba(14, 165, 233, 0.85)",
    bgColor: "#F0F9FF",
    shadowColor: "#0ea5e9",
    textColor: "#0369a1",
  },
  forest: {
    id: "forest",
    label: "Forest",
    gradientColors: ["#0a2218", "#0d3324"],
    accentColor: "rgba(34, 197, 94, 0.85)",
    bgColor: "#F0FDF4",
    shadowColor: "#22c55e",
    textColor: "#15803d",
  },
  ember: {
    id: "ember",
    label: "Ember",
    gradientColors: ["#2a1200", "#3d1f08"],
    accentColor: "rgba(249, 115, 22, 0.85)",
    bgColor: "#FFF4E5",
    shadowColor: "#f97316",
    textColor: "#c2410c",
  },
  violet: {
    id: "violet",
    label: "Violet",
    gradientColors: ["#1a0a2e", "#280f45"],
    accentColor: "rgba(168, 85, 247, 0.85)",
    bgColor: "#FDF4FF",
    shadowColor: "#a855f7",
    textColor: "#7e22ce",
  },
  indigo: {
    id: "indigo",
    label: "Indigo",
    gradientColors: ["#0f0f2e", "#181840"],
    accentColor: "rgba(99, 102, 241, 0.85)",
    bgColor: "#EEF2FF",
    shadowColor: "#6366f1",
    textColor: "#4338ca",
  },
  rose: {
    id: "rose",
    label: "Rose",
    gradientColors: ["#2a0a12", "#3d0f1c"],
    accentColor: "rgba(244, 63, 94, 0.85)",
    bgColor: "#FFF1F2",
    shadowColor: "#f43f5e",
    textColor: "#be123c",
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

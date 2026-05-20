import FloatingTabBar from "@/components/FloatingTabBar";
import { useSegments } from "expo-router";

/** Full-screen flows where the tab bar blocks camera, voice, or focused wizards */
const HIDDEN_ON_ROUTES = new Set([
  "sakuSnap",
  "sakuSnapLoading",
  "scannedPage",
  "editScannedPage",
  "sakuVoice",
  "splitPage",
  "summarySplit",
  "participantBills",
  "addForm",
  "transferForm",
]);

export const shouldShowOthersTabBar = (segments: string[]) => {
  const current = segments[segments.length - 1];
  if (!current) return false;
  return !HIDDEN_ON_ROUTES.has(current);
};

/** Tab bar for (others) stack only — hidden on camera / snap / voice screens */
const ConditionalFloatingTabBar = () => {
  const segments = useSegments();

  if (!shouldShowOthersTabBar(segments as string[])) {
    return null;
  }

  return <FloatingTabBar />;
};

export default ConditionalFloatingTabBar;

import { Stack } from "expo-router";
import FloatingTabBar from "../../components/FloatingTabBar"; // your custom component

export default function MainLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingTabBar />
    </>
  );
}

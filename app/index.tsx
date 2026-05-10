import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = false; // replace with your auth logic

  if (isAuthenticated) {
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

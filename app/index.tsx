import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = false; // replace with your auth logic

  return <Redirect href="/(main)/home" />;
}

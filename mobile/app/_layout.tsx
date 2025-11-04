import "react-native-gesture-handler";
import "react-native-reanimated";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from "@stripe/stripe-react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { getStripePublishableKey } from "@/features/payments/api";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const stripePublishableKey = getStripePublishableKey();

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <NotificationsProvider>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </NotificationsProvider>
    </StripeProvider>
  );
}

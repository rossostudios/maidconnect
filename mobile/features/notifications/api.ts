import Constants from "expo-constants";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

type RegisterParams = {
  token: string;
  deviceName?: string | null;
};

export async function registerMobilePushToken({ token, deviceName }: RegisterParams) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    return;
  }

  const appVersion =
    Constants?.expoConfig?.version ?? Constants?.manifest2?.extra?.expoClient?.version ?? null;

  const { error } = await supabase.from("mobile_push_tokens").upsert(
    {
      user_id: session.user.id,
      expo_push_token: token,
      platform: Platform.OS,
      device_name: deviceName ?? null,
      app_version: appVersion,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,expo_push_token",
    }
  );

  if (error) {
    throw error;
  }
}

export async function deleteMobilePushToken(token: string) {
  const { error } = await supabase.from("mobile_push_tokens").delete().eq("expo_push_token", token);

  if (error) {
    throw error;
  }
}

type EnvConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const missingValueMessage = (key: string) =>
  `Missing required environment variable "${key}". Set it in an .env file or your Expo configuration.`;

export const env: EnvConfig = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

if (__DEV__) {
  if (!env.supabaseUrl) {
    console.warn(missingValueMessage("EXPO_PUBLIC_SUPABASE_URL"));
  }

  if (!env.supabaseAnonKey) {
    console.warn(missingValueMessage("EXPO_PUBLIC_SUPABASE_ANON_KEY"));
  }
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === "undefined") {
    // Server-side or build time - use dummy values to prevent build failure
    console.warn(
      "Supabase environment variables are missing. This is expected during build time.",
    );
  }
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
);

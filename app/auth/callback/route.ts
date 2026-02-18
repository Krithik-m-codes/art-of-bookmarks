import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/bookmarks";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(new URL(next, request.url));
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(
        new URL("/auth?error=auth_failed", request.url),
      );
    }
  }

  return NextResponse.redirect(new URL("/auth?error=no_code", request.url));
}

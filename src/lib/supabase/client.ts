"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for use in client components.
 * NOTE: this is just the client factory. The actual OAuth
 * (Google/Apple/Facebook) + TOTP MFA login flow is a separate,
 * not-yet-built step.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
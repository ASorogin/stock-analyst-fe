"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  // Where the user was headed before being redirected to /login, e.g.
  // /stock/AAPL. Falls back to /dashboard if they landed here directly.
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // On success, the browser navigates to Google — nothing else to do here.
  }

  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track your stocks and get plain-English analysis, no jargon.
      </p>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {callbackError && !error && (
        <p className="mt-4 text-sm text-red-600">
          Sign-in didn&apos;t complete. Please try again.
        </p>
      )}

      <p className="mt-6 text-xs text-gray-400">
        More sign-in options (Apple, Facebook) are coming soon.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
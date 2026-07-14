export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-500">
          Google / Apple / Facebook OAuth + TOTP MFA — not built yet.
        </p>
      </div>
    </main>
  );
}
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { AddStockForm } from "@/components/AddStockForm";

export default async function AddStockPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection middleware should already guarantee this, but guard
  // defensively rather than assume.
  if (!user) {
    return (
      <main className="mx-auto max-w-md p-6">
        <p className="text-sm text-gray-500">Please sign in to add a stock.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Add a Stock</h1>
      <p className="mb-6 text-sm text-gray-500">
        Pick a ticker and how you want it analyzed — long-term looks at
        fundamentals, short-term leans on technicals.
      </p>
      <AddStockForm userId={user.id} />
    </main>
  );
}
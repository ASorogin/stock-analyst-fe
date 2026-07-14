export default function AddStockPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Add a Stock</h1>
      <p className="text-sm text-gray-500">
        Ticker search + long_term/short_term picker goes here — wires up to
        POST /api/analysis/request on the backend. Not built yet.
      </p>
    </main>
  );
}
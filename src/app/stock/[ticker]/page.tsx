export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">{ticker.toUpperCase()}</h1>
      <p className="text-sm text-gray-500">
        Full analysis (rating badge, gauge, stat grid, etc. per the spec's UI
        mapping table) renders here. Not built yet.
      </p>
    </main>
  );
}
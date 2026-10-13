// Async server component: it suspends until the timer finishes, which triggers the fallback.
// Only delays in development, so it can't slow production if you forget to remove it.
export default async function Delay({
  ms = 3000,
  children,
}: {
  ms?: number;
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  return <>{children}</>;
}
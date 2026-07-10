export default function KioskLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-5 py-8 sm:px-8">
      <div className="h-4 w-28 rounded bg-border" />
      <div className="mt-4 h-9 w-64 rounded bg-border" />
      <div className="mt-10 h-48 border-y border-border bg-background" />
    </main>
  );
}

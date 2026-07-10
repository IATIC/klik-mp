import { LoaderCircle } from "lucide-react";

export function LoadingPanel({ title, description, progress }: { title: string; description: string; progress?: number }) {
  return (
    <section aria-live="polite" className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-border bg-background p-8 text-center">
      <LoaderCircle aria-hidden="true" className="size-16 animate-spin text-primary" />
      <h2 className="mt-5 text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-xl text-base text-muted-foreground">{description}</p>
      {typeof progress === "number" ? <progress className="mt-6 h-3 w-full max-w-md accent-primary" value={progress} max={100}>{progress}%</progress> : null}
    </section>
  );
}


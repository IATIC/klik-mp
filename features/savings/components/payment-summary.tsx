type PaymentSummaryProps = {
  title: string;
  items: Array<{ label: string; value: string }>;
  totalLabel?: string;
  total: string;
  variant?: "default" | "success" | "warning";
};

export function PaymentSummary({
  title,
  items,
  totalLabel = "Total",
  total,
  variant = "default",
}: PaymentSummaryProps) {
  const borderColor =
    variant === "success"
      ? "border-green-200 bg-green-50/50"
      : variant === "warning"
        ? "border-amber-200 bg-amber-50/50"
        : "border-border bg-white";

  return (
    <section
      className={`w-full rounded-3xl border-2 p-6 shadow-sm sm:p-8 ${borderColor}`}
    >
      <h2 className="mb-5 text-lg font-extrabold sm:text-xl">{title}</h2>
      <div className="divide-y divide-border">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 text-sm sm:text-base"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3 pt-4">
          <span className="text-lg font-extrabold sm:text-xl">{totalLabel}</span>
          <span className="text-2xl font-extrabold text-primary sm:text-3xl">
            {total}
          </span>
        </div>
      </div>
    </section>
  );
}

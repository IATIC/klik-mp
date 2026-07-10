"use client";

type WithdrawalReasonInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function WithdrawalReasonInput({
  value,
  onChange,
  error,
  disabled = false,
}: WithdrawalReasonInputProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="withdrawal-reason" className="block text-base font-bold">
        Alasan Pencairan
      </label>
      <textarea
        id="withdrawal-reason"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Jelaskan alasan pencairan simpanan..."
        rows={3}
        className={`w-full rounded-2xl border-2 bg-white p-4 text-base outline-none transition-colors focus:ring-4 focus:ring-ring/15 ${
          error
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-primary"
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? "withdrawal-reason-error" : undefined}
      />
      {error && (
        <p
          id="withdrawal-reason-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

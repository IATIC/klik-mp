"use client";

import { useState, useCallback } from "react";
import { formatRupiah } from "../validations/savings-validation";

type MoneyInputProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  /** Show quick amount buttons */
  quickAmounts?: number[];
};

export function MoneyInput({
  value,
  onChange,
  label,
  placeholder = "0",
  error,
  disabled = false,
  quickAmounts,
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value > 0 ? String(value) : "");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const num = raw === "" ? 0 : Number.parseInt(raw, 10);
      if (!isNaN(num)) {
        setInputValue(raw);
        onChange(num);
      }
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    setInputValue(value > 0 ? String(value) : "");
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    setInputValue(value > 0 ? String(value) : "");
  }, [value]);

  return (
    <div className="space-y-3">
      <label htmlFor="money-input" className="block text-base font-bold">
        {label}
      </label>
      <div
        className={`flex items-center overflow-hidden rounded-2xl border-2 bg-white transition-colors ${
          error
            ? "border-destructive"
            : focused
              ? "border-primary"
              : "border-border"
        }`}
      >
        <span className="flex h-16 items-center border-r border-border bg-surface px-4 text-lg font-bold text-muted-foreground sm:h-[4.5rem] sm:text-xl">
          Rp
        </span>
        <input
          id="money-input"
          type="text"
          inputMode="numeric"
          value={focused ? inputValue : value > 0 ? String(value) : ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="h-16 min-w-0 flex-1 px-4 text-2xl font-extrabold outline-none sm:h-[4.5rem] sm:text-3xl"
          aria-invalid={!!error}
          aria-describedby={error ? "money-input-error" : undefined}
        />
      </div>
      {!focused && value > 0 && (
        <p className="text-base font-medium text-primary">{formatRupiah(value)}</p>
      )}
      {error && (
        <p id="money-input-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {quickAmounts && quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(amt)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors ${
                value === amt
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {formatRupiah(amt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

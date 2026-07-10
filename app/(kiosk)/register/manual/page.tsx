"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import type { IdentityRecord } from "@/features/kiosk-flow";
import {
  useKioskFlow,
  validateManualIdentity,
} from "@/features/kiosk-flow";

type ManualIdentityFields = Omit<IdentityRecord, "memberNumber">;

const emptyForm: ManualIdentityFields = {
  nik: "",
  fullName: "",
  birthPlace: "",
  birthDate: "",
  address: "",
};

type FieldName = keyof ManualIdentityFields;
const ALL_FIELDS = Object.keys(emptyForm) as FieldName[];

const fieldLabels: Record<FieldName, string> = {
  nik: "NIK",
  fullName: "Nama Lengkap",
  birthPlace: "Tempat Lahir",
  birthDate: "Tanggal Lahir",
  address: "Alamat Lengkap",
};

const fieldPlaceholders: Record<FieldName, string> = {
  nik: "16 digit nomor induk kependudukan",
  fullName: "Sesuai KTP",
  birthPlace: "Kota atau kabupaten kelahiran",
  birthDate: "YYYY-MM-DD",
  address: "Sesuai KTP, minimal 10 karakter",
};

export default function RegisterManualPage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();
  const existing = state.registration.identity;
  const [form, setForm] = useState<ManualIdentityFields>({
    nik: existing?.nik ?? emptyForm.nik,
    fullName: existing?.fullName ?? emptyForm.fullName,
    birthPlace: existing?.birthPlace ?? emptyForm.birthPlace,
    birthDate: existing?.birthDate ?? emptyForm.birthDate,
    address: existing?.address ?? emptyForm.address,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: FieldName, value: string) => {
    setForm((prev: ManualIdentityFields) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<Record<FieldName, string>>) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validationErrors = validateManualIdentity(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitting(false);
      return;
    }

    dispatch({
      type: "SET_REGISTRATION_IDENTITY",
      identity: { ...form, memberNumber: "" },
      source: "manual",
    });

    router.push("/register/face");
  };

  return (
    <KioskPage
      progress={{ label: "Pendaftaran", current: 2, total: 5 }}
      showExit
      onExit={() => router.push("/")}
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/register/fingerprint")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Masukkan Data Identitas
        </h1>

        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Isi data diri sesuai KTP untuk melanjutkan pendaftaran.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-border bg-background p-6 sm:p-8"
        >
          <div className="grid gap-5">
            {ALL_FIELDS.map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="mb-1.5 block text-sm font-bold"
                >
                  {fieldLabels[field]}
                </label>
                <input
                  id={field}
                  type={field === "birthDate" ? "date" : "text"}
                  inputMode={
                    field === "nik"
                      ? "numeric"
                      : field === "birthDate"
                        ? "numeric"
                        : "text"
                  }
                  maxLength={field === "nik" ? 16 : undefined}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={fieldPlaceholders[field]}
                  className="flex h-14 w-full rounded-xl border border-border bg-surface px-4 text-base font-medium outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-50"
                  disabled={submitting}
                  aria-invalid={!!errors[field]}
                />
                {errors[field] ? (
                  <p className="mt-1.5 text-sm font-medium text-destructive">
                    {errors[field]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <Button
            type="submit"
            size="kiosk"
            className="mt-6 w-full"
            disabled={submitting}
          >
            <Save aria-hidden="true" className="size-5" />
            {submitting ? "Menyimpan…" : "Simpan & Lanjutkan"}
          </Button>
        </form>
      </div>
    </KioskPage>
  );
}

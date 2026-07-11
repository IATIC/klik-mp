"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Stethoscope } from "lucide-react";
import { useState } from "react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { useClinicFlow } from "@/features/clinic/context/clinic-flow-context";
import { PatientSummary } from "@/features/clinic/components/patient-summary";
import { validateComplaintSummary } from "@/features/clinic/validations/clinic-validation";
import { CLINIC_CONSTANTS, ERROR_MESSAGES } from "@/features/clinic/constants/clinic-constants";

export default function ClinicApplicationPage() {
  const router = useRouter();
  const { state, dispatch } = useClinicFlow();
const [complaintSummary, setComplaintSummary] = useState(state.complaintSummary);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no service selected
  if (!state.selectedService) {
    return (
      <KioskPage
        footer={
          <KioskFooterActions
            start={
              <Button
                variant="outline"
                size="kiosk"
                onClick={() => router.push("/clinic")}
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
                Kembali
              </Button>
            }
          />
        }
      >
        <div className="flex h-full flex-col items-center justify-center gap-5 animate-foundation-in">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Stethoscope aria-hidden="true" className="size-8" />
          </span>
          <p className="text-xl font-bold text-muted-foreground">
            Silakan pilih layanan terlebih dahulu
          </p>
          <Button
            size="kiosk"
            onClick={() => router.push("/clinic")}
          >
            Pilih Layanan
          </Button>
        </div>
      </KioskPage>
    );
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate complaint
    const complaintValidation = validateComplaintSummary(complaintSummary.trim());
    if (!complaintValidation.valid) {
      newErrors.complaintSummary = complaintValidation.error ?? ERROR_MESSAGES.COMPLAINT_REQUIRED;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    dispatch({ type: "SET_COMPLAINT_SUMMARY", complaintSummary: complaintSummary.trim() });

    router.push("/clinic/documents");
  };

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/clinic")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button size="kiosk" onClick={handleSubmit}>
              <Send aria-hidden="true" className="size-5" />
              Lanjut ke Dokumen
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {state.selectedService.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi data pengajuan pemeriksaan
          </p>
        </section>

        {/* Selected service info */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope aria-hidden="true" className="size-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Layanan Dipilih</p>
              <p className="text-base font-bold">{state.selectedService.name}</p>
            </div>
          </div>
        </section>

        {/* Patient data - read only */}
        {state.member && (
          <PatientSummary member={state.member} />
        )}

        {/* Complaint summary */}
        <section className="flex-1 space-y-3">
          <label
            htmlFor="complaint"
            className="text-base font-extrabold sm:text-lg"
          >
            Keluhan Utama
            <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-muted-foreground">
            Jelaskan keluhan yang akan diperiksakan
          </p>
          <textarea
            id="complaint"
            value={complaintSummary}
            onChange={(e) => {
              setComplaintSummary(e.target.value);
              if (errors.complaintSummary) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.complaintSummary;
                  return next;
                });
              }
            }}
            placeholder="Deskripsikan keluhan Anda secara singkat..."
            className={`h-36 w-full resize-none rounded-2xl border-2 bg-white px-5 py-4 text-base font-bold outline-none transition-colors sm:h-44 sm:py-5 ${
              errors.complaintSummary
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary"
            }`}
            maxLength={CLINIC_CONSTANTS.MAX_COMPLAINT_LENGTH}
            aria-invalid={!!errors.complaintSummary}
            aria-describedby={
              errors.complaintSummary ? "complaint-error" : "complaint-counter"
            }
          />
          <div className="flex items-center justify-between">
            <div>
              {errors.complaintSummary && (
                <p id="complaint-error" className="text-sm font-medium text-destructive">
                  {errors.complaintSummary}
                </p>
              )}
            </div>
            <p
              id="complaint-counter"
              className="text-xs text-muted-foreground"
            >
              {complaintSummary.length}/{CLINIC_CONSTANTS.MAX_COMPLAINT_LENGTH}
            </p>
          </div>
        </section>
      </div>
    </KioskPage>
  );
}

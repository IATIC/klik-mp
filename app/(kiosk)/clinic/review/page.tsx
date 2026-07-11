"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, SendHorizonal, Stethoscope, Loader2 } from "lucide-react";
import { useState } from "react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/kiosk/confirmation-dialog";
import { useClinicFlow } from "@/features/clinic/context/clinic-flow-context";
import { ApplicationReview } from "@/features/clinic/components/application-review";
import { clinicService } from "@/features/clinic/services/clinic-service";
import { queueService } from "@/features/clinic/services/queue-service";
import { ERROR_MESSAGES } from "@/features/clinic/constants/clinic-constants";

export default function ClinicReviewPage() {
  const router = useRouter();
  const { state, dispatch } = useClinicFlow();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if required data is missing
  if (!state.selectedService || !state.member) {
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
            Data pengajuan tidak lengkap
          </p>
          <Button size="kiosk" onClick={() => router.push("/clinic/application")}>
            Isi Data Pengajuan
          </Button>
        </div>
      </KioskPage>
    );
  }

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      // Check for duplicate
      const isDuplicate = await queueService.isDuplicateSubmission(
        state.member!.memberId,
      );

      if (isDuplicate) {
        setError(ERROR_MESSAGES.DUPLICATE_TICKET);
        setSubmitting(false);
        return;
      }

      // Submit application and get ticket
      const ticket = await clinicService.submitApplication({
        memberId: state.member!.memberId,
        serviceId: state.selectedService!.id,
        complaintSummary: state.complaintSummary,
        documentRequirements: state.documentRequirements,
        consentAccepted: state.consentAccepted,
      });

      dispatch({ type: "SET_QUEUE_TICKET", ticket });
      router.push("/clinic/queue");
    } catch {
      setError(ERROR_MESSAGES.SUBMISSION_FAILED);
      setSubmitting(false);
    }
  };

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/clinic/documents")}
              disabled={submitting}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button
              size="kiosk"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <SendHorizonal aria-hidden="true" className="size-5" />
                  Ajukan Pemeriksaan
                </>
              )}
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Konfirmasi Pengajuan</h1>
          <p className="text-sm text-muted-foreground">
            Periksa kembali data Anda sebelum mengirim
          </p>
        </section>

        {/* Error banner */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
            <p className="text-sm font-bold text-destructive">{error}</p>
            {error === ERROR_MESSAGES.DUPLICATE_TICKET && (
              <button
                type="button"
                className="mt-1 text-sm text-destructive underline hover:no-underline"
                onClick={() => router.push("/clinic")}
              >
                Kembali ke halaman utama
              </button>
            )}
          </div>
        )}

        {/* Review card */}
        <ApplicationReview
          member={state.member}
          serviceName={state.selectedService.name}
          complaintSummary={state.complaintSummary}
          documentsComplete={state.applicationStatus === "READY_TO_SUBMIT"}
        />
      </div>

      {/* Confirmation dialog */}
      <ConfirmationDialog
        open={showConfirm}
        title="Ajukan Pemeriksaan?"
        description="Setelah dikirim, Anda akan mendapatkan nomor antrean untuk pemeriksaan."
        confirmLabel="Ya, Ajukan"
        cancelLabel="Batal"
        onConfirm={handleSubmit}
        onClose={() => setShowConfirm(false)}
      />
    </KioskPage>
  );
}

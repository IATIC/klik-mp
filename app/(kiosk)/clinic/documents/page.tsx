"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { useClinicFlow } from "@/features/clinic/context/clinic-flow-context";
import { DocumentChecklist } from "@/features/clinic/components/document-checklist";
import { clinicService } from "@/features/clinic/services/clinic-service";
import {
  validateConsent,
  validateRequiredDocuments,
} from "@/features/clinic/validations/clinic-validation";
import { ERROR_MESSAGES } from "@/features/clinic/constants/clinic-constants";

export default function ClinicDocumentsPage() {
  const router = useRouter();
  const { state, dispatch } = useClinicFlow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.member) return;
    clinicService.getDocumentRequirements(state.member.memberId).then((reqs) => {
      dispatch({ type: "SET_DOCUMENT_REQUIREMENTS", requirements: reqs });
      setLoading(false);
    });
  }, [state.member, dispatch]);

  // Redirect if no member
  if (!state.member) {
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
          <Button size="kiosk" onClick={() => router.push("/clinic")}>
            Pilih Layanan
          </Button>
        </div>
      </KioskPage>
    );
  }

  const handleConsentChange = (accepted: boolean) => {
    dispatch({ type: "SET_CONSENT_ACCEPTED", accepted });
    if (error) setError(null);
  };

  const handleContinue = () => {
    // Validate consent
    const consentValidation = validateConsent(state.consentAccepted);
    if (!consentValidation.valid) {
      setError(ERROR_MESSAGES.CONSENT_REQUIRED);
      return;
    }

    // Validate documents
    const docsValidation = validateRequiredDocuments(state.documentRequirements);
    if (!docsValidation.valid) {
      setError(ERROR_MESSAGES.DOCUMENTS_INCOMPLETE);
      return;
    }

    dispatch({ type: "SET_APPLICATION_STATUS", status: "READY_TO_SUBMIT" });
    router.push("/clinic/review");
  };

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/clinic/application")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
          end={
            <Button size="kiosk" onClick={handleContinue}>
              <FileCheck aria-hidden="true" className="size-5" />
              Lanjut ke Review
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Kelengkapan Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            Pastikan dokumen Anda lengkap
          </p>
        </section>

        {/* Error banner */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
            <p className="text-sm font-bold text-destructive">{error}</p>
          </div>
        )}

        {/* Document checklist */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : state.documentRequirements.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileCheck aria-hidden="true" className="size-8" />
            </span>
            <p className="text-lg font-bold text-muted-foreground">
              Tidak ada dokumen yang diperlukan
            </p>
            <Button size="kiosk" onClick={handleContinue}>
              Lanjut ke Review
            </Button>
          </div>
        ) : (
          <DocumentChecklist
            requirements={state.documentRequirements}
            consentAccepted={state.consentAccepted}
            onConsentChange={handleConsentChange}
          />
        )}
      </div>
    </KioskPage>
  );
}

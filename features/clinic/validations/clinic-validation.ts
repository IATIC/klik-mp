import { CLINIC_CONSTANTS, ERROR_MESSAGES } from "../constants/clinic-constants";
import type { DocumentRequirement } from "../types/clinic";

export type ValidationResult = { valid: true } | { valid: false; error: string };

// ── Masking utilities ──

export function maskNik(nik: string): string {
  if (nik.length < 6) return nik;
  return nik.slice(0, 4) + "••••••••" + nik.slice(-4);
}

export function maskMemberNumber(number: string): string {
  if (number.length < 4) return number;
  return "••••" + number.slice(-4);
}

// ── Complaint validation ──

export function validateComplaintSummary(summary: string): ValidationResult {
  if (!summary || summary.trim().length === 0) {
    return { valid: false, error: ERROR_MESSAGES.COMPLAINT_REQUIRED };
  }
  if (summary.trim() !== summary) {
    return { valid: false, error: ERROR_MESSAGES.COMPLAINT_INVALID };
  }
  if (summary.trim().length < CLINIC_CONSTANTS.MIN_COMPLAINT_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.COMPLAINT_TOO_SHORT };
  }
  if (summary.trim().length > CLINIC_CONSTANTS.MAX_COMPLAINT_LENGTH) {
    return { valid: false, error: `Ringkasan keluhan maksimal ${CLINIC_CONSTANTS.MAX_COMPLAINT_LENGTH} karakter.` };
  }
  return { valid: true };
}

// ── Consent validation ──

export function validateConsent(accepted: boolean): ValidationResult {
  if (!accepted) {
    return { valid: false, error: ERROR_MESSAGES.CONSENT_REQUIRED };
  }
  return { valid: true };
}

// ── Document requirements validation ──

export function validateRequiredDocuments(
  requirements: DocumentRequirement[],
): { valid: boolean; missingIds: string[] } {
  const missing: string[] = [];

  for (const req of requirements) {
    if (req.status === "MISSING" && !req.available) {
      missing.push(req.id);
    }
  }

  return {
    valid: missing.length === 0,
    missingIds: missing,
  };
}

export function isReadyToSubmit(
  complaintValid: boolean,
  documentsComplete: boolean,
  consentAccepted: boolean,
): boolean {
  return complaintValid && documentsComplete && consentAccepted;
}

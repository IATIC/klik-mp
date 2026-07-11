import type { DocumentRequirement, ClinicServiceItem } from "../types/clinic";

// ── Mock configuration ──

export const MOCK_DELAY_MS = 280;

export const CLINIC_CONSTANTS = {
  MIN_COMPLAINT_LENGTH: 5,
  MAX_COMPLAINT_LENGTH: 500,
  QUEUE_PREFIX: "A",
  OPERATING_HOURS: "08:00 - 16:00 WIB",
  SERVICE_LOCATION: "Ruang Pemeriksaan KlinikDesa",
} as const;

// ── Default mock services ──

export const MOCK_SERVICES: ClinicServiceItem[] = [
  {
    id: "doctor-general",
    name: "Pemeriksaan Dokter Umum",
    description: "Pemeriksaan kesehatan umum oleh dokter",
    status: "OPEN",
    currentQueueLength: 11,
    estimatedWaitMinutes: 45,
  },
];

// ── Default document requirements ──

export const MOCK_DOCUMENT_REQUIREMENTS: Omit<DocumentRequirement, "available">[] = [
  {
    id: "identity",
    label: "Identitas anggota",
    description: "Kartu anggota / KTP",
    status: "AVAILABLE",
  },
  {
    id: "consent",
    label: "Persetujuan penggunaan data",
    description: "Persetujuan data digunakan untuk pendaftaran",
    status: "MISSING",
  },
  {
    id: "health-insurance",
    label: "Dokumen jaminan kesehatan",
    description: "BPJS / asuransi kesehatan (opsional)",
    status: "OPTIONAL",
  },
];

// ── Status labels ──

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Pendaftaran dibuka",
  CLOSED: "Pendaftaran ditutup",
  UNAVAILABLE: "Layanan tidak tersedia",
};

export const QUEUE_STATUS_LABELS: Record<string, string> = {
  WAITING: "Menunggu",
  CALLED: "Dipanggil",
  IN_SERVICE: "Dalam Pemeriksaan",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const PRINTER_STATUS_LABELS: Record<string, string> = {
  READY: "Printer siap",
  PRINTING: "Sedang mencetak...",
  SUCCESS: "Tiket berhasil dicetak",
  FAILED: "Pencetakan gagal",
  DISCONNECTED: "Printer tidak terhubung",
};

// ── Success messages ──

export const SUCCESS_MESSAGES = {
  TICKET_CREATED: "Nomor antrean berhasil dibuat",
  TICKET_PRINTED: "Tiket antrean sudah dicetak",
  APPLICATION_SUBMITTED: "Pengajuan berhasil dikirim",
  PRINTER_READY: "Printer siap",
  PRINTER_DISCONNECTED: "Printer tidak terhubung",
  PRINT_FAILED: "Pencetakan gagal, coba lagi",
  DUPLICATE_SUBMISSION: "Anda sudah memiliki nomor antrean aktif",
} as const;

// ── Error messages ──

export const ERROR_MESSAGES = {
  COMPLAINT_REQUIRED: "Ringkasan keluhan wajib diisi.",
  COMPLAINT_INVALID: "Ringkasan keluhan tidak boleh hanya berisi spasi.",
  COMPLAINT_TOO_SHORT: "Ringkasan keluhan minimal 5 karakter.",
  CONSENT_REQUIRED: "Anda harus menyetujui penggunaan data.",
  DOCUMENTS_INCOMPLETE: "Lengkapi dokumen wajib sebelum melanjutkan.",
  SUBMISSION_FAILED: "Pengajuan gagal, silakan coba lagi.",
  SERVICE_UNAVAILABLE: "Layanan sedang tidak tersedia.",
  DUPLICATE_TICKET: "Anda sudah memiliki nomor antrean aktif.",
} as const;

// ── Mock member data ──

export const MOCK_MEMBER = {
  memberId: "AGT-0042",
  memberNumber: "AGT-0042",
  fullName: "Siti Rahmawati",
  nik: "3273014205890004",
  maskedNik: "3273••••••••0004",
  dateOfBirth: "10 Juli 1998",
};

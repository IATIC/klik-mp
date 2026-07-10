import { MOCK_DELAY_MS, MOCK_MEMBER, MOCK_SERVICES, MOCK_DOCUMENT_REQUIREMENTS } from "../constants/clinic-constants";
import type {
  ClinicMemberInfo,
  ClinicServiceItem,
  DocumentRequirement,
  ClinicQueueTicket,
  QueueSummary,
} from "../types/clinic";

let ticketCounter = 0;

export function createMockMember(): ClinicMemberInfo {
  return {
    memberId: MOCK_MEMBER.memberId,
    memberNumber: MOCK_MEMBER.memberNumber,
    fullName: MOCK_MEMBER.fullName,
    nik: MOCK_MEMBER.nik,
    maskedNik: MOCK_MEMBER.nik.slice(0, 4) + "••••••••" + MOCK_MEMBER.nik.slice(-4),
    dateOfBirth: MOCK_MEMBER.dateOfBirth,
  };
}

export function createMockServices(): ClinicServiceItem[] {
  return MOCK_SERVICES.map((s) => ({ ...s }));
}

export function createMockDocumentRequirements(): DocumentRequirement[] {
  return MOCK_DOCUMENT_REQUIREMENTS.map((req) => ({
    ...req,
    available: req.status === "AVAILABLE" || req.status === "OPTIONAL",
  }));
}

export function createMockQueueTicket(serviceName: string): ClinicQueueTicket {
  ticketCounter++;
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const seq = String(ticketCounter).padStart(3, "0");
  const queueNumber = `A-${seq}`;

  return {
    id: `TICKET-${seq}`,
    queueNumber,
    serviceName,
    serviceId: "doctor-general",
    visitDate: dateStr,
    peopleAhead: 4,
    location: "Ruang Pemeriksaan KlinikDesa",
    status: "WAITING",
    printedCount: 0,
    createdAt: now.toISOString(),
  };
}

export function createMockQueueSummary(): QueueSummary {
  return {
    serviceId: "doctor-general",
    serviceName: "Pemeriksaan Dokter Umum",
    currentQueueCount: 11,
    estimatedWaitMinutes: 45,
    status: "OPEN",
    operatingHours: "08:00 - 16:00 WIB",
  };
}

export { MOCK_DELAY_MS, MOCK_MEMBER, MOCK_SERVICES, MOCK_DOCUMENT_REQUIREMENTS };

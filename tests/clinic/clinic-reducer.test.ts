import { describe, expect, it } from "vitest";
import {
  clinicFlowReducer,
  initialClinicFlowState,
} from "@/features/clinic/context/clinic-flow-context";
import type {
  ClinicServiceItem,
  ClinicMemberInfo,
  ClinicQueueTicket,
} from "@/features/clinic/types/clinic";

const mockService: ClinicServiceItem = {
  id: "general-checkup",
  name: "Pemeriksaan Umum",
  description: "Pemeriksaan kesehatan umum oleh dokter",
  status: "OPEN",
  currentQueueLength: 5,
  estimatedWaitMinutes: 30,
};

const mockMember: ClinicMemberInfo = {
  memberId: "AGT-0042",
  memberNumber: "AGT-0042",
  fullName: "Budi Anggara",
  nik: "3273014205890004",
  maskedNik: "3273••••••••0004",
  dateOfBirth: "14-05-1989",
};

const mockTicket: ClinicQueueTicket = {
  id: "TICKET-001",
  queueNumber: "A001",
  serviceName: "Pemeriksaan Umum",
  serviceId: "general-checkup",
  visitDate: "10 Juli 2026",
  location: "Klinik Desa",
  peopleAhead: 4,
  status: "WAITING",
  printedCount: 0,
  createdAt: "2026-07-10T10:00:00+07:00",
};

describe("clinicFlowReducer", () => {
  it("mengembalikan initial state untuk RESET_FLOW", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "RESET_FLOW",
    });
    expect(state).toEqual(initialClinicFlowState);
  });

  it("menangani SELECT_SERVICE", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SELECT_SERVICE",
      service: mockService,
    });
    expect(state.selectedService).toEqual(mockService);
  });

  it("menangani SET_MEMBER", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_MEMBER",
      member: mockMember,
    });
    expect(state.member).toEqual(mockMember);
  });

  it("menangani SET_COMPLAINT_SUMMARY", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_COMPLAINT_SUMMARY",
      complaintSummary: "Sakit kepala",
    });
    expect(state.complaintSummary).toBe("Sakit kepala");
  });

  it("menangani SET_CONSENT_ACCEPTED", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_CONSENT_ACCEPTED",
      accepted: true,
    });
    expect(state.consentAccepted).toBe(true);
  });

  it("menangani SET_QUEUE_TICKET", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_QUEUE_TICKET",
      ticket: mockTicket,
    });
    expect(state.queueTicket).toEqual(mockTicket);
    expect(state.applicationStatus).toBe("QUEUED");
  });

  it("menangani SET_SUBMISSION_STATUS dengan ERROR", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_SUBMISSION_STATUS",
      status: "ERROR",
      error: "Gagal memproses pengajuan",
    });
    expect(state.submissionStatus).toBe("ERROR");
    expect(state.submissionError).toBe("Gagal memproses pengajuan");
  });

  it("menangani SET_PRINTER_STATUS", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_PRINTER_STATUS",
      status: "DISCONNECTED",
    });
    expect(state.printerStatus).toBe("DISCONNECTED");
  });

  it("menangani INCREMENT_TICKET_PRINT", () => {
    const stateWithTicket = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_QUEUE_TICKET",
      ticket: mockTicket,
    });
    const state = clinicFlowReducer(stateWithTicket, {
      type: "INCREMENT_TICKET_PRINT",
    });
    expect(state.queueTicket?.printedCount).toBe(1);
  });

  it("tidak mengubah state untuk INCREMENT_TICKET_PRINT tanpa ticket", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "INCREMENT_TICKET_PRINT",
    });
    expect(state.queueTicket).toBeNull();
  });

  it("mereset semua state pada RESET_FLOW setelah modifikasi", () => {
    const modified = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_COMPLAINT_SUMMARY",
      complaintSummary: "test",
    });
    const state = clinicFlowReducer(modified, { type: "RESET_FLOW" });
    expect(state.selectedService).toBeNull();
    expect(state.member).toBeNull();
    expect(state.queueTicket).toBeNull();
    expect(state.complaintSummary).toBe("");
    expect(state.consentAccepted).toBe(false);
    expect(state.submissionStatus).toBe("IDLE");
    expect(state.submissionError).toBeNull();
  });

  it("menangani SET_APPLICATION_STATUS", () => {
    const state = clinicFlowReducer(initialClinicFlowState, {
      type: "SET_APPLICATION_STATUS",
      status: "READY_TO_SUBMIT",
    });
    expect(state.applicationStatus).toBe("READY_TO_SUBMIT");
  });
});

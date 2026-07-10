import { waitForMock } from "@/lib/services/mock-utils";
import { createMockQueueSummary, createMockQueueTicket } from "../mocks/clinic-mock-data";
import type { QueueService, QueueSummary, ClinicQueueTicket } from "../types/clinic";

export class MockQueueService implements QueueService {
  async getCurrentQueue(serviceId: string): Promise<QueueSummary> {
    void serviceId;
    await waitForMock(250);
    return createMockQueueSummary();
  }

  async getTicket(ticketId: string): Promise<ClinicQueueTicket> {
    void ticketId;
    await waitForMock(150);
    return createMockQueueTicket("Pemeriksaan Dokter Umum");
  }

  async isDuplicateSubmission(memberId: string): Promise<boolean> {
    void memberId;
    await waitForMock(100);
    return false;
  }
}

export const queueService: QueueService = new MockQueueService();

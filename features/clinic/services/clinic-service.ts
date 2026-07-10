import { waitForMock } from "@/lib/services/mock-utils";
import {
  createMockServices,
  createMockDocumentRequirements,
  createMockQueueTicket,
} from "../mocks/clinic-mock-data";
import type {
  ClinicService,
  ClinicServiceItem,
  DocumentRequirement,
  ClinicApplicationInput,
  ClinicQueueTicket,
} from "../types/clinic";

export class MockClinicService implements ClinicService {
  async getAvailableServices(): Promise<ClinicServiceItem[]> {
    await waitForMock(280);
    return createMockServices();
  }

  async getDocumentRequirements(_memberId: string): Promise<DocumentRequirement[]> {
    await waitForMock(200);
    return createMockDocumentRequirements();
  }

  async submitApplication(_input: ClinicApplicationInput): Promise<ClinicQueueTicket> {
    await waitForMock(500);
    return createMockQueueTicket("Pemeriksaan Dokter Umum");
  }
}

export const clinicService: ClinicService = new MockClinicService();

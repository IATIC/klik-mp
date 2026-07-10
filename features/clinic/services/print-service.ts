import { waitForMock } from "@/lib/services/mock-utils";
import { SUCCESS_MESSAGES } from "../constants/clinic-constants";
import type { QueuePrintService, PrinterStatus, PrintResult, ClinicQueueTicket } from "../types/clinic";

let printerConnected = true;

export class MockQueuePrintService implements QueuePrintService {
  async getStatus(): Promise<PrinterStatus> {
    await waitForMock(100);
    return printerConnected ? "READY" : "DISCONNECTED";
  }

  async printQueueTicket(ticket: ClinicQueueTicket): Promise<PrintResult> {
    await waitForMock(500);
    if (!printerConnected) {
      return { success: false, message: SUCCESS_MESSAGES.PRINTER_DISCONNECTED, ticketId: ticket.id };
    }
    const success = Math.random() > 0.1;
    return {
      success,
      message: success ? SUCCESS_MESSAGES.TICKET_PRINTED : SUCCESS_MESSAGES.PRINT_FAILED,
      ticketId: ticket.id,
    };
  }

  async reprintQueueTicket(ticket: ClinicQueueTicket): Promise<PrintResult> {
    await waitForMock(400);
    if (!printerConnected) {
      return { success: false, message: SUCCESS_MESSAGES.PRINTER_DISCONNECTED, ticketId: ticket.id };
    }
    return { success: true, message: SUCCESS_MESSAGES.TICKET_PRINTED, ticketId: ticket.id };
  }

  static setPrinterConnected(connected: boolean): void {
    printerConnected = connected;
  }
}

export const queuePrintService: QueuePrintService = new MockQueuePrintService();

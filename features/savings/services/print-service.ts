import { waitForMock } from "@/lib/services/mock-utils";
import type { PrintResult, PrintService, PrinterStatus } from "../types/savings";

let printerReady = true;

export class MockPrintService implements PrintService {
  async getStatus(): Promise<PrinterStatus> {
    await waitForMock(100);
    return printerReady ? "READY" : "DISCONNECTED";
  }

  async print(_documentId: string): Promise<PrintResult> {
    await waitForMock(500);
    if (!printerReady) {
      return { success: false, message: "Printer tidak terhubung", documentId: _documentId };
    }
    // Simulate occasional failure (10% chance)
    if (Math.random() < 0.1) {
      return { success: false, message: "Pencetakan gagal, coba lagi", documentId: _documentId };
    }
    return { success: true, message: "Dokumen berhasil dicetak", documentId: _documentId };
  }

  /** For testing: toggle printer connection */
  static setPrinterReady(ready: boolean) {
    printerReady = ready;
  }
}

export const printService: PrintService = new MockPrintService();

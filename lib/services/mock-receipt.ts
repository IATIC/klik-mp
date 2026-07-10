import type { AssessmentResult, OfferState, TransactionReceipt, WeightSnapshot } from "@/features/kiosk-flow";
import { waitForMock } from "./mock-utils";

export interface ReceiptPrinterAdapter {
  print(input: { assessment: AssessmentResult; offer: OfferState; weight: WeightSnapshot }): Promise<TransactionReceipt>;
  reprint(receipt: TransactionReceipt): Promise<TransactionReceipt>;
}

export class MockReceiptPrinterAdapter implements ReceiptPrinterAdapter {
  async print({ assessment, offer, weight }: { assessment: AssessmentResult; offer: OfferState; weight: WeightSnapshot }) {
    await waitForMock(420);
    const total = offer.agreedTotal ?? offer.total;
    return {
      transactionNumber: "KMP-DEMO-0012",
      commodityName: assessment.commodityName,
      grade: assessment.grade,
      netWeight: weight.net,
      agreedUnitPrice: Math.round(total / weight.net),
      total,
      printedCount: 1,
    };
  }

  async reprint(receipt: TransactionReceipt) {
    await waitForMock(320);
    return { ...receipt, printedCount: receipt.printedCount + 1 };
  }
}

export const receiptPrinterAdapter: ReceiptPrinterAdapter = new MockReceiptPrinterAdapter();


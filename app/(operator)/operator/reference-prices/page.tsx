import type { Metadata } from "next";

import {
  demoReferencePrices,
  ReferencePriceWorkspace,
} from "@/features/operator-assistance";

export const metadata: Metadata = {
  title: "Referensi harga",
};

export default function ReferencePricesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:px-10">
      <ReferencePriceWorkspace initialPrices={demoReferencePrices} />
    </main>
  );
}

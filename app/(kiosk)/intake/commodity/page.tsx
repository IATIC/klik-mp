"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { COMMODITIES, useKioskFlow } from "@/features/kiosk-flow";

export default function CommodityPage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();

  function handleSelect(commodity: (typeof COMMODITIES)[number]) {
    dispatch({ type: "SET_COMMODITY", commodity });
    router.push("/intake/capture");
  }

  function handleBack() {
    router.push("/kiosk");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleBack}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </Button>
      }
    />
  );

  return (
    <KioskPage
      progress={{ label: "Penerimaan", current: 1, total: 5 }}
      footer={footer}
    >
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 animate-foundation-in">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Pilih komoditas</h1>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {COMMODITIES.map((commodity) => {
            const isSelected = state.selectedCommodity?.id === commodity.id;
            return (
              <button
                key={commodity.id}
                type="button"
                onClick={() => handleSelect(commodity)}
                className={`group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-5 text-center outline-none transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/25 sm:min-h-44 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mb-3 text-4xl sm:text-5xl"
                >
                  {commodity.emoji}
                </span>
                <h2
                  className={`text-base font-extrabold sm:text-lg ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {commodity.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {commodity.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </KioskPage>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { Button } from "@/components/ui/button";
import { ClinicServiceCard } from "@/features/clinic/components/clinic-service-card";
import { useClinicFlow } from "@/features/clinic/context/clinic-flow-context";
import { clinicService } from "@/features/clinic/services/clinic-service";
import { createMockMember } from "@/features/clinic/mocks/clinic-mock-data";
import type { ClinicServiceItem } from "@/features/clinic/types/clinic";

export default function ClinicHomePage() {
  const router = useRouter();
  const { dispatch } = useClinicFlow();
  const [services, setServices] = useState<ClinicServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clinicService.getAvailableServices().then((data) => {
      setServices(data);
      dispatch({ type: "SET_AVAILABLE_SERVICES", services: data });
      setLoading(false);
    });
  }, [dispatch]);

  const handleSelectService = (service: ClinicServiceItem) => {
    dispatch({ type: "SELECT_SERVICE", service });
    dispatch({ type: "SET_MEMBER", member: createMockMember() });
    router.push("/clinic/application");
  };

  return (
    <KioskPage
      footer={
        <KioskFooterActions
          start={
            <Button
              variant="outline"
              size="kiosk"
              onClick={() => router.push("/kiosk")}
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Kembali
            </Button>
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 animate-foundation-in">
        {/* Header */}
        <section className="flex items-center gap-5 rounded-2xl bg-primary/5 px-6 py-5 sm:px-8 sm:py-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-white sm:size-16">
            <Stethoscope aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.7} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Klinik Desa</h1>
            <p className="text-sm text-muted-foreground">
              Pilih layanan pemeriksaan yang tersedia
            </p>
          </div>
        </section>

        {/* Service selection */}
        <section className="flex flex-1 flex-col gap-4">
          <h2 className="text-lg font-extrabold sm:text-xl">
            Layanan Tersedia
          </h2>

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Stethoscope aria-hidden="true" className="size-8" />
              </span>
              <p className="text-lg font-bold text-muted-foreground">
                Belum ada layanan tersedia
              </p>
              <p className="text-sm text-muted-foreground">
                Silakan coba kembali beberapa saat lagi
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              {services.map((service) => (
                <ClinicServiceCard
                  key={service.id}
                  service={service}
                  onSelect={handleSelectService}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </KioskPage>
  );
}

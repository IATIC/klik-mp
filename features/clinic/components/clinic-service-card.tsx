"use client";

import { Stethoscope, Clock, Users } from "lucide-react";
import type { ClinicServiceItem } from "../types/clinic";
import { SERVICE_STATUS_LABELS } from "../constants/clinic-constants";

type ClinicServiceCardProps = {
  service: ClinicServiceItem;
  onSelect: (service: ClinicServiceItem) => void;
  disabled?: boolean;
};

export function ClinicServiceCard({
  service,
  onSelect,
  disabled = false,
}: ClinicServiceCardProps) {
  const isOpen = service.status === "OPEN";
  const statusLabel = SERVICE_STATUS_LABELS[service.status] ?? service.status;

  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      disabled={disabled}
      className={`w-full rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all sm:p-8 ${
        isOpen
          ? "border-primary hover:border-primary/80 hover:shadow-md"
          : "border-border opacity-60"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-start gap-5">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl sm:size-16 ${
            isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Stethoscope aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="text-xl font-extrabold sm:text-2xl">{service.name}</h2>
          <p className="text-base text-muted-foreground">{service.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`size-2.5 rounded-full ${
                  isOpen ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
              {statusLabel}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users aria-hidden="true" className="size-4" />
              Antrean: {service.currentQueueLength} orang
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock aria-hidden="true" className="size-4" />
              Estimasi: ~{service.estimatedWaitMinutes} menit
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 flex justify-end">
          <span className="rounded-xl bg-primary px-6 py-3 text-base font-bold text-white transition-colors hover:bg-primary/90">
            Ajukan Pemeriksaan
          </span>
        </div>
      )}
    </button>
  );
}

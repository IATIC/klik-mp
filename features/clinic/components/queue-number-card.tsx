"use client";

import { MapPin, Users } from "lucide-react";
import type { ClinicQueueTicket } from "../types/clinic";
import { QUEUE_STATUS_LABELS } from "../constants/clinic-constants";

type QueueNumberCardProps = {
  ticket: ClinicQueueTicket;
};

export function QueueNumberCard({ ticket }: QueueNumberCardProps) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      {/* Success indicator */}
      <span className="flex size-20 items-center justify-center rounded-full bg-green-50 text-green-600">
        <span className="text-4xl font-extrabold">✓</span>
      </span>

      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Nomor Antrean Berhasil Dibuat
        </h1>
      </div>

      {/* Queue number - very large */}
      <div className="rounded-3xl border-2 border-primary bg-primary/5 px-10 py-6 sm:px-14 sm:py-8">
        <p className="text-sm font-bold text-muted-foreground">NOMOR ANTREAN</p>
        <p className="text-5xl font-extrabold tracking-widest text-primary sm:text-7xl">
          {ticket.queueNumber}
        </p>
      </div>

      {/* Details */}
      <div className="w-full max-w-md space-y-3">
        <p className="text-lg font-bold">{ticket.serviceName}</p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users aria-hidden="true" className="size-4" />
            Antrean di depan Anda: <strong>{ticket.peopleAhead}</strong> orang
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4" />
            {ticket.location}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {ticket.visitDate}
        </p>
      </div>

      {/* Status badge */}
      <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
        {QUEUE_STATUS_LABELS[ticket.status] ?? ticket.status}
      </span>
    </section>
  );
}

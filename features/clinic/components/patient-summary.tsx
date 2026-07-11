"use client";

import { UserRound, Hash, Calendar } from "lucide-react";
import type { ClinicMemberInfo } from "../types/clinic";
import { maskNik } from "../validations/clinic-validation";

type PatientSummaryProps = {
  member: ClinicMemberInfo;
};

export function PatientSummary({
  member,
}: PatientSummaryProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold sm:text-xl">Data Pasien</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-white">
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Nama</p>
            <p className="text-base font-bold">{member.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Hash aria-hidden="true" className="size-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Nomor Anggota</p>
            <p className="text-base font-bold">{member.memberNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Hash aria-hidden="true" className="size-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">NIK</p>
            <p className="text-base font-bold tracking-widest">{maskNik(member.nik)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar aria-hidden="true" className="size-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Tanggal Lahir</p>
            <p className="text-base font-bold">{member.dateOfBirth}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

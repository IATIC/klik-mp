"use client";

import { UserRound, Hash, Phone, Stethoscope, FileText, ClipboardCheck } from "lucide-react";
import type { ClinicMemberInfo } from "../types/clinic";
import { maskNik, maskPhoneNumber } from "../validations/clinic-validation";

type ApplicationReviewProps = {
  member: ClinicMemberInfo;
  phoneNumber: string;
  serviceName: string;
  complaintSummary: string;
  documentsComplete: boolean;
};

export function ApplicationReview({
  member,
  phoneNumber,
  serviceName,
  complaintSummary,
  documentsComplete,
}: ApplicationReviewProps) {
  const reviewItems = [
    {
      icon: UserRound,
      label: "Nama",
      value: member.fullName,
    },
    {
      icon: Hash,
      label: "Nomor Anggota",
      value: member.memberNumber,
    },
    {
      icon: Hash,
      label: "NIK",
      value: maskNik(member.nik),
    },
    {
      icon: Phone,
      label: "Nomor Kontak",
      value: maskPhoneNumber(phoneNumber),
    },
    {
      icon: Stethoscope,
      label: "Layanan",
      value: serviceName,
    },
    {
      icon: FileText,
      label: "Keluhan Utama",
      value: complaintSummary,
    },
    {
      icon: ClipboardCheck,
      label: "Administrasi",
      value: documentsComplete ? "Lengkap" : "Belum lengkap",
      highlight: !documentsComplete,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold sm:text-xl">Periksa Pengajuan Anda</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-white">
        {reviewItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p
                className={`text-base font-bold ${
                  "highlight" in item && item.highlight
                    ? "text-amber-600"
                    : ""
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

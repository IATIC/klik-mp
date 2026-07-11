import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClinicServiceCard } from "@/features/clinic/components/clinic-service-card";
import { PatientSummary } from "@/features/clinic/components/patient-summary";
import { DocumentChecklist } from "@/features/clinic/components/document-checklist";
import { ApplicationReview } from "@/features/clinic/components/application-review";
import { QueueNumberCard } from "@/features/clinic/components/queue-number-card";
import { QueueTicketPreview, TicketContent } from "@/features/clinic/components/queue-ticket-preview";
import { PrinterStatusPanel } from "@/features/clinic/components/printer-status";
import type {
  ClinicServiceItem,
  ClinicMemberInfo,
  DocumentRequirement,
  ClinicQueueTicket,
} from "@/features/clinic/types/clinic";

/* ------------------------------------------------------------------ */
/*  ClinicServiceCard                                                  */
/* ------------------------------------------------------------------ */
const openService: ClinicServiceItem = {
  id: "general-checkup",
  name: "Pemeriksaan Umum",
  description: "Pemeriksaan kesehatan umum oleh dokter",
  status: "OPEN",
  currentQueueLength: 5,
  estimatedWaitMinutes: 30,
};

const closedService: ClinicServiceItem = {
  ...openService,
  status: "CLOSED",
  currentQueueLength: 0,
  estimatedWaitMinutes: 0,
};

describe("ClinicServiceCard", () => {
  it("menampilkan nama dan deskripsi layanan", () => {
    render(<ClinicServiceCard service={openService} onSelect={() => {}} />);
    expect(screen.getByText("Pemeriksaan Umum")).toBeInTheDocument();
    expect(
      screen.getByText("Pemeriksaan kesehatan umum oleh dokter"),
    ).toBeInTheDocument();
  });

  it("menampilkan tombol Ajukan Pemeriksaan jika OPEN", () => {
    render(<ClinicServiceCard service={openService} onSelect={() => {}} />);
    expect(screen.getByText("Ajukan Pemeriksaan")).toBeInTheDocument();
  });

  it("tidak menampilkan tombol Ajukan Pemeriksaan jika CLOSED", () => {
    render(<ClinicServiceCard service={closedService} onSelect={() => {}} />);
    expect(screen.queryByText("Ajukan Pemeriksaan")).not.toBeInTheDocument();
  });

  it("menampilkan status antrean", () => {
    render(<ClinicServiceCard service={openService} onSelect={() => {}} />);
    expect(screen.getByText(/Antrean:/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/Estimasi:/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it("disabled card ketika disabled prop true", () => {
    render(
      <ClinicServiceCard service={openService} onSelect={() => {}} disabled />,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("memanggil onSelect saat diklik", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ClinicServiceCard service={openService} onSelect={onSelect} />);
    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(openService);
  });
});

/* ------------------------------------------------------------------ */
/*  PatientSummary                                                     */
/* ------------------------------------------------------------------ */
const mockMember: ClinicMemberInfo = {
  memberId: "AGT-0042",
  memberNumber: "AGT-0042",
  fullName: "Siti Rahmawati",
  nik: "3273014205890004",
  maskedNik: "3273••••••••0004",
  dateOfBirth: "14-05-1989",
};

describe("PatientSummary", () => {
  it("menampilkan data pasien", () => {
    render(<PatientSummary member={mockMember} />);
    expect(screen.getByText("Siti Rahmawati")).toBeInTheDocument();
    expect(screen.getByText("AGT-0042")).toBeInTheDocument();
    expect(screen.getByText(/3273/)).toBeInTheDocument();
    expect(screen.getByText("14-05-1989")).toBeInTheDocument();
  });

  it("mask NIK tidak menampilkan NIK lengkap", () => {
    render(<PatientSummary member={mockMember} />);
    expect(screen.queryByText("3273014205890004")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  DocumentChecklist                                                  */
/* ------------------------------------------------------------------ */
const requirements: DocumentRequirement[] = [
  { id: "ktp", label: "KTP", description: "Kartu Tanda Penduduk", available: true, status: "AVAILABLE" },
  { id: "kk", label: "KK", description: "Kartu Keluarga", available: false, status: "MISSING" },
  { id: "bpjs", label: "BPJS", description: "Kartu BPJS", available: false, status: "OPTIONAL" },
  {
    id: "consent",
    label: "Persetujuan Pemeriksaan",
    description: "Saya menyetujui untuk menjalani pemeriksaan",
    available: true,
    status: "MISSING",
  },
];

describe("DocumentChecklist", () => {
  it("menampilkan daftar dokumen", () => {
    render(
      <DocumentChecklist
        requirements={requirements}
        consentAccepted={false}
        onConsentChange={() => {}}
      />,
    );
    expect(screen.getByText("KTP")).toBeInTheDocument();
    expect(screen.getByText("KK")).toBeInTheDocument();
    expect(screen.getByText("BPJS")).toBeInTheDocument();
    expect(screen.getByText("Persetujuan Pemeriksaan")).toBeInTheDocument();
  });

  it("menampilkan status ketersediaan dokumen", () => {
    render(
      <DocumentChecklist
        requirements={requirements}
        consentAccepted={false}
        onConsentChange={() => {}}
      />,
    );
    expect(screen.getByText("Tersedia")).toBeInTheDocument();
    expect(screen.getByText("Belum tersedia")).toBeInTheDocument();
    expect(screen.getByText("Opsional")).toBeInTheDocument();
  });

  it("consent checkbox dapat dicentang", async () => {
    const onConsentChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentChecklist
        requirements={requirements}
        consentAccepted={false}
        onConsentChange={onConsentChange}
      />,
    );
    const checkbox = screen.getByLabelText("Persetujuan Pemeriksaan");
    await user.click(checkbox);
    expect(onConsentChange).toHaveBeenCalledWith(true);
  });
});

/* ------------------------------------------------------------------ */
/*  ApplicationReview                                                  */
/* ------------------------------------------------------------------ */
describe("ApplicationReview", () => {
  it("menampilkan ringkasan pengajuan", () => {
    render(
      <ApplicationReview
        member={mockMember}
        serviceName="Pemeriksaan Umum"
        complaintSummary="Sakit kepala"
        documentsComplete={true}
      />,
    );
    expect(screen.getByText("Siti Rahmawati")).toBeInTheDocument();
    expect(screen.getByText("AGT-0042")).toBeInTheDocument();
    expect(screen.getByText("Pemeriksaan Umum")).toBeInTheDocument();
    expect(screen.getByText("Sakit kepala")).toBeInTheDocument();
    expect(screen.getByText("Lengkap")).toBeInTheDocument();
  });

  it("menampilkan peringatan jika dokumen belum lengkap", () => {
    render(
      <ApplicationReview
        member={mockMember}
        serviceName="Pemeriksaan Umum"
        complaintSummary="Sakit kepala"
        documentsComplete={false}
      />,
    );
    expect(screen.getByText("Belum lengkap")).toBeInTheDocument();
  });

  it("NIK termask tidak menampilkan NIK lengkap", () => {
    render(
      <ApplicationReview
        member={mockMember}
        serviceName="Pemeriksaan Umum"
        complaintSummary="Sakit kepala"
        documentsComplete={true}
      />,
    );
    expect(screen.queryByText("3273014205890004")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  QueueNumberCard                                                    */
/* ------------------------------------------------------------------ */
const mockTicket: ClinicQueueTicket = {
  id: "TICKET-001",
  queueNumber: "A001",
  serviceName: "Pemeriksaan Umum",
  serviceId: "general-checkup",
  visitDate: "10 Juli 2026",
  location: "Klinik Desa",
  peopleAhead: 4,
  status: "WAITING",
  printedCount: 0,
  createdAt: "2026-07-10T10:00:00+07:00",
};

describe("QueueNumberCard", () => {
  it("menampilkan nomor antrean", () => {
    render(<QueueNumberCard ticket={mockTicket} />);
    expect(screen.getByText("A001")).toBeInTheDocument();
  });

  it("menampilkan informasi antrean", () => {
    render(<QueueNumberCard ticket={mockTicket} />);
    expect(screen.getByText("Pemeriksaan Umum")).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
    expect(screen.getByText("Klinik Desa")).toBeInTheDocument();
    expect(screen.getByText("10 Juli 2026")).toBeInTheDocument();
    expect(screen.getByText("Menunggu")).toBeInTheDocument();
  });

  it("menampilkan pesan sukses", () => {
    render(<QueueNumberCard ticket={mockTicket} />);
    expect(
      screen.getByText("Nomor Antrean Berhasil Dibuat"),
    ).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  QueueTicketPreview                                                 */
/* ------------------------------------------------------------------ */
describe("QueueTicketPreview", () => {
  it("menampilkan tombol cetak ketika IDLE", () => {
    render(
      <QueueTicketPreview
        ticket={mockTicket}
        printerStatus="READY"
        printStatus="IDLE"
        onPrint={() => {}}
        onReprint={() => {}}
      />,
    );
    expect(screen.getByText("Cetak Tiket Antrean")).toBeInTheDocument();
  });

  it("menampilkan tombol cetak ulang setelah sukses", () => {
    render(
      <QueueTicketPreview
        ticket={mockTicket}
        printerStatus="READY"
        printStatus="SUCCESS"
        onPrint={() => {}}
        onReprint={() => {}}
      />,
    );
    expect(screen.getByText("Cetak Ulang")).toBeInTheDocument();
  });

  it("menampilkan status printer tidak terhubung", () => {
    render(
      <QueueTicketPreview
        ticket={mockTicket}
        printerStatus="DISCONNECTED"
        printStatus="IDLE"
        onPrint={() => {}}
        onReprint={() => {}}
      />,
    );
    expect(screen.getByText(/Printer tidak terhubung/)).toBeInTheDocument();
  });

  it("menampilkan error printer", () => {
    render(
      <QueueTicketPreview
        ticket={mockTicket}
        printerStatus="FAILED"
        printStatus="ERROR"
        printError="Gagal mencetak"
        onPrint={() => {}}
        onReprint={() => {}}
      />,
    );
    expect(screen.getByText(/Gagal mencetak/)).toBeInTheDocument();
  });

  it("menonaktifkan tombol selama printing", () => {
    render(
      <QueueTicketPreview
        ticket={mockTicket}
        printerStatus="READY"
        printStatus="LOADING"
        onPrint={() => {}}
        onReprint={() => {}}
      />,
    );
    expect(screen.getByText(/Sedang mencetak.../)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  TicketContent                                                      */
/* ------------------------------------------------------------------ */
describe("TicketContent", () => {
  it("menampilkan nomor antrean pada preview tiket", () => {
    render(<TicketContent ticket={mockTicket} />);
    expect(screen.getByText("A001")).toBeInTheDocument();
    expect(screen.getByText("Pemeriksaan Umum")).toBeInTheDocument();
    expect(screen.getByText("10 Juli 2026")).toBeInTheDocument();
    expect(screen.getByText("Klinik Desa")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  PrinterStatusPanel                                                 */
/* ------------------------------------------------------------------ */
describe("PrinterStatusPanel", () => {
  it("menampilkan printer siap", () => {
    render(
      <PrinterStatusPanel printerStatus="READY" printStatus="IDLE" />,
    );
    expect(screen.getByText("Printer siap")).toBeInTheDocument();
  });

  it("menampilkan printer disconnect", () => {
    render(
      <PrinterStatusPanel printerStatus="DISCONNECTED" printStatus="IDLE" />,
    );
    expect(screen.getByText("Printer tidak terhubung")).toBeInTheDocument();
  });

  it("menampilkan status printing", () => {
    render(
      <PrinterStatusPanel printerStatus="PRINTING" printStatus="LOADING" />,
    );
    expect(screen.getByText("Sedang mencetak...")).toBeInTheDocument();
  });

  it("menampilkan status print success", () => {
    render(
      <PrinterStatusPanel printerStatus="SUCCESS" printStatus="SUCCESS" />,
    );
    expect(screen.getByText("Tiket berhasil dicetak")).toBeInTheDocument();
  });

  it("menampilkan error print", () => {
    render(
      <PrinterStatusPanel
        printerStatus="READY"
        printStatus="ERROR"
        printError="Pencetakan gagal"
      />,
    );
    expect(screen.getByText("Pencetakan gagal")).toBeInTheDocument();
  });
});

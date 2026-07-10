import { ClinicFlowProvider } from "@/features/clinic/context/clinic-flow-context";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClinicFlowProvider>{children}</ClinicFlowProvider>;
}

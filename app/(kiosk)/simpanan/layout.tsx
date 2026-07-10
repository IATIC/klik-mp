import { SavingsFlowProvider } from "@/features/savings";

export default function SimpananLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SavingsFlowProvider>{children}</SavingsFlowProvider>;
}

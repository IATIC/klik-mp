import type { Metadata } from "next";
import { LandingShell } from "@/components/landing-shell";

export const metadata: Metadata = {
  title: "KLIK-MP",
};

export default function Home() {
  return <LandingShell />;
}

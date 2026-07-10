import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { KioskFlowProvider } from "./kiosk-flow-provider";

export const metadata: Metadata = {
  title: {
    default: "KLIK-MP",
    template: "%s · KLIK-MP",
  },
  description:
    "Kios layanan intake komoditas Koperasi Desa/Kelurahan Merah Putih.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        <KioskFlowProvider>{children}</KioskFlowProvider>
      </body>
    </html>
  );
}

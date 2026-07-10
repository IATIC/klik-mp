"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Scale, CheckCircle2, AlertCircle } from "lucide-react";
import * as React from "react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import { cameraAdapter } from "@/lib/devices/camera";
import { scaleAdapter } from "@/lib/devices/scale";
import { useKioskFlow } from "@/features/kiosk-flow";

export default function CapturePage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();

  // All hooks must be before any early return
  const [photoState, setPhotoState] = React.useState<"idle" | "capturing" | "done" | "error">("idle");
  const [photoError, setPhotoError] = React.useState<string>("");
  const [weightState, setWeightState] = React.useState<"idle" | "reading" | "done" | "error">("idle");
  const [weightError, setWeightError] = React.useState<string>("");
  const [grossWeight, setGrossWeight] = React.useState<number>(0);
  const [tareWeight, setTareWeight] = React.useState<number>(0);
  const [netWeight, setNetWeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (!state.selectedCommodity) {
      router.replace("/intake/commodity");
    }
  }, [state.selectedCommodity, router]);

  if (!state.selectedCommodity) return null;

  const commodity = state.selectedCommodity;
  const hasPhoto = state.capturedPhoto !== null;
  const hasWeight = state.weight !== null;
  const bothDone = hasPhoto && hasWeight;

  async function handleTakePhoto() {
    if (photoState === "capturing") return;
    setPhotoState("capturing");
    setPhotoError("");
    try {
      const result = await cameraAdapter.captureCommodity(commodity.name);
      if (result.ok) {
        dispatch({ type: "SET_CAPTURE", photo: result.photo, weight: state.weight ?? { gross: 0, tare: 0, net: 0 } });
        setPhotoState("done");
      } else {
        setPhotoError(result.error);
        setPhotoState("error");
      }
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Gagal mengambil foto");
      setPhotoState("error");
    }
  }

  async function handleWeigh() {
    if (weightState === "reading") return;
    setWeightState("reading");
    setWeightError("");
    try {
      const snapshot = await scaleAdapter.read(commodity.id);
      setGrossWeight(snapshot.gross);
      setTareWeight(snapshot.tare);
      setNetWeight(snapshot.net);
      dispatch({ type: "SET_CAPTURE", photo: state.capturedPhoto ?? { reference: "", label: "" }, weight: snapshot });
      setWeightState("done");
    } catch (err) {
      setWeightError(err instanceof Error ? err.message : "Gagal membaca timbangan");
      setWeightState("error");
    }
  }

  function handleNext() {
    if (bothDone) {
      router.push("/intake/assessment");
    }
  }

  function handleBack() {
    router.push("/intake/commodity");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleBack}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Kembali
        </Button>
      }
      end={
        <Button size="kiosk" disabled={!bothDone} onClick={handleNext}>
          Selanjutnya
          <ArrowRight aria-hidden="true" className="size-5" />
        </Button>
      }
    />
  );

  return (
    <KioskPage
      progress={{ label: "Penerimaan", current: 2, total: 5 }}
      footer={footer}
    >
      <div className="mx-auto grid h-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 animate-foundation-in">
        {/* Camera Section */}
        <section className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Camera aria-hidden="true" className="size-6 text-primary" />
            Foto Komoditas
          </h2>

          {/* Camera Preview */}
          <div className="mb-4 flex min-h-48 flex-1 items-center justify-center rounded-2xl bg-surface sm:min-h-64">
            {photoState === "done" ? (
              <div className="flex flex-col items-center gap-2 text-success">
                <CheckCircle2 aria-hidden="true" className="size-10" />
                <p className="font-bold">Foto berhasil diambil</p>
              </div>
            ) : (
              <Camera aria-hidden="true" className="size-12 text-muted-foreground/50" />
            )}
          </div>

          <Button
            size="kiosk"
            variant={photoState === "done" ? "outline" : "default"}
            onClick={handleTakePhoto}
            disabled={photoState === "capturing"}
            className="w-full"
          >
            {photoState === "capturing" ? "Mengambil foto..." : photoState === "done" ? "Ambil ulang" : "Ambil foto"}
          </Button>

          {photoState === "error" && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              {photoError}
            </p>
          )}
        </section>

        {/* Scale Section */}
        <section className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Scale aria-hidden="true" className="size-6 text-primary" />
            Timbangan
          </h2>

          {/* Weight Display */}
          <div className="mb-4 flex min-h-48 flex-1 flex-col items-center justify-center rounded-2xl bg-surface sm:min-h-64">
            {weightState === "done" ? (
              <div className="space-y-3 text-center">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bruto</p>
                    <p className="text-xl font-extrabold">{grossWeight.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tara</p>
                    <p className="text-xl font-extrabold">{tareWeight.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Netto</p>
                    <p className="text-2xl font-extrabold text-primary">{netWeight.toFixed(1)} kg</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Scale aria-hidden="true" className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">
                  {weightState === "reading" ? "Sedang membaca..." : "Timbang komoditas"}
                </p>
              </>
            )}
          </div>

          <Button
            size="kiosk"
            variant={weightState === "done" ? "outline" : "default"}
            onClick={handleWeigh}
            disabled={weightState === "reading"}
            className="w-full"
          >
            {weightState === "reading" ? "Menimbang..." : weightState === "done" ? "Timbang ulang" : "Timbang"}
          </Button>

          {weightState === "error" && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              {weightError}
            </p>
          )}
        </section>
      </div>
    </KioskPage>
  );
}

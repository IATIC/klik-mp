import type { ReactNode } from "react";
import {
  BuildingSketch,
  ScaleSketch,
  PlantSketch,
  HandshakeSketch,
} from "@/components/landing-illustrations";

type Props = {
  children: ReactNode;
};

export function AuthBackground({ children }: Props) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-surface px-6 py-8 sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <BuildingSketch className="absolute -left-4 top-12 size-52 text-primary" />
        <HandshakeSketch className="absolute -right-6 top-32 size-56 text-primary" />
        <PlantSketch className="absolute -bottom-8 left-20 size-48 text-primary" />
        <ScaleSketch className="absolute bottom-16 right-8 size-48 text-primary" />
        <ScaleSketch className="absolute left-1/3 top-1/4 size-40 -translate-x-1/2 -translate-y-1/2 text-primary" />
        <BuildingSketch className="absolute right-1/5 top-3/4 size-44 text-primary" />
      </div>
      <div className="relative z-10 flex w-full justify-center">
        {children}
      </div>
    </main>
  );
}

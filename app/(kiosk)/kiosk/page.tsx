"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Handshake,
  PiggyBank,
  HandCoins,
  Stethoscope,
  ClipboardList,
  LogOut,
  UserRound,
} from "lucide-react";

import { KioskFooterActions } from "@/components/kiosk/kiosk-footer-actions";
import { KioskPage } from "@/components/kiosk/kiosk-page";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_COMMODITY,
  DEMO_IDENTITY,
  type AuthenticatedUser,
  useKioskFlow,
} from "@/features/kiosk-flow";

const DEMO_USER: AuthenticatedUser = {
  memberNumber: DEMO_IDENTITY.memberNumber,
  fullName: DEMO_IDENTITY.fullName,
  nikMasked: DEMO_IDENTITY.nik.replace(/^(\d{2})\d+(\d{2})$/, "$1****$2"),
  loginMethod: "fingerprint",
};

type MenuItem = {
  id: string;
  label: string;
  icon: typeof Handshake;
  color: string;
  iconBg: string;
  route: string;
  desc: string;
};

const MENUS: MenuItem[] = [
  {
    id: "offtacker",
    label: "Off-Taker",
    icon: Handshake,
    color: "from-[#025669] to-[#054353]",
    iconBg: "bg-white/15",
    route: "/intake/commodity",
    desc: "Jual komoditas",
  },
  {
    id: "simpanan",
    label: "Simpanan",
    icon: PiggyBank,
    color: "from-emerald-700 to-emerald-800",
    iconBg: "bg-white/15",
    route: "/simpanan",
    desc: "Simpan & tarik",
  },
  {
    id: "pinjaman",
    label: "Pinjaman",
    icon: HandCoins,
    color: "from-amber-600 to-amber-800",
    iconBg: "bg-white/15",
    route: "/pinjaman",
    desc: "Ajukan pinjaman",
  },
  {
    id: "klinikdesa",
    label: "Klinikdesa",
    icon: Stethoscope,
    color: "from-rose-600 to-rose-800",
    iconBg: "bg-white/15",
    route: "/clinic",
    desc: "Layanan kesehatan",
  },
  {
    id: "rat",
    label: "Rapat Anggota Tahunan",
    icon: ClipboardList,
    color: "from-violet-600 to-violet-800",
    iconBg: "bg-white/15",
    route: "/erat",
    desc: "Laporan & evaluasi tahunan",
  },
];

/** Map distance from center to visual scale factor (eased) */
function scaleAtDistance(dist: number): number {
  if (dist === 0) return 1;
  if (dist === 1) return 0.62;
  if (dist === 2) return 0.38;
  return 0;
}

/** Map distance from center to opacity */
function opacityAtDistance(dist: number): number {
  if (dist === 0) return 1;
  if (dist === 1) return 0.7;
  if (dist === 2) return 0.3;
  return 0;
}

export default function KioskHomePage() {
  const router = useRouter();
  const { state, dispatch } = useKioskFlow();
  const [activeIndex, setActiveIndex] = useState(2);

  const user = state.authenticatedUser ?? DEMO_USER;
  const isAuthenticated = state.authenticatedUser !== null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleNav = useCallback(
    (item: MenuItem) => {
      if (item.id === "offtacker") {
        dispatch({ type: "SET_COMMODITY", commodity: DEFAULT_COMMODITY });
      }
      router.push(item.route);
    },
    [dispatch, router],
  );

  const handleItemClick = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        handleNav(MENUS[index]);
      } else {
        setActiveIndex(index);
      }
    },
    [activeIndex, handleNav],
  );

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let swiping = false;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      swiping = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 15 || Math.abs(dy) > 15) swiping = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!swiping) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dx) < 40) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.5) return;

      if (dx < 0 && activeIndex < MENUS.length - 1) {
        setActiveIndex((i) => Math.min(i + 1, MENUS.length - 1));
      } else if (dx > 0 && activeIndex > 0) {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }

      startX = 0;
      startY = 0;
      swiping = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex]);

  if (!isAuthenticated) return null;

  function handleLogout() {
    dispatch({ type: "RESET_SESSION" });
    router.push("/");
  }

  function handleExit() {
    dispatch({ type: "RESET_SESSION" });
    router.push("/");
  }

  const footer = (
    <KioskFooterActions
      start={
        <Button variant="outline" size="kiosk" onClick={handleLogout}>
          <LogOut aria-hidden="true" className="size-5" />
          Keluar
        </Button>
      }
    />
  );

  return (
    <KioskPage showExit onExit={handleExit} footer={footer}>
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-5 sm:gap-6 animate-foundation-in">
        {/* Welcome strip — compact */}
        <section className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
            <UserRound aria-hidden="true" className="size-6 sm:size-7" strokeWidth={1.7} />
          </span>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-sm font-medium text-muted-foreground">Halo,</p>
            <h1 className="text-xl font-extrabold sm:text-2xl">{user.fullName}</h1>
            <span className="hidden rounded-md bg-deep-teal/10 px-2.5 py-0.5 text-xs font-bold text-deep-teal sm:inline-block">
              {user.memberNumber}
            </span>
          </div>
        </section>

        {/* Fisheye carousel — main area */}
        <section ref={carouselRef} className="flex min-h-0 flex-1 items-center justify-center px-0 sm:px-4">
          <div className="flex w-full items-center justify-center gap-3 sm:gap-4 lg:gap-5">
            {MENUS.map((item, i) => {
              const dist = Math.abs(i - activeIndex);
              const scale = scaleAtDistance(dist);
              const opacity = opacityAtDistance(dist);
              const zIndex = MENUS.length - dist;
              const Icon = item.icon;
              const isCenter = i === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(i)}
                  className={[
                    "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden",
                    "rounded-3xl border-0 text-white shadow-lg outline-none",
                    "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    "focus-visible:ring-4 focus-visible:ring-ring/30",
                    "min-h-48 sm:min-h-56 lg:min-h-64",
                    "bg-gradient-to-br " + item.color,
                  ].join(" ")}
                  style={{
                    flex: `${scale} 1 0%`,
                    opacity,
                    transform: `scale(${Math.max(scale, 0.3)})`,
                    zIndex,
                  }}
                  aria-label={item.label}
                >
                  {/* Decorative orbs */}
                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute rounded-full bg-white/5 transition-all duration-500",
                      isCenter ? "size-64 opacity-100" : "size-32 opacity-0",
                    ].join(" ")}
                    style={{ top: "-30%", right: "-20%" }}
                  />

                  {/* Icon */}
                  <span
                    className={[
                      "flex items-center justify-center rounded-2xl transition-all duration-500",
                      item.iconBg,
                      isCenter ? "size-16 sm:size-20" : "size-10 sm:size-12",
                    ].join(" ")}
                  >
                    <Icon
                      aria-hidden="true"
                      className={[
                        "transition-all duration-500",
                        isCenter ? "size-8 sm:size-10" : "size-5 sm:size-6",
                      ].join(" ")}
                      strokeWidth={1.7}
                    />
                  </span>

                  {/* Label */}
                  <span
                    className={[
                      "mt-3 text-center font-extrabold leading-tight transition-all duration-500",
                      isCenter
                        ? "text-xl sm:text-2xl lg:text-3xl opacity-100"
                        : "text-xs sm:text-sm lg:text-base opacity-70",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  {/* Description - only visible at center */}
                  <span
                    className={[
                      "mt-1 text-center text-sm leading-snug transition-all duration-500",
                      isCenter
                        ? "max-h-8 opacity-80"
                        : "max-h-0 opacity-0 overflow-hidden",
                    ].join(" ")}
                  >
                    {item.desc}
                  </span>

                  {/* Active indicator */}
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute bottom-4 left-1/2 h-1 rounded-full bg-white transition-all duration-500",
                      isCenter
                        ? "w-16 opacity-70"
                        : "w-0 opacity-0",
                    ].join(" ")}
                    style={{ translate: "-50%" }}
                  />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </KioskPage>
  );
}

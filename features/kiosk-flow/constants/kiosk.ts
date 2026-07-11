import type { Commodity, IdentityRecord } from "../types/kiosk-flow";

export const DEMO_IDENTITY: IdentityRecord = {
  nik: "3273000000000042",
  memberNumber: "AGT-0042",
  fullName: "Budi Anggara",
  birthPlace: "Bandung",
  birthDate: "1988-05-12",
  address: "Desa Sukamaju, Kecamatan Cibiru, Kota Bandung",
};

export const DEMO_CREDENTIALS = {
  account: DEMO_IDENTITY.nik,
  memberNumber: DEMO_IDENTITY.memberNumber,
  password: "Klikmp123",
} as const;

export const COMMODITIES: Commodity[] = [
  { id: "chili", name: "Cabai Merah", emoji: "🌶️", description: "Cabai merah segar" },
  { id: "shallot", name: "Bawang Merah", emoji: "🧅", description: "Bawang merah panen" },
  { id: "tomato", name: "Tomat", emoji: "🍅", description: "Tomat segar" },
  { id: "rice", name: "Beras", emoji: "🌾", description: "Beras konsumsi" },
  { id: "corn", name: "Jagung", emoji: "🌽", description: "Jagung pipil atau tongkol" },
  { id: "other", name: "Komoditas lainnya", emoji: "◫", description: "Pilih bersama petugas" },
];

export const DEFAULT_COMMODITY = COMMODITIES[0];

export const KIOSK_ROUTES = {
  welcome: "/",
  access: "/access",
  registerFingerprint: "/register/fingerprint",
  registerIdentity: "/register/identity",
  registerManual: "/register/manual",
  registerFace: "/register/face",
  registerPassword: "/register/password",
  registerSuccess: "/register/success",
  login: "/login",
  loginBiometric: "/login/biometric",
  loginManual: "/login/manual",
  kiosk: "/kiosk",
  intakeCommodity: "/intake/commodity",
  intakeCapture: "/intake/capture",
  intakeAssessment: "/intake/assessment",
  intakeOffer: "/intake/offer",
  intakeSuccess: "/intake/success",
} as const;


export type DeviceStatus =
  | "idle"
  | "ready"
  | "reading"
  | "capturing"
  | "success"
  | "failed"
  | "disconnected";

export type IdentityRecord = {
  nik: string;
  memberNumber: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
};

export type RegistrationSource = "dukcapil" | "manual";

export type RegistrationDraft = {
  source: RegistrationSource | null;
  fingerprintVerified: boolean;
  identity: IdentityRecord | null;
  faceCaptured: boolean;
  completed: boolean;
};

export type AuthenticatedUser = {
  memberNumber: string;
  fullName: string;
  nikMasked: string;
  loginMethod: "fingerprint" | "face" | "manual";
};

export type CommodityId = "chili" | "shallot" | "tomato" | "rice" | "corn" | "other";

export type Commodity = {
  id: CommodityId;
  name: string;
  emoji: string;
  description: string;
};

export type CapturedCommodityPhoto = {
  reference: string;
  label: string;
};

export type WeightSnapshot = {
  gross: number;
  tare: number;
  net: number;
};

export type AssessmentResult = {
  commodityId: CommodityId;
  commodityName: string;
  grade: "Grade A" | "Grade B";
  qualityLabel: string;
  referencePrice: number;
  confidence: number;
};

export type OfferState = {
  referencePrice: number;
  total: number;
  counteroffer: number | null;
  negotiationReason: string;
  agreedTotal: number | null;
  status: "offered" | "reviewing" | "agreed";
};

export type TransactionReceipt = {
  transactionNumber: string;
  commodityName: string;
  grade: string;
  netWeight: number;
  agreedUnitPrice: number;
  total: number;
  printedCount: number;
};

export type KioskFlowState = {
  version: 1;
  registration: RegistrationDraft;
  selectedLoginMethod: "biometric" | "manual" | null;
  authenticatedUser: AuthenticatedUser | null;
  selectedCommodity: Commodity | null;
  capturedPhoto: CapturedCommodityPhoto | null;
  weight: WeightSnapshot | null;
  assessment: AssessmentResult | null;
  offer: OfferState | null;
  receipt: TransactionReceipt | null;
};

export type KioskFlowAction =
  | { type: "HYDRATE"; state: KioskFlowState }
  | { type: "SET_REGISTRATION_SOURCE"; source: RegistrationSource }
  | { type: "SET_REGISTRATION_IDENTITY"; identity: IdentityRecord; source: RegistrationSource }
  | { type: "SET_FINGERPRINT_VERIFIED"; verified: boolean }
  | { type: "SET_FACE_CAPTURED"; captured: boolean }
  | { type: "COMPLETE_REGISTRATION" }
  | { type: "SET_LOGIN_METHOD"; method: "biometric" | "manual" }
  | { type: "AUTHENTICATE"; user: AuthenticatedUser }
  | { type: "SET_COMMODITY"; commodity: Commodity }
  | { type: "SET_CAPTURE"; photo: CapturedCommodityPhoto; weight: WeightSnapshot }
  | { type: "SET_ASSESSMENT"; assessment: AssessmentResult; offer: OfferState }
  | { type: "SET_NEGOTIATION"; counteroffer: number; reason: string; status: "reviewing" | "agreed"; agreedTotal?: number }
  | { type: "SET_RECEIPT"; receipt: TransactionReceipt }
  | { type: "INCREMENT_RECEIPT_PRINT" }
  | { type: "RESET_REGISTRATION" }
  | { type: "RESET_INTAKE" }
  | { type: "RESET_SESSION" };


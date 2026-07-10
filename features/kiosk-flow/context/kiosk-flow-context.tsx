"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";

import type { KioskFlowAction, KioskFlowState } from "../types/kiosk-flow";

export const KIOSK_SESSION_KEY = "klik-mp:kiosk-flow:v1";

const emptyRegistration = {
  source: null,
  fingerprintVerified: false,
  identity: null,
  faceCaptured: false,
  completed: false,
} as const;

export const initialKioskFlowState: KioskFlowState = {
  version: 1,
  registration: { ...emptyRegistration },
  selectedLoginMethod: null,
  authenticatedUser: null,
  selectedCommodity: null,
  capturedPhoto: null,
  weight: null,
  assessment: null,
  offer: null,
  receipt: null,
};

export function kioskFlowReducer(state: KioskFlowState, action: KioskFlowAction): KioskFlowState {
  switch (action.type) {
    case "HYDRATE":
      return action.state.version === 1 ? action.state : state;
    case "SET_REGISTRATION_SOURCE":
      return { ...state, registration: { ...state.registration, source: action.source } };
    case "SET_REGISTRATION_IDENTITY":
      return { ...state, registration: { ...state.registration, identity: action.identity, source: action.source } };
    case "SET_FINGERPRINT_VERIFIED":
      return { ...state, registration: { ...state.registration, fingerprintVerified: action.verified } };
    case "SET_FACE_CAPTURED":
      return { ...state, registration: { ...state.registration, faceCaptured: action.captured } };
    case "COMPLETE_REGISTRATION":
      return { ...state, registration: { ...state.registration, completed: true } };
    case "SET_LOGIN_METHOD":
      return { ...state, selectedLoginMethod: action.method };
    case "AUTHENTICATE":
      return { ...state, authenticatedUser: action.user };
    case "SET_COMMODITY":
      return { ...state, selectedCommodity: action.commodity, capturedPhoto: null, weight: null, assessment: null, offer: null, receipt: null };
    case "SET_CAPTURE":
      return { ...state, capturedPhoto: action.photo, weight: action.weight, assessment: null, offer: null, receipt: null };
    case "SET_ASSESSMENT":
      return { ...state, assessment: action.assessment, offer: action.offer };
    case "SET_NEGOTIATION":
      return {
        ...state,
        offer: state.offer
          ? {
              ...state.offer,
              counteroffer: action.counteroffer,
              negotiationReason: action.reason,
              status: action.status,
              agreedTotal: action.agreedTotal ?? state.offer.agreedTotal,
            }
          : null,
      };
    case "SET_RECEIPT":
      return { ...state, receipt: action.receipt };
    case "INCREMENT_RECEIPT_PRINT":
      return state.receipt
        ? { ...state, receipt: { ...state.receipt, printedCount: state.receipt.printedCount + 1 } }
        : state;
    case "RESET_REGISTRATION":
      return { ...state, registration: { ...emptyRegistration } };
    case "RESET_INTAKE":
      return { ...state, selectedCommodity: null, capturedPhoto: null, weight: null, assessment: null, offer: null, receipt: null };
    case "RESET_SESSION":
      return initialKioskFlowState;
    default:
      return state;
  }
}

export function resetStoredKioskSession(storage: Pick<Storage, "removeItem">) {
  storage.removeItem(KIOSK_SESSION_KEY);
}

type KioskFlowContextValue = {
  state: KioskFlowState;
  dispatch: React.Dispatch<KioskFlowAction>;
  hydrated: boolean;
  resetSession: () => void;
};

const KioskFlowContext = createContext<KioskFlowContextValue | null>(null);

export function KioskFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kioskFlowReducer, initialKioskFlowState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(KIOSK_SESSION_KEY);
      if (stored) dispatch({ type: "HYDRATE", state: JSON.parse(stored) as KioskFlowState });
    } catch {
      sessionStorage.removeItem(KIOSK_SESSION_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(KIOSK_SESSION_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const resetSession = useCallback(() => {
    resetStoredKioskSession(sessionStorage);
    dispatch({ type: "RESET_SESSION" });
  }, []);

  const value = useMemo(() => ({ state, dispatch, hydrated, resetSession }), [state, hydrated, resetSession]);
  return <KioskFlowContext.Provider value={value}>{children}</KioskFlowContext.Provider>;
}

export function useKioskFlow() {
  const context = useContext(KioskFlowContext);
  if (!context) throw new Error("useKioskFlow harus digunakan di dalam KioskFlowProvider.");
  return context;
}


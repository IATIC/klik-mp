"use client";

import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";
import type { ClinicFlowAction, ClinicFlowState } from "../types/clinic";

const initialClinicFlowState: ClinicFlowState = {
  member: null,
  availableServices: [],
  selectedService: null,
  complaintSummary: "",
  documentRequirements: [],
  consentAccepted: false,
  applicationStatus: "DRAFT",
  queueTicket: null,
  currentQueueSummary: null,
  submissionStatus: "IDLE",
  submissionError: null,
  printerStatus: "READY",
  printStatus: "IDLE",
  printError: null,
  loading: false,
  error: null,
};

function clinicFlowReducer(
  state: ClinicFlowState,
  action: ClinicFlowAction,
): ClinicFlowState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_MEMBER":
      return { ...state, member: action.member };
    case "SET_AVAILABLE_SERVICES":
      return { ...state, availableServices: action.services };
    case "SELECT_SERVICE":
      return { ...state, selectedService: action.service };
    case "SET_COMPLAINT_SUMMARY":
      return { ...state, complaintSummary: action.complaintSummary };
    case "SET_DOCUMENT_REQUIREMENTS":
      return { ...state, documentRequirements: action.requirements };
    case "TOGGLE_DOCUMENT": {
      const updated = state.documentRequirements.map((req) =>
        req.id === action.documentId ? { ...req, available: !req.available } : req,
      );
      return { ...state, documentRequirements: updated };
    }
    case "SET_CONSENT_ACCEPTED":
      return { ...state, consentAccepted: action.accepted };
    case "SET_APPLICATION_STATUS":
      return { ...state, applicationStatus: action.status };
    case "SET_QUEUE_TICKET":
      return { ...state, queueTicket: action.ticket, applicationStatus: "QUEUED" };
    case "SET_QUEUE_SUMMARY":
      return { ...state, currentQueueSummary: action.summary };
    case "SET_SUBMISSION_STATUS":
      return {
        ...state,
        submissionStatus: action.status,
        submissionError: action.error ?? null,
      };
    case "SET_PRINTER_STATUS":
      return { ...state, printerStatus: action.status };
    case "SET_PRINT_STATUS":
      return {
        ...state,
        printStatus: action.status,
        printError: action.error ?? null,
      };
    case "INCREMENT_TICKET_PRINT":
      return state.queueTicket
        ? {
            ...state,
            queueTicket: {
              ...state.queueTicket,
              printedCount: state.queueTicket.printedCount + 1,
            },
          }
        : state;
    case "RESET_FLOW":
      return initialClinicFlowState;
    default:
      return state;
  }
}

type ClinicFlowContextValue = {
  state: ClinicFlowState;
  dispatch: React.Dispatch<ClinicFlowAction>;
};

const ClinicFlowContext = createContext<ClinicFlowContextValue | null>(null);

export function ClinicFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clinicFlowReducer, initialClinicFlowState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return (
    <ClinicFlowContext.Provider value={value}>{children}</ClinicFlowContext.Provider>
  );
}

export function useClinicFlow() {
  const context = useContext(ClinicFlowContext);
  if (!context) {
    throw new Error("useClinicFlow harus digunakan di dalam ClinicFlowProvider.");
  }
  return context;
}

export { clinicFlowReducer, initialClinicFlowState };

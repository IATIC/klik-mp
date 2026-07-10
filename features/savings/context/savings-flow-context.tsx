"use client";

import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";
import type { SavingsFlowAction, SavingsFlowState } from "../types/savings";

const initialSavingsFlowState: SavingsFlowState = {
  memberId: "",
  summary: null,
  transactions: [],
  mandatoryInvoices: [],
  summaryLoading: false,
  summaryError: null,

  selectedSavingsType: null,
  selectedMandatoryInvoice: null,
  paymentMode: null,
  enteredAmount: 0,
  withdrawalReason: "",
  currentDocument: null,
  submissionStatus: "IDLE",
  submissionError: null,

  printerStatus: "READY",
  printStatus: "IDLE",
  printError: null,
};

function savingsFlowReducer(
  state: SavingsFlowState,
  action: SavingsFlowAction,
): SavingsFlowState {
  switch (action.type) {
    case "SET_SUMMARY":
      return { ...state, summary: action.summary, summaryLoading: false, summaryError: null };
    case "SET_SUMMARY_LOADING":
      return { ...state, summaryLoading: action.loading };
    case "SET_SUMMARY_ERROR":
      return { ...state, summaryError: action.error, summaryLoading: false };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.transactions };
    case "SET_MANDATORY_INVOICES":
      return { ...state, mandatoryInvoices: action.invoices };
    case "SET_MEMBER_ID":
      return { ...state, memberId: action.memberId };
    case "SELECT_SAVINGS_TYPE":
      return { ...state, selectedSavingsType: action.savingsType };
    case "SELECT_MANDATORY_INVOICE":
      return { ...state, selectedMandatoryInvoice: action.invoice };
    case "SET_PAYMENT_MODE":
      return { ...state, paymentMode: action.mode };
    case "SET_ENTERED_AMOUNT":
      return { ...state, enteredAmount: action.amount };
    case "SET_WITHDRAWAL_REASON":
      return { ...state, withdrawalReason: action.reason };
    case "SET_DOCUMENT":
      return {
        ...state,
        currentDocument: action.document,
        submissionStatus: "SUCCESS",
        submissionError: null,
      };
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
    case "INCREMENT_DOCUMENT_PRINT":
      return state.currentDocument
        ? {
            ...state,
            currentDocument: {
              ...state.currentDocument,
              printedCount: state.currentDocument.printedCount + 1,
            },
          }
        : state;
    case "RESET_FLOW":
      return initialSavingsFlowState;
    default:
      return state;
  }
}

type SavingsFlowContextValue = {
  state: SavingsFlowState;
  dispatch: React.Dispatch<SavingsFlowAction>;
};

const SavingsFlowContext = createContext<SavingsFlowContextValue | null>(null);

export function SavingsFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(savingsFlowReducer, initialSavingsFlowState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return (
    <SavingsFlowContext.Provider value={value}>{children}</SavingsFlowContext.Provider>
  );
}

export function useSavingsFlow() {
  const context = useContext(SavingsFlowContext);
  if (!context) {
    throw new Error("useSavingsFlow harus digunakan di dalam SavingsFlowProvider.");
  }
  return context;
}

export { savingsFlowReducer, initialSavingsFlowState };

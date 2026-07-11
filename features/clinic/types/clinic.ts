// ── Union types ──

export type ClinicApplicationStatus =
  | "DRAFT"
  | "DOCUMENTS_INCOMPLETE"
  | "READY_TO_SUBMIT"
  | "SUBMITTING"
  | "QUEUED"
  | "FAILED"
  | "CANCELLED";

export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "IN_SERVICE"
  | "COMPLETED"
  | "CANCELLED";

export type DocumentRequirementStatus = "AVAILABLE" | "MISSING" | "OPTIONAL";

export type PrinterStatus =
  | "READY"
  | "PRINTING"
  | "SUCCESS"
  | "FAILED"
  | "DISCONNECTED";

export type SubmissionStatus =
  | "IDLE"
  | "LOADING"
  | "SUCCESS"
  | "ERROR"
  | "DUPLICATE";

export type ClinicServiceStatus = "OPEN" | "CLOSED" | "UNAVAILABLE";

// ── Data model interfaces ──

export interface ClinicServiceItem {
  id: string;
  name: string;
  description: string;
  status: ClinicServiceStatus;
  currentQueueLength: number;
  estimatedWaitMinutes: number;
}

export interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
  status: DocumentRequirementStatus;
  available: boolean;
}

export interface ClinicApplicationInput {
  memberId: string;
  serviceId: string;
  complaintSummary: string;
  documentRequirements: DocumentRequirement[];
  consentAccepted: boolean;
}

export interface ClinicQueueTicket {
  id: string;
  queueNumber: string;
  serviceName: string;
  serviceId: string;
  visitDate: string;
  peopleAhead: number;
  location: string;
  status: QueueStatus;
  printedCount: number;
  createdAt: string;
}

export interface PrintResult {
  success: boolean;
  message: string;
  ticketId: string;
}

export interface QueueSummary {
  serviceId: string;
  serviceName: string;
  currentQueueCount: number;
  estimatedWaitMinutes: number;
  status: ClinicServiceStatus;
  operatingHours: string;
}

// ── Service interfaces ──

export interface ClinicService {
  getAvailableServices(): Promise<ClinicServiceItem[]>;
  getDocumentRequirements(
    memberId: string,
  ): Promise<DocumentRequirement[]>;
  submitApplication(
    input: ClinicApplicationInput,
  ): Promise<ClinicQueueTicket>;
}

export interface QueueService {
  getCurrentQueue(serviceId: string): Promise<QueueSummary>;
  getTicket(ticketId: string): Promise<ClinicQueueTicket>;
  isDuplicateSubmission(memberId: string): Promise<boolean>;
}

export interface QueuePrintService {
  getStatus(): Promise<PrinterStatus>;
  printQueueTicket(ticket: ClinicQueueTicket): Promise<PrintResult>;
  reprintQueueTicket(ticket: ClinicQueueTicket): Promise<PrintResult>;
}

// ── Mock Member Info ──

export interface ClinicMemberInfo {
  memberId: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  maskedNik: string;
  dateOfBirth: string;
}

// ── Flow state ──

export interface ClinicFlowState {
  member: ClinicMemberInfo | null;
  availableServices: ClinicServiceItem[];
  selectedService: ClinicServiceItem | null;
  complaintSummary: string;
  documentRequirements: DocumentRequirement[];
  consentAccepted: boolean;
  applicationStatus: ClinicApplicationStatus;
  queueTicket: ClinicQueueTicket | null;
  currentQueueSummary: QueueSummary | null;
  submissionStatus: SubmissionStatus;
  submissionError: string | null;
  printerStatus: PrinterStatus;
  printStatus: SubmissionStatus;
  printError: string | null;
  loading: boolean;
  error: string | null;
}

// ── Flow actions (discriminated union) ──

export type ClinicFlowAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_MEMBER"; member: ClinicMemberInfo }
  | { type: "SET_AVAILABLE_SERVICES"; services: ClinicServiceItem[] }
  | { type: "SELECT_SERVICE"; service: ClinicServiceItem }
  | { type: "SET_COMPLAINT_SUMMARY"; complaintSummary: string }
  | { type: "SET_DOCUMENT_REQUIREMENTS"; requirements: DocumentRequirement[] }
  | { type: "TOGGLE_DOCUMENT"; documentId: string }
  | { type: "SET_CONSENT_ACCEPTED"; accepted: boolean }
  | { type: "SET_APPLICATION_STATUS"; status: ClinicApplicationStatus }
  | { type: "SET_QUEUE_TICKET"; ticket: ClinicQueueTicket }
  | { type: "SET_QUEUE_SUMMARY"; summary: QueueSummary }
  | { type: "SET_SUBMISSION_STATUS"; status: SubmissionStatus; error?: string | null }
  | { type: "SET_PRINTER_STATUS"; status: PrinterStatus }
  | { type: "SET_PRINT_STATUS"; status: SubmissionStatus; error?: string | null }
  | { type: "INCREMENT_TICKET_PRINT" }
  | { type: "RESET_FLOW" };

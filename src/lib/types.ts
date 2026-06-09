export type Lang = "ar" | "fr" | "en";

export type ServiceType =
  | "boiler"
  | "heating"
  | "plumbing"
  | "pvc"
  | "gas"
  | "handyman"
  | "allWorks";

export type InstallationLocation = "home" | "workshop" | "projects";

export type BoilerAction =
  | "repair"
  | "maintenance"
  | "descaling"
  | "remove"
  | "install";

export type Status = "waiting" | "done" | "cancelled";
export type FinalState = "awaitingParts" | "enRoute" | "warrantyFollowUp";

/** Map any legacy status string ("new", "inProgress", "waitingParts") to the new 3-value enum. */
export function normalizeStatus(s: string | undefined | null): Status {
  if (s === "done" || s === "cancelled") return s;
  return "waiting";
}

/** Infer a finalState from a legacy status when migrating older records. */
export function inferFinalState(s: string | undefined | null): FinalState | undefined {
  if (s === "waitingParts") return "awaitingParts";
  if (s === "inProgress") return "enRoute";
  return undefined;
}

export type PaymentColor = "paid" | "partial" | "debt" | "custom" | "empty";

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Visit {
  date: string;
  number: number;
  label: string;
  notes?: string;
}

export interface Warranty {
  status: "under" | "out";
  company?: string;
  serial?: string;
  startDate?: string;
  endDate?: string;
}

export interface Payment {
  partsCost?: number;
  laborCost?: number;
  advance?: number;
  customFlag?: boolean; // purple ledger state
  note?: string;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  capturedAt: string;
}

export interface CRMRecord {
  id: string;
  createdAt: string;          // Date Commande (editable)
  completionDate?: string;    // Date Fin (editable)
  client: string;
  phone: string;
  zone: string;
  brand: string;
  model: string;
  serviceType: ServiceType;
  installationLocation: InstallationLocation;
  boilerAction?: BoilerAction;
  status: Status;
  finalState?: FinalState;
  fault: string;
  diagnosticFinal?: string;
  assignedTech?: string;
  appointment?: string;
  appointmentReminded?: boolean;
  payment: Payment;
  warranty?: Warranty;
  tasks?: Task[];
  visits: Visit[];
  visitNumber: number;
  inDailyPlan: boolean;
  archivedAt?: string;
  gps?: GpsPoint;
  nextMaintenanceDate?: string;
  maintenanceAlertDays?: number;
}

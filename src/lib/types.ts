export type Lang = "ar" | "fr" | "en";

export type ServiceType =
  | "boiler"
  | "heating"
  | "plumbing"
  | "pvc"
  | "gas"
  | "handyman"
  | "allWorks";

export type InstallationLocation = "home" | "workshop";

export type BoilerAction =
  | "repair"
  | "maintenance"
  | "descaling"
  | "remove"
  | "install";

export type Status = "new" | "inProgress" | "waitingParts" | "done" | "cancelled";

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

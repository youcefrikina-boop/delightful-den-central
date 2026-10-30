import type { CRMRecord } from "./types";

export type CustomerSort = "newest" | "oldest" | "name";

export function filterCustomers(records: CRMRecord[], query: string, status: string, service: string, sort: CustomerSort) {
  const q = query.trim().toLowerCase();
  return records.filter((r) =>
    (!q || [r.client, r.phone, r.zone, r.brand, r.model, r.fault].join(" ").toLowerCase().includes(q)) &&
    (status === "all" || r.status === status) &&
    (service === "all" || r.serviceType === service),
  ).sort((a, b) => sort === "name" ? a.client.localeCompare(b.client) :
    sort === "oldest" ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
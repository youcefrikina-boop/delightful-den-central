import { describe, test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { filterCustomers } from "./customerFilters";
import type { CRMRecord } from "./types";

const records = [
  { id: "1", client: "أحمد", serviceType: "boiler", status: "waiting", createdAt: "2026-10-01" },
  { id: "2", client: "علي", serviceType: "plumbing", status: "done", createdAt: "2026-10-02" },
  { id: "3", client: "سليم", serviceType: "plumbing", status: "waiting", createdAt: "2026-10-03" },
] as CRMRecord[];

describe("customer selection", () => {
  test("only the selected service is shown", () => {
    deepStrictEqual(filterCustomers(records, "", "all", "plumbing", "newest").map(r => r.id), ["3", "2"]);
  });
  test("all restores every service", () => {
    deepStrictEqual(filterCustomers(records, "", "all", "all", "oldest").map(r => r.id), ["1", "2", "3"]);
  });
  test("service combines with status and search", () => {
    deepStrictEqual(filterCustomers(records, "سليم", "waiting", "plumbing", "newest").map(r => r.id), ["3"]);
    deepStrictEqual(filterCustomers(records, "أحمد", "waiting", "plumbing", "newest"), []);
  });
});
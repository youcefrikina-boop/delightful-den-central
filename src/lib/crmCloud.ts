import { supabase } from "@/integrations/supabase/client";
import { normalizeStatus, inferFinalState, type CRMRecord } from "@/lib/types";

const STORAGE_KEY = "dafatek_crm_records_v4";
const LANG_KEY = "dafatek_crm_lang_v2";
const TECH_KEY = "dafatek_technician";

interface RecordRow {
  id: string;
  owner_id: string;
  data: CRMRecord;
  updated_at: string;
}

function migrateRecord(r: CRMRecord): CRMRecord {
  const rawStatus = (r as unknown as { status?: string }).status;
  const newStatus = normalizeStatus(rawStatus);
  const inferred = inferFinalState(rawStatus);
  return {
    ...r,
    status: newStatus,
    finalState: r.finalState ?? (newStatus === "waiting" ? inferred : undefined),
  };
}

export async function fetchRecords(userId: string): Promise<CRMRecord[]> {
  const { data, error } = await supabase
    .from("crm_records")
    .select("id, owner_id, data, updated_at")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as RecordRow[]).map((r) => migrateRecord({ ...r.data, id: r.id }));
}

export async function insertRecord(userId: string, record: CRMRecord) {
  const { error } = await supabase.from("crm_records").insert({
    id: record.id,
    owner_id: userId,
    data: record as unknown as Record<string, unknown>,
    client_phone: record.phone ?? null,
  } as never);
  if (error) throw error;
}

export async function updateRecordCloud(record: CRMRecord) {
  const { error } = await supabase
    .from("crm_records")
    .update({ data: record as unknown as Record<string, unknown>, client_phone: record.phone ?? null } as never)
    .eq("id", record.id);
  if (error) throw error;
}

export async function deleteRecordCloud(id: string) {
  const { error } = await supabase.from("crm_records").delete().eq("id", id);
  if (error) throw error;
}

export interface Settings {
  lang: "ar" | "fr" | "en";
  technician: string;
  migrated_from_local: boolean;
}

export async function fetchSettings(userId: string): Promise<Settings> {
  const { data, error } = await supabase
    .from("crm_settings")
    .select("lang, technician, migrated_from_local")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    await supabase.from("crm_settings").insert({ user_id: userId });
    return { lang: "ar", technician: "", migrated_from_local: false };
  }
  return {
    lang: (data.lang as Settings["lang"]) ?? "ar",
    technician: data.technician ?? "",
    migrated_from_local: data.migrated_from_local ?? false,
  };
}

export async function saveSettings(userId: string, patch: Partial<Settings>) {
  const { error } = await supabase
    .from("crm_settings")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
  if (error) throw error;
}

/**
 * If localStorage holds records and the user has never migrated, push them to Cloud.
 * Returns the number of records migrated.
 */
export async function migrateLocalToCloud(userId: string): Promise<number> {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await saveSettings(userId, { migrated_from_local: true });
    return 0;
  }
  let records: CRMRecord[] = [];
  try {
    records = JSON.parse(raw) as CRMRecord[];
  } catch {
    return 0;
  }
  if (records.length === 0) {
    await saveSettings(userId, { migrated_from_local: true });
    return 0;
  }
  const rows = records.map((r) => ({
    id: r.id,
    owner_id: userId,
    data: r as unknown as Record<string, unknown>,
    client_phone: r.phone ?? null,
  }));
  const { error } = await supabase.from("crm_records").upsert(rows as never, { onConflict: "id" });
  if (error) throw error;

  // Carry over lang & technician
  const lang = window.localStorage.getItem(LANG_KEY) as Settings["lang"] | null;
  const tech = window.localStorage.getItem(TECH_KEY) ?? "";
  await saveSettings(userId, {
    migrated_from_local: true,
    lang: lang ?? "ar",
    technician: tech,
  });

  // Keep localStorage as a backup, don't wipe it
  return records.length;
}

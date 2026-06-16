import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Check, X, Trash2 } from "lucide-react";

export interface BaseOption {
  value: string;
  label: string;
}

interface Props {
  storageKey: string;            // unique per field; persists custom items + label overrides
  baseOptions: BaseOption[];     // built-in enum options (value cannot be removed)
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  addLabel?: string;
  editLabel?: string;
  doneLabel?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

interface Stored {
  custom: BaseOption[];                  // user-added entries
  overrides: Record<string, string>;     // value -> renamed label (for base or custom)
}

function load(key: string): Stored {
  if (typeof window === "undefined") return { custom: [], overrides: {} };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { custom: [], overrides: {} };
    const parsed = JSON.parse(raw);
    return {
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
      overrides: parsed.overrides ?? {},
    };
  } catch { return { custom: [], overrides: {} }; }
}

function save(key: string, s: Stored) {
  try { localStorage.setItem(key, JSON.stringify(s)); } catch { /* ignore */ }
}

export function EditableSelect({
  storageKey, baseOptions, value, onChange, disabled,
  className = "", addLabel = "إضافة", editLabel = "تعديل القائمة",
  doneLabel = "تم", allowEmpty, emptyLabel = "—",
}: Props) {
  const [store, setStore] = useState<Stored>(() => load(storageKey));
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => { save(storageKey, store); }, [store, storageKey]);

  const merged = useMemo(() => {
    const all = [...baseOptions, ...store.custom];
    return all.map((o) => ({ ...o, label: store.overrides[o.value] ?? o.label }));
  }, [baseOptions, store]);

  const baseValues = useMemo(() => new Set(baseOptions.map((b) => b.value)), [baseOptions]);

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-[#0d1a2e] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none";

  function commitAdd() {
    const text = draft.trim();
    if (!text) { setAdding(false); return; }
    const value = "custom:" + text.toLowerCase().replace(/\s+/g, "_") + ":" + Date.now().toString(36);
    setStore((s) => ({ ...s, custom: [...s.custom, { value, label: text }] }));
    setDraft(""); setAdding(false);
    onChange(value);
  }

  function renameOpt(v: string, newLabel: string) {
    setStore((s) => ({ ...s, overrides: { ...s.overrides, [v]: newLabel } }));
  }

  function removeCustom(v: string) {
    setStore((s) => ({
      ...s,
      custom: s.custom.filter((c) => c.value !== v),
      overrides: Object.fromEntries(Object.entries(s.overrides).filter(([k]) => k !== v)),
    }));
    if (value === v) onChange(baseOptions[0]?.value ?? "");
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex gap-1">
        <select
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {allowEmpty && <option value="">{emptyLabel}</option>}
          {merged.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => { setAdding((x) => !x); setEditing(false); }}
          className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 text-cyan-200 hover:bg-cyan-500/20"
          title={addLabel}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => { setEditing((x) => !x); setAdding(false); }}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 text-amber-200 hover:bg-amber-500/20"
          title={editLabel}
        >
          <Pencil className="size-4" />
        </button>
      </div>

      {adding && (
        <div className="flex gap-1">
          <input
            autoFocus
            className={inputClass}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commitAdd(); }
              if (e.key === "Escape") { setAdding(false); setDraft(""); }
            }}
            placeholder={addLabel}
          />
          <button type="button" onClick={commitAdd} className="rounded-lg bg-emerald-500/80 px-2 text-slate-950 hover:bg-emerald-400">
            <Check className="size-4" />
          </button>
          <button type="button" onClick={() => { setAdding(false); setDraft(""); }} className="rounded-lg bg-slate-700 px-2 text-slate-200">
            <X className="size-4" />
          </button>
        </div>
      )}

      {editing && (
        <div className="space-y-1 rounded-lg border border-slate-700 bg-[#0a1428] p-2">
          {merged.map((o) => {
            const isBase = baseValues.has(o.value);
            return (
              <div key={o.value} className="flex items-center gap-1">
                <input
                  className={inputClass}
                  value={o.label}
                  onChange={(e) => renameOpt(o.value, e.target.value)}
                />
                {!isBase && (
                  <button
                    type="button"
                    onClick={() => removeCustom(o.value)}
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 text-red-300 hover:bg-red-500/20"
                    title="حذف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="w-full rounded-lg bg-cyan-500 px-2 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
          >
            {doneLabel}
          </button>
        </div>
      )}
    </div>
  );
}

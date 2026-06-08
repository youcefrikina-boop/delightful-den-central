import { useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord, Task } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ListChecks } from "lucide-react";

export function TasksChecklist({ record }: { record: CRMRecord }) {
  const { updateRecord, lang } = useCRM();
  const [draft, setDraft] = useState("");
  const tasks: Task[] = record.tasks ?? [];

  function setTasks(arr: Task[]) {
    updateRecord(record.id, { tasks: arr });
  }

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-amber-200">
        <ListChecks className="size-4" /> {t(lang, "tasks")}
      </div>
      <ul className="space-y-1">
        {tasks.map((tk) => (
          <li key={tk.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={tk.done}
              onChange={() => setTasks(tasks.map((x) => (x.id === tk.id ? { ...x, done: !x.done } : x)))}
            />
            <span className={tk.done ? "text-slate-400 line-through" : "text-slate-100"}>{tk.text}</span>
            <button type="button" onClick={() => setTasks(tasks.filter((x) => x.id !== tk.id))} className="ms-auto text-xs text-red-300">×</button>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-xs text-slate-500">—</li>}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-[#0d1a2e] px-2 py-1 text-sm text-slate-100"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!draft.trim()) return;
              setTasks([...tasks, { id: crypto.randomUUID(), text: draft.trim(), done: false }]);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!draft.trim()) return;
            setTasks([...tasks, { id: crypto.randomUUID(), text: draft.trim(), done: false }]);
            setDraft("");
          }}
          className="rounded-md bg-amber-500/80 px-3 py-1 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          {t(lang, "addTask")}
        </button>
      </div>
    </div>
  );
}

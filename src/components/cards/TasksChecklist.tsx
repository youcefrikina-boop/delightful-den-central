import { useState } from "react";
import { useCRM } from "@/context/CRMProvider";
import type { CRMRecord, Task } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TasksChecklist({ record }: { record: CRMRecord }) {
  const { updateRecord, lang } = useCRM();
  const [draft, setDraft] = useState("");
  const tasks: Task[] = record.tasks ?? [];
  function setTasks(arr: Task[]) { updateRecord(record.id, { tasks: arr }); }
  function addTask() {
    if (!draft.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: draft.trim(), done: false }]);
    setDraft("");
  }
  return (
    <section className="crm-controls min-w-0 border-t border-border pt-3" aria-label={t(lang, "tasks")}>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-foreground">
        <span className="flex items-center gap-2"><ListChecks className="size-4 text-primary" />{t(lang, "tasks")}</span>
        <span className="text-muted-foreground">{tasks.filter(task => task.done).length} / {tasks.length}</span>
      </div>
      <ul className="space-y-1">
        {tasks.map((task, index) => (
          <li key={task.id} className="flex min-w-0 items-center gap-2 text-xs">
            <input type="checkbox" checked={task.done} aria-label={task.text}
              className="size-4 shrink-0 accent-primary"
              onChange={() => setTasks(tasks.map(x => x.id === task.id ? { ...x, done: !x.done } : x))} />
            <span className="text-muted-foreground">{index + 1}.</span>
            <span className={`min-w-0 flex-1 break-words ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.text}</span>
            <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0 text-destructive"
              aria-label={`${t(lang, "delete")} ${task.text}`} title={t(lang, "delete")}
              onClick={() => setTasks(tasks.filter(x => x.id !== task.id))}><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex min-w-0 gap-2">
        <input className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
          value={draft} aria-label={t(lang, "addTask")} placeholder={t(lang, "addTask")}
          onChange={e => setDraft(e.target.value)} onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); addTask(); }
          }} />
        <Button type="button" size="icon" className="size-8 shrink-0" disabled={!draft.trim()}
          aria-label={t(lang, "addTask")} title={t(lang, "addTask")} onClick={addTask}><Plus /></Button>
      </div>
    </section>
  );
}

import { useCRM } from "@/context/CRMProvider";
import { t } from "@/lib/i18n";
import { CalendarCheck2 } from "lucide-react";
import { Button } from '@/components/ui/button';

export function DailyPlanToggle({ active, onToggle, disabled = false }: { active: boolean; onToggle: () => void; disabled?: boolean }) {
  const { lang } = useCRM();
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onToggle}
      className={active ? 'border-primary text-primary' : ''}
    >
      <CalendarCheck2 className="size-4" />
      {active ? t(lang, "inDailyPlan") : t(lang, "addToDailyPlan")}
    </Button>
  );
}

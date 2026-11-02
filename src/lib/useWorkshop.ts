import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/context/CRMProvider';
import type { Tables } from '@/integrations/supabase/types';

export type FaultEntry = Tables<'fault_guide'>;
export type ExpenseEntry = Tables<'expense_logs'>;
export type ClientAccount = Tables<'client_accounts'>;

export function useWorkshop() {
  const { userId } = useCRM();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['workshop', userId],
    queryFn: async () => {
      const [faults, expenses, accounts] = await Promise.all([
        supabase.from('fault_guide').select('*').order('brand'),
        supabase.from('expense_logs').select('*').eq('owner_id', userId).order('expense_date', { ascending: false }),
        supabase.from('client_accounts').select('*').eq('owner_id', userId),
      ]);
      if (faults.error) throw faults.error;
      if (expenses.error) throw expenses.error;
      if (accounts.error) throw accounts.error;
      return { faults: faults.data ?? [], expenses: expenses.data ?? [], accounts: accounts.data ?? [] };
    },
  });
  const refresh = () => client.invalidateQueries({ queryKey: ['workshop', userId] });
  return { ...query, faults: query.data?.faults ?? [], expenses: query.data?.expenses ?? [], accounts: query.data?.accounts ?? [], refresh, userId };
}
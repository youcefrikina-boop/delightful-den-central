ALTER TABLE public.crm_records ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE TABLE public.fault_guide (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid, brand text NOT NULL, code text NOT NULL, problem text NOT NULL, cause text NOT NULL DEFAULT '', solution text NOT NULL, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fault_guide TO authenticated;
GRANT ALL ON public.fault_guide TO service_role;
ALTER TABLE public.fault_guide ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read reference and owned faults" ON public.fault_guide FOR SELECT TO authenticated USING (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "Create own faults" ON public.fault_guide FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own faults" ON public.fault_guide FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Delete own trashed faults" ON public.fault_guide FOR DELETE TO authenticated USING (owner_id = auth.uid() AND deleted_at IS NOT NULL);
CREATE TABLE public.client_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, record_id uuid NOT NULL UNIQUE REFERENCES public.crm_records(id) ON DELETE CASCADE, client_name text NOT NULL DEFAULT '', billed_parts numeric NOT NULL DEFAULT 0, billed_labor numeric NOT NULL DEFAULT 0, amount_paid numeric NOT NULL DEFAULT 0, total_bill numeric GENERATED ALWAYS AS (billed_parts + billed_labor) STORED, remaining_debt numeric GENERATED ALWAYS AS (greatest(0, billed_parts + billed_labor - amount_paid)) STORED, deleted_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.client_accounts TO authenticated;
GRANT ALL ON public.client_accounts TO service_role;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own client ledger" ON public.client_accounts FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE TABLE public.expense_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, record_id uuid REFERENCES public.crm_records(id) ON DELETE SET NULL, category text NOT NULL, amount numeric NOT NULL, description text NOT NULL DEFAULT '', expense_date date NOT NULL DEFAULT current_date, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT expense_category CHECK (category IN ('parts','labor')), CONSTRAINT expense_positive CHECK (amount > 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_logs TO authenticated;
GRANT ALL ON public.expense_logs TO service_role;
ALTER TABLE public.expense_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own expenses" ON public.expense_logs FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Create own expenses" ON public.expense_logs FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND (record_id IS NULL OR EXISTS (SELECT 1 FROM public.crm_records r WHERE r.id = record_id AND r.owner_id = auth.uid())));
CREATE POLICY "Update own expenses" ON public.expense_logs FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND (record_id IS NULL OR EXISTS (SELECT 1 FROM public.crm_records r WHERE r.id = record_id AND r.owner_id = auth.uid())));
CREATE POLICY "Delete own trashed expenses" ON public.expense_logs FOR DELETE TO authenticated USING (owner_id = auth.uid() AND deleted_at IS NOT NULL);
CREATE FUNCTION public.crm_amount(value text) RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$ BEGIN IF value IS NULL OR value = '' THEN RETURN 0; END IF; RETURN greatest(0, value::numeric); EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN RETURN 0; END $$;
CREATE FUNCTION public.sync_client_account() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.client_accounts (owner_id, record_id, client_name, billed_parts, billed_labor, amount_paid, deleted_at) VALUES (NEW.owner_id, NEW.id, coalesce(NEW.data->>'client',''), public.crm_amount(NEW.data->'payment'->>'partsCost'), public.crm_amount(NEW.data->'payment'->>'laborCost'), public.crm_amount(NEW.data->'payment'->>'advance'), NEW.deleted_at) ON CONFLICT (record_id) DO UPDATE SET owner_id = EXCLUDED.owner_id, client_name = EXCLUDED.client_name, billed_parts = EXCLUDED.billed_parts, billed_labor = EXCLUDED.billed_labor, amount_paid = EXCLUDED.amount_paid, deleted_at = EXCLUDED.deleted_at, updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER crm_sync_account AFTER INSERT OR UPDATE ON public.crm_records FOR EACH ROW EXECUTE FUNCTION public.sync_client_account();
INSERT INTO public.client_accounts (owner_id, record_id, client_name, billed_parts, billed_labor, amount_paid, deleted_at) SELECT owner_id, id, coalesce(data->>'client',''), public.crm_amount(data->'payment'->>'partsCost'), public.crm_amount(data->'payment'->>'laborCost'), public.crm_amount(data->'payment'->>'advance'), deleted_at FROM public.crm_records ON CONFLICT (record_id) DO NOTHING;
CREATE INDEX fault_guide_brand_code_idx ON public.fault_guide(brand, code);
CREATE INDEX expense_logs_owner_date_idx ON public.expense_logs(owner_id, expense_date);
CREATE FUNCTION public.enforce_crm_workflow() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN IF NEW.data->>'status' = 'done' THEN NEW.data = jsonb_set(NEW.data, '{inDailyPlan}', 'false'::jsonb); IF coalesce(NEW.data->>'completionDate','') = '' THEN NEW.data = jsonb_set(NEW.data, '{completionDate}', to_jsonb(now()::text)); END IF; END IF; IF NEW.data->>'status' <> 'waiting' THEN NEW.data = NEW.data - 'finalState'; END IF; RETURN NEW; END $$;
CREATE TRIGGER crm_enforce_workflow BEFORE INSERT OR UPDATE ON public.crm_records FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_workflow();
UPDATE public.crm_records SET data = jsonb_set(data - 'finalState', '{inDailyPlan}', 'false'::jsonb) WHERE data->>'status' = 'done';
-- Phase 2: semi-recurring non-fixed expenses (gas, groceries) and
-- worked-day tracking (for the "remaining work days" half of the daily
-- target formula).

-- ─────────────────────────────────────────────────────────────────────────
-- Recurring expenses: not fixed-amount/fixed-date like a bill, but repeat
-- often enough to prorate into the monthly obligation total.
-- ─────────────────────────────────────────────────────────────────────────

create table recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index recurring_expenses_user_id_idx on recurring_expenses(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Worked days: which calendar days the user actually worked this month,
-- either inferred (an income transaction exists for that date) or set by
-- hand (the user marks a day worked before logging any income for it).
-- ─────────────────────────────────────────────────────────────────────────

create table worked_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  source text not null check (source in ('manual', 'inferred_from_income')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index worked_days_user_id_date_idx on worked_days(user_id, date);

alter table recurring_expenses enable row level security;
alter table worked_days enable row level security;

create policy recurring_expenses_select on recurring_expenses
  for select to authenticated using (user_id = auth.uid());
create policy recurring_expenses_insert on recurring_expenses
  for insert to authenticated with check (user_id = auth.uid());
create policy recurring_expenses_update on recurring_expenses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recurring_expenses_delete on recurring_expenses
  for delete to authenticated using (user_id = auth.uid());

create policy worked_days_select on worked_days
  for select to authenticated using (user_id = auth.uid());
create policy worked_days_insert on worked_days
  for insert to authenticated with check (user_id = auth.uid());
create policy worked_days_update on worked_days
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy worked_days_delete on worked_days
  for delete to authenticated using (user_id = auth.uid());

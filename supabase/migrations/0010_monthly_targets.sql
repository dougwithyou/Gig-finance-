-- User-set daily target per month, used for the "Proyección del mes" card
-- (independent from the calculated daily-target pacing in calc.ts, which
-- stays deadline-driven). One row per user/year/month, upserted from the
-- dashboard.

create table monthly_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  daily_target numeric(10, 2) not null check (daily_target > 0),
  created_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table monthly_targets enable row level security;

create policy monthly_targets_select on monthly_targets
  for select to authenticated using (user_id = auth.uid());
create policy monthly_targets_insert on monthly_targets
  for insert to authenticated with check (user_id = auth.uid());
create policy monthly_targets_update on monthly_targets
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy monthly_targets_delete on monthly_targets
  for delete to authenticated using (user_id = auth.uid());

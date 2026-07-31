-- Phase 5: per-date work planning. Replaces the single "planned work days
-- count" (work_day_config) with an actual calendar of dates the user
-- intends to work, so the remaining-work-days math only counts real future
-- intent instead of a guessed total. work_day_config is left in place
-- (unused by the app from here on) rather than dropped, to avoid a
-- destructive change to data already in production.

create table planned_work_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index planned_work_days_user_id_date_idx on planned_work_days(user_id, date);

alter table planned_work_days enable row level security;

create policy planned_work_days_select on planned_work_days
  for select to authenticated using (user_id = auth.uid());
create policy planned_work_days_insert on planned_work_days
  for insert to authenticated with check (user_id = auth.uid());
create policy planned_work_days_update on planned_work_days
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy planned_work_days_delete on planned_work_days
  for delete to authenticated using (user_id = auth.uid());

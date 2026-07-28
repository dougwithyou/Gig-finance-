-- Phase 4: Web Push subscriptions and per-user notification preferences.

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on push_subscriptions(user_id);

create table notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  daily_target_reminder_enabled boolean not null default true,
  bill_due_alert_days_before int not null default 3 check (bill_due_alert_days_before between 0 and 14),
  low_income_alert_enabled boolean not null default true,
  low_income_alert_threshold_pct int not null default 50 check (low_income_alert_threshold_pct between 0 and 100),
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
alter table notification_preferences enable row level security;

-- The user manages their own subscriptions/preferences directly...
create policy push_subscriptions_select on push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy push_subscriptions_insert on push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());
create policy push_subscriptions_delete on push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

create policy notification_preferences_select on notification_preferences
  for select to authenticated using (user_id = auth.uid());
create policy notification_preferences_insert on notification_preferences
  for insert to authenticated with check (user_id = auth.uid());
create policy notification_preferences_update on notification_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ...but sending pushes and reading who to send them to happens from the
-- daily cron job via the service-role client, which bypasses RLS entirely
-- (see src/lib/supabase/admin.ts) — no anon/authenticated policy is needed
-- for that read path.

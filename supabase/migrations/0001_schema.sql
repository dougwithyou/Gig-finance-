-- Gig Finance core schema
-- Single-user-per-row-owner budget tracker for gig workers. Every table
-- carries user_id from day one so adding a second real user later (should
-- that ever happen) needs no schema change, only new auth.users rows.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Transactions: unified income + expense log
-- ─────────────────────────────────────────────────────────────────────────

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(10, 2) not null check (amount > 0),
  description text not null,
  date date not null,
  source_platform text,
  category text,
  created_at timestamptz not null default now()
);

create index transactions_user_id_date_idx on transactions(user_id, date desc);

-- ─────────────────────────────────────────────────────────────────────────
-- Fixed bills: recurring monthly obligations
-- ─────────────────────────────────────────────────────────────────────────

create table fixed_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  due_day int not null check (due_day between 1 and 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index fixed_bills_user_id_idx on fixed_bills(user_id);

-- Paid/pending status per bill per month, derived rather than stored on
-- fixed_bills — avoids needing a cron to "regenerate" rows every month.
-- A bill is unpaid for a given year/month if no row exists here, or a row
-- exists with paid_at still null.
create table bill_payments (
  id uuid primary key default gen_random_uuid(),
  fixed_bill_id uuid not null references fixed_bills(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  paid_at timestamptz,
  transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (fixed_bill_id, year, month)
);

create index bill_payments_fixed_bill_id_idx on bill_payments(fixed_bill_id);

-- Helper used by RLS policies below: true when the bill referenced by a
-- bill_payments row belongs to the current user.
create or replace function owns_fixed_bill(bill_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from fixed_bills where id = bill_id and user_id = auth.uid()
  )
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Work-day config: planned work days per user per month, used to compute
-- the live daily target on the dashboard.
-- ─────────────────────────────────────────────────────────────────────────

create table work_day_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  planned_work_days int not null check (planned_work_days between 0 and 31),
  created_at timestamptz not null default now(),
  unique (user_id, year, month)
);

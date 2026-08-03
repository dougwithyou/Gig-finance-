-- Credit cards: balance, APR, minimum payment (all edited by hand — no
-- automatic transaction linking, the user keeps the balance in sync from
-- their statement), plus a paid/pending status per month, same pattern as
-- fixed_bills/bill_payments.

create table credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric(10, 2) not null check (balance >= 0),
  apr numeric(5, 2) not null check (apr >= 0),
  minimum_payment numeric(10, 2) not null check (minimum_payment > 0),
  due_day int not null check (due_day between 1 and 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index credit_cards_user_id_idx on credit_cards(user_id);

create table credit_card_payments (
  id uuid primary key default gen_random_uuid(),
  credit_card_id uuid not null references credit_cards(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (credit_card_id, year, month)
);

create index credit_card_payments_credit_card_id_idx on credit_card_payments(credit_card_id);

-- Helper for credit_card_payments RLS policies, created directly in the
-- `private` schema (not `public`) so it's never exposed as a PostgREST
-- RPC endpoint — see 0005_private_schema_for_rls_helpers.sql for why
-- owns_fixed_bill() had to be moved there after the fact.
create or replace function private.owns_credit_card(card_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from credit_cards where id = card_id and user_id = auth.uid()
  )
$$;

grant execute on function private.owns_credit_card(uuid) to authenticated;

alter table credit_cards enable row level security;
alter table credit_card_payments enable row level security;

create policy credit_cards_select on credit_cards
  for select to authenticated using (user_id = auth.uid());
create policy credit_cards_insert on credit_cards
  for insert to authenticated with check (user_id = auth.uid());
create policy credit_cards_update on credit_cards
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy credit_cards_delete on credit_cards
  for delete to authenticated using (user_id = auth.uid());

create policy credit_card_payments_select on credit_card_payments
  for select to authenticated using (private.owns_credit_card(credit_card_id));
create policy credit_card_payments_insert on credit_card_payments
  for insert to authenticated with check (private.owns_credit_card(credit_card_id));
create policy credit_card_payments_update on credit_card_payments
  for update to authenticated using (private.owns_credit_card(credit_card_id)) with check (private.owns_credit_card(credit_card_id));
create policy credit_card_payments_delete on credit_card_payments
  for delete to authenticated using (private.owns_credit_card(credit_card_id));

-- Row level security policies.
--
-- Trust model: every table is scoped to user_id = auth.uid(). There is no
-- public/anon access anywhere in this app — it's a private single-user
-- budget tracker, not a shared or public-facing resource.

alter table transactions enable row level security;
alter table fixed_bills enable row level security;
alter table bill_payments enable row level security;
alter table work_day_config enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- transactions
-- ─────────────────────────────────────────────────────────────────────────

create policy transactions_select on transactions
  for select to authenticated
  using (user_id = auth.uid());

create policy transactions_insert on transactions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy transactions_update on transactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy transactions_delete on transactions
  for delete to authenticated
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- fixed_bills
-- ─────────────────────────────────────────────────────────────────────────

create policy fixed_bills_select on fixed_bills
  for select to authenticated
  using (user_id = auth.uid());

create policy fixed_bills_insert on fixed_bills
  for insert to authenticated
  with check (user_id = auth.uid());

create policy fixed_bills_update on fixed_bills
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy fixed_bills_delete on fixed_bills
  for delete to authenticated
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- bill_payments (scoped indirectly via the parent bill's owner)
-- ─────────────────────────────────────────────────────────────────────────

create policy bill_payments_select on bill_payments
  for select to authenticated
  using (owns_fixed_bill(fixed_bill_id));

create policy bill_payments_insert on bill_payments
  for insert to authenticated
  with check (owns_fixed_bill(fixed_bill_id));

create policy bill_payments_update on bill_payments
  for update to authenticated
  using (owns_fixed_bill(fixed_bill_id))
  with check (owns_fixed_bill(fixed_bill_id));

create policy bill_payments_delete on bill_payments
  for delete to authenticated
  using (owns_fixed_bill(fixed_bill_id));

-- ─────────────────────────────────────────────────────────────────────────
-- work_day_config
-- ─────────────────────────────────────────────────────────────────────────

create policy work_day_config_select on work_day_config
  for select to authenticated
  using (user_id = auth.uid());

create policy work_day_config_insert on work_day_config
  for insert to authenticated
  with check (user_id = auth.uid());

create policy work_day_config_update on work_day_config
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

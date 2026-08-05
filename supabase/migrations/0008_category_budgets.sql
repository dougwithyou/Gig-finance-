-- Per-category monthly spending budgets. `category` on `transactions`
-- stays free text (no catalog/enum) — matching against a budget's `name`
-- is done normalized (trim + lowercase) in application code, not here.
-- No `_payments`-style child table: budget consumption is derived purely
-- from summing this month's expense transactions, never marked by hand.

create table category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  monthly_budget numeric(10, 2) not null check (monthly_budget > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index category_budgets_user_id_idx on category_budgets(user_id);

alter table category_budgets enable row level security;

create policy category_budgets_select on category_budgets
  for select to authenticated using (user_id = auth.uid());
create policy category_budgets_insert on category_budgets
  for insert to authenticated with check (user_id = auth.uid());
create policy category_budgets_update on category_budgets
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy category_budgets_delete on category_budgets
  for delete to authenticated using (user_id = auth.uid());

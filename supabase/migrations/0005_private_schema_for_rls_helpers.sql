-- Security advisor flagged owns_fixed_bill() as directly callable via
-- PostgREST RPC (/rest/v1/rpc/owns_fixed_bill) since it lived in the
-- public schema. It's only ever meant to be used inside RLS policy
-- expressions, not as a public endpoint. Moving it to a `private` schema
-- (not exposed by PostgREST, which only serves `public` by default)
-- removes the RPC surface while keeping it fully usable from policies via
-- its qualified name.

create schema if not exists private;

alter function public.owns_fixed_bill(uuid) set schema private;

grant usage on schema private to authenticated;
grant execute on function private.owns_fixed_bill(uuid) to authenticated;

drop policy bill_payments_select on bill_payments;
drop policy bill_payments_insert on bill_payments;
drop policy bill_payments_update on bill_payments;
drop policy bill_payments_delete on bill_payments;

create policy bill_payments_select on bill_payments
  for select to authenticated
  using (private.owns_fixed_bill(fixed_bill_id));

create policy bill_payments_insert on bill_payments
  for insert to authenticated
  with check (private.owns_fixed_bill(fixed_bill_id));

create policy bill_payments_update on bill_payments
  for update to authenticated
  using (private.owns_fixed_bill(fixed_bill_id))
  with check (private.owns_fixed_bill(fixed_bill_id));

create policy bill_payments_delete on bill_payments
  for delete to authenticated
  using (private.owns_fixed_bill(fixed_bill_id));

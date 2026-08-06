-- Links a credit_card_payments row to the expense transaction it creates,
-- same shape as bill_payments.transaction_id. Marking a card's minimum
-- payment "paid" now logs a real expense (so mtdExpenses/balance reflect
-- the cash that actually left your hand), and unmarking it removes that
-- transaction again — this FK is how the toggle finds it to delete it.

alter table credit_card_payments
  add column transaction_id uuid references transactions(id) on delete set null;

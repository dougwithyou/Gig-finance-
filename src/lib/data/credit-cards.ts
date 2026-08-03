import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreditCard, CreditCardPayment, CreditCardWithStatus } from "@/lib/types/database";

export async function getCreditCardsWithStatus(
  supabase: SupabaseClient,
  year: number,
  month: number,
  userId?: string
): Promise<CreditCardWithStatus[]> {
  let cardsQuery = supabase.from("credit_cards").select("*").eq("is_active", true);
  if (userId) cardsQuery = cardsQuery.eq("user_id", userId);

  const { data: cards, error: cardsError } = await cardsQuery.order("due_day", { ascending: true });

  if (cardsError) throw cardsError;

  const cardIds = (cards as CreditCard[]).map((c) => c.id);
  let payments: CreditCardPayment[] = [];

  if (cardIds.length > 0) {
    const { data, error } = await supabase
      .from("credit_card_payments")
      .select("*")
      .in("credit_card_id", cardIds)
      .eq("year", year)
      .eq("month", month);

    if (error) throw error;
    payments = data as CreditCardPayment[];
  }

  return (cards as CreditCard[]).map((card) => {
    const payment = payments.find((p) => p.credit_card_id === card.id) ?? null;
    return {
      ...card,
      payment,
      is_paid: payment?.paid_at != null,
    };
  });
}

/** Estimated interest accruing this month on a card's current balance. */
export function estimatedMonthlyInterest(card: CreditCard): number {
  return card.balance * (card.apr / 100 / 12);
}

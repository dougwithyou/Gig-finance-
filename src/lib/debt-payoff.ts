import type { CreditCard } from "@/lib/types/database";

export type PayoffStrategy = "snowball" | "avalanche";

export interface DebtPayoffCardResult {
  cardId: string;
  name: string;
  monthsToPayoff: number;
}

export interface DebtPayoffResult {
  totalMonths: number;
  totalInterestPaid: number;
  /** true when the monthly budget doesn't even cover accruing interest — balances never reach zero. */
  neverPaysOff: boolean;
  order: DebtPayoffCardResult[];
}

const MAX_MONTHS = 600;
const ZERO_THRESHOLD = 0.005;

/**
 * Simulates paying off every active card in `cards` month by month: pay
 * the minimum on every card except one "target" (chosen by `strategy`),
 * and dump the rest of the monthly budget (minimums + extraMonthly) onto
 * that target. When a card hits zero, its minimum payment frees up for
 * the next target — the snowball/avalanche effect.
 */
export function simulateDebtPayoff(
  cards: CreditCard[],
  strategy: PayoffStrategy,
  extraMonthly: number
): DebtPayoffResult {
  const activeCards = cards.filter((c) => c.balance > 0);
  if (activeCards.length === 0) {
    return { totalMonths: 0, totalInterestPaid: 0, neverPaysOff: false, order: [] };
  }

  const order = [...activeCards].sort((a, b) =>
    strategy === "snowball" ? a.balance - b.balance : b.apr - a.apr
  );

  const balances = new Map(order.map((c) => [c.id, c.balance]));
  const monthsToPayoff = new Map<string, number>();
  const totalMinimum = order.reduce((sum, c) => sum + c.minimum_payment, 0);
  const budget = totalMinimum + Math.max(0, extraMonthly);

  let totalInterestPaid = 0;
  let months = 0;
  let remainingCount = order.length;

  while (remainingCount > 0 && months < MAX_MONTHS) {
    months += 1;

    for (const card of order) {
      const balance = balances.get(card.id)!;
      if (balance <= 0) continue;
      const interest = balance * (card.apr / 100 / 12);
      totalInterestPaid += interest;
      balances.set(card.id, balance + interest);
    }

    const target = order.find((c) => balances.get(c.id)! > 0);
    if (!target) break;

    let spendable = budget;
    for (const card of order) {
      if (card.id === target.id) continue;
      const balance = balances.get(card.id)!;
      if (balance <= 0) continue;
      const payment = Math.min(balance, card.minimum_payment);
      balances.set(card.id, balance - payment);
      spendable -= payment;
    }

    const targetBalance = balances.get(target.id)!;
    const targetPayment = Math.min(targetBalance, Math.max(0, spendable));
    balances.set(target.id, targetBalance - targetPayment);

    for (const card of order) {
      const balance = balances.get(card.id)!;
      if (balance <= ZERO_THRESHOLD && !monthsToPayoff.has(card.id)) {
        balances.set(card.id, 0);
        monthsToPayoff.set(card.id, months);
        remainingCount -= 1;
      }
    }
  }

  return {
    totalMonths: months,
    totalInterestPaid,
    neverPaysOff: remainingCount > 0,
    order: order.map((c) => ({
      cardId: c.id,
      name: c.name,
      monthsToPayoff: monthsToPayoff.get(c.id) ?? months,
    })),
  };
}

import { createClient } from "@/lib/supabase/server";
import { getCreditCardsWithStatus, estimatedMonthlyInterest } from "@/lib/data/credit-cards";
import { CreditCardForm } from "@/components/credit-cards/credit-card-form";
import { CreditCardList } from "@/components/credit-cards/credit-card-list";
import { DebtPayoffPlanner } from "@/components/credit-cards/debt-payoff-planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default async function CreditCardsPage() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const cards = await getCreditCardsWithStatus(supabase, year, month);

  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
  const totalMinimumThisMonth = cards
    .filter((c) => !c.is_paid)
    .reduce((sum, c) => sum + c.minimum_payment, 0);
  const totalInterestThisMonth = cards.reduce((sum, c) => sum + estimatedMonthlyInterest(c), 0);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Tarjetas de crédito</h1>

      <Card>
        <CardContent className="grid grid-cols-3 gap-3 pt-5 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Saldo total</p>
            <p className="text-lg font-bold">{formatMoney(totalBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mínimos este mes</p>
            <p className="text-lg font-bold">{formatMoney(totalMinimumThisMonth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interés estimado</p>
            <p className="text-lg font-bold">{formatMoney(totalInterestThisMonth)}</p>
          </div>
        </CardContent>
      </Card>

      <CreditCardForm />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Tus tarjetas</h2>
        <CreditCardList cards={cards} year={year} month={month} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan para salir de deudas</CardTitle>
        </CardHeader>
        <CardContent>
          <DebtPayoffPlanner cards={cards} />
        </CardContent>
      </Card>
    </div>
  );
}

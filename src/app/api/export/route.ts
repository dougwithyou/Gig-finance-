import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/data/transactions";
import { buildExpenseWorkbook } from "@/lib/spreadsheet/export";
import type { FixedBill } from "@/lib/types/database";

const EXPORT_ROW_LIMIT = 10000;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const [income, expenses, billsResult] = await Promise.all([
    getFilteredTransactions(supabase, { from, to, type: "income" }, EXPORT_ROW_LIMIT),
    getFilteredTransactions(supabase, { from, to, type: "expense" }, EXPORT_ROW_LIMIT),
    supabase.from("fixed_bills").select("*").eq("is_active", true).order("due_day"),
  ]);

  if (billsResult.error) {
    return NextResponse.json({ error: billsResult.error.message }, { status: 500 });
  }

  const buffer = await buildExpenseWorkbook(income, expenses, billsResult.data as FixedBill[]);

  return new NextResponse(new Blob([Uint8Array.from(buffer)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="gig-finance-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

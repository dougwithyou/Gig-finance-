import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseWorkbook } from "@/lib/spreadsheet/import";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — plenty for a personal spreadsheet, keeps parsing bounded

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo es demasiado grande (máx. 5MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = await parseWorkbook(buffer);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo. ¿Es un .xlsx válido?" }, { status: 400 });
  }

  let insertedIncome = 0;
  let insertedExpenses = 0;
  let insertedBills = 0;

  if (parsed.income.length > 0) {
    const { error, count } = await supabase
      .from("transactions")
      .insert(
        parsed.income.map((row) => ({ ...row, type: "income" as const, user_id: user.id })),
        { count: "exact" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    insertedIncome = count ?? parsed.income.length;
  }

  if (parsed.expenses.length > 0) {
    const { error, count } = await supabase
      .from("transactions")
      .insert(
        parsed.expenses.map((row) => ({ ...row, type: "expense" as const, user_id: user.id })),
        { count: "exact" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    insertedExpenses = count ?? parsed.expenses.length;
  }

  if (parsed.bills.length > 0) {
    const { error, count } = await supabase
      .from("fixed_bills")
      .insert(
        parsed.bills.map((row) => ({ ...row, user_id: user.id })),
        { count: "exact" }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    insertedBills = count ?? parsed.bills.length;
  }

  return NextResponse.json({
    insertedIncome,
    insertedExpenses,
    insertedBills,
    errors: parsed.errors,
  });
}

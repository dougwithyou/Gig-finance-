"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: tx } = await supabase
    .from("transactions")
    .select("type, date")
    .eq("id", id)
    .single();

  await supabase.from("transactions").delete().eq("id", id);

  if (tx?.type === "income") {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("type", "income")
      .eq("date", tx.date);

    if (!count) {
      // No income left that day — remove the inferred worked-day row, but
      // never touch one the user set manually.
      await supabase
        .from("worked_days")
        .delete()
        .eq("user_id", user.id)
        .eq("date", tx.date)
        .eq("source", "inferred_from_income");
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

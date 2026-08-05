import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryBudget } from "@/lib/types/database";

export async function getActiveCategoryBudgets(
  supabase: SupabaseClient,
  userId?: string
): Promise<CategoryBudget[]> {
  let query = supabase.from("category_budgets").select("*").eq("is_active", true);
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) throw error;
  return data as CategoryBudget[];
}

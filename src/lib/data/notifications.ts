import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationPreferences } from "@/lib/types/database";

export async function getNotificationPreferences(
  supabase: SupabaseClient,
  userId?: string
): Promise<NotificationPreferences | null> {
  let query = supabase.from("notification_preferences").select("*");
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data as NotificationPreferences | null;
}

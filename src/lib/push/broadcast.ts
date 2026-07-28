import type { SupabaseClient } from "@supabase/supabase-js";
import type { PushSubscription } from "@/lib/types/database";
import { sendPush, type PushPayload } from "@/lib/push/send";

/** Every distinct user_id that has at least one push subscription. */
export async function getSubscribedUserIds(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin.from("push_subscriptions").select("user_id");
  if (error) throw error;
  return [...new Set((data as { user_id: string }[]).map((r) => r.user_id))];
}

/** Sends to every device a user has subscribed, pruning dead subscriptions as it goes. */
export async function sendToUser(
  admin: SupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; pruned: number }> {
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;

  const subscriptions = data as PushSubscription[];
  let sent = 0;
  let pruned = 0;

  for (const sub of subscriptions) {
    const result = await sendPush(sub, payload);
    if (result.ok) {
      sent += 1;
    } else if (result.expired) {
      await admin.from("push_subscriptions").delete().eq("id", sub.id);
      pruned += 1;
    }
  }

  return { sent, pruned };
}

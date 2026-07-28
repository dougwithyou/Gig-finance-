import webpush from "web-push";
import type { PushSubscription } from "@/lib/types/database";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:you@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export type SendPushResult = { ok: true } | { ok: false; expired: boolean; error: string };

/** Sends one push message. `expired: true` means the subscription is dead (410/404) and should be deleted. */
export async function sendPush(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<SendPushResult> {
  ensureConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    return { ok: false, expired, error: err instanceof Error ? err.message : String(err) };
  }
}

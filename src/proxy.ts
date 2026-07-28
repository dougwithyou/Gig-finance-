import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // /api/* is excluded: every route handler under it does its own auth (the
  // push subscribe/unsubscribe routes check the session and return 401
  // JSON; the cron routes check a bearer CRON_SECRET, which Vercel Cron
  // sends with no cookies and won't follow an HTML redirect anyway).
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};

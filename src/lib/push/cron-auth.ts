/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically once
 * the CRON_SECRET env var is set on the project — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

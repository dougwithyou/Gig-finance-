import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-lg font-semibold">Gig Finance</span>
        <SignOutButton />
      </header>
      <main className="flex-1 px-4 py-4 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}

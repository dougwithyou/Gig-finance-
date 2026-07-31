import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";

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
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <span className="flex items-center gap-2">
          <Logo className="h-7 w-7 rounded-lg" />
          <span className="text-lg font-semibold">Gig Finance</span>
        </span>
        <Link href="/settings" aria-label="Configuración" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
        </Link>
      </header>
      <main className="flex-1 px-4 py-4 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}

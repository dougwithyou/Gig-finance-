import { createClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/lib/data/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushToggle } from "@/components/settings/push-toggle";
import { NotificationPrefsForm } from "@/components/settings/notification-prefs-form";
import { ExportImportCard } from "@/components/settings/export-import-card";
import { SignOutButton } from "@/components/sign-out-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const prefs = await getNotificationPreferences(supabase);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <PushToggle />
          <NotificationPrefsForm prefs={prefs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar / Exportar Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportImportCard />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <SignOutButton />
      </div>
    </div>
  );
}

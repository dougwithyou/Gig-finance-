"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/subscribe-client";

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function PushToggle() {
  const [supported, setSupported] = useState(true);
  const [standalone, setStandalone] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detecting browser/installed-PWA capability and the current push
    // subscription state on mount — synchronizing with external systems
    // (the platform APIs and the service worker), the canonical valid use
    // of an effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setSupported(isPushSupported());
    setStandalone(isStandalone());
    getExistingSubscription().then((sub) => setSubscribed(sub != null));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  async function handleToggle() {
    setError(null);
    setIsPending(true);

    if (subscribed) {
      await unsubscribeFromPush();
      setSubscribed(false);
    } else {
      const result = await subscribeToPush();
      if (result.ok) {
        setSubscribed(true);
      } else {
        setError(result.error);
      }
    }

    setIsPending(false);
  }

  if (!supported) {
    return (
      <p className="text-sm text-muted-foreground">
        Este navegador no soporta notificaciones push.
      </p>
    );
  }

  if (!standalone) {
    return (
      <p className="text-sm text-muted-foreground">
        Para recibir notificaciones en iPhone, primero agrega esta app a tu pantalla de inicio
        (Compartir → Agregar a pantalla de inicio) y ábrela desde ahí.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={handleToggle} disabled={isPending} variant={subscribed ? "outline" : "default"}>
        {isPending ? "..." : subscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types/database";
import { insertTransactionClient } from "@/lib/offline/insert-transaction";
import { enqueueTransaction } from "@/lib/offline/queue";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function TransactionForm({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<TransactionType>("income");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedNotice, setQueuedNotice] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setQueuedNotice(false);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const description = String(formData.get("description") ?? "").trim();
    const date = String(formData.get("date") ?? "");
    const sourcePlatform = String(formData.get("source_platform") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();

    if (!amount || amount <= 0) return setError("Ingresa un monto válido.");
    if (!description) return setError("Agrega una descripción.");
    if (!date) return setError("Selecciona una fecha.");

    const item = {
      type,
      amount,
      description,
      date,
      source_platform: type === "income" ? sourcePlatform || null : null,
      category: type === "expense" ? category || null : null,
    };

    setIsPending(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueTransaction({ ...item, localId: crypto.randomUUID(), queued_at: Date.now() });
      setIsPending(false);
      setQueuedNotice(true);
      formRef.current?.reset();
      return;
    }

    const result = await insertTransactionClient(item);
    setIsPending(false);

    if (result.ok) {
      formRef.current?.reset();
      router.refresh();
      return;
    }

    if (result.reason === "network") {
      await enqueueTransaction({ ...item, localId: crypto.randomUUID(), queued_at: Date.now() });
      setQueuedNotice(true);
      formRef.current?.reset();
      return;
    }

    setError(result.message);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "h-12 rounded-xl text-base font-semibold transition-colors",
                type === "income"
                  ? "bg-positive text-positive-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "h-12 rounded-xl text-base font-semibold transition-colors",
                type === "expense"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Gasto
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" name="description" type="text" required />
          </div>

          {type === "income" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="source_platform">Plataforma (opcional)</Label>
              <Input id="source_platform" name="source_platform" type="text" placeholder="Uber, DoorDash, cliente..." />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Input id="category" name="category" type="text" placeholder="Gasolina, comida, herramientas..." />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={initialDate && ISO_DATE.test(initialDate) ? initialDate : todayISO()}
              required
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {queuedNotice && (
            <p className="text-sm font-medium text-warning">
              Sin conexión — guardado en el dispositivo, se sincronizará solo.
            </p>
          )}

          <Button type="submit" size="lg" variant={type === "income" ? "positive" : "destructive"} disabled={isPending}>
            {isPending ? "Guardando..." : type === "income" ? "Agregar ingreso" : "Agregar gasto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

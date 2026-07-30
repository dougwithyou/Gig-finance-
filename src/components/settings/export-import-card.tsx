"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImportResult {
  insertedIncome: number;
  insertedExpenses: number;
  insertedBills: number;
  errors: { sheet: string; row: number; reason: string }[];
}

export function ExportImportCard() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  function exportHref() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return qs ? `/api/export?${qs}` : "/api/export";
  }

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setImportError("Selecciona un archivo .xlsx primero.");
      return;
    }

    setImportError(null);
    setResult(null);
    setIsImporting(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "No se pudo importar el archivo.");
      } else {
        setResult(data);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setImportError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Exporta tus ingresos, gastos variables y pagos fijos a un Excel con 3 hojas. Deja
          las fechas vacías para exportar todo el historial.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-from">Desde</Label>
            <Input
              id="export-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-to">Hasta</Label>
            <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <Button asChild variant="outline">
          <a href={exportHref()}>Exportar a Excel</a>
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground">
          Importa un Excel con la misma estructura (hojas &quot;Ingresos&quot;, &quot;Gastos
          Variables&quot;, &quot;Gastos Fijos&quot;). Solo agrega registros nuevos — nunca
          modifica ni borra lo que ya tienes.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground"
        />
        <Button type="button" onClick={handleImport} disabled={isImporting}>
          {isImporting ? "Importando..." : "Importar"}
        </Button>

        {importError && <p className="text-sm font-medium text-destructive">{importError}</p>}

        {result && (
          <div className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
            <p className="font-medium text-positive">
              Se agregaron {result.insertedIncome} ingresos, {result.insertedExpenses} gastos
              variables y {result.insertedBills} pagos fijos.
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-warning">
                  {result.errors.length} fila{result.errors.length === 1 ? "" : "s"} se
                  saltaron:
                </p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>
                      {e.sheet}, fila {e.row}: {e.reason}
                    </li>
                  ))}
                </ul>
                {result.errors.length > 10 && (
                  <p className="mt-1 text-muted-foreground">
                    y {result.errors.length - 10} más...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

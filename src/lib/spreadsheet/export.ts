import writeXlsxFile from "write-excel-file/node";
import type { FixedBill, Transaction } from "@/lib/types/database";

export const INGRESOS_HEADERS = ["Fecha", "Monto", "Descripción", "Plataforma"];
export const GASTOS_VARIABLES_HEADERS = ["Fecha", "Monto", "Descripción", "Categoría"];
export const GASTOS_FIJOS_HEADERS = ["Nombre", "Monto", "Día de pago"];

export async function buildExpenseWorkbook(
  income: Transaction[],
  expenses: Transaction[],
  bills: FixedBill[]
): Promise<Buffer> {
  return writeXlsxFile([
    {
      sheet: "Ingresos",
      data: [
        INGRESOS_HEADERS,
        ...income.map((t) => [t.date, t.amount, t.description, t.source_platform ?? ""]),
      ],
    },
    {
      sheet: "Gastos Variables",
      data: [
        GASTOS_VARIABLES_HEADERS,
        ...expenses.map((t) => [t.date, t.amount, t.description, t.category ?? ""]),
      ],
    },
    {
      sheet: "Gastos Fijos",
      data: [
        GASTOS_FIJOS_HEADERS,
        ...bills.map((b) => [b.name, b.amount, b.due_day]),
      ],
    },
  ]).toBuffer();
}

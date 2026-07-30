import readXlsxFile, { readSheet, SheetNotFoundError } from "read-excel-file/node";
import { INGRESOS_HEADERS, GASTOS_VARIABLES_HEADERS, GASTOS_FIJOS_HEADERS } from "./export";

export interface ParsedIncomeRow {
  date: string;
  amount: number;
  description: string;
  source_platform: string | null;
}

export interface ParsedExpenseRow {
  date: string;
  amount: number;
  description: string;
  category: string | null;
}

export interface ParsedBillRow {
  name: string;
  amount: number;
  due_day: number;
}

export interface ParseError {
  sheet: string;
  row: number;
  reason: string;
}

export interface ParsedWorkbook {
  income: ParsedIncomeRow[];
  expenses: ParsedExpenseRow[];
  bills: ParsedBillRow[];
  errors: ParseError[];
}

type Cell = string | number | boolean | Date | null;

function buildColumnIndex(headerRow: Cell[], expectedHeaders: string[]): Map<string, number> | null {
  const map = new Map<string, number>();
  for (const header of expectedHeaders) {
    const index = headerRow.findIndex(
      (cell) => typeof cell === "string" && cell.trim().toLowerCase() === header.toLowerCase()
    );
    if (index === -1) return null;
    map.set(header, index);
  }
  return map;
}

function parseDate(cell: Cell): string | null {
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  if (typeof cell === "string") {
    const trimmed = cell.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
  }
  return null;
}

function parseAmount(cell: Cell): number | null {
  const n = typeof cell === "number" ? cell : typeof cell === "string" ? Number(cell.trim()) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseText(cell: Cell): string | null {
  const s = typeof cell === "string" ? cell.trim() : typeof cell === "number" ? String(cell) : "";
  return s.length > 0 ? s : null;
}

function parseOptionalText(cell: Cell): string | null {
  return parseText(cell);
}

function parseDueDay(cell: Cell): number | null {
  const n = typeof cell === "number" ? cell : typeof cell === "string" ? Number(cell.trim()) : NaN;
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null;
}

async function readNamedSheet(buffer: Buffer, sheetName: string): Promise<Cell[][] | null> {
  try {
    return (await readSheet(buffer, sheetName)) as Cell[][];
  } catch (err) {
    if (err instanceof SheetNotFoundError) return null;
    throw err;
  }
}

export async function parseWorkbook(buffer: Buffer): Promise<ParsedWorkbook> {
  const errors: ParseError[] = [];
  const income: ParsedIncomeRow[] = [];
  const expenses: ParsedExpenseRow[] = [];
  const bills: ParsedBillRow[] = [];

  // Validate the file is a real, parseable spreadsheet before touching any sheet.
  await readXlsxFile(buffer);

  const incomeRows = await readNamedSheet(buffer, "Ingresos");
  if (incomeRows) {
    const [header, ...rows] = incomeRows;
    const cols = buildColumnIndex(header, INGRESOS_HEADERS);
    if (!cols) {
      errors.push({ sheet: "Ingresos", row: 1, reason: `Encabezados esperados: ${INGRESOS_HEADERS.join(", ")}` });
    } else {
      rows.forEach((row, i) => {
        const rowNum = i + 2;
        const date = parseDate(row[cols.get("Fecha")!]);
        const amount = parseAmount(row[cols.get("Monto")!]);
        const description = parseText(row[cols.get("Descripción")!]);
        if (!date || !amount || !description) {
          if (row.every((c) => c == null || c === "")) return; // skip fully blank rows
          errors.push({ sheet: "Ingresos", row: rowNum, reason: "Fecha, monto o descripción inválidos" });
          return;
        }
        income.push({
          date,
          amount,
          description,
          source_platform: parseOptionalText(row[cols.get("Plataforma")!]),
        });
      });
    }
  }

  const expenseRows = await readNamedSheet(buffer, "Gastos Variables");
  if (expenseRows) {
    const [header, ...rows] = expenseRows;
    const cols = buildColumnIndex(header, GASTOS_VARIABLES_HEADERS);
    if (!cols) {
      errors.push({
        sheet: "Gastos Variables",
        row: 1,
        reason: `Encabezados esperados: ${GASTOS_VARIABLES_HEADERS.join(", ")}`,
      });
    } else {
      rows.forEach((row, i) => {
        const rowNum = i + 2;
        const date = parseDate(row[cols.get("Fecha")!]);
        const amount = parseAmount(row[cols.get("Monto")!]);
        const description = parseText(row[cols.get("Descripción")!]);
        if (!date || !amount || !description) {
          if (row.every((c) => c == null || c === "")) return;
          errors.push({ sheet: "Gastos Variables", row: rowNum, reason: "Fecha, monto o descripción inválidos" });
          return;
        }
        expenses.push({
          date,
          amount,
          description,
          category: parseOptionalText(row[cols.get("Categoría")!]),
        });
      });
    }
  }

  const billRows = await readNamedSheet(buffer, "Gastos Fijos");
  if (billRows) {
    const [header, ...rows] = billRows;
    const cols = buildColumnIndex(header, GASTOS_FIJOS_HEADERS);
    if (!cols) {
      errors.push({ sheet: "Gastos Fijos", row: 1, reason: `Encabezados esperados: ${GASTOS_FIJOS_HEADERS.join(", ")}` });
    } else {
      rows.forEach((row, i) => {
        const rowNum = i + 2;
        const name = parseText(row[cols.get("Nombre")!]);
        const amount = parseAmount(row[cols.get("Monto")!]);
        const dueDay = parseDueDay(row[cols.get("Día de pago")!]);
        if (!name || !amount || !dueDay) {
          if (row.every((c) => c == null || c === "")) return;
          errors.push({ sheet: "Gastos Fijos", row: rowNum, reason: "Nombre, monto o día de pago inválidos" });
          return;
        }
        bills.push({ name, amount, due_day: dueDay });
      });
    }
  }

  return { income, expenses, bills, errors };
}

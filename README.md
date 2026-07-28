# Gig Finance

Control de ingresos, gastos y pagos fijos mensuales para trabajadores gig
(delivery, rideshare, freelance). Ver [`PLAN.md`](./PLAN.md) para la
arquitectura completa y las fases de construcción.

**Estado actual: Fases 0, 1 y 2 implementadas** (base, MVP, y lógica de
presupuesto completa: gastos recurrentes prorateados, inferencia de días
trabajados, historial/reportes con gráfico de tendencia). Falta: sync
offline y notificaciones push (Fases 3-4 del plan).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase
(Postgres + Auth), mismo patrón que el repo hermano `Menu`.

## Setup

### 1. Crear el proyecto en Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, corre en orden los archivos de `supabase/migrations/`
   (`0001_schema.sql`, `0002_rls.sql`, `0003_recurring_and_worked_days.sql`).
   Alternativamente, con la
   [Supabase CLI](https://supabase.com/docs/guides/cli) instalada:
   ```bash
   supabase link --project-ref <tu-project-ref>
   supabase db push
   ```
3. En **Authentication → Users**, crea manualmente tu único usuario
   (email + contraseña). No hay ruta de registro pública en la app —
   este es el único punto de entrada de usuarios, a propósito.

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con
los valores de **Settings → API** de tu proyecto Supabase.

### 3. Instalar y correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` — te redirige a `/login`.

### 4. Deploy a Vercel (free tier)

1. Importa este repo en [vercel.com](https://vercel.com).
2. Agrega las mismas variables de entorno del `.env.local` en
   **Settings → Environment Variables**.
3. Deploy. Desde el iPhone, abre la URL en Safari y usa
   **Compartir → Agregar a pantalla de inicio** para instalarla como PWA.

## Estructura

```
src/app/
  login/                  -- pantalla de acceso (single-user)
  (app)/dashboard/        -- resumen: balance, meta diaria, próximos pagos
  (app)/transactions/     -- alta rápida y listado de ingresos/gastos
  (app)/bills/            -- pagos fijos + marcar pagado/pendiente
  (app)/recurring/        -- gastos recurrentes no fijos (prorateados)
  (app)/history/          -- filtros, comparación de meses, gráfico de tendencia
src/lib/
  supabase/               -- clientes server/browser + sesión (proxy.ts)
  data/                   -- queries reutilizadas por las páginas
  calc.ts                 -- cálculo del resumen/meta diaria (puro, sin DB)
  dashboard-summary.ts    -- fetch + cálculo combinados, usado por dashboard e historial
src/proxy.ts              -- auth gate (Next.js 16 renombró middleware.ts a esto)
supabase/migrations/      -- esquema + RLS, numerados y versionados
public/manifest.json      -- instalabilidad como PWA
```

## Notas

- **Next.js 16 rompe compatibilidad con `middleware.ts`** — el archivo se
  llama `src/proxy.ts` y exporta una función `proxy`, no `middleware`.
- La "meta diaria" usa `remainingWorkDays = planned_work_days − días ya
  trabajados`. Un día cuenta como trabajado si tiene al menos un ingreso
  registrado (automático) o si se marca a mano desde el dashboard.
- No hay sync offline ni notificaciones push todavía — ver `PLAN.md`
  sección "Fases" para el resto del roadmap (Fases 3-4).
- Toda la UI está en un solo idioma (español), sin sistema de i18n — es
  una app de un solo usuario, no lo necesita.

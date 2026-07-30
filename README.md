# Gig Finance

Control de ingresos, gastos y pagos fijos mensuales para trabajadores gig
(delivery, rideshare, freelance). Ver [`PLAN.md`](./PLAN.md) para la
arquitectura completa y las fases de construcción.

**Estado actual: Fases 0-4 implementadas** — base, MVP, lógica de
presupuesto completa, outbox offline, y notificaciones push. El plan
técnico original (`PLAN.md`) está completo; lo que queda es configurar
tus propias credenciales (Supabase, VAPID, cron) y usarlo.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase
(Postgres + Auth), mismo patrón que el repo hermano `Menu`.

## Setup

### 1. Crear el proyecto en Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, corre en orden los archivos de `supabase/migrations/`
   (`0001` a `0005`, en orden numérico). Alternativamente, con la
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

Completa `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` con los valores de **Settings → API** de tu
proyecto Supabase.

Para notificaciones push, genera un par de llaves VAPID:

```bash
npx web-push generate-vapid-keys
```

y completa `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y
`VAPID_SUBJECT` (un `mailto:` con tu correo). Genera también un
`CRON_SECRET` aleatorio (`openssl rand -hex 32`) — sin estas variables la
app funciona igual, solo sin notificaciones.

### 3. Instalar y correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` — te redirige a `/login`.

### 4. Deploy a Vercel (free tier)

1. Importa este repo en [vercel.com](https://vercel.com).
2. Agrega las mismas variables de entorno del `.env.local` en
   **Settings → Environment Variables** (incluyendo `CRON_SECRET` — Vercel
   lo manda automáticamente como header en cada llamada de cron una vez
   que la variable existe en el proyecto).
3. Deploy. `vercel.json` ya declara los dos cron jobs (mañana y tarde/noche,
   en UTC — ajusta los horarios en `vercel.json` según tu zona horaria).
4. Desde el iPhone: abre la URL en Safari, usa
   **Compartir → Agregar a pantalla de inicio**, y abre la app **desde el
   ícono de pantalla de inicio** (no desde Safari). Entra a
   **Configuración** dentro de la app y activa las notificaciones — iOS
   solo permite pedir el permiso desde dentro de la app ya instalada.

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
  offline/                -- outbox IndexedDB (queue.ts) + insert client-side (insert-transaction.ts)
  push/                   -- envío de push (send.ts), broadcast por usuario, auth de cron
src/app/api/
  push/subscribe|unsubscribe/  -- guardan/borran la suscripción del usuario logueado
  cron/morning/           -- recordatorio de meta diaria + pagos por vencer
  cron/evening/           -- alerta de ingreso del día por debajo de la meta
src/proxy.ts              -- auth gate (Next.js 16 renombró middleware.ts a esto; /api/* excluido)
supabase/migrations/      -- esquema + RLS, numerados y versionados
public/manifest.json      -- instalabilidad como PWA
public/sw.js              -- cache network-first de última página + push + notificationclick
vercel.json                -- horarios de los cron jobs (UTC)
```

## Notas

- **Next.js 16 rompe compatibilidad con `middleware.ts`** — el archivo se
  llama `src/proxy.ts` y exporta una función `proxy`, no `middleware`.
- La "meta diaria" usa `remainingWorkDays = planned_work_days − días ya
  trabajados`. Un día cuenta como trabajado si tiene al menos un ingreso
  registrado (automático) o si se marca a mano desde el dashboard.
- **Offline**: registrar un ingreso/gasto sin conexión lo guarda en
  IndexedDB (`src/lib/offline/queue.ts`) y lo sincroniza solo al recuperar
  señal (evento `online`, `visibilitychange`, o el botón "Reintentar" en
  `/transactions`). Solo cubre altas de transacciones — eliminar o editar
  pagos fijos/gastos recurrentes todavía requiere conexión, según el
  alcance de la Fase 3 del plan. iOS Safari no tiene Background Sync API,
  así que la cola solo se vacía con la app en primer plano, nunca en
  segundo plano.
- **Push en iOS**: solo funciona con la app agregada a pantalla de inicio
  y abierta desde ahí (una pestaña normal de Safari no tiene acceso a la
  Push API). El botón "Activar notificaciones" en `/settings` detecta si
  no estás en modo standalone y te lo indica en vez de fallar en silencio.
- Los cron jobs (`/api/cron/morning`, `/api/cron/evening`) usan el cliente
  de service-role (`src/lib/supabase/admin.ts`), que **bypassa RLS** — por
  eso las queries en `src/lib/data/*` aceptan un `userId` opcional que se
  usa solo desde ahí; el resto de la app sigue confiando en RLS normal.
- No hay garantía de entrega ni de horario exacto — es Web Push estándar
  sobre el cron de Vercel Hobby (máx. 1x/día por job, hora aproximada).
  Ver `PLAN.md` sección "Riesgos" para el detalle.
- Toda la UI está en un solo idioma (español), sin sistema de i18n — es
  una app de un solo usuario, no lo necesita.

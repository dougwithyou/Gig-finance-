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
   (`0001` a `0010`, en orden numérico). Alternativamente, con la
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
  (app)/credit-cards/     -- tarjetas: saldo, APR, mínimo, plan de pago
  (app)/categories/       -- presupuesto mensual por categoría de gasto
  (app)/history/          -- filtros, comparación de meses, gráfico de tendencia y gastos por categoría
src/lib/
  supabase/               -- clientes server/browser + sesión (proxy.ts)
  data/                   -- queries reutilizadas por las páginas
  calc.ts                 -- cálculo del resumen/meta diaria (puro, sin DB)
  debt-payoff.ts          -- simulación de pago de tarjetas (bola de nieve/avalancha, puro, sin DB)
  dashboard-summary.ts    -- fetch + cálculo combinados, usado por dashboard e historial
  offline/                -- outbox IndexedDB (queue.ts) + insert client-side (insert-transaction.ts)
  push/                   -- envío de push (send.ts), broadcast por usuario, auth de cron
  spreadsheet/            -- export.ts (genera el .xlsx) e import.ts (lo parsea y valida)
src/app/api/
  push/subscribe|unsubscribe/  -- guardan/borran la suscripción del usuario logueado
  cron/morning/           -- recordatorio de meta diaria + pagos por vencer
  cron/evening/           -- alerta de ingreso del día por debajo de la meta
  export/                 -- GET, descarga un .xlsx (Ingresos, Gastos Variables, Gastos Fijos)
  import/                 -- POST, sube un .xlsx y agrega filas nuevas (nunca actualiza/borra)
src/proxy.ts              -- auth gate (Next.js 16 renombró middleware.ts a esto; /api/* excluido)
supabase/migrations/      -- esquema + RLS, numerados y versionados
public/manifest.json      -- instalabilidad como PWA
public/sw.js              -- cache network-first de última página + push + notificationclick
vercel.json                -- horarios de los cron jobs (UTC)
```

## Notas

- **Next.js 16 rompe compatibilidad con `middleware.ts`** — el archivo se
  llama `src/proxy.ts` y exporta una función `proxy`, no `middleware`.
- **Calendario de trabajo** (`/dashboard`): reemplaza el número suelto de
  "días planeados" por un calendario donde marcás, día por día, qué días
  del mes vas a trabajar. Días futuros: tocar el día lo marca/desmarca como
  planeado (`planned_work_days`, una fila por fecha). Hoy o días pasados:
  tocar el día lleva a `/transactions` con la fecha precargada para
  registrar cuánto generaste — el ingreso se suma automáticamente al total
  del mes y ese día pasa a contar como trabajado (`worked_days`, igual que
  antes).
- **Pagos fijos** (`/bills`): igual que las tarjetas de crédito, **"Marcar
  pagado"** registra un gasto real — crea una transacción `expense` por el
  monto del pago, categoría fija `"Pago fijo"`
  (`src/app/(app)/bills/actions.ts::toggleBillPaid`), así que se refleja
  en "Gastos del mes"/balance y en el gráfico de categorías. Desmarcarlo
  borra esa misma transacción (`bill_payments.transaction_id`, columna que
  ya existía desde `0001` pero no se usaba hasta ahora).
- **Meta diaria con ritmo por vencimiento** (`src/lib/calc.ts::summarize`):
  la meta diaria no reparte lo que falta ganar por igual entre todos los
  días de trabajo del mes — calcula, para cada pago próximo (pagos fijos,
  tarjetas de crédito, y los gastos recurrentes agrupados a fin de mes),
  cuánto haría falta ganar por día para llegar a tiempo a *esa* fecha, y
  usa el más exigente de todos. Si un vencimiento está tan cerca que no
  alcanza con los días ya planeados, igual muestra el monto (aunque sea
  alto) junto con un aviso en vez de esconderlo. **Los gastos variables ya
  generados este mes** (`mtdExpenses` — todo lo que no es pago fijo,
  tarjeta ni recurrente) también entran como una obligación más, vencida
  hoy mismo — sin esto, la meta diaria solo miraba "cuánto debo" e
  ignoraba "cuánto ya gasté", lo que podía mostrar $0 aunque el usuario ya
  hubiera gastado de más. El desglose de "para llegar a tus pagos de tal
  fecha necesitas este ritmo" lista **todo** lo que compone ese monto
  acumulado (no solo lo que vence justo ese día), para que el número
  nunca quede sin explicación.
- **Saldo que se arrastra entre meses** (`getCumulativeBalanceBefore` en
  `src/lib/data/transactions.ts`): el balance nunca "desaparece" a fin de
  mes — se deriva sumando *todas* las transacciones anteriores al primer
  día del mes que se está viendo (sin tabla ni columna extra, es puro
  `SUM` sobre el historial ya existente). Un saldo negativo arrastrado se
  trata como una obligación más, vencida hoy mismo, dentro del cálculo de
  Meta diaria (puede ser lo que termine determinando el ritmo del día); un
  saldo positivo se trata como ingreso ya en mano, así que resta presión.
  Se muestra como un aviso arriba del resumen del dashboard cuando no es
  cero.
- **Proyección del mes** (`/dashboard`, tarjeta "Proyección del mes"):
  a diferencia de la Meta diaria (el ritmo *mínimo* necesario), acá el
  usuario fija su propia meta diaria (tabla `monthly_targets`, una por
  mes) y la app proyecta hacia adelante: ingresos proyectados = lo ya
  ganado + (meta diaria × días de trabajo planeados restantes); gastos
  proyectados = lo ya gastado + pagos fijos/tarjetas sin pagar + gastos
  recurrentes; el resultado final sale de sumarle el saldo arrastrado del
  mes anterior (`src/lib/calc.ts::projectMonthEnd`, función pura). Las dos
  tarjetas conviven a propósito: una dice "esto es lo mínimo", la otra
  "esto es lo que te va a quedar si cumples tu propia meta".
- **Tarjetas de crédito** (`/credit-cards`): saldo, APR y pago mínimo se
  editan a mano — el saldo no se descuenta solo. El pago mínimo de cada
  tarjeta activa entra al cálculo de la meta diaria igual que un pago
  fijo, usando su propio día de vencimiento. **"Marcar mínimo pagado"** sí
  registra un gasto real: crea una transacción de tipo `expense` por el
  monto del mínimo, categoría fija `"Pago de tarjeta de crédito"`
  (`src/app/(app)/credit-cards/actions.ts::toggleCreditCardPaid`), para
  que se refleje en "Gastos del mes"/balance y en el gráfico de categorías
  — desmarcarlo borra esa misma transacción (el vínculo vive en
  `credit_card_payments.transaction_id`, migración `0009`). El "Plan para
  salir de deudas" simula mes a mes pagar el mínimo de todas las tarjetas
  y volcar el resto del presupuesto (mínimos + un extra opcional) en una
  sola tarjeta a la vez, en el orden que definís (bola de nieve: saldo
  menor primero; o avalancha: interés más alto primero) — todo el cálculo
  es client-side (`src/lib/debt-payoff.ts`), sin ida y vuelta al servidor.
- **Categorías y presupuestos** (`/categories`): `transactions.category`
  sigue siendo texto libre (no es un catálogo cerrado) — el campo
  "Categoría" de `/transactions` ahora sugiere, vía `<datalist>`, los
  nombres de las categorías con presupuesto, pero sigue aceptando
  cualquier texto. El presupuesto mensual por categoría se compara contra
  el gasto normalizado (`trim().toLowerCase()`) para que "Gasolina" y
  "gasolina" cuenten como la misma categoría. Estado: verde (&lt;80% usado),
  ámbar (≥80%, "te estás acercando al límite"), rojo (≥100%, muestra
  cuánto te pasaste) — es un aviso visual, no push. El gráfico de dona en
  `/history` (`src/components/history/category-spending-chart.tsx`) usa
  Recharts y una paleta categórica validada para daltonismo (más de 8
  categorías se agrupan en "Otros"). Ninguno de los dos se integra al
  cálculo de "Meta diaria" — un presupuesto de categoría es un límite que
  el usuario se pone, no una obligación de pago.
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
- **Import/Export Excel** (`/settings`): usa `read-excel-file` / `write-excel-file`
  en vez de `xlsx` (SheetJS) o `exceljs` — ambos tenían vulnerabilidades
  altas conocidas (`xlsx` en el propio parser, `exceljs` vía su dependencia
  `archiver`) relevantes justo aquí, donde se parsea un archivo subido por
  el usuario. Importar es **solo agregar** — nunca actualiza ni borra
  filas existentes, y siempre pasa por el cliente con sesión (nunca el
  admin client), así que RLS sigue protegiendo la escritura igual que en
  el resto de la app.

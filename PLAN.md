# Plan: Gig Worker Budget PWA — Arquitectura y Producto

## Contexto

El usuario ya tiene un prototipo funcional en HTML/JS/localStorage que valida
la idea: una app de control de gastos para trabajadores gig (ingresos
diarios variables) que necesitan cubrir pagos fijos mensuales. El prototipo
sirvió para probar el concepto, pero tiene riesgos de pérdida de datos
(localStorage), no es instalable de forma confiable, y no tiene
notificaciones reales. El objetivo de esta fase es solo **planear** — sin
escribir código todavía — la arquitectura de una versión production-ready:
instalable en iPhone, con notificaciones push reales, persistencia
confiable, funcionamiento offline, y **presupuesto $0**.

**Repo destino**: `dougwithyou/Gig-finance-`, actualmente completamente
vacío (sin commits), branch `claude/gig-worker-budget-pwa-sm86g6`. No hay
nada que migrar dentro de este repo — es un proyecto desde cero.

**Precedente clave encontrado**: el repo hermano `dougwithyou/Menu`
(`/home/user/Menu`) es una app Next.js 16.2.12 + Supabase ya funcionando en
producción, con auth vía `@supabase/ssr`, RLS multi-tenant, y migraciones
SQL versionadas. Verifiqué directamente los archivos clave:
- `src/lib/supabase/server.ts` — cliente Supabase server-side ligado a cookies
- `src/lib/supabase/middleware.ts` — refresco de sesión + gate de rutas protegidas
- `next.config.ts`, `package.json` — Next 16.2.12, Tailwind v4, `@supabase/ssr` 0.12.4, `@supabase/supabase-js` 2.111.0
- `supabase/migrations/0001_schema.sql` — patrón de RLS con funciones `security definer`

Este patrón es la base recomendada: reutilizar tooling que el usuario ya
sabe operar en free tier, en vez de introducir un stack nuevo.

**Nota para la fase de código (no ahora)**: `Menu/AGENTS.md` advierte que
esta versión de Next.js tiene breaking changes vs. el training data —
revisar `node_modules/next/dist/docs/` antes de escribir rutas/App Router
en el nuevo repo.

## Decisiones confirmadas con el usuario

- **Push notifications**: PWA Web Push (VAPID/APNs vía Safari), no
  Capacitor/nativo. Se acepta la fricción de instalación en pantalla de
  inicio y notificaciones con cadencia diaria (no instantáneas), a cambio
  de $0 costo y evitar la App Store.
- **Offline/sync**: outbox simple con IndexedDB (cola de escrituras
  pendientes, last-write-wins), no un motor de sync tipo PowerSync/RxDB —
  evita complejidad y un tercer servicio innecesario para un solo usuario.

## 1. Arquitectura recomendada

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4,
  replicando la config de Menu (`next.config.ts`, ESLint, estructura
  `src/app` / `src/components` / `src/lib`). Tema oscuro único y
  permanente (no el sistema de color de marca de Menu): fondo negro/gris
  oscuro, texto claro, verde=ingresos, rojo=gastos/alertas, ámbar=avisos.
  PWA vía `public/manifest.json` + service worker escrito a mano (evitar
  plugins de PWA no verificados contra Next 16 App Router).
- **Backend/DB**: Supabase (Postgres + Auth), mismo patrón que Menu —
  cliente server (`lib/supabase/server.ts`), cliente browser
  (`lib/supabase/client.ts`), middleware de sesión adaptado a un solo
  gate de auth (no prefijos `/admin` + `/waiter`, aquí toda la app está
  protegida).
- **Hosting**: Vercel Hobby, igual que Menu.
- **Offline**: outbox en IndexedDB (`idb-keyval` o Dexie) — solo cola de
  escrituras pendientes + cache de última lectura conocida por vista
  (dashboard, transacciones del mes). Lecturas van directo a Supabase
  cuando hay conexión. Escrituras (nueva transacción) entran primero al
  outbox, actualizan UI optimísticamente, e intentan insert inmediato;
  si falla, quedan encoladas. iOS Safari no soporta Background Sync API,
  así que el flush de la cola ocurre al reabrir la app en foreground, no
  en background silencioso. Conflictos: cada escritura en cola es un
  `insert` nuevo (nunca edición concurrente de la misma fila desde dos
  dispositivos a la vez en el flujo normal); para el caso raro de marcar
  un pago fijo como pagado desde dos dispositivos offline simultáneamente,
  se acepta last-write-wins por `updated_at` — limitación documentada, no
  a resolver con CRDT.
- **Push**: Web Push estándar (VAPID) con el paquete `web-push` en el
  servidor, suscripciones guardadas en Supabase, disparadas por Vercel
  Cron (jobs diarios, no horarios — ver Riesgos).

## 2. Modelo de datos (nivel de planeación)

Todas las tablas incluyen `user_id uuid references auth.users(id)` desde
el día uno + RLS (`user_id = auth.uid()`), replicando el patrón
`restaurant_id` / `auth_restaurant_id()` de Menu — así multi-usuario a
futuro es solo crear más usuarios, sin rediseño.

- **`transactions`**: tabla unificada de ingresos/gastos — `id`,
  `user_id`, `type` (`income`|`expense`), `amount`, `description`,
  `date`, `source_platform` (nullable, solo ingresos), `category`
  (nullable, solo gastos), `recurring_expense_id` (nullable, link a
  gasto recurrente), `created_at`.
- **`fixed_bills`**: `id`, `user_id`, `name`, `amount`, `due_day` (1-31),
  `is_active`, `created_at`. Sin columna de estado pagado/pendiente —
  eso se deriva vía **`bill_payments`** (`id`, `fixed_bill_id`, `year`,
  `month`, `paid_at` nullable, `transaction_id` nullable). Evita
  necesitar un cron que "regenere" filas cada mes; el estado del mes
  actual se calcula al leer.
- **`recurring_expenses`** (gastos semi-recurrentes no fijos): `id`,
  `user_id`, `name`, `amount` (estimado por ocurrencia), `frequency`
  (`daily`|`weekly`|`biweekly`), `is_active`. Prorateo calculado al
  consultar: diario × días del mes, semanal × (días/7), quincenal ×
  (días/14).
- **`work_day_config`**: `id`, `user_id`, `year`, `month`,
  `planned_work_days`. Una fila por usuario/mes.
- **`worked_days`**: `id`, `user_id`, `date`, `source`
  (`manual`|`inferred_from_income`), único en `(user_id, date)`. Se
  infiere automáticamente al registrar un ingreso ese día; también
  editable a mano.
- **`push_subscriptions`**: `id`, `user_id`, `endpoint` (único),
  `p256dh`, `auth`, `created_at`. Múltiples filas por usuario
  (celular + escritorio).
- **`notification_preferences`**: `id`, `user_id`,
  `daily_target_reminder_enabled/time`,
  `bill_due_alert_days_before` (default 3),
  `low_income_alert_enabled/threshold_pct`.

**No se persiste**: la meta diaria (`(pagos fijos pendientes + gastos
recurrentes prorateados − ingresos del mes) / días de trabajo
restantes`) se calcula siempre en vivo, nunca se guarda — cumple el
requisito de recálculo en tiempo real y evita bugs de cache obsoleto.

## 3. Estructura de proyecto y fases

Estructura calcada de Menu, pero con una sola superficie (no
`/admin` + `/r` + `/waiter`):

```
src/app/
  login/
  (app)/dashboard/         -- balance, MTD, % progreso, salud financiera, próximos pagos
  (app)/transactions/      -- alta/listado de ingresos y gastos, formulario rápido
  (app)/bills/             -- CRUD de pagos fijos + marcar pagado/pendiente
  (app)/recurring/         -- config de gastos semi-recurrentes
  (app)/settings/          -- días de trabajo, notificaciones, importación
  (app)/history/           -- historial filtrable, comparación de meses, gráfico de tendencia
  api/push/subscribe/
  api/cron/daily-check/    -- Vercel Cron: recordatorios + alertas de pagos
public/
  manifest.json
  sw.js
supabase/migrations/
```

**Fase 0 — Base**: proyecto Supabase, `profiles` + RLS, scaffold Next.js
copiando configuración de Menu, auth gate de un solo usuario, pipeline de
deploy a Vercel.

**Fase 1 — MVP usable** (prioridad: tenerlo en uso diario cuanto antes):
CRUD de `transactions` (formulario de alta rápida es la pantalla más
usada — optimizar tap-count aquí primero), CRUD de `fixed_bills` con
toggle manual pagado/pendiente, dashboard básico (MTD ingresos/gastos,
balance, meta diaria con días de trabajo planeados simples, sin
inferencia de `worked_days` todavía), tema oscuro, mobile-first,
instalable como PWA (manifest + service worker mínimo, sin push aún).
Deploy a Vercel + Supabase free tier — esto ya reemplaza el valor
central del prototipo localStorage.

**Fase 2 — Lógica de presupuesto completa**: `recurring_expenses` con
prorateo, inferencia de `worked_days`, % de progreso y semáforo
verde/amarillo/rojo, próximos pagos ordenados por urgencia,
historial/reportes filtrable, comparación mes a mes, gráfico de
tendencia (`recharts`).

**Fase 3 — Offline**: outbox IndexedDB para transacciones, cache de
última vista del dashboard, indicador visible de "N pendientes de
sincronizar" (nunca perder silenciosamente un gasto registrado).

**Fase 4 — Notificaciones**: generación de claves VAPID, tabla
`push_subscriptions`, flujo de suscripción (debe iniciarse con gesto del
usuario, requisito de iOS), envío server-side con `web-push`, Vercel
Cron diario, los tres tipos de alerta (meta diaria, pago por vencer,
día con ingreso muy bajo), onboarding explícito que guía "Agregar a
pantalla de inicio → abrir desde ahí → activar notificaciones".

**Fase 5 — Migración y pulido**: pantalla de importación JSON desde el
prototipo (ver sección 5), ping de keep-alive para Supabase (el cron
diario ya cumple esta función), pase final de UI.

## 4. Riesgos y limitaciones

- **Push en iOS**: solo funciona para apps agregadas a pantalla de
  inicio (una pestaña de Safari no tiene acceso a la Push API). El
  permiso debe solicitarse con un tap dentro de la app ya instalada, no
  proactivamente. Es push real vía APNs bajo el capó, pero sin garantía
  de timing exacto, y sin Background Sync en iOS Safari (el outbox
  offline solo puede vaciarse al reabrir la app, no en background).
  Ninguna API de "notificación local programada" está disponible en
  Safari — toda notificación, incluido el recordatorio diario rutinario,
  requiere el ciclo servidor→push real (de ahí la necesidad de Vercel
  Cron + `web-push`, no un truco solo-cliente).
- **Vercel Cron (Hobby)**: cada job corre como máximo una vez al día, en
  una hora aproximada (no al minuto exacto). Suficiente para
  recordatorio matutino + chequeo nocturno como dos jobs separados;
  descarta lógica de notificación más granular que diaria en el tier
  gratuito — aceptable dado que los tres tipos de alerta son de cadencia
  diaria por diseño.
- **Pausa de proyecto Supabase**: se pausa tras 7 días sin actividad de
  base de datos. El cron diario (que consulta Supabase) actúa como
  keep-alive automático, sin infraestructura extra.
- **Conflictos offline**: se acepta append-only / last-write-wins en vez
  de merge sin conflictos — correcto para un usuario activo en un
  dispositivo a la vez, mencionado explícitamente para que sea una
  limitación conocida, no descubierta en producción.

## 5. Migración del prototipo HTML/localStorage

Como no tenemos acceso al código del prototipo (vive fuera de los repos
de esta sesión), el import se diseña **tolerante al esquema**, no exacto:

1. Pantalla única `/settings/import` con selector de archivo JSON.
2. Se le pide al usuario agregar un botón "Exportar datos" a su
   prototipo actual (`JSON.stringify(localStorage)` o las keys
   relevantes, descargado como `.json`) — puente pragmático dado que no
   podemos inspeccionar ese código.
3. Paso de mapeo de campos: tras parsear el JSON, mostrar una tabla de
   vista previa de los primeros registros con selects para mapear los
   campos de origen (los que use el prototipo) a los campos destino
   (`amount`/`description`/`date`/etc.), y un selector de tipo para
   clasificar cada registro en `transactions`, `fixed_bills` o
   `recurring_expenses`.
4. Insert por lote vía cliente Supabase (a través de RLS), con resumen
   de éxito/fallo para poder reintentar solo los fallidos.
5. Al ser una operación única y de bajo volumen (datos personales de
   meses, no millones de filas), no requiere un endpoint dedicado —
   parseo client-side + inserts normales alcanza.

## 6. Autenticación

**Recomendación: Supabase Auth, email+password, un solo usuario
sembrado manualmente** — mismo patrón exacto que Menu
(`@supabase/ssr` + middleware de refresco de sesión).

- Cero tecnología nueva: mismo código server/browser client que ya
  funciona en Menu, solo adaptado a un único gate de auth.
- Gratis: incluido en el mismo proyecto Supabase free tier, sin
  servicio adicional.
- No bloquea multi-usuario futuro: como cada tabla ya tiene `user_id` +
  RLS desde el día uno, agregar un segundo usuario real es solo crear
  otro usuario en Supabase Auth — no hay rediseño.
- Se descarta NextAuth con credenciales hardcodeadas (segunda librería
  de auth sin beneficio sobre Supabase Auth, que de todos modos se
  necesita para que RLS tenga un `auth.uid()`) y un gate de cookie
  firmada simple (no le da a RLS una identidad por usuario, no escala a
  multi-usuario sin rehacerlo, y duplica lógica de seguridad que
  Supabase/Menu ya resolvieron).
- Sin ruta `/signup` pública — el único usuario se crea a mano desde el
  dashboard de Supabase (Authentication → Add User), cerrando cualquier
  superficie de abuso si el link llega a filtrarse.

## 7. Comparativa de servicios free tier

| Servicio | Límites free tier | Relevancia para esta app | Costo si se excede |
|---|---|---|---|
| **Vercel (Hobby)** | ~100 GB bandwidth/mes, ~1M invocaciones de funciones/mes, hasta 100 cron jobs/proyecto, cada cron ≤ 1x/día, uso personal no comercial | Sobra para un solo usuario de bajo tráfico; el límite de cadencia diaria del cron ya calza con el diseño de notificaciones | Plan Pro $20/asiento/mes |
| **Supabase (Free)** | 500 MB DB, 1 GB storage, 5 GB egress/mes, hasta 2 proyectos activos, se pausa tras 7 días sin uso, sin backups/SLA | 500MB es holgado para años de transacciones personales; la pausa se evita con el cron diario como keep-alive | Plan Pro $25/mes |
| **Web Push (`web-push` npm, VAPID)** | Gratis — es un protocolo, no un servicio pago | Hay que construir/mantener la infraestructura de suscripción y envío (Fase 4), pero sin techo de free tier que preocupe | N/A (self-hosted) |
| **GitHub Actions** (opcional, keep-alive redundante) | 2000 min/mes gratis en repos privados | Respaldo opcional si el cron de Vercel se llegara a desactivar | N/A a esta escala |
| **PowerSync** (evaluado, no recomendado) | 500 MB sync, 50 conexiones | Suficiente en volumen, pero agrega un tercer servicio y un salto a $49/mes para un problema de conflictos que esta app no tiene (un solo usuario) | $49/mes |
| **Apple Developer Program** (solo si se optara por nativo/Capacitor, descartado) | Sin tier gratuito | $99/año — evitado por completo al usar PWA | $99/año |

**Balance**: el stack completo recomendado (Vercel Hobby + Supabase Free
+ Web Push self-hosted) corre en $0/mes indefinidamente a esta escala de
uso personal. Los únicos "costos" reales son la cadencia diaria del cron
y las garantías de entrega más suaves de push en iOS — ambos trade-offs
aceptados explícitamente, no bloqueadores.

## Archivos de referencia (para la fase de código, no ahora)

- `Menu/src/lib/supabase/server.ts` — patrón de cliente server a
  replicar
- `Menu/src/lib/supabase/client.ts` — patrón de cliente browser
- `Menu/src/lib/supabase/middleware.ts` — patrón de gate de auth a
  adaptar (un solo gate en vez de múltiples prefijos)
- `Menu/supabase/migrations/0001_schema.sql` y `0002_rls.sql` —
  convención de esquema + RLS (funciones `security definer`, naming de
  políticas) a seguir en las migraciones del nuevo proyecto
- `Menu/next.config.ts`, `Menu/package.json` — línea base de
  dependencias/versiones (Next 16.2.12, Tailwind v4) para arrancar el
  nuevo proyecto, agregando solo lo específico de PWA (`web-push`,
  manifest, service worker) y, en Fase 2, `recharts`

## Verificación

Este documento es un plan técnico y de producto — no hay código que
correr todavía. Para validarlo:
1. Confirmar con el usuario que las 7 secciones cubren lo pedido en su
   prompt original (arquitectura, modelo de datos, fases, riesgos,
   migración, auth, comparativa de free tiers) — están las 7.
2. Antes de empezar Fase 0, crear el proyecto Supabase real y confirmar
   los límites de la tabla de la sección 7 contra la consola de
   Supabase/Vercel vigente en ese momento (los free tiers cambian con
   el tiempo).
3. Al iniciar la fase de código, releer `AGENTS.md` de Menu y los docs
   de Next 16 en `node_modules/next/dist/docs/` antes de escribir la
   primera ruta.

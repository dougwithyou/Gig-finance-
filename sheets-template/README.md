# Gig Finance — plantilla de Google Sheets

Versión "hoja de cálculo" de la app de este repo, pensada para venderse como
producto digital en Etsy. Implementa la misma lógica financiera que
[`src/lib/calc.ts`](../src/lib/calc.ts) y
[`src/lib/debt-payoff.ts`](../src/lib/debt-payoff.ts): meta diaria por
vencimiento más exigente, prorrateo de gastos recurrentes y simulación de pago
de deudas bola de nieve / avalancha.

Lo que hay aquí **no es la plantilla**: es el generador que la construye. Se
corre una vez, produce el archivo terminado y ese archivo es lo que se vende.

## Qué construye

Cinco pestañas, en este orden:

| Pestaña | Qué es |
| --- | --- |
| `Instrucciones` | Portada: guía de arranque, qué hay en cada pestaña, cómo duplicar el mes, mini-glosario y FAQ. |
| `Configuración` | Pagos fijos, tarjetas de crédito, gastos recurrentes, categorías con presupuesto y plataformas. |
| `MES – plantilla` | El molde que se duplica cada mes: registro de movimientos, pagos del mes, calendario de trabajo y panel de resumen. |
| `Plan de pago de deudas` | Calculadora de bola de nieve / avalancha con pago extra opcional. |
| `_Listas` | Oculta. Alimenta todas las listas desplegables. |

## Cómo generar el archivo que se vende

1. Crea una hoja de cálculo nueva y vacía en Google Sheets.
2. **Extensiones ▸ Apps Script**.
3. Borra el `Código.gs` que viene por defecto y crea un archivo por cada `.gs`
   de `apps-script/`, con el mismo nombre y contenido. (Con
   [clasp](https://github.com/google/clasp) es directo: `clasp push` desde
   `apps-script/`.)
4. En el editor, selecciona la función **`construirPlantilla`** y ejecútala.
   Google pedirá autorización la primera vez.
5. Al terminar, vuelve a la hoja: ya está todo armado, protegido y formateado.
6. Revisa que se vea bien, llena un par de datos de ejemplo si quieres una
   captura para el listado, y **bórralos antes de publicar**.
7. Comparte el archivo como **"Cualquier persona con el enlace ▸ Lector"** y
   entrega al comprador la URL en formato `.../copy`:

   ```
   https://docs.google.com/spreadsheets/d/<ID>/copy
   ```

   Ese enlace obliga a sacar una copia propia, así que nadie edita tu original.
   El script queda incluido en la copia.

`construirPlantilla()` es idempotente: se puede volver a correr sobre el mismo
archivo y lo reconstruye desde cero (borra y recrea todas las pestañas).

## Los archivos

| Archivo | Contenido |
| --- | --- |
| `00_Constantes.gs` | Nombres de hoja, paleta, formatos y **todas** las coordenadas de los bloques. |
| `10_Construir.gs` | Orquestador `construirPlantilla()` y los ayudantes de formato. |
| `11_Instrucciones.gs` | Texto y maquetado de la portada. |
| `12_Configuracion.gs` | Las cinco tablas de configuración. |
| `13_Mes.gs` | La hoja del mes: paneles, fórmulas, zona de cálculo oculta, gráfico y formato condicional. |
| `14_Deudas.gs` | Maquetado del plan de pago de deudas. |
| `15_Listas.gs` | Hoja oculta que alimenta los desplegables. |
| `20_Protecciones.gs` | Protección de fórmulas y liberación de las celdas de captura. |
| `30_Runtime.gs` | Menú `onOpen` y las automatizaciones `onEdit`. |
| `40_SimulacionDeuda.gs` | Simulación mes a mes de bola de nieve / avalancha. |
| `50_NuevoMes.gs` | Duplicar y vaciar la pestaña del mes. |

Las coordenadas viven todas en `00_Constantes.gs`. Si mueves un bloque, muévelo
ahí: las fórmulas se generan a partir de esas constantes.

## Decisiones de diseño que conviene conocer

**Por qué hay Apps Script y no sólo fórmulas.** Tres cosas no se pueden hacer
con fórmulas: marcar un pago y que aparezca solo en el registro de movimientos
(una fórmula no puede escribir en otra celda), simular hasta 600 meses de pago
de deudas, y duplicar la pestaña del mes limpiándola. Todo lo demás —meta
diaria, prorrateo, presupuestos, calendario— es fórmula pura y sigue
funcionando aunque el comprador nunca autorice el script.

**Por qué no hay rangos con nombre.** Un rango con nombre que apunte a la hoja
del mes se rompe o se duplica raro al copiar la pestaña. Todas las fórmulas
usan referencias A1 explícitas a la propia hoja o a `'Configuración'` /
`'_Listas'` por nombre, que sí sobreviven a la copia.

**Por qué las protecciones son "sólo advertencia".** El comprador es dueño de
su copia, así que una protección con lista de editores no le impediría nada.
La advertencia sí aparece para el dueño, que es justo lo que hace falta para
que no borre una fórmula sin querer. Los scripts escriben sin restricción.

**La zona de cálculo oculta (`AC:AU`).** La meta diaria necesita, por cada
vencimiento, cuánto falta y entre cuántos días de trabajo repartirlo. Eso son
31 renglones de días + 31 de obligaciones que no tiene sentido enseñar. Están
en columnas ocultas de la misma hoja para que la copia del mes se los lleve.

**Casillas de "¿Pagado?" y reordenamiento.** La lista de pagos se ordena por
día de vencimiento con una sola fórmula derramada, pero las casillas son
celdas físicas y no se mueven con ella. Si el comprador cambia sus pagos a
media marcha, una casilla puede quedar sobre un pago distinto: al marcarla se
guarda el nombre en una columna oculta, y el formato condicional pinta de rojo
cualquier casilla que ya no corresponda a su renglón. Al desmarcar se borra
exactamente el movimiento que se creó, no el que hoy ocupa esa fila.

## Verificación

La lógica se comprobó contra la de la app con una prueba diferencial de 7 000
casos aleatorios (4 000 de meta diaria, 3 000 de plan de deudas), comparando
meta diaria, bandera de riesgo, fecha que manda, etiquetas, faltante,
porcentaje de progreso, meses totales, interés total y orden de tarjetas.
Coinciden en todos los casos; la única diferencia intencional es el sufijo
`" (mínimo)"` que la plantilla añade al nombre de las tarjetas.

## Fuera de alcance

Sin uso sin conexión, sin notificaciones, sin varios usuarios y sin
importar/exportar a Excel: la plantilla ya es la hoja.

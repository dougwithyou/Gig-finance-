# Qué entregas y cómo

Respuesta corta: **el producto es un archivo de Google Sheets que vive en TU
Drive**, y lo que le das al comprador es el enlace de ese archivo terminado en
`/copy`. No le mandas ningún archivo adjunto.

Ese archivo todavía no existe: hay que crearlo una vez. Estos son los pasos.

---

## Paso 1 · Crear el archivo maestro (una sola vez, ~5 minutos)

1. Entra a [sheets.google.com](https://sheets.google.com) y crea una hoja de
   cálculo **nueva y vacía**.
2. Ponle nombre, por ejemplo `Gig Finance — Presupuesto para trabajadores gig`.
   Ese nombre es el que verá el comprador al sacar su copia.
3. Menú **Extensiones ▸ Apps Script**.
4. Borra lo que haya en el editor y pega **todo** el contenido de
   `Gig-Finance-completo.gs`.
5. Guarda (Ctrl+S).
6. En el desplegable de funciones de arriba elige **`construirPlantilla`** y
   presiona **▶ Ejecutar**.
7. Google pedirá autorización:
   **Revisar permisos ▸ tu cuenta ▸ Configuración avanzada ▸ Ir a (proyecto) ▸ Permitir**.
   Es normal, y el permiso vale sólo para esta hoja.
8. Espera a que termine y vuelve a la pestaña de la hoja de cálculo.

Ya está: cinco pestañas armadas, con formato, fórmulas y protecciones.

> Si te equivocas o quieres empezar de nuevo, vuelve a ejecutar
> `construirPlantilla`. Borra y reconstruye todo desde cero.

## Paso 2 · Revisar y dejarlo limpio

- Llena un par de datos de ejemplo y toma las capturas para el listado.
- **Borra esos datos antes de publicar**, o cada comprador recibirá tu ejemplo.
  Lo más rápido: menú **💰 Gig Finance ▸ 🧹 Limpiar esta hoja de mes**, y a
  mano las tablas de `Configuración`.

## Paso 3 · Compartir

1. Botón **Compartir** (arriba a la derecha).
2. En *Acceso general*, cambia a **Cualquier persona con el enlace**.
3. A la derecha, deja el rol en **Lector** (nunca Editor).
4. **Copiar enlace**.

Te dará algo así:

```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit?usp=sharing
```

## Paso 4 · Convertirlo en el enlace que entregas

Quita todo lo que va después del ID y escribe `/copy`:

```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/copy
```

**Ése es el enlace que le das al comprador.** Con `/copy`, Google le muestra
directamente el botón «Hacer una copia»: nadie puede editar tu original, y la
copia se guarda en el Drive del comprador con el script incluido.

> Con `/edit` en vez de `/copy`, el comprador entraría a TU archivo en modo
> lectura. Es el error más común. Verifica el enlace en una ventana de
> incógnito antes de publicar.

## Paso 5 · Publicar en Etsy

Etsy entrega archivos, no enlaces sueltos. Así que subes un **PDF de una
página** con el enlace dentro:

```
¡Gracias por tu compra!

1. Abre este enlace:
   https://docs.google.com/spreadsheets/d/<TU-ID>/copy

2. Presiona "Hacer una copia". La plantilla queda guardada en tu
   propio Google Drive — es tuya, edítala a gusto.

3. Empieza por la pestaña "Instrucciones".

¿Dudas? Escríbeme por mensaje de Etsy.
```

En Etsy: **Añadir un listado ▸ Digital ▸ Subir archivo**, y subes ese PDF.

---

## Qué ve el comprador

1. Abre el PDF y hace clic en el enlace.
2. Google le muestra «¿Quieres hacer una copia de …?» → **Hacer una copia**.
3. La copia queda en su Drive. Es suya: la edita, la borra, la comparte.
4. Al abrirla aparece la pestaña `Instrucciones` y el menú **💰 Gig Finance**.
5. La primera vez que use el menú, Google le pedirá autorizar. Está explicado
   en la pestaña `Instrucciones` y conviene repetirlo en la descripción de
   Etsy, porque es la duda número uno.

Todo lo que no necesita el script —meta diaria, presupuestos, calendario,
totales— funciona aunque el comprador nunca autorice nada.

## Preguntas que te van a hacer

**¿Y si borro mi archivo maestro?** El enlace deja de funcionar y los
compradores nuevos no podrán copiarlo. Las copias ya hechas siguen intactas.
No lo borres ni le cambies el ID.

**¿Puedo corregir la plantilla después de vender?** Sí, editas tu maestro y
los compradores nuevos reciben la versión corregida. Los que ya copiaron se
quedan con la suya: si el cambio es importante, avísales por Etsy.

**¿Sirve en Excel?** No. Necesita Google Sheets. Déjalo claro en el listado
para evitar devoluciones.

**¿Y el .xlsx de `vista-previa/`?** Ése es sólo para que TÚ veas el diseño y
para sacar capturas. No lo vendas: no trae el script ni las fórmulas de
Google.

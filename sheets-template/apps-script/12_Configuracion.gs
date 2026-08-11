/**
 * Hoja "Configuración": todo lo que no cambia mes a mes.
 *
 * Es la única fuente de verdad de pagos fijos, tarjetas, gastos recurrentes,
 * categorías con presupuesto y plataformas. La hoja del mes y el plan de
 * deudas leen de aquí, siempre a través de las coordenadas de `CFG`.
 */

function construirConfiguracion(hoja) {
  prepararLienzo(hoja, 95, 12);

  const anchos = { 2: 230, 3: 130, 4: 190, 5: 130, 6: 170, 7: 60 };
  Object.keys(anchos).forEach(function (c) {
    hoja.setColumnWidth(Number(c), anchos[c]);
  });

  tituloHoja(hoja, 'B2:F2', '⚙️  Configuración');
  hoja.getRange('B3:F3')
    .merge()
    .setValue('Llena estos datos una sola vez. Las celdas amarillas son tuyas; todo lo demás ' +
      'se calcula solo. Vuelve aquí cuando cambie un pago, una tarjeta o un presupuesto.')
    .setFontColor(COLOR.tenue)
    .setWrap(true);
  hoja.setRowHeight(3, 34);

  seccionPagosFijos(hoja);
  seccionTarjetas(hoja);
  seccionRecurrentes(hoja);
  seccionCategorias(hoja);
  seccionPlataformas(hoja);
}

/* ------------------------------------------------------------------ *
 * 1 · Pagos fijos
 * ------------------------------------------------------------------ */

function seccionPagosFijos(hoja) {
  const b = CFG.pagos;
  tituloSeccion(hoja, 'B' + b.titulo + ':F' + b.titulo, '1 · Pagos fijos del mes');
  encabezadosTabla(hoja, b.encabezado, b.col1, [
    'Nombre del pago', 'Monto', 'Día de vencimiento (1-31)',
  ]);

  celdasDeEntrada(hoja, bloqueA1(b));
  columnaDeBloque(hoja, b, 1).setNumberFormat(FORMATO.dinero);
  columnaDeBloque(hoja, b, 2).setNumberFormat(FORMATO.entero).setHorizontalAlignment('center');

  validarDiaDelMes(hoja, columnaDeBloque(hoja, b, 2));
  validarMontoPositivo(hoja, columnaDeBloque(hoja, b, 1));

  hoja.getRange('B' + (b.filaN + 1))
    .setValue('Total mensual de pagos fijos:')
    .setFontWeight('bold');
  hoja.getRange('C' + (b.filaN + 1))
    .setFormula('=SUM(' + columnaAbs(b, 1) + ')')
    .setNumberFormat(FORMATO.dinero)
    .setFontWeight('bold')
    .setFontColor(COLOR.azul);
}

/* ------------------------------------------------------------------ *
 * 2 · Tarjetas de crédito
 * ------------------------------------------------------------------ */

function seccionTarjetas(hoja) {
  const b = CFG.tarjetas;
  tituloSeccion(hoja, 'B' + b.titulo + ':F' + b.titulo, '2 · Tarjetas de crédito');
  encabezadosTabla(hoja, b.encabezado, b.col1, [
    'Nombre de la tarjeta', 'Saldo actual', 'Tasa de interés anual (APR %)',
    'Pago mínimo', 'Día de vencimiento (1-31)',
  ]);

  celdasDeEntrada(hoja, bloqueA1(b));
  columnaDeBloque(hoja, b, 1).setNumberFormat(FORMATO.dinero);
  columnaDeBloque(hoja, b, 2).setNumberFormat(FORMATO.aprPct).setHorizontalAlignment('center');
  columnaDeBloque(hoja, b, 3).setNumberFormat(FORMATO.dinero);
  columnaDeBloque(hoja, b, 4).setNumberFormat(FORMATO.entero).setHorizontalAlignment('center');

  validarDiaDelMes(hoja, columnaDeBloque(hoja, b, 4));
  validarMontoPositivo(hoja, columnaDeBloque(hoja, b, 1));
  validarMontoPositivo(hoja, columnaDeBloque(hoja, b, 3));

  hoja.getRange('B' + (b.filaN + 1))
    .setValue('El APR se escribe como número: 24.99 significa 24.99 % anual. ' +
      'El "pago mínimo" es lo que exige la tarjeta cada mes.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic');
}

/* ------------------------------------------------------------------ *
 * 3 · Gastos recurrentes
 * ------------------------------------------------------------------ */

function seccionRecurrentes(hoja) {
  const b = CFG.recurrentes;
  tituloSeccion(hoja, 'B' + b.titulo + ':F' + b.titulo,
    '3 · Gastos recurrentes  (gasolina, comida, datos… lo que gastas por trabajar)');
  encabezadosTabla(hoja, b.encabezado, b.col1, [
    'Nombre', 'Monto por ocurrencia', 'Frecuencia',
  ]);

  celdasDeEntrada(hoja, bloqueA1(b));
  columnaDeBloque(hoja, b, 1).setNumberFormat(FORMATO.dinero);
  validarMontoPositivo(hoja, columnaDeBloque(hoja, b, 1));
  desplegable(hoja, columnaDeBloque(hoja, b, 2).getA1Notation(), rangoLista('frecuencias'), false);

  // Columna informativa: cuánto sale al mes cada gasto recurrente.
  hoja.getRange(b.encabezado, 5)
    .setValue('Costo mensual aprox.')
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontColor(COLOR.tarjeta)
    .setBackground(COLOR.texto)
    .setWrap(true);
  const costoMensual = [];
  for (let f = b.fila1; f <= b.filaN; f++) {
    costoMensual.push([
      '=IF($B' + f + '="","",$C' + f + '*IF($D' + f + '="Diario",30,' +
      'IF($D' + f + '="Semanal",30/7,IF($D' + f + '="Quincenal",30/14,0))))',
    ]);
  }
  hoja.getRange(b.fila1, 5, costoMensual.length, 1).setFormulas(costoMensual);
  celdasCalculadas(hoja, 'E' + b.fila1 + ':E' + b.filaN);
  hoja.getRange('E' + b.fila1 + ':E' + b.filaN).setNumberFormat(FORMATO.dinero);

  hoja.getRange('B' + (b.filaN + 1))
    .setValue('Aquí se estima sobre 30 días. La hoja del mes usa los días exactos ' +
      'de ese mes (28, 29, 30 o 31).')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic');
}

/* ------------------------------------------------------------------ *
 * 4 · Categorías con presupuesto
 * ------------------------------------------------------------------ */

function seccionCategorias(hoja) {
  const b = CFG.categorias;
  tituloSeccion(hoja, 'B' + b.titulo + ':F' + b.titulo, '4 · Categorías con presupuesto');
  encabezadosTabla(hoja, b.encabezado, b.col1, ['Categoría', 'Presupuesto mensual']);

  celdasDeEntrada(hoja, bloqueA1(b));
  columnaDeBloque(hoja, b, 1).setNumberFormat(FORMATO.dinero);
  validarMontoPositivo(hoja, columnaDeBloque(hoja, b, 1));

  hoja.getRange('B' + (b.filaN + 1))
    .setValue('Cada categoría que escribas aquí aparece en la lista desplegable ' +
      'de la hoja del mes y recibe su propia barra de presupuesto.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic');
}

/* ------------------------------------------------------------------ *
 * 5 · Plataformas
 * ------------------------------------------------------------------ */

function seccionPlataformas(hoja) {
  const b = CFG.plataformas;
  tituloSeccion(hoja, 'B' + b.titulo + ':F' + b.titulo,
    '5 · Plataformas donde generas ingreso');
  encabezadosTabla(hoja, b.encabezado, b.col1, ['Plataforma']);

  celdasDeEntrada(hoja, bloqueA1(b));
  hoja.getRange('B' + (b.filaN + 1))
    .setValue('Ejemplos: Uber, DoorDash, Rappi, Lyft, Instacart, Cliente directo…')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic');
}

/* ------------------------------------------------------------------ *
 * Ayudantes
 * ------------------------------------------------------------------ */

/** Rango de una sola columna del bloque (0 = primera columna del bloque). */
function columnaDeBloque(hoja, bloque, desplazamiento) {
  return hoja.getRange(
    bloque.fila1,
    bloque.col1 + desplazamiento,
    bloque.filaN - bloque.fila1 + 1,
    1
  );
}

function validarDiaDelMes(hoja, rango) {
  const regla = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 31)
    .setAllowInvalid(false)
    .setHelpText('Escribe el día del mes en que vence, del 1 al 31.')
    .build();
  (typeof rango === 'string' ? hoja.getRange(rango) : rango).setDataValidation(regla);
}

function validarMontoPositivo(hoja, rango) {
  const regla = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    .setHelpText('Escribe un monto en dólares, sin el signo $.')
    .build();
  (typeof rango === 'string' ? hoja.getRange(rango) : rango).setDataValidation(regla);
}

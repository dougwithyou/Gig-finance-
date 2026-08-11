/**
 * Hoja "Plan de pago de deudas".
 *
 * No depende del mes: lee las tarjetas de "Configuración" y simula el pago
 * mes a mes. Los resultados los escribe `recalcularPlanDeDeudas()` como
 * valores fijos — una simulación iterativa de hasta 600 meses no se puede
 * expresar razonablemente con fórmulas de hoja.
 */

function construirDeudas(hoja) {
  prepararLienzo(hoja, 40, 12);

  const anchos = { 2: 90, 3: 200, 4: 130, 5: 110, 6: 120, 7: 160 };
  Object.keys(anchos).forEach(function (c) { hoja.setColumnWidth(Number(c), anchos[c]); });

  tituloHoja(hoja, 'B2:G2', '💳  Plan de pago de deudas');

  // --- Entradas ---------------------------------------------------
  hoja.getRange('B4').setValue('Estrategia').setFontWeight('bold');
  hoja.getRange('B5').setValue('Pago extra mensual').setFontWeight('bold');
  hoja.getRange('B7').setValue('Recalcular').setFontWeight('bold');

  celdasDeEntrada(hoja, DEUDA.celdaEstrategia);
  celdasDeEntrada(hoja, DEUDA.celdaExtra);
  desplegable(hoja, DEUDA.celdaEstrategia, rangoLista('estrategias'), false);
  hoja.getRange(DEUDA.celdaEstrategia).setValue('Bola de nieve');
  hoja.getRange(DEUDA.celdaExtra)
    .setValue(0)
    .setNumberFormat(FORMATO.dinero)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberGreaterThanOrEqualTo(0)
        .setAllowInvalid(false)
        .setHelpText('Cuánto puedes poner cada mes ADEMÁS de los pagos mínimos.')
        .build()
    );

  hoja.getRange(DEUDA.celdaBoton).insertCheckboxes().setHorizontalAlignment('center');
  celdasDeEntrada(hoja, DEUDA.celdaBoton);
  hoja.getRange('D7:G7').merge()
    .setValue('◀ Marca esta casilla para recalcular. Se desmarca sola al terminar.')
    .setFontColor(COLOR.azul)
    .setFontStyle('italic');

  hoja.getRange('D4:G5').merge()
    .setValue('Bola de nieve = atacas primero la tarjeta con el saldo más chico ' +
      '(ganas rápido y no te desmotivas).\n' +
      'Avalancha = atacas primero la del interés más alto (pagas menos intereses en total).')
    .setFontColor(COLOR.tenue)
    .setWrap(true)
    .setVerticalAlignment('middle');

  // --- Resultados -------------------------------------------------
  hoja.getRange('B9').setValue('Meses para liquidar todo').setFontWeight('bold');
  hoja.getRange('B10').setValue('Interés total pagado').setFontWeight('bold');
  hoja.getRange('B11').setValue('Fecha estimada de liquidación').setFontWeight('bold');

  celdasCalculadas(hoja, 'C9:C11');
  hoja.getRange(DEUDA.celdaMeses).setNumberFormat(FORMATO.entero)
    .setFontWeight('bold').setFontSize(14).setFontColor(COLOR.azul);
  hoja.getRange(DEUDA.celdaInteres).setNumberFormat(FORMATO.dinero)
    .setFontWeight('bold').setFontSize(14).setFontColor(COLOR.rojo);
  hoja.getRange(DEUDA.celdaFecha).setNumberFormat(FORMATO.fecha)
    .setFontWeight('bold').setFontSize(14);

  hoja.getRange('B13:G13').merge()
    .setBackground(COLOR.tarjeta)
    .setWrap(true)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBorder(true, true, true, true, false, false, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
  hoja.setRowHeight(13, 40);

  encabezadosTabla(hoja, DEUDA.filaEncabezados, DEUDA.col1, [
    'Orden', 'Tarjeta', 'Saldo actual', 'APR %', 'Pago mínimo', 'Meses hasta liquidarla',
  ]);
  celdasCalculadas(hoja, 'B' + DEUDA.fila1 + ':G' + DEUDA.filaN);
  const filas = DEUDA.filaN - DEUDA.fila1 + 1;
  hoja.getRange(DEUDA.fila1, 2, filas, 1).setHorizontalAlignment('center');
  hoja.getRange(DEUDA.fila1, 4, filas, 1).setNumberFormat(FORMATO.dinero);
  hoja.getRange(DEUDA.fila1, 5, filas, 1).setNumberFormat(FORMATO.aprPct).setHorizontalAlignment('center');
  hoja.getRange(DEUDA.fila1, 6, filas, 1).setNumberFormat(FORMATO.dinero);
  hoja.getRange(DEUDA.fila1, 7, filas, 1).setHorizontalAlignment('center');

  hoja.getRange(DEUDA.filaN + 2, 2, 1, 6).merge()
    .setValue('La simulación supone que cada mes pagas el mínimo de todas las tarjetas ' +
      'y que todo el resto del presupuesto (mínimos + pago extra) va a la tarjeta objetivo. ' +
      'Cuando una tarjeta llega a cero, su mínimo se suma al ataque de la siguiente.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic')
    .setWrap(true);
  hoja.setRowHeight(DEUDA.filaN + 2, 46);

  recalcularPlanDeDeudas();
}

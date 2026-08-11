/**
 * Hoja "_Listas" (oculta).
 *
 * Alimenta todas las listas desplegables de la plantilla. Vive en una hoja
 * aparte para que las validaciones apunten siempre al mismo rango, incluso
 * después de duplicar la hoja del mes.
 */

const LISTAS = {
  categorias: 'A2:A60',
  plataformas: 'C2:C20',
  tipos: 'E2:E3',
  frecuencias: 'G2:G4',
  meses: 'I2:I13',
  estrategias: 'K2:K3',
};

function construirListas(hoja) {
  prepararLienzo(hoja, 70, 12);

  hoja.getRange('A1').setValue('Categorías');
  hoja.getRange('C1').setValue('Plataformas');
  hoja.getRange('E1').setValue('Tipo de movimiento');
  hoja.getRange('G1').setValue('Frecuencia');
  hoja.getRange('I1').setValue('Meses');
  hoja.getRange('K1').setValue('Estrategia');
  hoja.getRange('A1:K1').setFontWeight('bold').setFontColor(COLOR.azul);

  // Las cuatro primeras categorías son fijas: dos las escribe el script al
  // marcar un pago, y las otras dos son comodines. Las del comprador se
  // agregan debajo con FILTER, así la lista crece sola.
  hoja.getRange('A2:A5').setValues([
    [CAT_PAGO_FIJO],
    [CAT_PAGO_TARJETA],
    ['Otros'],
    ['Sin categoría'],
  ]);
  const cfg = ref(HOJAS.configuracion);
  hoja.getRange('A6').setFormula(
    '=IFERROR(FILTER(' + cfg + '!' + columnaAbs(CFG.categorias, 0) +
    ',' + cfg + '!' + columnaAbs(CFG.categorias, 0) + '<>""),"")'
  );

  hoja.getRange('C2').setFormula(
    '=IFERROR(FILTER(' + cfg + '!' + columnaAbs(CFG.plataformas, 0) +
    ',' + cfg + '!' + columnaAbs(CFG.plataformas, 0) + '<>""),"")'
  );

  hoja.getRange('E2:E3').setValues([['Ingreso'], ['Gasto']]);
  hoja.getRange('G2:G4').setValues([['Diario'], ['Semanal'], ['Quincenal']]);
  hoja.getRange('I2:I13').setValues(MESES_ES.map(function (m) { return [m]; }));
  hoja.getRange('K2:K3').setValues([['Bola de nieve'], ['Avalancha']]);

  // Fuera del rango de validación (A2:A60) y del alcance del derrame de A6,
  // que puede llegar hasta A20 con las 15 categorías.
  hoja.getRange('A62')
    .setValue('Esta hoja es interna: alimenta las listas desplegables. No la edites ni la borres.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic');
}

/** Rango de origen para una validación, por nombre lógico. */
function rangoLista(clave) {
  return SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(HOJAS.listas)
    .getRange(LISTAS[clave]);
}

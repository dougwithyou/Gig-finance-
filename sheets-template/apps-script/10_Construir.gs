/**
 * Constructor de la plantilla.
 *
 * `construirPlantilla()` deja el archivo entero como sale de fábrica: crea
 * las cinco hojas, aplica formato, fórmulas, validaciones, formato
 * condicional, gráficos y protecciones. Es idempotente — se puede volver a
 * correr sobre el mismo archivo y lo reconstruye desde cero.
 */

function construirPlantilla() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    ss.setSpreadsheetLocale('es_MX');
  } catch (err) {
    ss.setSpreadsheetLocale('en_US');
  }

  // Creamos una hoja temporal para poder borrar todas las demás: un archivo
  // de Sheets no puede quedarse sin ninguna hoja.
  const temporal = ss.insertSheet('__temp__' + Date.now());
  ss.getSheets().forEach(function (h) {
    if (h.getSheetId() !== temporal.getSheetId()) ss.deleteSheet(h);
  });

  const listas = crearHoja(ss, HOJAS.listas);
  const instrucciones = crearHoja(ss, HOJAS.instrucciones);
  const configuracion = crearHoja(ss, HOJAS.configuracion);
  const mes = crearHoja(ss, HOJAS.mes);
  const deudas = crearHoja(ss, HOJAS.deudas);

  ss.deleteSheet(temporal);

  // El orden importa: "Configuración" alimenta a "_Listas", y la hoja del
  // mes depende de ambas.
  construirListas(listas);
  construirConfiguracion(configuracion);
  construirMes(mes);
  construirDeudas(deudas);
  construirInstrucciones(instrucciones);

  // Orden final de pestañas: Instrucciones primero (requisito de Etsy).
  ordenarHojas(ss, [
    HOJAS.instrucciones,
    HOJAS.configuracion,
    HOJAS.mes,
    HOJAS.deudas,
    HOJAS.listas,
  ]);

  listas.hideSheet();
  ss.setActiveSheet(instrucciones);
  instrucciones.setActiveSelection('B2');

  aplicarTodasLasProtecciones();

  SpreadsheetApp.flush();
}

function crearHoja(ss, nombre) {
  const existente = ss.getSheetByName(nombre);
  if (existente) ss.deleteSheet(existente);
  return ss.insertSheet(nombre);
}

function ordenarHojas(ss, nombres) {
  nombres.forEach(function (nombre, i) {
    const hoja = ss.getSheetByName(nombre);
    if (!hoja) return;
    ss.setActiveSheet(hoja);
    ss.moveActiveSheet(i + 1);
  });
}

/* ================================================================== *
 * Ayudantes de formato
 * ================================================================== */

/** Redimensiona la cuadrícula y pinta el fondo base de la hoja. */
function prepararLienzo(hoja, filas, columnas) {
  const maxFilas = hoja.getMaxRows();
  const maxCols = hoja.getMaxColumns();
  if (maxFilas < filas) hoja.insertRowsAfter(maxFilas, filas - maxFilas);
  if (maxFilas > filas) hoja.deleteRows(filas + 1, maxFilas - filas);
  if (maxCols < columnas) hoja.insertColumnsAfter(maxCols, columnas - maxCols);
  if (maxCols > columnas) hoja.deleteColumns(columnas + 1, maxCols - columnas);

  hoja.getRange(1, 1, filas, columnas)
    .setBackground(COLOR.fondo)
    .setFontFamily('Inter')
    .setFontSize(10)
    .setFontColor(COLOR.texto)
    .setVerticalAlignment('middle');

  hoja.setHiddenGridlines(true);
  hoja.setColumnWidth(1, 24);
  hoja.setRowHeight(1, 12);
}

/** Título grande de la hoja. */
function tituloHoja(hoja, a1, texto) {
  const r = hoja.getRange(a1);
  if (r.getNumColumns() > 1) r.merge();
  r.setValue(texto)
    .setFontSize(18)
    .setFontWeight('bold')
    .setFontColor(COLOR.texto)
    .setBackground(COLOR.fondo);
  hoja.setRowHeight(r.getRow(), 40);
}

/** Encabezado de sección (banda azul discreta). */
function tituloSeccion(hoja, a1, texto) {
  const r = hoja.getRange(a1);
  if (r.getNumColumns() > 1) r.merge();
  r.setValue(texto)
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor(COLOR.azul)
    .setBackground(COLOR.fondo);
  hoja.setRowHeight(r.getRow(), 28);
}

/** Fila de encabezados de una tabla. */
function encabezadosTabla(hoja, fila, col1, valores) {
  const r = hoja.getRange(fila, col1, 1, valores.length);
  r.setValues([valores])
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontColor(COLOR.tarjeta)
    .setBackground(COLOR.texto)
    .setVerticalAlignment('middle')
    .setWrap(true);
  hoja.setRowHeight(fila, 34);
  return r;
}

/** Marca un rango como "tarjeta blanca" (celdas calculadas / contenedor). */
function tarjeta(hoja, a1) {
  hoja.getRange(a1)
    .setBackground(COLOR.tarjeta)
    .setBorder(true, true, true, true, false, false, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
}

/** Marca un rango como celda de captura del comprador. */
function celdasDeEntrada(hoja, a1) {
  hoja.getRange(a1)
    .setBackground(COLOR.inputFondo)
    .setFontColor(COLOR.texto)
    .setBorder(true, true, true, true, true, true, COLOR.inputBorde, SpreadsheetApp.BorderStyle.SOLID);
}

/** Marca un rango como celda calculada (no editable). */
function celdasCalculadas(hoja, a1) {
  hoja.getRange(a1)
    .setBackground(COLOR.calcFondo)
    .setFontColor(COLOR.texto)
    .setBorder(true, true, true, true, true, true, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Dibuja una tarjeta de indicador: etiqueta arriba, valor grande abajo.
 * Devuelve el rango del valor para que quien llama le ponga la fórmula.
 */
function tarjetaIndicador(hoja, filaEtiqueta, col, ancho, etiqueta, colorValor) {
  const rEtiqueta = hoja.getRange(filaEtiqueta, col, 1, ancho);
  const rValor = hoja.getRange(filaEtiqueta + 1, col, 1, ancho);
  rEtiqueta.merge()
    .setValue(etiqueta)
    .setFontSize(9)
    .setFontWeight('bold')
    .setFontColor(COLOR.tenue)
    .setBackground(COLOR.tarjeta)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('bottom');
  rValor.merge()
    .setFontSize(16)
    .setFontWeight('bold')
    .setFontColor(colorValor || COLOR.texto)
    .setBackground(COLOR.tarjeta)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('top');
  hoja.getRange(filaEtiqueta, col, 2, ancho)
    .setBorder(true, true, true, true, false, false, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
  hoja.setRowHeight(filaEtiqueta, 24);
  hoja.setRowHeight(filaEtiqueta + 1, 34);
  // Devolvemos la celda ancla, no el rango combinado: escribir una fórmula
  // sobre un rango combinado completo lanza error.
  return hoja.getRange(filaEtiqueta + 1, col);
}

/** Lista desplegable tomada de un rango de "_Listas". */
function desplegable(hoja, a1, rangoOrigen, permitirOtros) {
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInRange(rangoOrigen, true)
    .setAllowInvalid(!!permitirOtros)
    .setHelpText(permitirOtros
      ? 'Elige una opción de la lista (o escribe la tuya).'
      : 'Elige una opción de la lista.')
    .build();
  hoja.getRange(a1).setDataValidation(regla);
}

/** Añade una regla de formato condicional basada en fórmula. */
function reglaFormula(hoja, rangosA1, formula, estilo) {
  const rangos = rangosA1.map(function (a1) { return hoja.getRange(a1); });
  let constructor = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(formula)
    .setRanges(rangos);
  if (estilo.fondo) constructor = constructor.setBackground(estilo.fondo);
  if (estilo.texto) constructor = constructor.setFontColor(estilo.texto);
  if (estilo.negrita) constructor = constructor.setBold(true);
  const reglas = hoja.getConditionalFormatRules();
  reglas.push(constructor.build());
  hoja.setConditionalFormatRules(reglas);
}

/** Convierte un índice de columna (1) en su letra ("A"). */
function letraColumna(indice) {
  let n = indice;
  let letra = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra;
}

/** "B6:D25" a partir de un bloque {fila1, filaN, col1, cols}. */
function bloqueA1(bloque) {
  return letraColumna(bloque.col1) + bloque.fila1 + ':' +
    letraColumna(bloque.col1 + bloque.cols - 1) + bloque.filaN;
}

/** Igual que bloqueA1 pero con referencias absolutas ($B$6:$D$25). */
function bloqueAbs(bloque) {
  return '$' + letraColumna(bloque.col1) + '$' + bloque.fila1 + ':$' +
    letraColumna(bloque.col1 + bloque.cols - 1) + '$' + bloque.filaN;
}

/** Referencia absoluta a una sola columna del bloque, p. ej. "$B$6:$B$25". */
function columnaAbs(bloque, desplazamiento) {
  const letra = letraColumna(bloque.col1 + desplazamiento);
  return '$' + letra + '$' + bloque.fila1 + ':$' + letra + '$' + bloque.filaN;
}

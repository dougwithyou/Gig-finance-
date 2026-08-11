/**
 * ============================================================
 *  GIG FINANCE — Generador de la plantilla de Google Sheets
 * ============================================================
 *
 *  CÓMO USAR ESTE ARCHIVO (una sola vez, ~5 minutos)
 *
 *  1. Entra a sheets.google.com y crea una hoja de cálculo NUEVA y vacía.
 *  2. Menú  Extensiones ▸ Apps Script.
 *  3. Borra todo lo que haya en el editor y pega AQUÍ todo este archivo.
 *  4. Guarda (icono del disquete o Ctrl+S).
 *  5. Arriba, en el menú desplegable de funciones, elige  construirPlantilla
 *     y presiona  ▶ Ejecutar.
 *  6. Google te pedirá autorización: Revisar permisos ▸ elige tu cuenta ▸
 *     Configuración avanzada ▸ Ir a (nombre del proyecto) ▸ Permitir.
 *     Es normal: el permiso vale sólo para esta hoja de cálculo.
 *  7. Espera a que termine (puede tardar un minuto) y vuelve a la pestaña
 *     de la hoja. Ya está todo armado, con formato y protegido.
 *
 *  Este archivo es la unión de los 11 archivos de apps-script/,
 *  en el mismo orden, para que sólo tengas que pegar una vez.
 *  Generado el 2026-08-11.
 * ============================================================
 */

// ==================================================================
// 00_Constantes.gs
// ==================================================================

/**
 * Gig Finance — Plantilla de Google Sheets
 * ----------------------------------------
 * Constantes compartidas por todo el proyecto: nombres de hojas, paleta de
 * color y las coordenadas exactas de cada bloque.
 *
 * Las coordenadas viven aquí (y NO repartidas por el código) porque todas
 * las fórmulas de la hoja "MES – plantilla" apuntan a celdas fijas: si una
 * fila se mueve hay que moverla en un solo lugar.
 */

/** Nombres de las hojas. Deben coincidir con los usados dentro de las fórmulas. */
const HOJAS = {
  instrucciones: 'Instrucciones',
  configuracion: 'Configuración',
  mes: 'MES – plantilla',
  deudas: 'Plan de pago de deudas',
  listas: '_Listas',
};

/** Paleta del producto. */
const COLOR = {
  fondo: '#eef3f9',
  tarjeta: '#ffffff',
  texto: '#0f2547',
  tenue: '#6b7f9e',
  borde: '#d7e0ec',
  azul: '#2563eb',
  azulSuave: '#dbe6fb',
  verdeAzulado: '#0d9488',
  verdeAzuladoSuave: '#d3f0ec',
  verde: '#16a34a',
  verdeSuave: '#dcf5e3',
  ambar: '#f59e0b',
  ambarSuave: '#fdefd2',
  rojo: '#dc2626',
  rojoSuave: '#fbdede',
  // Celdas que el comprador SÍ puede escribir.
  inputFondo: '#fff8e1',
  inputBorde: '#f0c86a',
  // Celdas calculadas (no tocar).
  calcFondo: '#f5f8fc',
};

/** Formatos numéricos usados en toda la plantilla. */
const FORMATO = {
  dinero: '"$"#,##0.00',
  dineroCorto: '"$"#,##0',
  porcentaje: '0%',
  entero: '0',
  aprPct: '0.00"%"',
  fecha: 'dd/mm/yyyy',
};

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Categorías fijas que la app usa al registrar pagos automáticamente. */
const CAT_PAGO_FIJO = 'Pago fijo';
const CAT_PAGO_TARJETA = 'Pago de tarjeta de crédito';

/* ------------------------------------------------------------------ *
 * Coordenadas — hoja "Configuración"
 * ------------------------------------------------------------------ */
const CFG = {
  // `titulo` y `encabezado` son filas sueltas; `fila1..filaN` es SÓLO la
  // zona de captura, que es a la que apuntan las fórmulas de las demás hojas.
  pagos: { titulo: 4, encabezado: 5, fila1: 6, filaN: 25, col1: 2, cols: 3 },
  tarjetas: { titulo: 27, encabezado: 28, fila1: 29, filaN: 38, col1: 2, cols: 5 },
  recurrentes: { titulo: 41, encabezado: 42, fila1: 43, filaN: 52, col1: 2, cols: 3 },
  categorias: { titulo: 55, encabezado: 56, fila1: 57, filaN: 71, col1: 2, cols: 2 },
  plataformas: { titulo: 74, encabezado: 75, fila1: 76, filaN: 85, col1: 2, cols: 1 },
};

/* ------------------------------------------------------------------ *
 * Coordenadas — hoja "MES – plantilla"
 * ------------------------------------------------------------------ */
const MES = {
  filas: 520,
  columnas: 50,

  // Selector de mes (celdas de entrada).
  celdaMes: 'K2',
  celdaAnio: 'M2',

  // Panel de resumen.
  filaEtiquetas1: 5,
  filaValores1: 6,
  filaEtiquetas2: 8,
  filaValores2: 9,
  filaAviso: 11,

  // Encabezados de los cuatro bloques.
  filaTitulos: 14,
  filaEncabezados: 15,

  // A. Registro de movimientos: B16:H515 (H = columna interna de origen).
  mov: { fila1: 16, filaN: 515, col1: 2, colN: 8 },

  // B. Pagos del mes: J = "Pagado", K:N = lista automática.
  pagos: { fila1: 16, filaN: 45, colCheck: 10, col1: 11, colN: 14 },

  // C. Calendario de trabajo: P:V, 6 semanas de 2 filas (número + casilla).
  cal: { fila1: 16, filaN: 27, col1: 16, colN: 22, semanas: 6 },

  // D. Presupuesto por categoría: X:AB.
  presupuesto: { fila1: 16, filaN: 30, col1: 24, colN: 28 },

  // Zona oculta de cálculo.
  aux: {
    colEscalares: 31,   // AE
    colDia: 32,         // AF  día 1..31
    colFecha: 33,       // AG
    colMarcado: 34,     // AH
    colIngresoDia: 35,  // AI
    colDisponible: 36,  // AJ
    colNombrePagado: 37,// AK  nombre registrado al marcar "Pagado"
    colEtiqueta: 38,    // AL  obligaciones
    colMonto: 39,       // AM
    colVence: 40,       // AN
    colRequerido: 41,   // AO
    colDiasDisp: 42,    // AP
    colRitmo: 43,       // AQ
    colRiesgo: 44,      // AR
    colOrigenPago: 45,  // AS  marca del movimiento creado al marcar "Pagado"
    colDonaCat: 46,     // AT
    colDonaTotal: 47,   // AU
    primeraOculta: 29,  // AC
    ultimaOculta: 47,   // AU
    filaObligN: 31,     // 30 pagos + 1 fila de gastos recurrentes
  },

  /** Marca que identifica una hoja de mes (la escribimos en AE1). */
  marcador: 'GIGFINANCE_MES',
};

/* ------------------------------------------------------------------ *
 * Coordenadas — hoja "Plan de pago de deudas"
 * ------------------------------------------------------------------ */
const DEUDA = {
  celdaEstrategia: 'C4',
  celdaExtra: 'C5',
  celdaBoton: 'C7',
  celdaMeses: 'C9',
  celdaInteres: 'C10',
  celdaFecha: 'C11',
  celdaAviso: 'B13',
  filaEncabezados: 15,
  fila1: 16,
  filaN: 25,
  col1: 2, // B
  colN: 7, // G
  maxMeses: 600,
};

/** Envuelve el nombre de una hoja para usarlo dentro de una fórmula. */
function ref(nombreHoja) {
  return "'" + nombreHoja + "'";
}


// ==================================================================
// 10_Construir.gs
// ==================================================================

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


// ==================================================================
// 11_Instrucciones.gs
// ==================================================================

/**
 * Hoja "Instrucciones": la portada. Es lo primero que ve el comprador de
 * Etsy, así que asume cero conocimiento de hojas de cálculo.
 */

const GUIA = [
  ['h1', '💰  Gig Finance — Presupuesto para trabajadores gig'],
  ['sub', 'Tu dinero entra distinto cada día. Esta plantilla te dice, con un número, ' +
    'cuánto tienes que generar HOY para no quedarte corto con tus pagos.'],

  ['h2', 'Empieza aquí (10 minutos, una sola vez)'],
  ['num', 'Ve a la pestaña «Configuración» y llena tus pagos fijos, tus tarjetas de ' +
    'crédito, tus gastos recurrentes, tus categorías con presupuesto y las plataformas ' +
    'donde generas ingreso.'],
  ['num', 'Vuelve a la pestaña «MES – plantilla» y elige arriba el mes y el año.'],
  ['num', 'En el calendario de trabajo, marca los días que PIENSAS trabajar este mes. ' +
    'Sin esto la meta diaria no se puede calcular.'],
  ['num', 'Empieza a registrar tus movimientos: una línea por cada ingreso y cada gasto.'],
  ['num', 'Cuando pagues algo de la lista «Pagos del mes», marca su casilla. El gasto se ' +
    'registra solo.'],

  ['h2', 'Qué hay en cada pestaña'],
  ['def', 'Instrucciones|Esta portada. Puedes volver aquí desde el menú «💰 Gig Finance».'],
  ['def', 'Configuración|Lo que no cambia mes a mes: pagos fijos, tarjetas, gastos ' +
    'recurrentes, categorías con presupuesto y plataformas. Todo lo demás lee de aquí.'],
  ['def', 'MES – plantilla|Tu mes de trabajo. Se duplica cada mes (ver abajo). Trae el ' +
    'registro de movimientos, los pagos del mes, el calendario de trabajo y el panel ' +
    'con tu meta diaria.'],
  ['def', 'Plan de pago de deudas|Calculadora de bola de nieve / avalancha para tus ' +
    'tarjetas. No depende del mes.'],

  ['h2', 'Cómo empezar un mes nuevo'],
  ['p', 'En el menú de arriba entra a «💰 Gig Finance ▸ ➕ Crear mes nuevo…», escribe por ' +
    'ejemplo «Marzo 2026» y acepta. Se crea una pestaña nueva, ya vacía y con tus pagos ' +
    'cargados. La pestaña «MES – plantilla» nunca se toca: es tu molde.'],
  ['nota', 'La primera vez que uses el menú, Google te pedirá autorizar la plantilla. Es ' +
    'normal: el permiso es sólo para esta hoja de cálculo, y es lo que permite que marcar ' +
    'un pago registre el gasto solo.'],

  ['h2', 'Las reglas de la casa'],
  ['p', 'Las celdas AMARILLAS son tuyas: escribe libremente en ellas.'],
  ['p', 'Las celdas GRISES o BLANCAS se calculan solas. Si intentas escribir en una, ' +
    'Google te avisará. Puedes seguir adelante, pero perderás el cálculo.'],
  ['p', 'Los montos SIEMPRE se escriben en positivo. La columna «Tipo» decide si suman ' +
    'o restan.'],
  ['p', 'Las columnas con flechita son listas: elige de la lista en vez de escribir, ' +
    'así los totales por categoría te cuadran.'],

  ['h2', 'Cómo se calcula tu meta diaria'],
  ['p', 'No se reparte parejo entre los días del mes. Se busca el vencimiento MÁS ' +
    'EXIGENTE y se calcula el ritmo que necesitas para llegar a ése:'],
  ['num', 'Se juntan tus obligaciones pendientes: pagos fijos sin marcar, el mínimo de ' +
    'cada tarjeta sin marcar, y los gastos recurrentes prorrateados (vencen el último ' +
    'día del mes).'],
  ['num', 'Un vencimiento que ya pasó y sigue sin pagar cuenta como que vence HOY: es ' +
    'urgencia máxima.'],
  ['num', 'Para cada fecha de vencimiento se calcula cuánto falta ganar hasta esa fecha ' +
    '(lo acumulado menos lo que ya ingresaste) y entre cuántos días marcados de trabajo ' +
    'lo puedes repartir.'],
  ['num', 'Tu meta diaria es el ritmo más alto de todos. Cumpliendo ése, los demás ' +
    'vencimientos salen solos.'],
  ['nota', 'Si un vencimiento no tiene ningún día de trabajo marcado antes de su fecha, ' +
    'aparece el aviso «EN RIESGO» con el nombre del pago y la fecha. Marca más días o ' +
    'consigue el dinero de otro lado.'],

  ['h2', 'Mini-glosario'],
  ['def', 'Meta diaria|Lo que necesitas generar cada día que trabajes para llegar al ' +
    'vencimiento más apretado que tienes por delante.'],
  ['def', 'Día disponible|Un día marcado en el calendario, de hoy en adelante, en el que ' +
    'todavía no registraste ingreso. Son los días entre los que se reparte lo que falta.'],
  ['def', 'Bola de nieve|Estrategia de pago de deudas: atacas primero la tarjeta con el ' +
    'SALDO MÁS CHICO. Tardas un poco más y pagas algo más de interés, pero ves tarjetas ' +
    'liquidarse rápido y eso motiva.'],
  ['def', 'Avalancha|Atacas primero la tarjeta con el INTERÉS MÁS ALTO (APR). Es la que ' +
    'menos intereses te cuesta en total.'],
  ['def', 'Pago mínimo|Lo mínimo que la tarjeta te exige cada mes. Pagar sólo el mínimo ' +
    'mantiene la deuda viva durante años.'],
  ['def', 'APR|Tasa de interés anual de la tarjeta. 24.99 significa 24.99 % al año, ' +
    'que se cobra como 24.99 ÷ 12 cada mes sobre el saldo.'],
  ['def', 'Prorratear|Repartir un gasto que ocurre seguido para saber cuánto suma al ' +
    'mes. Diario × días del mes; Semanal × (días ÷ 7); Quincenal × (días ÷ 14).'],
  ['def', 'Progreso|Cuánto de todo lo que debes cubrir este mes llevas ya generado, ' +
    'en porcentaje.'],

  ['h2', 'Los colores del panel'],
  ['def', '🟢 Vas bien|Con lo que llevas ingresado ya cubres todo lo que debes este mes.'],
  ['def', '🟡 Atención|Todavía te falta, pero llevas la mitad o más del camino.'],
  ['def', '🔴 En riesgo|Te falta más de la mitad. Marca más días de trabajo o ajusta gastos.'],
  ['def', 'Barras de presupuesto|Verde por debajo del 80 % de la categoría, ámbar entre ' +
    '80 % y 99 %, rojo al llegar o pasar el 100 %.'],

  ['h2', 'Preguntas rápidas'],
  ['def', '¿Puedo agregar más renglones?|El registro trae 500 líneas por mes, los pagos ' +
    '30 y las categorías 15. Es de sobra para un mes normal. No insertes filas nuevas ' +
    'en medio: las fórmulas usan posiciones fijas.'],
  ['def', '¿Y si cambio un pago a media marcha?|Cámbialo en «Configuración». La lista de ' +
    'pagos del mes se reordena sola. Si alguna casilla «¿Pagado?» queda de un pago que ' +
    'ya no corresponde, se pinta de rojo para que la revises.'],
  ['def', '¿Funciona en el celular?|Sí, con la app de Google Sheets. Para registrar sobre ' +
    'la marcha va perfecto; el panel se ve mejor en pantalla grande.'],
  ['def', '¿Puedo borrar la pestaña «MES – plantilla»?|No. Es el molde del que salen todos ' +
    'los meses nuevos.'],

  ['espacio', ''],
  ['nota', 'Esta plantilla es una herramienta de organización personal. No es asesoría ' +
    'financiera, contable ni fiscal.'],
];

function construirInstrucciones(hoja) {
  prepararLienzo(hoja, 140, 10);

  hoja.setColumnWidth(2, 220);
  [3, 4, 5, 6, 7, 8].forEach(function (c) { hoja.setColumnWidth(c, 115); });

  let fila = 2;
  GUIA.forEach(function (item) {
    const tipo = item[0];
    const texto = item[1];
    fila = pintarLinea(hoja, fila, tipo, texto);
  });

  hoja.setFrozenRows(1);
}

function pintarLinea(hoja, fila, tipo, texto) {
  const rango = hoja.getRange(fila, 2, 1, 7);

  switch (tipo) {
    case 'h1':
      rango.merge().setValue(texto)
        .setFontSize(20).setFontWeight('bold').setFontColor(COLOR.texto);
      hoja.setRowHeight(fila, 46);
      return fila + 1;

    case 'sub':
      rango.merge().setValue(texto)
        .setFontSize(11).setFontColor(COLOR.tenue).setWrap(true)
        .setVerticalAlignment('middle');
      hoja.setRowHeight(fila, 42);
      return fila + 2;

    case 'h2':
      rango.merge().setValue(texto)
        .setFontSize(13).setFontWeight('bold').setFontColor(COLOR.azul)
        .setVerticalAlignment('bottom');
      hoja.setRowHeight(fila, 40);
      return fila + 1;

    case 'p':
      rango.merge().setValue(texto)
        .setBackground(COLOR.tarjeta).setWrap(true).setVerticalAlignment('middle')
        .setBorder(true, true, true, true, false, false, COLOR.borde,
          SpreadsheetApp.BorderStyle.SOLID);
      hoja.setRowHeight(fila, alturaPara(texto, 95));
      return fila + 1;

    case 'num':
      rango.merge().setValue('▸   ' + texto)
        .setBackground(COLOR.tarjeta).setWrap(true).setVerticalAlignment('middle')
        .setBorder(true, true, true, true, false, false, COLOR.borde,
          SpreadsheetApp.BorderStyle.SOLID);
      hoja.setRowHeight(fila, alturaPara(texto, 95));
      return fila + 1;

    case 'def': {
      // "Término|explicación" en dos columnas.
      const partes = texto.split('|');
      hoja.getRange(fila, 2).setValue(partes[0])
        .setFontWeight('bold').setWrap(true).setVerticalAlignment('middle')
        .setBackground(COLOR.tarjeta);
      hoja.getRange(fila, 3, 1, 6).merge().setValue(partes[1] || '')
        .setWrap(true).setVerticalAlignment('middle').setBackground(COLOR.tarjeta);
      hoja.getRange(fila, 2, 1, 7).setBorder(true, true, true, true, false, false,
        COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
      hoja.setRowHeight(fila, alturaPara(partes[1] || '', 75));
      return fila + 1;
    }

    case 'nota':
      rango.merge().setValue('ℹ️   ' + texto)
        .setBackground(COLOR.azulSuave).setFontColor(COLOR.texto)
        .setWrap(true).setVerticalAlignment('middle')
        .setBorder(true, true, true, true, false, false, COLOR.azul,
          SpreadsheetApp.BorderStyle.SOLID);
      hoja.setRowHeight(fila, alturaPara(texto, 95));
      return fila + 2;

    default:
      return fila + 1;
  }
}

/** Alto aproximado de una fila según cuánto texto lleva. */
function alturaPara(texto, caracteresPorLinea) {
  const lineas = Math.max(1, Math.ceil(String(texto).length / caracteresPorLinea));
  return 22 + (lineas - 1) * 16;
}


// ==================================================================
// 12_Configuracion.gs
// ==================================================================

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


// ==================================================================
// 13_Mes.gs
// ==================================================================

/**
 * Hoja "MES – plantilla": el corazón de la plantilla.
 *
 * Cuatro bloques visibles y una zona de cálculo oculta a la derecha:
 *
 *   B:H   A · Registro de movimientos      (captura libre)
 *   J:N   B · Pagos del mes                (J = casilla "Pagado", K:N automático)
 *   P:V   C · Calendario de trabajo        (6 semanas × 2 filas: número + casilla)
 *   X:AB  D · Presupuesto por categoría
 *   AC:AU Zona de cálculo oculta
 *
 * Ninguna fórmula usa rangos con nombre: todas apuntan a celdas de esta
 * misma hoja o a 'Configuración'/'_Listas' por nombre. Eso es lo que hace
 * que duplicar la pestaña para el mes siguiente no rompa nada.
 */

function construirMes(hoja) {
  prepararLienzo(hoja, MES.filas, MES.columnas);

  anchosDeColumna(hoja);
  encabezadoMes(hoja);
  zonaDeCalculo(hoja);        // primero: el resto de bloques la referencia
  panelResumen(hoja);
  bloqueMovimientos(hoja);
  bloquePagos(hoja);
  bloqueCalendario(hoja);
  bloquePresupuesto(hoja);
  graficoDona(hoja);
  formatoCondicionalMes(hoja);

  hoja.hideColumns(8);                                     // H · origen interno
  hoja.hideColumns(MES.aux.primeraOculta,
    MES.aux.ultimaOculta - MES.aux.primeraOculta + 1);     // AC:AU
  hoja.setFrozenRows(MES.filaEncabezados);
}

function anchosDeColumna(hoja) {
  const anchos = {
    2: 95, 3: 90, 4: 100, 5: 210, 6: 130, 7: 150, 8: 10,   // B:H movimientos
    9: 18,                                                  // I espaciador
    10: 70, 11: 210, 12: 100, 13: 60, 14: 90,               // J:N pagos
    15: 18,                                                 // O espaciador
    16: 56, 17: 56, 18: 56, 19: 56, 20: 56, 21: 56, 22: 56, // P:V calendario
    23: 18,                                                 // W espaciador
    24: 160, 25: 105, 26: 105, 27: 55, 28: 130,             // X:AB presupuesto
  };
  Object.keys(anchos).forEach(function (c) {
    hoja.setColumnWidth(Number(c), anchos[c]);
  });
}

/* ================================================================== *
 * Encabezado y selector de mes
 * ================================================================== */

function encabezadoMes(hoja) {
  tituloHoja(hoja, 'B2:H2', '📅  Mi mes — Gig Finance');

  hoja.getRange('J2').setValue('Mes:').setFontWeight('bold').setHorizontalAlignment('right');
  hoja.getRange('L2').setValue('Año:').setFontWeight('bold').setHorizontalAlignment('right');
  celdasDeEntrada(hoja, 'K2');
  celdasDeEntrada(hoja, 'M2');
  desplegable(hoja, 'K2', rangoLista('meses'), false);
  hoja.getRange('K2').setHorizontalAlignment('center').setFontWeight('bold');
  hoja.getRange('M2')
    .setNumberFormat('0')
    .setHorizontalAlignment('center')
    .setFontWeight('bold')
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberBetween(2000, 2100)
        .setAllowInvalid(false)
        .setHelpText('Escribe el año con 4 dígitos, por ejemplo 2026.')
        .build()
    );

  const hoy = new Date();
  hoja.getRange(MES.celdaMes).setValue(MESES_ES[hoy.getMonth()]);
  hoja.getRange(MES.celdaAnio).setValue(hoy.getFullYear());

  hoja.getRange('P2:V2')
    .merge()
    .setValue('Duplica esta pestaña cada mes desde el menú «Gig Finance ▸ Crear mes nuevo».')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic')
    .setWrap(true);
}

/* ================================================================== *
 * Zona de cálculo oculta (AC:AU)
 * ================================================================== */

function zonaDeCalculo(hoja) {
  const cfg = ref(HOJAS.configuracion);
  const rec = CFG.recurrentes;

  // --- Escalares: etiqueta en AD, valor en AE ---------------------
  const escalares = [
    ['marcador de hoja', null],
    ['año', '=IFERROR(IF($M$2="",YEAR(TODAY()),$M$2),YEAR(TODAY()))'],
    ['mes (número)', '=IFERROR(MATCH($K$2,' + ref(HOJAS.listas) + '!$I$2:$I$13,0),MONTH(TODAY()))'],
    ['primer día', '=DATE($AE$2,$AE$3,1)'],
    ['días del mes', '=DAY(EOMONTH($AE$4,0))'],
    ['último día', '=EOMONTH($AE$4,0)'],
    // "Hoy" acotado dentro del mes: en un mes futuro todos los días
    // planeados cuentan; en uno pasado, todo aparece ya vencido.
    ['hoy efectivo', '=MEDIAN(TODAY(),$AE$4,$AE$6)'],
    ['ingresos del mes', '=SUMIFS($D$16:$D$515,$C$16:$C$515,"Ingreso")'],
    ['gastos del mes', '=SUMIFS($D$16:$D$515,$C$16:$C$515,"Gasto")'],
    // Prorrateo: Diario × días del mes, Semanal × (días/7), Quincenal × (días/14).
    ['gastos recurrentes prorrateados',
      '=IFERROR(SUMPRODUCT((' + cfg + '!' + columnaAbs(rec, 0) + '<>"")*' +
      cfg + '!' + columnaAbs(rec, 1) + '*' +
      'IF(' + cfg + '!' + columnaAbs(rec, 2) + '="Diario",$AE$5,' +
      'IF(' + cfg + '!' + columnaAbs(rec, 2) + '="Semanal",$AE$5/7,' +
      'IF(' + cfg + '!' + columnaAbs(rec, 2) + '="Quincenal",$AE$5/14,0)))),0)'],
    ['días marcados en el calendario', '=COUNTIF($AH$1:$AH$31,TRUE)'],
    ['total de obligaciones del mes', '=SUM($L$16:$L$45)+$AE$10'],
    ['falta por cubrir', '=MAX(0,$AE$19+$AE$10-$AE$8)'],
    ['progreso %', '=IF($AE$12>0,MIN(100,ROUND($AE$8/$AE$12*100)),100)'],
    // Meta diaria = el ritmo más exigente de todos los vencimientos.
    ['meta diaria', '=IF($AE$11=0,0,MAX($AQ$1:$AQ$31))'],
    ['fecha que manda',
      '=IFERROR(IF($AE$15<=0,"",MIN(FILTER($AN$1:$AN$31,$AQ$1:$AQ$31=$AE$15))),"")'],
    ['qué vence ese día',
      '=IFERROR(IF($AE$16="","",TEXTJOIN(", ",TRUE,' +
      'FILTER($AL$1:$AL$31,($AN$1:$AN$31=$AE$16)*($AM$1:$AM$31>0)))),"")'],
    ['en riesgo (1/0)',
      '=IFERROR(IF($AE$16="",0,MAX(FILTER($AR$1:$AR$31,' +
      '($AQ$1:$AQ$31=$AE$15)*($AN$1:$AN$31=$AE$16)))),0)'],
    ['pagos pendientes (sin marcar)',
      '=SUMIFS($L$16:$L$45,$J$16:$J$45,FALSE,$K$16:$K$45,"<>")'],
  ];

  hoja.getRange(1, MES.aux.colEscalares - 1, escalares.length, 1)
    .setValues(escalares.map(function (par) { return [par[0]]; }));
  hoja.getRange(1, MES.aux.colEscalares, escalares.length, 1)
    .setFormulas(escalares.map(function (par) { return [par[1] || '']; }));
  // AE1 no es fórmula: es la marca que identifica una hoja de mes.
  hoja.getRange('AE1').setValue(MES.marcador);
  hoja.getRange('AE4').setNumberFormat(FORMATO.fecha);
  hoja.getRange('AE6:AE7').setNumberFormat(FORMATO.fecha);
  hoja.getRange('AE16').setNumberFormat(FORMATO.fecha);

  // --- Un renglón por día del mes (filas 1..31) -------------------
  hoja.getRange('AD33').setValue('día / fecha / marcado / ingreso del día / día disponible');
  const numerosDeDia = [];
  const formulasDeDia = [];
  for (let d = 1; d <= 31; d++) {
    numerosDeDia.push([d]);
    // La casilla del día vive en la cuadrícula del calendario; aquí sólo la
    // leemos con INDEX sobre las 12 filas del bloque.
    const desplazamiento = 'WEEKDAY($AE$4,1)+$AF' + d + '-2';
    formulasDeDia.push([
      '=IF($AF' + d + '<=$AE$5,DATE($AE$2,$AE$3,$AF' + d + '),"")',
      '=IF($AG' + d + '="",FALSE,INDEX($P$' + MES.cal.fila1 + ':$V$' + MES.cal.filaN + ',' +
      '2*INT((' + desplazamiento + ')/7)+2,MOD(' + desplazamiento + ',7)+1))',
      '=IF($AG' + d + '="",0,SUMIFS($D$16:$D$515,$C$16:$C$515,"Ingreso",$B$16:$B$515,$AG' + d + '))',
      // Día disponible = marcado, de hoy en adelante y sin ingreso registrado
      // todavía (si ya ganaste ese día, no cuenta para lo que falta).
      '=IF(AND($AG' + d + '<>"",$AH' + d + '=TRUE,$AG' + d + '>=$AE$7,$AI' + d + '=0),1,0)',
    ]);
  }
  hoja.getRange(1, MES.aux.colDia, 31, 1).setValues(numerosDeDia);
  hoja.getRange(1, MES.aux.colFecha, 31, 4).setFormulas(formulasDeDia);
  hoja.getRange(1, MES.aux.colFecha, 31, 1).setNumberFormat(FORMATO.fecha);

  // --- Obligaciones (filas 1..31) --------------------------------
  // Filas 1..30 = las 30 líneas del bloque "Pagos del mes".
  // Fila 31    = los gastos recurrentes, que vencen el último día del mes.
  hoja.getRange('AD35').setValue('obligación / monto pendiente / vence / requerido / días / ritmo / riesgo');
  const origenObligaciones = [];
  for (let i = 1; i <= 30; i++) {
    const filaPago = MES.pagos.fila1 + i - 1;
    origenObligaciones.push([
      '=IF($K' + filaPago + '="","",$K' + filaPago + ')',
      '=IF($K' + filaPago + '="",0,IF($J' + filaPago + '=TRUE,0,N($L' + filaPago + ')))',
      // Un vencimiento ya pasado y sin pagar es urgencia máxima: vence "hoy".
      '=IF($K' + filaPago + '="","",MAX(DATE($AE$2,$AE$3,MIN(MAX($M' + filaPago + ',1),$AE$5)),$AE$7))',
    ]);
  }
  origenObligaciones.push([
    '=IF($AE$10>0,"Gastos recurrentes","")',
    '=$AE$10',
    '=IF($AE$10>0,MAX($AE$6,$AE$7),"")',
  ]);
  hoja.getRange(1, MES.aux.colEtiqueta, 31, 3).setFormulas(origenObligaciones);

  const ritmoPorObligacion = [];
  for (let i = 1; i <= MES.aux.filaObligN; i++) {
    ritmoPorObligacion.push([
      '=IF($AN' + i + '="","",MAX(0,SUMIF($AN$1:$AN$31,"<="&$AN' + i + ',$AM$1:$AM$31)-$AE$8))',
      '=IF($AN' + i + '="","",SUMIFS($AJ$1:$AJ$31,$AG$1:$AG$31,"<="&$AN' + i + '))',
      // Sin días de trabajo antes del vencimiento, el ritmo es el monto
      // completo y la fila queda marcada "en riesgo".
      '=IF($AN' + i + '="",0,IF($AO' + i + '<=0,0,IF($AP' + i + '=0,$AO' + i + ',$AO' + i + '/$AP' + i + ')))',
      '=IF($AN' + i + '="",0,IF(AND($AO' + i + '>0,$AP' + i + '=0),1,0))',
    ]);
  }
  hoja.getRange(1, MES.aux.colRequerido, MES.aux.filaObligN, 4).setFormulas(ritmoPorObligacion);
  hoja.getRange(1, MES.aux.colVence, 31, 1).setNumberFormat(FORMATO.fecha);

  // --- Datos del gráfico de dona ---------------------------------
  hoja.getRange(1, MES.aux.colDonaCat).setValue('Categoría');
  hoja.getRange(1, MES.aux.colDonaTotal).setValue('Total');
  hoja.getRange(2, MES.aux.colDonaCat).setFormula(
    '=IFERROR(QUERY(ARRAYFORMULA({IF($C$16:$C$515="Gasto",' +
    'IF($G$16:$G$515="","Sin categoría",$G$16:$G$515),""),$D$16:$D$515}),' +
    '"select Col1, sum(Col2) where Col1 <> \'\' group by Col1 order by sum(Col2) desc ' +
    'label sum(Col2) \'\'",0),"")'
  );
}

/* ================================================================== *
 * Panel de resumen
 * ================================================================== */

function panelResumen(hoja) {
  tituloSeccion(hoja, 'B4:V4', 'PANEL DEL MES');

  const fila1 = MES.filaEtiquetas1;
  tarjetaIndicador(hoja, fila1, 2, 4, '💵  INGRESOS DEL MES', COLOR.verdeAzulado)
    .setFormula('=$AE$8').setNumberFormat(FORMATO.dinero);
  tarjetaIndicador(hoja, fila1, 6, 4, '🧾  GASTOS DEL MES', COLOR.texto)
    .setFormula('=$AE$9').setNumberFormat(FORMATO.dinero);
  tarjetaIndicador(hoja, fila1, 10, 4, '⚖️  BALANCE', COLOR.azul)
    .setFormula('=$AE$8-$AE$9').setNumberFormat(FORMATO.dinero);
  tarjetaIndicador(hoja, fila1, 14, 4, '📈  PROGRESO', COLOR.azul)
    .setFormula('=$AE$14/100').setNumberFormat(FORMATO.porcentaje);
  tarjetaIndicador(hoja, fila1, 18, 4, '🚦  ESTADO', COLOR.texto)
    .setFormula('=IF($AE$13<=0,"🟢 Vas bien",IF($AE$14>=50,"🟡 Atención","🔴 En riesgo"))')
    .setFontSize(13);

  const fila2 = MES.filaEtiquetas2;
  tarjetaIndicador(hoja, fila2, 2, 4, '🎯  META DIARIA', COLOR.verde)
    .setFormula('=IF($AE$11=0,"",$AE$15)').setNumberFormat(FORMATO.dinero).setFontSize(20);
  tarjetaIndicador(hoja, fila2, 6, 4, '🗓️  DÍAS DE TRABAJO POR DELANTE', COLOR.texto)
    .setFormula('=IF($AE$11=0,"",SUM($AJ$1:$AJ$31))').setNumberFormat(FORMATO.entero);
  tarjetaIndicador(hoja, fila2, 10, 4, '📌  PAGOS SIN MARCAR', COLOR.ambar)
    .setFormula('=$AE$19').setNumberFormat(FORMATO.dinero);
  tarjetaIndicador(hoja, fila2, 14, 4, '🔁  GASTOS RECURRENTES DEL MES', COLOR.texto)
    .setFormula('=$AE$10').setNumberFormat(FORMATO.dinero);
  tarjetaIndicador(hoja, fila2, 18, 4, '💳  TOTAL A CUBRIR', COLOR.texto)
    .setFormula('=$AE$12').setNumberFormat(FORMATO.dinero);

  // Renglón de aviso: es donde el algoritmo "habla".
  const aviso = hoja.getRange(MES.filaAviso, 2, 1, 21);
  aviso.merge()
    .setFormula(
      '=IF($AE$11=0,' +
      '"👉 Marca en el calendario los días que vas a trabajar para calcular tu meta diaria.",' +
      'IF($AE$15<=0,' +
      '"✅ Ya cubriste todo lo que debes este mes. Lo que ganes de más es tuyo.",' +
      'IF($AE$18=1,' +
      '"⚠️ EN RIESGO: "&$AE$17&" vence el "&TEXT($AE$16,"dd/mm/yyyy")&' +
      '" y no tienes ningún día de trabajo marcado antes de esa fecha. Marca más días o busca el dinero de otro lado.",' +
      '"🎯 Gana "&TEXT($AE$15,"$#,##0.00")&" cada día que trabajes para llegar a "&$AE$17&' +
      '" el "&TEXT($AE$16,"dd/mm/yyyy")&"."))))'
    )
    .setBackground(COLOR.tarjeta)
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setWrap(true)
    .setBorder(true, true, true, true, false, false, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);
  hoja.setRowHeight(MES.filaAviso, 40);
}

/* ================================================================== *
 * A · Registro de movimientos
 * ================================================================== */

function bloqueMovimientos(hoja) {
  const m = MES.mov;
  tituloSeccion(hoja, 'B' + MES.filaTitulos + ':H' + MES.filaTitulos,
    'A ·  REGISTRO DE MOVIMIENTOS');
  encabezadosTabla(hoja, MES.filaEncabezados, m.col1, [
    'Fecha (dd/mm/aaaa)', 'Tipo', 'Monto', 'Descripción',
    'Plataforma (sólo ingresos)', 'Categoría (sólo gastos)', 'origen',
  ]);
  hoja.getRange(MES.filaEncabezados, 8).setFontColor(COLOR.texto);

  const filas = m.filaN - m.fila1 + 1;
  celdasDeEntrada(hoja, 'B' + m.fila1 + ':G' + m.filaN);
  hoja.getRange(m.fila1, 2, filas, 1).setNumberFormat(FORMATO.fecha);
  hoja.getRange(m.fila1, 4, filas, 1).setNumberFormat(FORMATO.dinero);
  hoja.getRange(m.fila1, 3, filas, 1).setHorizontalAlignment('center');

  hoja.getRange(m.fila1, 2, filas, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(true)
      .setHelpText('Escribe la fecha del movimiento.')
      .build()
  );
  desplegable(hoja, 'C' + m.fila1 + ':C' + m.filaN, rangoLista('tipos'), false);
  hoja.getRange(m.fila1, 4, filas, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireNumberGreaterThanOrEqualTo(0)
      .setAllowInvalid(false)
      .setHelpText('Escribe el monto en dólares, siempre positivo. El tipo decide si suma o resta.')
      .build()
  );
  desplegable(hoja, 'F' + m.fila1 + ':F' + m.filaN, rangoLista('plataformas'), true);
  desplegable(hoja, 'G' + m.fila1 + ':G' + m.filaN, rangoLista('categorias'), true);

  hoja.getRange(MES.filaEncabezados, m.col1).setNote(
    'Una línea por movimiento. Elige Ingreso o Gasto en «Tipo» y el monto siempre en positivo.\n\n' +
    'Al registrar un ingreso, el día queda marcado solo en el calendario de trabajo.'
  );
}

/* ================================================================== *
 * B · Pagos del mes
 * ================================================================== */

function bloquePagos(hoja) {
  const p = MES.pagos;
  const cfg = ref(HOJAS.configuracion);
  tituloSeccion(hoja, 'J' + MES.filaTitulos + ':N' + MES.filaTitulos, 'B ·  PAGOS DEL MES');
  encabezadosTabla(hoja, MES.filaEncabezados, p.colCheck, [
    '¿Pagado?', 'Concepto', 'Monto', 'Día', 'Tipo',
  ]);

  const filas = p.filaN - p.fila1 + 1;
  hoja.getRange(p.fila1, p.colCheck, filas, 1).insertCheckboxes();
  celdasDeEntrada(hoja, 'J' + p.fila1 + ':J' + p.filaN);
  hoja.getRange(p.fila1, p.colCheck, filas, 1).setHorizontalAlignment('center');

  // Lista automática: pagos fijos + tarjetas (con su mínimo), ordenada por
  // día de vencimiento. Es una sola fórmula que se derrama sobre K:N.
  hoja.getRange(p.fila1, p.col1).setFormula(
    '=IFERROR(LET(' +
    'pagos,ARRAYFORMULA({' +
    cfg + '!' + columnaAbs(CFG.pagos, 0) + ',' +
    cfg + '!' + columnaAbs(CFG.pagos, 1) + ',' +
    cfg + '!' + columnaAbs(CFG.pagos, 2) + ',' +
    'IF(' + cfg + '!' + columnaAbs(CFG.pagos, 0) + '<>"","Pago fijo","")}),' +
    'tarjetas,ARRAYFORMULA({' +
    'IF(' + cfg + '!' + columnaAbs(CFG.tarjetas, 0) + '<>"",' +
    cfg + '!' + columnaAbs(CFG.tarjetas, 0) + '&" (mínimo)",""),' +
    cfg + '!' + columnaAbs(CFG.tarjetas, 3) + ',' +
    cfg + '!' + columnaAbs(CFG.tarjetas, 4) + ',' +
    'IF(' + cfg + '!' + columnaAbs(CFG.tarjetas, 0) + '<>"","Tarjeta","")}),' +
    'todo,{pagos;tarjetas},' +
    'SORT(FILTER(todo,INDEX(todo,,1)<>""),3,TRUE)),"")'
  );

  celdasCalculadas(hoja, 'K' + p.fila1 + ':N' + p.filaN);
  hoja.getRange(p.fila1, 12, filas, 1).setNumberFormat(FORMATO.dinero);
  hoja.getRange(p.fila1, 13, filas, 1).setNumberFormat(FORMATO.entero).setHorizontalAlignment('center');
  hoja.getRange(p.fila1, 14, filas, 1).setFontColor(COLOR.tenue).setFontSize(9);

  hoja.getRange(p.filaN + 2, p.colCheck, 1, 5).merge()
    .setValue('Al marcar «¿Pagado?» el monto se registra solo como gasto en el registro de ' +
      'movimientos. Si te equivocas, desmárcalo y la línea se borra.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic')
    .setWrap(true);
  hoja.setRowHeight(p.filaN + 2, 34);
}

/* ================================================================== *
 * C · Calendario de trabajo
 * ================================================================== */

function bloqueCalendario(hoja) {
  const c = MES.cal;
  tituloSeccion(hoja, 'P' + MES.filaTitulos + ':V' + MES.filaTitulos,
    'C ·  CALENDARIO DE TRABAJO');
  encabezadosTabla(hoja, MES.filaEncabezados, c.col1, DIAS_ES);
  hoja.getRange(MES.filaEncabezados, c.col1, 1, 7).setHorizontalAlignment('center');

  for (let semana = 0; semana < c.semanas; semana++) {
    const filaNumero = c.fila1 + semana * 2;
    const filaCasilla = filaNumero + 1;

    const formulasDeLaSemana = [];
    for (let col = 0; col < 7; col++) {
      // El día que cae en esta casilla del calendario:
      //   día = 7*semana + col + 2 − (día de la semana del 1° del mes)
      const base = 7 * semana + col + 2;
      const expr = '(' + base + '-WEEKDAY($AE$4,1))';
      formulasDeLaSemana.push(
        '=IF(AND(' + expr + '>=1,' + expr + '<=$AE$5),' + expr + ',"")'
      );
    }
    hoja.getRange(filaNumero, c.col1, 1, 7).setFormulas([formulasDeLaSemana]);

    hoja.getRange(filaNumero, c.col1, 1, 7)
      .setHorizontalAlignment('center')
      .setFontWeight('bold')
      .setFontSize(10)
      .setBackground(COLOR.tarjeta);
    hoja.getRange(filaCasilla, c.col1, 1, 7)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(COLOR.inputFondo);

    hoja.setRowHeight(filaNumero, 22);
    hoja.setRowHeight(filaCasilla, 24);
  }

  hoja.getRange(c.fila1, c.col1, c.semanas * 2, 7)
    .setBorder(true, true, true, true, true, true, COLOR.borde, SpreadsheetApp.BorderStyle.SOLID);

  hoja.getRange(c.filaN + 1, c.col1, 1, 7).merge()
    .setValue('Marca los días que VAS a trabajar. Los días ya pasados se marcan solos ' +
      'cuando registras un ingreso.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic')
    .setWrap(true);
  hoja.setRowHeight(c.filaN + 1, 32);

  hoja.getRange(c.filaN + 2, c.col1, 1, 7).merge()
    .setValue('Gastos por categoría')
    .setFontWeight('bold')
    .setFontColor(COLOR.azul);
}

/* ================================================================== *
 * D · Presupuesto por categoría
 * ================================================================== */

function bloquePresupuesto(hoja) {
  const b = MES.presupuesto;
  const cfg = ref(HOJAS.configuracion);
  tituloSeccion(hoja, 'X' + MES.filaTitulos + ':AB' + MES.filaTitulos,
    'D ·  PRESUPUESTO POR CATEGORÍA');
  encabezadosTabla(hoja, MES.filaEncabezados, b.col1, [
    'Categoría', 'Presupuesto', 'Gastado', '%', 'Avance',
  ]);

  hoja.getRange(b.fila1, b.col1).setFormula(
    '=IFERROR(FILTER(' + cfg + '!' + columnaAbs(CFG.categorias, 0) + ',' +
    cfg + '!' + columnaAbs(CFG.categorias, 0) + '<>""),"")'
  );

  const formulasPresupuesto = [];
  for (let f = b.fila1; f <= b.filaN; f++) {
    formulasPresupuesto.push([
      '=IF($X' + f + '="","",IFERROR(VLOOKUP($X' + f + ',' + cfg + '!' +
      bloqueAbs(CFG.categorias) + ',2,FALSE),0))',
      '=IF($X' + f + '="","",SUMIFS($D$16:$D$515,$C$16:$C$515,"Gasto",$G$16:$G$515,$X' + f + '))',
      '=IF($X' + f + '="","",IF(N($Y' + f + ')<=0,0,ROUND($Z' + f + '/$Y' + f + '*100)))',
      '=IF($X' + f + '="","",REPT("█",MIN(20,ROUND(N($AA' + f + ')/5)))&' +
      'IF(N($AA' + f + ')>100," ⚠",""))',
    ]);
  }
  hoja.getRange(b.fila1, b.col1 + 1, formulasPresupuesto.length, 4)
    .setFormulas(formulasPresupuesto);

  const filas = b.filaN - b.fila1 + 1;
  celdasCalculadas(hoja, 'X' + b.fila1 + ':AB' + b.filaN);
  hoja.getRange(b.fila1, 25, filas, 2).setNumberFormat(FORMATO.dinero);
  hoja.getRange(b.fila1, 27, filas, 1).setNumberFormat('0"%"').setHorizontalAlignment('center');
  hoja.getRange(b.fila1, 28, filas, 1).setFontFamily('Roboto Mono').setFontSize(9);

  hoja.getRange(b.filaN + 2, b.col1, 1, 5).merge()
    .setValue('Verde: menos del 80 % del presupuesto. Ámbar: entre 80 % y 99 %. Rojo: 100 % o más.')
    .setFontColor(COLOR.tenue)
    .setFontStyle('italic')
    .setWrap(true);
  hoja.setRowHeight(b.filaN + 2, 32);
}

/* ================================================================== *
 * Gráfico de dona
 * ================================================================== */

function graficoDona(hoja) {
  hoja.getCharts().forEach(function (g) { hoja.removeChart(g); });

  const rango = hoja.getRange(
    1, MES.aux.colDonaCat, 21, 2
  );
  const grafico = hoja.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(rango)
    .setNumHeaders(1)
    .setPosition(MES.cal.filaN + 3, MES.cal.col1, 0, 0)
    .setOption('title', 'Gastos por categoría')
    .setOption('pieHole', 0.55)
    .setOption('width', 430)
    .setOption('height', 300)
    .setOption('legend', { position: 'right', textStyle: { color: COLOR.texto, fontSize: 10 } })
    .setOption('titleTextStyle', { color: COLOR.texto, fontSize: 13, bold: true })
    .setOption('backgroundColor', COLOR.tarjeta)
    .setOption('colors', [
      COLOR.azul, COLOR.verdeAzulado, COLOR.ambar, COLOR.rojo, COLOR.verde,
      '#7c3aed', '#0891b2', '#be123c', '#65a30d', '#a16207',
    ])
    .build();
  hoja.insertChart(grafico);
}

/* ================================================================== *
 * Formato condicional
 * ================================================================== */

function formatoCondicionalMes(hoja) {
  hoja.setConditionalFormatRules([]);
  const m = MES.mov;
  const p = MES.pagos;
  const c = MES.cal;
  const b = MES.presupuesto;

  const movB = 'B' + m.fila1 + ':B' + m.filaN;
  const movC = 'C' + m.fila1 + ':C' + m.filaN;
  const movF = 'F' + m.fila1 + ':F' + m.filaN;
  const movG = 'G' + m.fila1 + ':G' + m.filaN;

  // Fecha fuera del mes elegido: casi siempre es un dedazo.
  reglaFormula(hoja, [movB],
    '=AND($B' + m.fila1 + '<>"",OR($B' + m.fila1 + '<$AE$4,$B' + m.fila1 + '>$AE$6))',
    { fondo: COLOR.rojoSuave, texto: COLOR.rojo, negrita: true });

  reglaFormula(hoja, [movC], '=$C' + m.fila1 + '="Ingreso"',
    { texto: COLOR.verdeAzulado, negrita: true });
  reglaFormula(hoja, [movC], '=$C' + m.fila1 + '="Gasto"',
    { texto: COLOR.rojo, negrita: true });

  // Columnas que no aplican según el tipo de movimiento.
  reglaFormula(hoja, [movF], '=$C' + m.fila1 + '="Gasto"', { fondo: COLOR.fondo });
  reglaFormula(hoja, [movG], '=$C' + m.fila1 + '="Ingreso"', { fondo: COLOR.fondo });

  // Pagos ya marcados / vencidos sin pagar / casilla desalineada.
  reglaFormula(hoja, ['K' + p.fila1 + ':N' + p.filaN], '=$J' + p.fila1 + '=TRUE',
    { fondo: COLOR.verdeSuave, texto: COLOR.verde });
  reglaFormula(hoja, ['K' + p.fila1 + ':N' + p.filaN],
    '=AND($K' + p.fila1 + '<>"",$J' + p.fila1 + '=FALSE,' +
    'DATE($AE$2,$AE$3,MIN(MAX($M' + p.fila1 + ',1),$AE$5))<$AE$7)',
    { texto: COLOR.rojo, negrita: true });
  reglaFormula(hoja, ['J' + p.fila1 + ':J' + p.filaN],
    '=AND($J' + p.fila1 + '=TRUE,$AK' + p.fila1 + '<>"",$AK' + p.fila1 + '<>$K' + p.fila1 + ')',
    { fondo: COLOR.rojoSuave });

  // Calendario: días que no existen en este mes y día de hoy.
  const grid = 'P' + c.fila1 + ':V' + c.filaN;
  reglaFormula(hoja, [grid],
    '=AND(MOD(ROW()-' + c.fila1 + ',2)=0,P' + c.fila1 + '="")',
    { fondo: COLOR.fondo });
  reglaFormula(hoja, [grid],
    '=AND(MOD(ROW()-' + c.fila1 + ',2)=1,P' + (c.fila1 - 1) + '="")',
    { fondo: COLOR.fondo });
  reglaFormula(hoja, [grid],
    '=AND(MOD(ROW()-' + c.fila1 + ',2)=0,P' + c.fila1 + '<>"",' +
    'DATE($AE$2,$AE$3,P' + c.fila1 + ')=TODAY())',
    { fondo: COLOR.azul, texto: COLOR.tarjeta, negrita: true });

  // Barras de presupuesto.
  const barras = ['AA' + b.fila1 + ':AB' + b.filaN];
  reglaFormula(hoja, barras, '=AND($X' + b.fila1 + '<>"",$AA' + b.fila1 + '<80)',
    { texto: COLOR.verde, negrita: true });
  reglaFormula(hoja, barras,
    '=AND($X' + b.fila1 + '<>"",$AA' + b.fila1 + '>=80,$AA' + b.fila1 + '<100)',
    { texto: COLOR.ambar, negrita: true });
  reglaFormula(hoja, barras, '=AND($X' + b.fila1 + '<>"",$AA' + b.fila1 + '>=100)',
    { texto: COLOR.rojo, negrita: true });

  // Panel: la meta diaria se pinta de rojo cuando el vencimiento va en riesgo.
  reglaFormula(hoja, ['B' + MES.filaValores2 + ':E' + MES.filaValores2], '=$AE$18=1',
    { fondo: COLOR.rojoSuave, texto: COLOR.rojo });
  reglaFormula(hoja, ['B' + MES.filaAviso], '=$AE$18=1',
    { fondo: COLOR.rojoSuave, texto: COLOR.rojo });
  reglaFormula(hoja, ['R' + MES.filaValores1 + ':U' + MES.filaValores1], '=$AE$13<=0',
    { texto: COLOR.verde });
  reglaFormula(hoja, ['R' + MES.filaValores1 + ':U' + MES.filaValores1],
    '=AND($AE$13>0,$AE$14>=50)', { texto: COLOR.ambar });
  reglaFormula(hoja, ['R' + MES.filaValores1 + ':U' + MES.filaValores1],
    '=AND($AE$13>0,$AE$14<50)', { texto: COLOR.rojo });
}


// ==================================================================
// 14_Deudas.gs
// ==================================================================

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


// ==================================================================
// 15_Listas.gs
// ==================================================================

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


// ==================================================================
// 20_Protecciones.gs
// ==================================================================

/**
 * Protecciones.
 *
 * Todas son "sólo advertencia": el comprador es el dueño de su copia, así
 * que una protección con lista de editores no le impediría nada. La
 * advertencia sí aparece para el dueño, y es justo lo que hace falta para
 * que no borre una fórmula sin darse cuenta. Los scripts siguen pudiendo
 * escribir con normalidad.
 */

function aplicarTodasLasProtecciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ss.getSheets().forEach(function (hoja) {
    const nombre = hoja.getName();
    if (nombre === HOJAS.configuracion) {
      protegerConEntradas(hoja, [
        bloqueA1(CFG.pagos),
        bloqueA1(CFG.tarjetas),
        bloqueA1(CFG.recurrentes),
        bloqueA1(CFG.categorias),
        bloqueA1(CFG.plataformas),
      ]);
    } else if (nombre === HOJAS.deudas) {
      protegerConEntradas(hoja, [
        DEUDA.celdaEstrategia, DEUDA.celdaExtra, DEUDA.celdaBoton,
      ]);
    } else if (esHojaDeMes(hoja)) {
      protegerHojaDeMes(hoja);
    } else {
      protegerConEntradas(hoja, []);
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Fórmulas protegidas. Las celdas amarillas siguen siendo tuyas.', 'Gig Finance', 5
  );
}

function protegerHojaDeMes(hoja) {
  const m = MES.mov;
  const p = MES.pagos;
  const c = MES.cal;

  const entradas = [
    MES.celdaMes,
    MES.celdaAnio,
    'B' + m.fila1 + ':H' + m.filaN,
    'J' + p.fila1 + ':J' + p.filaN,
  ];
  for (let semana = 0; semana < c.semanas; semana++) {
    const fila = c.fila1 + semana * 2 + 1;
    entradas.push(
      letraColumna(c.col1) + fila + ':' + letraColumna(c.colN) + fila
    );
  }
  // La zona de control interna la escribe el script, nunca la persona.
  entradas.push(
    letraColumna(MES.aux.colNombrePagado) + p.fila1 + ':' +
    letraColumna(MES.aux.colOrigenPago) + p.filaN
  );

  protegerConEntradas(hoja, entradas);
}

/**
 * Protege la hoja completa con advertencia y deja libres los rangos de
 * captura. Elimina antes cualquier protección previa para que volver a
 * ejecutar la función no acumule protecciones duplicadas.
 */
function protegerConEntradas(hoja, rangosDeEntrada) {
  hoja.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    .forEach(function (p) { p.remove(); });
  hoja.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .forEach(function (p) { p.remove(); });

  const proteccion = hoja.protect()
    .setDescription('Gig Finance — fórmulas de «' + hoja.getName() + '»')
    .setWarningOnly(true);

  if (rangosDeEntrada.length > 0) {
    proteccion.setUnprotectedRanges(
      rangosDeEntrada.map(function (a1) { return hoja.getRange(a1); })
    );
  }
}


// ==================================================================
// 30_Runtime.gs
// ==================================================================

/**
 * Lo que ocurre mientras el comprador usa la plantilla: el menú y las dos
 * automatizaciones que no se pueden hacer con fórmulas.
 *
 *   1. Marcar «¿Pagado?» crea (o borra) el movimiento correspondiente.
 *   2. Registrar un ingreso marca ese día en el calendario de trabajo.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💰 Gig Finance')
    .addItem('➕  Crear mes nuevo…', 'crearMesNuevo')
    .addItem('🔄  Recalcular plan de pago de deudas', 'recalcularPlanDeDeudas')
    .addSeparator()
    .addItem('🧹  Limpiar esta hoja de mes…', 'limpiarHojaActiva')
    .addItem('🔒  Volver a proteger las fórmulas', 'aplicarTodasLasProtecciones')
    .addSeparator()
    .addItem('📘  Abrir instrucciones', 'irAInstrucciones')
    .addToUi();
}

function irAInstrucciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.instrucciones);
  if (hoja) ss.setActiveSheet(hoja);
}

/* ================================================================== *
 * onEdit
 * ================================================================== */

function onEdit(e) {
  if (!e || !e.range) return;
  const hoja = e.range.getSheet();
  const fila = e.range.getRow();
  const col = e.range.getColumn();

  if (hoja.getName() === HOJAS.deudas) {
    if (e.range.getA1Notation() === DEUDA.celdaBoton && e.range.getValue() === true) {
      recalcularPlanDeDeudas();
      hoja.getRange(DEUDA.celdaBoton).setValue(false);
    }
    return;
  }

  if (!esHojaDeMes(hoja)) return;

  // Una edición puede abarcar varias celdas (pegar, arrastrar): recorremos
  // las filas tocadas.
  const filaFinal = fila + e.range.getNumRows() - 1;
  const colFinal = col + e.range.getNumColumns() - 1;

  const p = MES.pagos;
  if (col <= p.colCheck && colFinal >= p.colCheck) {
    for (let f = Math.max(fila, p.fila1); f <= Math.min(filaFinal, p.filaN); f++) {
      alternarPago(hoja, f);
    }
  }

  const m = MES.mov;
  if (col <= m.colN && colFinal >= m.col1) {
    for (let f = Math.max(fila, m.fila1); f <= Math.min(filaFinal, m.filaN); f++) {
      marcarDiaTrabajado(hoja, f);
    }
  }
}

/** Una hoja es "de mes" si lleva el marcador que escribimos al construirla. */
function esHojaDeMes(hoja) {
  try {
    return hoja.getRange(1, MES.aux.colEscalares).getValue() === MES.marcador;
  } catch (err) {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * 1 · Marcar / desmarcar un pago
 * ------------------------------------------------------------------ */

function alternarPago(hoja, fila) {
  const p = MES.pagos;
  const marcado = hoja.getRange(fila, p.colCheck).getValue() === true;
  const celdaNombre = hoja.getRange(fila, MES.aux.colNombrePagado);
  const celdaOrigen = hoja.getRange(fila, MES.aux.colOrigenPago);

  if (!marcado) {
    // Al desmarcar borramos exactamente el movimiento que creamos, usando
    // la marca guardada — no el nombre que hoy ocupa esa fila.
    const origen = String(celdaOrigen.getValue() || '');
    if (origen) borrarMovimientoPorOrigen(hoja, origen);
    celdaNombre.clearContent();
    celdaOrigen.clearContent();
    return;
  }

  const nombre = String(hoja.getRange(fila, p.col1).getValue() || '').trim();
  if (!nombre) {
    // Fila vacía: no hay nada que pagar.
    hoja.getRange(fila, p.colCheck).setValue(false);
    return;
  }

  const monto = Number(hoja.getRange(fila, p.col1 + 1).getValue()) || 0;
  const dia = Number(hoja.getRange(fila, p.col1 + 2).getValue()) || 1;
  const tipo = String(hoja.getRange(fila, p.col1 + 3).getValue() || 'Pago fijo');

  const anio = Number(hoja.getRange(2, MES.aux.colEscalares).getValue());
  const mes = Number(hoja.getRange(3, MES.aux.colEscalares).getValue());
  const diasDelMes = Number(hoja.getRange(5, MES.aux.colEscalares).getValue()) || 28;
  const diaSeguro = Math.min(Math.max(dia, 1), diasDelMes);

  const categoria = tipo === 'Tarjeta' ? CAT_PAGO_TARJETA : CAT_PAGO_FIJO;
  const origen = 'AUTO|' + tipo + '|' + nombre;

  if (buscarFilaPorOrigen(hoja, origen) === -1) {
    agregarMovimiento(hoja, {
      fecha: new Date(anio, mes - 1, diaSeguro),
      tipo: 'Gasto',
      monto: monto,
      descripcion: nombre,
      plataforma: '',
      categoria: categoria,
      origen: origen,
    });
  }

  celdaNombre.setValue(nombre);
  celdaOrigen.setValue(origen);
}

function agregarMovimiento(hoja, mov) {
  const m = MES.mov;
  const fila = primeraFilaLibre(hoja);
  if (fila === -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'El registro de movimientos está lleno. Borra líneas viejas para seguir.',
      'Gig Finance', 8
    );
    return;
  }
  hoja.getRange(fila, m.col1, 1, 7).setValues([[
    mov.fecha, mov.tipo, mov.monto, mov.descripcion,
    mov.plataforma, mov.categoria, mov.origen,
  ]]);
}

function primeraFilaLibre(hoja) {
  const m = MES.mov;
  const filas = m.filaN - m.fila1 + 1;
  const datos = hoja.getRange(m.fila1, m.col1, filas, m.colN - m.col1 + 1).getValues();
  for (let i = 0; i < datos.length; i++) {
    const vacia = datos[i].every(function (v) { return v === '' || v === null; });
    if (vacia) return m.fila1 + i;
  }
  return -1;
}

function buscarFilaPorOrigen(hoja, origen) {
  const m = MES.mov;
  const filas = m.filaN - m.fila1 + 1;
  const datos = hoja.getRange(m.fila1, m.colN, filas, 1).getValues();
  for (let i = 0; i < datos.length; i++) {
    if (String(datos[i][0]) === origen) return m.fila1 + i;
  }
  return -1;
}

function borrarMovimientoPorOrigen(hoja, origen) {
  const m = MES.mov;
  const fila = buscarFilaPorOrigen(hoja, origen);
  // Limpiamos el contenido en lugar de eliminar la fila: borrar filas
  // correría el bloque entero y desalinearía todas las fórmulas fijas.
  if (fila !== -1) hoja.getRange(fila, m.col1, 1, m.colN - m.col1 + 1).clearContent();
}

/* ------------------------------------------------------------------ *
 * 2 · Un ingreso marca el día como trabajado
 * ------------------------------------------------------------------ */

function marcarDiaTrabajado(hoja, fila) {
  const m = MES.mov;
  if (String(hoja.getRange(fila, m.col1 + 1).getValue()) !== 'Ingreso') return;

  const fecha = hoja.getRange(fila, m.col1).getValue();
  if (!(fecha instanceof Date)) return;

  const anio = Number(hoja.getRange(2, MES.aux.colEscalares).getValue());
  const mes = Number(hoja.getRange(3, MES.aux.colEscalares).getValue());
  if (fecha.getFullYear() !== anio || fecha.getMonth() + 1 !== mes) return;

  const celda = celdaDelCalendario(hoja, anio, mes, fecha.getDate());
  if (celda && celda.getValue() !== true) celda.setValue(true);
}

/** Casilla del calendario que corresponde a un día del mes. */
function celdaDelCalendario(hoja, anio, mes, dia) {
  const c = MES.cal;
  const primeroDelMes = new Date(anio, mes - 1, 1);
  const indice = primeroDelMes.getDay() + dia - 1;   // 0 = primera casilla
  const semana = Math.floor(indice / 7);
  if (semana >= c.semanas) return null;
  return hoja.getRange(c.fila1 + semana * 2 + 1, c.col1 + (indice % 7));
}


// ==================================================================
// 40_SimulacionDeuda.gs
// ==================================================================

/**
 * Simulación de pago de deudas (bola de nieve / avalancha).
 *
 * Réplica exacta de la lógica de la app: cada mes suma el interés a todos
 * los saldos, paga el mínimo de todas las tarjetas menos la "objetivo", y
 * vuelca el resto del presupuesto (mínimos + extra) sobre la objetivo. Al
 * liquidarse una tarjeta su mínimo queda libre para la siguiente.
 */

const CERO = 0.005;

/**
 * @param {Array<{nombre:string,saldo:number,apr:number,minimo:number}>} tarjetas
 * @param {'bola'|'avalancha'} estrategia
 * @param {number} extraMensual
 */
function simularPagoDeDeudas(tarjetas, estrategia, extraMensual) {
  const activas = tarjetas.filter(function (t) { return t.saldo > 0; });
  if (activas.length === 0) {
    return { totalMeses: 0, interesTotal: 0, nuncaSeLiquida: false, orden: [] };
  }

  // Bola de nieve: saldo más chico primero. Avalancha: interés más alto.
  const orden = activas.slice().sort(function (a, b) {
    return estrategia === 'bola' ? a.saldo - b.saldo : b.apr - a.apr;
  });

  const saldos = orden.map(function (t) { return t.saldo; });
  const mesesDeLiquidacion = orden.map(function () { return null; });
  const totalMinimos = orden.reduce(function (s, t) { return s + t.minimo; }, 0);
  const presupuesto = totalMinimos + Math.max(0, extraMensual);

  let interesTotal = 0;
  let meses = 0;
  let pendientes = orden.length;

  while (pendientes > 0 && meses < DEUDA.maxMeses) {
    meses += 1;

    for (let i = 0; i < orden.length; i++) {
      if (saldos[i] <= 0) continue;
      const interes = saldos[i] * (orden[i].apr / 100 / 12);
      interesTotal += interes;
      saldos[i] += interes;
    }

    let objetivo = -1;
    for (let i = 0; i < orden.length; i++) {
      if (saldos[i] > 0) { objetivo = i; break; }
    }
    if (objetivo === -1) break;

    let disponible = presupuesto;
    for (let i = 0; i < orden.length; i++) {
      if (i === objetivo || saldos[i] <= 0) continue;
      const pago = Math.min(saldos[i], orden[i].minimo);
      saldos[i] -= pago;
      disponible -= pago;
    }

    const pagoObjetivo = Math.min(saldos[objetivo], Math.max(0, disponible));
    saldos[objetivo] -= pagoObjetivo;

    for (let i = 0; i < orden.length; i++) {
      if (saldos[i] <= CERO && mesesDeLiquidacion[i] === null) {
        saldos[i] = 0;
        mesesDeLiquidacion[i] = meses;
        pendientes -= 1;
      }
    }
  }

  return {
    totalMeses: meses,
    interesTotal: interesTotal,
    nuncaSeLiquida: pendientes > 0,
    orden: orden.map(function (t, i) {
      return {
        nombre: t.nombre,
        saldo: t.saldo,
        apr: t.apr,
        minimo: t.minimo,
        meses: mesesDeLiquidacion[i] === null ? meses : mesesDeLiquidacion[i],
      };
    }),
  };
}

/** Lee las tarjetas de "Configuración". */
function leerTarjetas() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.configuracion);
  const b = CFG.tarjetas;
  const valores = hoja.getRange(b.fila1, b.col1, b.filaN - b.fila1 + 1, b.cols).getValues();

  return valores
    .filter(function (fila) { return String(fila[0]).trim() !== ''; })
    .map(function (fila) {
      return {
        nombre: String(fila[0]).trim(),
        saldo: Number(fila[1]) || 0,
        apr: Number(fila[2]) || 0,
        minimo: Number(fila[3]) || 0,
      };
    });
}

/** Corre la simulación y escribe los resultados en la hoja. */
function recalcularPlanDeDeudas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.deudas);
  if (!hoja) return;

  const estrategia = String(hoja.getRange(DEUDA.celdaEstrategia).getValue())
    .toLowerCase().indexOf('avalancha') === 0 ? 'avalancha' : 'bola';
  const extra = Number(hoja.getRange(DEUDA.celdaExtra).getValue()) || 0;

  const tarjetas = leerTarjetas();
  const resultado = simularPagoDeDeudas(tarjetas, estrategia, extra);

  const filas = DEUDA.filaN - DEUDA.fila1 + 1;
  hoja.getRange(DEUDA.fila1, DEUDA.col1, filas, DEUDA.colN - DEUDA.col1 + 1).clearContent();

  if (tarjetas.length === 0) {
    hoja.getRange(DEUDA.celdaMeses).setValue('');
    hoja.getRange(DEUDA.celdaInteres).setValue('');
    hoja.getRange(DEUDA.celdaFecha).setValue('');
    escribirAviso(hoja, 'Agrega tus tarjetas en la hoja «Configuración» y vuelve a recalcular.',
      COLOR.tenue);
    return;
  }

  const conSaldo = resultado.orden.length;
  const salida = resultado.orden.slice(0, filas).map(function (t, i) {
    return [
      i + 1,
      t.nombre,
      t.saldo,
      t.apr,
      t.minimo,
      resultado.nuncaSeLiquida ? 'No se liquida' : t.meses + ' meses',
    ];
  });
  if (salida.length > 0) {
    hoja.getRange(DEUDA.fila1, DEUDA.col1, salida.length, 6).setValues(salida);
  }

  if (resultado.nuncaSeLiquida) {
    // El presupuesto no alcanza ni para cubrir los intereses que se acumulan.
    hoja.getRange(DEUDA.celdaMeses).setValue('');
    hoja.getRange(DEUDA.celdaInteres).setValue('');
    hoja.getRange(DEUDA.celdaFecha).setValue('');
    escribirAviso(hoja,
      '⚠️ Con este presupuesto las tarjetas no se liquidan ni en ' + DEUDA.maxMeses +
      ' meses: los intereses crecen más rápido de lo que abonas. Sube el pago extra ' +
      'mensual, o busca bajar el APR (transferencia de saldo o consolidación).',
      COLOR.rojo);
    return;
  }

  hoja.getRange(DEUDA.celdaMeses).setValue(resultado.totalMeses);
  hoja.getRange(DEUDA.celdaInteres).setValue(resultado.interesTotal);

  const hoy = new Date();
  hoja.getRange(DEUDA.celdaFecha).setValue(
    new Date(hoy.getFullYear(), hoy.getMonth() + resultado.totalMeses, 1)
  );

  const anios = Math.floor(resultado.totalMeses / 12);
  const resto = resultado.totalMeses % 12;
  const enPalabras = anios > 0
    ? anios + (anios === 1 ? ' año' : ' años') + (resto > 0 ? ' y ' + resto + ' meses' : '')
    : resultado.totalMeses + ' meses';
  escribirAviso(hoja,
    '✅ Con la estrategia «' + (estrategia === 'bola' ? 'Bola de nieve' : 'Avalancha') +
    '» y $' + extra.toFixed(2) + ' extra al mes, liquidas ' + conSaldo +
    (conSaldo === 1 ? ' tarjeta' : ' tarjetas') + ' en ' + enPalabras + '.',
    COLOR.verde);
}

function escribirAviso(hoja, texto, color) {
  hoja.getRange(DEUDA.celdaAviso).setValue(texto).setFontColor(color);
}


// ==================================================================
// 50_NuevoMes.gs
// ==================================================================

/**
 * Duplicar el mes.
 *
 * La pestaña "MES – plantilla" se copia tal cual: sus fórmulas apuntan a
 * celdas de su propia hoja o a 'Configuración'/'_Listas' por nombre, así que
 * la copia queda funcionando sola. Lo único que hace falta es vaciar los
 * datos del mes anterior y poner el mes/año nuevos.
 */

function crearMesNuevo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const plantilla = ss.getSheetByName(HOJAS.mes);

  if (!plantilla) {
    ui.alert('No encuentro la pestaña «' + HOJAS.mes + '». ¿La renombraste o la borraste?');
    return;
  }

  const hoy = new Date();
  const sugerido = MESES_ES[hoy.getMonth()] + ' ' + hoy.getFullYear();
  const respuesta = ui.prompt(
    'Crear mes nuevo',
    'Escribe el mes y el año que quieres crear.\n\nPor ejemplo:  ' + sugerido,
    ui.ButtonSet.OK_CANCEL
  );
  if (respuesta.getSelectedButton() !== ui.Button.OK) return;

  const texto = respuesta.getResponseText();
  const elegido = interpretarMesYAnio(texto);
  if (!elegido) {
    ui.alert('No entendí «' + texto + '».\n\nEscribe el mes y el año, así:  ' + sugerido);
    return;
  }

  const nombre = MESES_ES[elegido.mes - 1] + ' ' + elegido.anio;
  if (ss.getSheetByName(nombre)) {
    ui.alert('Ya existe una pestaña llamada «' + nombre + '».');
    return;
  }

  const nueva = plantilla.copyTo(ss).setName(nombre);
  vaciarHojaDeMes(nueva);
  nueva.getRange(MES.celdaMes).setValue(MESES_ES[elegido.mes - 1]);
  nueva.getRange(MES.celdaAnio).setValue(elegido.anio);

  ss.setActiveSheet(nueva);
  ss.moveActiveSheet(ss.getSheets().length);
  protegerHojaDeMes(nueva);
  nueva.setActiveSelection('B' + MES.mov.fila1);

  ui.alert(
    'Listo',
    'Creé la pestaña «' + nombre + '».\n\n' +
    'Ya trae tus pagos fijos y tarjetas desde Configuración. ' +
    'Empieza marcando en el calendario los días que vas a trabajar.',
    ui.ButtonSet.OK
  );
}

/** Acepta "Marzo 2026", "marzo de 2026", "03/2026", "2026 marzo"… */
function interpretarMesYAnio(texto) {
  const limpio = sinAcentos(String(texto || '').toLowerCase().trim());
  if (!limpio) return null;

  const anioEncontrado = limpio.match(/(19|20)\d{2}/);
  const anio = anioEncontrado ? Number(anioEncontrado[0]) : new Date().getFullYear();

  for (let i = 0; i < MESES_ES.length; i++) {
    if (limpio.indexOf(sinAcentos(MESES_ES[i].toLowerCase())) !== -1) {
      return { mes: i + 1, anio: anio };
    }
  }

  // Formatos numéricos: 03/2026, 3-2026, 2026/03.
  const numeros = limpio.match(/\d+/g) || [];
  for (let i = 0; i < numeros.length; i++) {
    const n = Number(numeros[i]);
    if (n >= 1 && n <= 12 && String(n) !== String(anio)) {
      return { mes: n, anio: anio };
    }
  }
  return null;
}

function sinAcentos(texto) {
  return texto
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u');
}

/* ------------------------------------------------------------------ *
 * Vaciar una hoja de mes
 * ------------------------------------------------------------------ */

function limpiarHojaActiva() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const hoja = ss.getActiveSheet();

  if (!esHojaDeMes(hoja)) {
    ui.alert('Ponte primero en una pestaña de mes (o en «' + HOJAS.mes + '»).');
    return;
  }

  const confirmar = ui.alert(
    'Limpiar «' + hoja.getName() + '»',
    'Se borrarán todos los movimientos, las casillas de pagos y los días marcados ' +
    'en el calendario de esta pestaña.\n\nTu Configuración no se toca. ¿Seguimos?',
    ui.ButtonSet.YES_NO
  );
  if (confirmar !== ui.Button.YES) return;

  vaciarHojaDeMes(hoja);
  ss.toast('Pestaña «' + hoja.getName() + '» lista para empezar.', 'Gig Finance', 5);
}

function vaciarHojaDeMes(hoja) {
  const m = MES.mov;
  const p = MES.pagos;
  const c = MES.cal;

  hoja.getRange(m.fila1, m.col1, m.filaN - m.fila1 + 1, m.colN - m.col1 + 1).clearContent();

  const filasPago = p.filaN - p.fila1 + 1;
  hoja.getRange(p.fila1, p.colCheck, filasPago, 1)
    .setValue(false);
  hoja.getRange(p.fila1, MES.aux.colNombrePagado, filasPago, 1).clearContent();
  hoja.getRange(p.fila1, MES.aux.colOrigenPago, filasPago, 1).clearContent();

  for (let semana = 0; semana < c.semanas; semana++) {
    hoja.getRange(c.fila1 + semana * 2 + 1, c.col1, 1, 7).setValue(false);
  }
}

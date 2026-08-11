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

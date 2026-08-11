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

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

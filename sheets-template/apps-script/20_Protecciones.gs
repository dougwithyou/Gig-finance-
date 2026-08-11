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

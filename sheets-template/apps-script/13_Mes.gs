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

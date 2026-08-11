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

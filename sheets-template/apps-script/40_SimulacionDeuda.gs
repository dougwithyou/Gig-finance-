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

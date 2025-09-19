const db = require('../config/db');

async function runRollover() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT id, saldo FROM TESORERIA_SALDO LIMIT 1 FOR UPDATE');
    if (rows.length === 0) {
      await connection.query('INSERT INTO TESORERIA_SALDO (saldo) VALUES (?)', [0]);
      await connection.commit();
      console.log('Rollover: no había saldo, inicializado a 0');
      return;
    }
    const saldoActual = parseFloat(rows[0].saldo || 0);
    const fechaHoy = new Date().toISOString().split('T')[0];
  await connection.query('INSERT INTO TESORERIA_SALDO_HISTORY (fecha, saldo_final) VALUES (?, ?)', [fechaHoy, saldoActual]);
  // Política: mantener el saldo actual como saldo inicial del día siguiente (no resetear)
    await connection.commit();
    console.log(`Rollover completado: snapshot ${saldoActual} para ${fechaHoy}`);
  } catch (err) {
    console.error('Error ejecutando rollover:', err);
    await connection.rollback();
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  runRollover().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = runRollover;

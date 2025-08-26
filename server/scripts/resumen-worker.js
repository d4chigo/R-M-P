#!/usr/bin/env node
/*
  Worker para poblar / mantener la tabla resumen_rutas.
  Modos:
    --full : recalcula todo desde VIAJE (recomendado para primera ejecución)
    --delta : procesa viajes con updated_at > last_run (por defecto)

  Uso: node server/scripts/resumen-worker.js --full
*/

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const { fullLoad, deltaLoad } = require('../lib/resumen-worker-lib');

async function run() {
  try {
    if (argv.full) {
      await fullLoad();
    } else {
      await deltaLoad();
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error worker principal:', err.message);
    process.exit(1);
  }
}

// Allow require() to call functions programmatically
module.exports = { run, fullLoad, deltaLoad };

if (require.main === module) {
  run();
}

const express = require("express");
const router = express.Router();
const {
  getResumenRutas,
  getResumenRutasRango,
  getMetricasDiarias,
  getPerformanceVehiculos,
  getPerformanceRepartidores,
  getMetricasCumplimiento,
  getResumenRutasProcedimiento,
  getMetricasDiaProcedimiento,
  // v2
  getPerformanceVehiculosV2,
  getPerformanceRepartidoresV2,
  getCumplimientoVehiculo,
  getCumplimientoVehiculoDetalle,
 // getCumplimientoVHVisitas,

  // Tesorería
  getTesoreriaPorCategoria,
  getTesoreriaPorPersona,
  getTesoreriaPorVehiculo,
  getTesoreriaPorCentro,
  getTesoreriaTendenciaMensual,
  getTesoreriaSummary,
  getTesoreriaDaily,

  // detalle por viaje
  getResumenRutasPorViaje,
  triggerFullResumLoad,
} = require("../controllers/reportes.controller");

const { requireOperator } = require('../middleware/auth.middleware');

// GET /api/reportes/resumen-rutas - Obtener resumen de rutas
// Query params: ?fecha=2025-01-21 (opcional)
router.get("/resumen-rutas", getResumenRutas);

// POST /api/reportes/resumen-rutas/trigger-full - Ejecuta un full load (operador/admin)
router.post('/resumen-rutas/trigger-full', requireOperator, triggerFullResumLoad);

// GET /api/reportes/resumen-rutas/viajes - Resumen por viaje (detalle)
// Query params: ?fecha=YYYY-MM-DD | ?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD [&placa=XXX] [&repartidor=texto]
router.get("/resumen-rutas/viajes", getResumenRutasPorViaje);

// GET /api/reportes/resumen-rutas/rango - Obtener resumen por rango de fechas
// Query params: ?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get("/resumen-rutas/rango", getResumenRutasRango);

// GET /api/reportes/metricas-diarias - Obtener métricas agregadas por día
// Query params: ?fecha=2025-01-21 (opcional)
router.get("/metricas-diarias", getMetricasDiarias);

// GET /api/reportes/performance/vehiculos - Performance de vehículos
// Query params: ?dias=30 (opcional, default 30)
router.get("/performance/vehiculos", getPerformanceVehiculos);

// GET /api/reportes/performance/repartidores - Performance de repartidores
// Query params: ?dias=30 (opcional, default 30)
router.get("/performance/repartidores", getPerformanceRepartidores);

// GET /api/reportes/cumplimiento - Métricas de cumplimiento
// Query params: ?fecha=2025-01-21 (opcional, default hoy)
router.get("/cumplimiento", getMetricasCumplimiento);

// V2 - Consultan directamente las vistas dedicadas
router.get("/performance/vehiculos/v2", getPerformanceVehiculosV2);
router.get("/performance/repartidores/v2", getPerformanceRepartidoresV2);
router.get("/cumplimiento/vh", getCumplimientoVehiculo);
// GET /api/reportes/cumplimiento/vh/:placa/detalle?umbralDias=30
router.get("/cumplimiento/vh/:placa/detalle", getCumplimientoVehiculoDetalle);
// Nota: el endpoint de visitas por Cumplimiento VH fue removido junto con la vista
// correspondiente. Si se requiere restaurarlo, volver a implementar la vista
// `v_cumplimiento_vh_visitas` y descomentar la ruta.

// ===== Tesorería - reportes
// GET /api/reportes/tesoreria/categoria
router.get('/tesoreria/categoria', getTesoreriaPorCategoria);
// GET /api/reportes/tesoreria/persona
router.get('/tesoreria/persona', getTesoreriaPorPersona);
// GET /api/reportes/tesoreria/vehiculo?placa=ABC-123
router.get('/tesoreria/vehiculo', getTesoreriaPorVehiculo);
// GET /api/reportes/tesoreria/centro?idCentro=1
router.get('/tesoreria/centro', getTesoreriaPorCentro);
// GET /api/reportes/tesoreria/tendencia?meses=12
router.get('/tesoreria/tendencia', getTesoreriaTendenciaMensual);

// GET /api/reportes/tesoreria/summary?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/tesoreria/summary', getTesoreriaSummary);
// GET /api/reportes/tesoreria/daily?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/tesoreria/daily', getTesoreriaDaily);


// GET /api/reportes/sp/resumen-rutas/:fecha - Usar procedimiento almacenado
router.get("/sp/resumen-rutas/:fecha", getResumenRutasProcedimiento);

// GET /api/reportes/sp/metricas-dia/:fecha - Usar procedimiento almacenado
router.get("/sp/metricas-dia/:fecha", getMetricasDiaProcedimiento);

module.exports = router;

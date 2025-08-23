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

  // detalle por viaje
  getResumenRutasPorViaje,
} = require("../controllers/reportes.controller");

// GET /api/reportes/resumen-rutas - Obtener resumen de rutas
// Query params: ?fecha=2025-01-21 (opcional)
router.get("/resumen-rutas", getResumenRutas);

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


// GET /api/reportes/sp/resumen-rutas/:fecha - Usar procedimiento almacenado
router.get("/sp/resumen-rutas/:fecha", getResumenRutasProcedimiento);

// GET /api/reportes/sp/metricas-dia/:fecha - Usar procedimiento almacenado
router.get("/sp/metricas-dia/:fecha", getMetricasDiaProcedimiento);

module.exports = router;

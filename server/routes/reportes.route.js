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
  getMetricasDiaProcedimiento
} = require("../controllers/reportes.controller");

// GET /api/reportes/resumen-rutas - Obtener resumen de rutas
// Query params: ?fecha=2025-01-21 (opcional)
router.get("/resumen-rutas", getResumenRutas);

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

// GET /api/reportes/sp/resumen-rutas/:fecha - Usar procedimiento almacenado
router.get("/sp/resumen-rutas/:fecha", getResumenRutasProcedimiento);

// GET /api/reportes/sp/metricas-dia/:fecha - Usar procedimiento almacenado
router.get("/sp/metricas-dia/:fecha", getMetricasDiaProcedimiento);

module.exports = router;

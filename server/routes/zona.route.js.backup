const express = require("express");
const router = express.Router();
const controller = require("../controllers/zona.controller");

// Rutas específicas ANTES de rutas con parámetros dinámicos
router.get("/estadisticas", controller.getZonasConEstadisticas);
router.get("/search", controller.searchZonas);
router.get("/codigo/:codigo", controller.getByCodigo);

// Rutas generales
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

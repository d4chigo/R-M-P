const express = require("express");
const router = express.Router();
const {
  getRepartidores,
  getRepartidorById,
  createRepartidor,
  updateRepartidor,
  deleteRepartidor,
  searchRepartidores,
  toggleRepartidorActivo,
} = require("../controllers/repartidor.controller");

// GET /api/repartidores - Obtener todos los repartidores
router.get("/", getRepartidores);

// GET /api/repartidores/search - Buscar repartidores
router.get("/search", searchRepartidores);

// GET /api/repartidores/:id - Obtener un repartidor por ID
router.get("/:id", getRepartidorById);

// POST /api/repartidores - Crear un nuevo repartidor
router.post("/", createRepartidor);

// PUT /api/repartidores/:id - Actualizar un repartidor
router.put("/:id", updateRepartidor);

// PUT /api/repartidores/:id/toggle - Cambiar estado activo/inactivo
router.put("/:id/toggle", toggleRepartidorActivo);

// DELETE /api/repartidores/:id - Eliminar un repartidor
router.delete("/:id", deleteRepartidor);

module.exports = router;

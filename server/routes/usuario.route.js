const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/usuarios - Obtener todos los usuarios
router.get("/", usuarioController.getUsuarios);

// GET /api/usuarios/activos - Obtener usuarios activos
router.get("/activos", usuarioController.getUsuariosActivos);

// GET /api/usuarios/estadisticas - Obtener usuarios con estadísticas
router.get("/estadisticas", usuarioController.getUsuariosConEstadisticas);

// GET /api/usuarios/search - Buscar usuarios
router.get("/search", usuarioController.searchUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get("/:id", usuarioController.getUsuarioById);

// POST /api/usuarios - Crear nuevo usuario
router.post("/", usuarioController.createUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put("/:id", usuarioController.updateUsuario);

// PUT /api/usuarios/:id/password - Cambiar contraseña de usuario
router.put("/:id/password", usuarioController.changeUsuarioPassword);

// PUT /api/usuarios/:id/toggle - Activar/Desactivar usuario
router.put("/:id/toggle", usuarioController.toggleUsuarioActivo);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete("/:id", usuarioController.deleteUsuario);

module.exports = router;

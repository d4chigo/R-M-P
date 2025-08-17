const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateToken, requireAdmin } = require("../middleware/auth.middleware");

// ============================================
// Rutas públicas (sin autenticación)
// ============================================

// Verificar si existen usuarios en el sistema
router.get("/check-users", adminController.checkUsersExist);

// ============================================
// Rutas protegidas (requieren autenticación y rol admin)
// ============================================
router.use(authenticateToken);
router.use(requireAdmin);

// Gestión de usuarios
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/reset-password", adminController.resetUserPassword);

module.exports = router;

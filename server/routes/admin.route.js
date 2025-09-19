const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const rolController = require("../controllers/rol.controller");
const userController = require("../controllers/user.controller");
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

// Gestión de roles
router.get("/roles", rolController.getRoles);

// Gestión de usuarios
router.get("/usuarios", adminController.getUsers);
router.post("/usuarios", adminController.createUser);
router.put("/usuarios/:id", adminController.updateUser);
router.delete("/usuarios/:id", adminController.deleteUser);
router.post("/usuarios/:id/reset-password", adminController.resetUserPassword);
router.patch("/usuarios/:id/toggle-active", adminController.toggleUsuarioActivo);
router.post('/usuarios/:id/reveal-password', adminController.revealUserPassword);

module.exports = router;

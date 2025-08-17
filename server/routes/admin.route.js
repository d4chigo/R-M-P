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
router.get("/users", adminController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.post("/users/:id/reset-password", userController.resetUserPassword);

module.exports = router;

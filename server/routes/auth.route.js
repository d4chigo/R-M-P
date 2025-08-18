const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { checkNoAdminExists } = require("../middleware/checkAdmin.middleware");

// Ruta para crear el primer admin
router.post("/first-admin", checkNoAdminExists, authController.createFirstAdmin);

// Ruta de login
router.post("/login", authController.login);

// Ruta de logout
router.post("/logout", authController.logout);

// Ruta para verificar token y obtener usuario actual
router.get("/me", authController.verifyToken);

// Ruta para registrar nuevo usuario (requiere autenticación)
router.post("/register", authenticateToken, authController.register);

// Ruta para obtener perfil del usuario actual (requiere autenticación)
router.get("/profile", authenticateToken, authController.getProfile);

// Ruta para actualizar perfil del usuario actual (requiere autenticación)
router.put("/profile", authenticateToken, authController.updateProfile);

// Ruta para cambiar contraseña (requiere autenticación)
router.post(
  "/change-password",
  authenticateToken,
  authController.changePassword,
);

// Ruta para solicitar restablecimiento de contraseña (público)
router.post("/forgot-password", authController.requestPasswordReset);

module.exports = router;

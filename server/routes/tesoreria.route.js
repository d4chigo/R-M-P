const express = require('express');
const router = express.Router();
const tesoreriaController = require('../controllers/tesoreria.controller');
const { authenticateToken, requireAdmin, optionalAuth, getUserRoles } = require('../middleware/auth.middleware');

// Rutas para Tesoreria
// GET admite ?scope=active|history|trash además de filtros
// GET routes are public but accept optional auth so we can show extra data to admins
router.get('/', optionalAuth, getUserRoles, tesoreriaController.getTesoreria);
router.get('/search', optionalAuth, getUserRoles, tesoreriaController.searchTesoreria);
router.get('/:id', optionalAuth, getUserRoles, tesoreriaController.getTesoreriaById);
// Crear: requiere autenticación (cualquier usuario autenticado puede crear)
router.post('/', authenticateToken, tesoreriaController.createTesoreria);
// Editar / Eliminar / Restaurar / Purgar: sólo administradores
router.put('/:id', authenticateToken, requireAdmin, tesoreriaController.updateTesoreria);
router.delete('/:id', authenticateToken, requireAdmin, tesoreriaController.deleteTesoreria);
// Restaurar desde papelera
router.post('/:id/restore', authenticateToken, requireAdmin, tesoreriaController.restoreTesoreria);
// Purgar definitivamente registros en papelera (>7 días)
router.post('/purge', authenticateToken, requireAdmin, tesoreriaController.purgeTesoreria);

// Saldo (tarjeta fija) - lectura pública, actualización sólo admin
router.get('/saldo/actual', tesoreriaController.getSaldo);
router.put('/saldo/actual', authenticateToken, requireAdmin, tesoreriaController.updateSaldo);
// Rollover diario snapshot (solo admin)
router.post('/saldo/rollover', authenticateToken, requireAdmin, tesoreriaController.rolloverSaldo);

module.exports = router;

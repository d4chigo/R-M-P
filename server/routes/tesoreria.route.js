const express = require('express');
const router = express.Router();
const tesoreriaController = require('../controllers/tesoreria.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Rutas para Tesoreria
// GET admite ?scope=active|history|trash además de filtros
router.get('/', tesoreriaController.getTesoreria);
router.get('/search', tesoreriaController.searchTesoreria);
router.get('/:id', tesoreriaController.getTesoreriaById);
// Crear: requiere autenticación (cualquier usuario autenticado puede crear)
router.post('/', authenticateToken, tesoreriaController.createTesoreria);
// Editar / Eliminar / Restaurar / Purgar: sólo administradores
router.put('/:id', authenticateToken, requireAdmin, tesoreriaController.updateTesoreria);
router.delete('/:id', authenticateToken, requireAdmin, tesoreriaController.deleteTesoreria);
// Restaurar desde papelera
router.post('/:id/restore', authenticateToken, requireAdmin, tesoreriaController.restoreTesoreria);
// Purgar definitivamente registros en papelera (>7 días)
router.post('/purge', authenticateToken, requireAdmin, tesoreriaController.purgeTesoreria);

module.exports = router;

const express = require('express');
const router = express.Router();
const tesoreriaController = require('../controllers/tesoreria.controller');

// Rutas para Tesoreria
// GET admite ?scope=active|history|trash además de filtros
router.get('/', tesoreriaController.getTesoreria);
router.get('/search', tesoreriaController.searchTesoreria);
router.get('/:id', tesoreriaController.getTesoreriaById);
router.post('/', tesoreriaController.createTesoreria);
router.put('/:id', tesoreriaController.updateTesoreria);
router.delete('/:id', tesoreriaController.deleteTesoreria);
// Restaurar desde papelera
router.post('/:id/restore', tesoreriaController.restoreTesoreria);
// Purgar definitivamente registros en papelera (>7 días)
router.post('/purge', tesoreriaController.purgeTesoreria);

module.exports = router;

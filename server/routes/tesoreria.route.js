const express = require('express');
const router = express.Router();
const tesoreriaController = require('../controllers/tesoreria.controller');

// Rutas para Tesoreria
router.get('/', tesoreriaController.getTesoreria);
router.get('/search', tesoreriaController.searchTesoreria);
router.get('/:id', tesoreriaController.getTesoreriaById);
router.post('/', tesoreriaController.createTesoreria);
router.put('/:id', tesoreriaController.updateTesoreria);
router.delete('/:id', tesoreriaController.deleteTesoreria);

module.exports = router;

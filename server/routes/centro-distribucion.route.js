const express = require('express');
const router = express.Router();
const centroDistribucionController = require('../controllers/centro-distribucion.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/checkAdmin.middleware');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas públicas (requieren autenticación)
router.get('/', centroDistribucionController.getAllCentros);
router.get('/stats', centroDistribucionController.getCentrosStats);
router.get('/search', centroDistribucionController.searchCentros);
router.get('/estado/:estado', centroDistribucionController.getCentrosByEstado);
router.get('/:id', centroDistribucionController.getCentroById);

// Rutas que requieren permisos de administrador
router.post('/', checkAdmin, centroDistribucionController.createCentro);
router.put('/:id', checkAdmin, centroDistribucionController.updateCentro);
router.delete('/:id', checkAdmin, centroDistribucionController.deleteCentro);

module.exports = router; 
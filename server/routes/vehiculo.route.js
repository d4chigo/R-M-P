const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehiculo.controller");

router.get("/", controller.getAll);
router.get("/search", controller.searchVehiculos);
router.get("/:id", controller.getById);

router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

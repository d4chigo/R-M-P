const db = require("../config/db");

// Obtener todos los vehículos
const getVehiculos = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de vehículos...");

    const [vehiculos] = await db.query(`
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      ORDER BY placa ASC
    `);

    console.log(`✅ Se encontraron ${vehiculos.length} vehículos`);

    res.json({
      success: true,
      data: vehiculos,
      count: vehiculos.length,
      message: "Vehículos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener vehículos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener vehículos",
      error: error.message,
    });
  }
};

// Obtener un vehículo por ID
const getVehiculoById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando vehículo con ID: ${id}`);

    const [vehiculo] = await db.query(
      `
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      WHERE id_vehiculo = ?
    `,
      [id],
    );

    if (vehiculo.length === 0) {
      console.log(`⚠️ Vehículo con ID ${id} no encontrado`);
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    console.log(`✅ Vehículo encontrado: ${vehiculo[0].placa}`);

    res.json({
      success: true,
      data: vehiculo[0],
      message: "Vehículo obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener vehículo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener vehículo",
      error: error.message,
    });
  }
};

// Crear un nuevo vehículo
const createVehiculo = async (req, res) => {
  try {
    const {
      placa,
      marca,
      modelo,
      anio,
      capacidad_kg,
      capacidad_cajas,
      activo = true,
    } = req.body;

    console.log("➕ Creando nuevo vehículo:", { placa, marca, modelo });

    // Validaciones básicas
    if (!placa || !marca || !modelo) {
      return res.status(400).json({
        success: false,
        message: "Placa, marca y modelo son requeridos",
      });
    }

    // Verificar que la placa no exista
    const [existingPlaca] = await db.query(
      "SELECT id_vehiculo FROM VEHICULO WHERE placa = ?",
      [placa],
    );

    if (existingPlaca.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un vehículo con esa placa",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO VEHICULO (placa, marca, modelo, anio, capacidad_kg, capacidad_cajas, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        placa,
        marca,
        modelo,
        anio || null,
        capacidad_kg || null,
        capacidad_cajas || null,
        activo,
      ],
    );

    console.log(`✅ Vehículo creado con ID: ${result.insertId}`);

    // Obtener el vehículo creado
    const [newVehiculo] = await db.query(
      `
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      WHERE id_vehiculo = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newVehiculo[0],
      message: "Vehículo creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear vehículo:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear vehículo",
      error: error.message,
    });
  }
};

// Actualizar un vehículo
const updateVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      placa,
      marca,
      modelo,
      anio,
      capacidad_kg,
      capacidad_cajas,
      activo,
    } = req.body;

    console.log(`✏️ Actualizando vehículo ID: ${id}`);

    // Verificar que el vehículo existe
    const [existing] = await db.query(
      "SELECT id_vehiculo FROM VEHICULO WHERE id_vehiculo = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    // Verificar placa única (si se está cambiando)
    if (placa) {
      const [existingPlaca] = await db.query(
        "SELECT id_vehiculo FROM VEHICULO WHERE placa = ? AND id_vehiculo != ?",
        [placa, id],
      );

      if (existingPlaca.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro vehículo con esa placa",
        });
      }
    }

    await db.query(
      `
      UPDATE VEHICULO
      SET
        placa = COALESCE(?, placa),
        marca = COALESCE(?, marca),
        modelo = COALESCE(?, modelo),
        anio = ?,
        capacidad_kg = ?,
        capacidad_cajas = ?,
        activo = COALESCE(?, activo)
      WHERE id_vehiculo = ?
    `,
      [placa, marca, modelo, anio, capacidad_kg, capacidad_cajas, activo, id],
    );

    console.log(`✅ Vehículo ${id} actualizado exitosamente`);

    // Obtener el vehículo actualizado
    const [updatedVehiculo] = await db.query(
      `
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      WHERE id_vehiculo = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedVehiculo[0],
      message: "Vehículo actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar vehículo:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar vehículo",
      error: error.message,
    });
  }
};

// Eliminar un vehículo (soft delete)
const deleteVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando vehículo ID: ${id}`);

    // Verificar que el vehículo existe
    const [existing] = await db.query(
      "SELECT id_vehiculo, placa FROM VEHICULO WHERE id_vehiculo = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    // Verificar si tiene viajes asociados
    const [viajes] = await db.query(
      "SELECT COUNT(*) as count FROM VIAJE WHERE id_vehiculo = ?",
      [id],
    );

    if (viajes[0].count > 0) {
      // Si tiene viajes, hacer soft delete
      await db.query(
        "UPDATE VEHICULO SET activo = FALSE WHERE id_vehiculo = ?",
        [id],
      );

      console.log(
        `✅ Vehículo ${existing[0].placa} desactivado (soft delete) - tiene ${viajes[0].count} viajes asociados`,
      );

      res.json({
        success: true,
        type: "deactivated",
        hasRelatedRecords: true,
        relatedCount: viajes[0].count,
        message: `El vehículo ${existing[0].placa} no puede ser eliminado porque tiene ${viajes[0].count} viaje(s) registrado(s). Ha sido desactivado para preservar el historial.`,
        details:
          "Para eliminar completamente este vehículo, primero debe eliminar todos los viajes asociados.",
      });
    } else {
      // Si no tiene viajes, eliminar completamente
      await db.query("DELETE FROM VEHICULO WHERE id_vehiculo = ?", [id]);

      console.log(`✅ Vehículo ${existing[0].placa} eliminado completamente`);

      res.json({
        success: true,
        type: "deleted",
        hasRelatedRecords: false,
        message: `Vehículo ${existing[0].placa} eliminado exitosamente`,
      });
    }
  } catch (error) {
    console.error("❌ Error al eliminar vehículo:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar vehículo",
      error: error.message,
    });
  }
};

// Buscar vehículos
const searchVehiculos = async (req, res) => {
  try {
    const { q, activo } = req.query;
    console.log(`🔍 Buscando vehículos con término: ${q}, activo: ${activo}`);

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        placa LIKE ? OR
        marca LIKE ? OR
        modelo LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (activo !== undefined) {
      whereClause += " AND activo = ?";
      params.push(activo === "true");
    }

    const [vehiculos] = await db.query(
      `
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      ${whereClause}
      ORDER BY placa ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${vehiculos.length} resultados`);

    res.json({
      success: true,
      data: vehiculos,
      count: vehiculos.length,
      message: `${vehiculos.length} vehículos encontrados`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de vehículos:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de vehículos",
      error: error.message,
    });
  }
};

// Obtener vehículos activos
const getVehiculosActivos = async (req, res) => {
  try {
    console.log("📋 Obteniendo vehículos activos...");

    const [vehiculos] = await db.query(`
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      WHERE activo = TRUE
      ORDER BY placa ASC
    `);

    console.log(`✅ Se encontraron ${vehiculos.length} vehículos activos`);

    res.json({
      success: true,
      data: vehiculos,
      count: vehiculos.length,
      message: "Vehículos activos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener vehículos activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener vehículos activos",
      error: error.message,
    });
  }
};

// Obtener vehículos con estadísticas de uso
const getVehiculosConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo vehículos con estadísticas...");

    const [vehiculos] = await db.query(`
      SELECT
        v.id_vehiculo,
        v.placa,
        v.marca,
        v.modelo,
        v.anio,
        v.capacidad_kg,
        v.capacidad_cajas,
        v.activo,
        COALESCE(stats.total_viajes, 0) as total_viajes,
        COALESCE(stats.total_distancia, 0) as total_distancia,
        COALESCE(stats.ultimo_viaje, NULL) as ultimo_viaje,
        v.created_at,
        v.updated_at
      FROM VEHICULO v
      LEFT JOIN (
        SELECT
          id_vehiculo,
          COUNT(*) as total_viajes,
          SUM(distancia_km) as total_distancia,
          MAX(fecha) as ultimo_viaje
        FROM VIAJE
        GROUP BY id_vehiculo
      ) stats ON v.id_vehiculo = stats.id_vehiculo
      ORDER BY v.placa ASC
    `);

    console.log(
      `✅ Se encontraron ${vehiculos.length} vehículos con estadísticas`,
    );

    res.json({
      success: true,
      data: vehiculos,
      count: vehiculos.length,
      message: "Vehículos con estadísticas obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener vehículos con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener vehículos con estadísticas",
      error: error.message,
    });
  }
};

// Activar/Desactivar vehículo
const toggleVehiculoActivo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Cambiando estado de vehículo ID: ${id}`);

    // Verificar que el vehículo existe
    const [existing] = await db.query(
      "SELECT id_vehiculo, placa, activo FROM VEHICULO WHERE id_vehiculo = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }

    const nuevoEstado = !existing[0].activo;

    await db.query("UPDATE VEHICULO SET activo = ? WHERE id_vehiculo = ?", [
      nuevoEstado,
      id,
    ]);

    console.log(
      `✅ Vehículo ${existing[0].placa} ${nuevoEstado ? "activado" : "desactivado"}`,
    );

    // Obtener el vehículo actualizado
    const [updatedVehiculo] = await db.query(
      `
      SELECT
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        capacidad_kg,
        capacidad_cajas,
        activo,
        created_at,
        updated_at
      FROM VEHICULO
      WHERE id_vehiculo = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedVehiculo[0],
      message: `Vehículo ${existing[0].placa} ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del vehículo:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del vehículo",
      error: error.message,
    });
  }
};

module.exports = {
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  searchVehiculos,
  getVehiculosActivos,
  getVehiculosConEstadisticas,
  toggleVehiculoActivo,
  // Aliases para compatibilidad
  getAll: getVehiculos,
  getById: getVehiculoById,
  create: createVehiculo,
  update: updateVehiculo,
  delete: deleteVehiculo,
};

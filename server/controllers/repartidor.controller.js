const db = require("../config/db");

// Función utilitaria para verificar si existe la columna estado_disponibilidad
const checkEstadoColumn = async () => {
  try {
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'REPARTIDOR'
      AND COLUMN_NAME = 'estado_disponibilidad'
    `);
    return columns.length > 0;
  } catch (error) {
    console.error("Error verificando columna estado_disponibilidad:", error);
    return false;
  }
};

// Función para limpiar datos de repartidor (remover campos internos si es necesario)
const cleanRepartidorData = (repartidores) => {
  return repartidores;
};

// Obtener todos los repartidores
const getRepartidores = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de repartidores...");

    const hasEstadoColumn = await checkEstadoColumn();
    const estadoField = hasEstadoColumn ? "estado_disponibilidad," : "";

    const [repartidores] = await db.query(`
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        ${estadoField}
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      ORDER BY nombre ASC
    `);

    console.log(`✅ Se encontraron ${repartidores.length} repartidores`);

    res.json({
      success: true,
      data: repartidores,
      count: repartidores.length,
      message: "Repartidores obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener repartidores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener repartidores",
      error: error.message,
    });
  }
};

// Obtener un repartidor por ID
const getRepartidorById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando repartidor con ID: ${id}`);

    const hasEstadoColumn = await checkEstadoColumn();
    const estadoField = hasEstadoColumn ? "estado_disponibilidad," : "";

    const [repartidor] = await db.query(
      `
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        ${estadoField}
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      WHERE id_repartidor = ?
    `,
      [id],
    );

    if (repartidor.length === 0) {
      console.log(`⚠️ Repartidor con ID ${id} no encontrado`);
      return res.status(404).json({
        success: false,
        message: "Repartidor no encontrado",
      });
    }

    console.log(`✅ Repartidor encontrado: ${repartidor[0].nombre}`);

    res.json({
      success: true,
      data: repartidor[0],
      message: "Repartidor obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener repartidor:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener repartidor",
      error: error.message,
    });
  }
};

// Crear un nuevo repartidor
const createRepartidor = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      dni,
      licencia_conducir,
      telefono,
      estado_disponibilidad = "DISPONIBLE",
      activo = true,
    } = req.body;

    console.log("➕ Creando nuevo repartidor:", { codigo, nombre });

    // Validaciones básicas
    if (!codigo || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Código y nombre son requeridos",
      });
    }

    // Verificar que el código no exista
    const [existingCodigo] = await db.query(
      "SELECT id_repartidor FROM REPARTIDOR WHERE codigo = ?",
      [codigo],
    );

    if (existingCodigo.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un repartidor con ese código",
      });
    }

    // Verificar que el DNI no exista (si se proporciona)
    if (dni) {
      const [existingDni] = await db.query(
        "SELECT id_repartidor FROM REPARTIDOR WHERE dni = ?",
        [dni],
      );

      if (existingDni.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un repartidor con ese DNI",
        });
      }
    }

    const hasEstadoColumn = await checkEstadoColumn();

    let query, params;
    if (hasEstadoColumn) {
      query = `
        INSERT INTO REPARTIDOR (codigo, nombre, dni, licencia_conducir, telefono, estado_disponibilidad, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        codigo,
        nombre,
        dni || null,
        licencia_conducir || null,
        telefono || null,
        estado_disponibilidad,
        activo,
      ];
    } else {
      query = `
        INSERT INTO REPARTIDOR (codigo, nombre, dni, licencia_conducir, telefono, activo)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      params = [
        codigo,
        nombre,
        dni || null,
        licencia_conducir || null,
        telefono || null,
        activo,
      ];
    }

    const [result] = await db.query(query, params);

    console.log(`✅ Repartidor creado con ID: ${result.insertId}`);

    // Obtener el repartidor creado
    const estadoField = hasEstadoColumn ? "estado_disponibilidad," : "";

    const [newRepartidor] = await db.query(
      `
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        ${estadoField}
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      WHERE id_repartidor = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newRepartidor[0],
      message: "Repartidor creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear repartidor:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear repartidor",
      error: error.message,
    });
  }
};

// Actualizar un repartidor
const updateRepartidor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      dni,
      licencia_conducir,
      telefono,
      estado_disponibilidad,
      activo,
    } = req.body;

    console.log(`✏️ Actualizando repartidor ID: ${id}`);

    // Verificar que el repartidor existe
    const [existing] = await db.query(
      "SELECT id_repartidor FROM REPARTIDOR WHERE id_repartidor = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Repartidor no encontrado",
      });
    }

    // Verificar código único (si se está cambiando)
    if (codigo) {
      const [existingCodigo] = await db.query(
        "SELECT id_repartidor FROM REPARTIDOR WHERE codigo = ? AND id_repartidor != ?",
        [codigo, id],
      );

      if (existingCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro repartidor con ese código",
        });
      }
    }

    // Verificar DNI único (si se está cambiando)
    if (dni) {
      const [existingDni] = await db.query(
        "SELECT id_repartidor FROM REPARTIDOR WHERE dni = ? AND id_repartidor != ?",
        [dni, id],
      );

      if (existingDni.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro repartidor con ese DNI",
        });
      }
    }

    const hasEstadoColumn = await checkEstadoColumn();

    let query, params;
    if (hasEstadoColumn) {
      query = `
        UPDATE REPARTIDOR
        SET
          codigo = COALESCE(?, codigo),
          nombre = COALESCE(?, nombre),
          dni = ?,
          licencia_conducir = ?,
          telefono = ?,
          estado_disponibilidad = COALESCE(?, estado_disponibilidad),
          activo = COALESCE(?, activo),
          updated_at = CURRENT_TIMESTAMP
        WHERE id_repartidor = ?
      `;
      params = [
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        estado_disponibilidad,
        activo,
        id,
      ];
    } else {
      query = `
        UPDATE REPARTIDOR
        SET
          codigo = COALESCE(?, codigo),
          nombre = COALESCE(?, nombre),
          dni = ?,
          licencia_conducir = ?,
          telefono = ?,
          activo = COALESCE(?, activo),
          updated_at = CURRENT_TIMESTAMP
        WHERE id_repartidor = ?
      `;
      params = [codigo, nombre, dni, licencia_conducir, telefono, activo, id];
    }

    await db.query(query, params);

    console.log(`✅ Repartidor ${id} actualizado exitosamente`);

    // Obtener el repartidor actualizado
    const estadoField = hasEstadoColumn ? "estado_disponibilidad," : "";

    const [updatedRepartidor] = await db.query(
      `
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        ${estadoField}
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      WHERE id_repartidor = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedRepartidor[0],
      message: "Repartidor actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar repartidor:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar repartidor",
      error: error.message,
    });
  }
};

// Eliminar un repartidor (soft delete)
const deleteRepartidor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando repartidor ID: ${id}`);

    // Verificar que el repartidor existe
    const [existing] = await db.query(
      "SELECT id_repartidor, nombre FROM REPARTIDOR WHERE id_repartidor = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Repartidor no encontrado",
      });
    }

    // Verificar si tiene viajes asociados
    const [viajes] = await db.query(
      "SELECT COUNT(*) as count FROM VIAJE WHERE id_repartidor = ?",
      [id],
    );

    if (viajes[0].count > 0) {
      const hasEstadoColumn = await checkEstadoColumn();

      // Si tiene viajes, hacer soft delete
      if (hasEstadoColumn) {
        await db.query(
          "UPDATE REPARTIDOR SET activo = FALSE, estado_disponibilidad = 'NO_DISPONIBLE', updated_at = CURRENT_TIMESTAMP WHERE id_repartidor = ?",
          [id],
        );
      } else {
        await db.query(
          "UPDATE REPARTIDOR SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id_repartidor = ?",
          [id],
        );
      }

      console.log(
        `✅ Repartidor ${existing[0].nombre} desactivado (soft delete)`,
      );

      res.json({
        success: true,
        message: `El repartidor ${existing[0].nombre} tiene viajes registrados en el sistema, por lo que ha sido desactivado en lugar de eliminado. Esto preserva la integridad de los datos históricos.`,
        type: "soft_delete",
      });
    } else {
      // Si no tiene viajes, eliminar completamente
      await db.query("DELETE FROM REPARTIDOR WHERE id_repartidor = ?", [id]);

      console.log(
        `✅ Repartidor ${existing[0].nombre} eliminado completamente`,
      );

      res.json({
        success: true,
        message: `Repartidor ${existing[0].nombre} eliminado exitosamente`,
        type: "hard_delete",
      });
    }
  } catch (error) {
    console.error("❌ Error al eliminar repartidor:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar repartidor",
      error: error.message,
    });
  }
};

// Buscar repartidores
const searchRepartidores = async (req, res) => {
  try {
    const { q, activo } = req.query;
    console.log(
      `🔍 Buscando repartidores con término: ${q}, activo: ${activo}`,
    );

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        codigo LIKE ? OR
        nombre LIKE ? OR
        dni LIKE ? OR
        licencia_conducir LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (activo !== undefined) {
      whereClause += " AND activo = ?";
      params.push(activo === "true");
    }

    const [repartidores] = await db.query(
      `
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      ${whereClause}
      ORDER BY nombre ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${repartidores.length} resultados`);

    res.json({
      success: true,
      data: repartidores,
      count: repartidores.length,
      message: `${repartidores.length} repartidores encontrados`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de repartidores:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de repartidores",
      error: error.message,
    });
  }
};

// Obtener repartidores activos
const getRepartidoresActivos = async (req, res) => {
  try {
    console.log("📋 Obteniendo repartidores activos...");

    const [repartidores] = await db.query(`
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      WHERE activo = TRUE
      ORDER BY nombre ASC
    `);

    console.log(
      `✅ Se encontraron ${repartidores.length} repartidores activos`,
    );

    res.json({
      success: true,
      data: repartidores,
      count: repartidores.length,
      message: "Repartidores activos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener repartidores activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener repartidores activos",
      error: error.message,
    });
  }
};

// Obtener repartidores con estadísticas de viajes
const getRepartidoresConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo repartidores con estadísticas...");

    const [repartidores] = await db.query(`
      SELECT
        r.id_repartidor,
        r.codigo,
        r.nombre,
        r.dni,
        r.licencia_conducir,
        r.telefono,
        r.activo,
        COALESCE(stats.total_viajes, 0) as total_viajes,
        COALESCE(stats.total_distancia, 0) as total_distancia,
        COALESCE(stats.ultimo_viaje, NULL) as ultimo_viaje,
        r.created_at,
        r.updated_at
      FROM REPARTIDOR r
      LEFT JOIN (
        SELECT
          id_repartidor,
          COUNT(*) as total_viajes,
          SUM(distancia_km) as total_distancia,
          MAX(fecha) as ultimo_viaje
        FROM VIAJE
        GROUP BY id_repartidor
      ) stats ON r.id_repartidor = stats.id_repartidor
      ORDER BY r.nombre ASC
    `);

    console.log(
      `✅ Se encontraron ${repartidores.length} repartidores con estadísticas`,
    );

    res.json({
      success: true,
      data: repartidores,
      count: repartidores.length,
      message: "Repartidores con estadísticas obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener repartidores con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener repartidores con estadísticas",
      error: error.message,
    });
  }
};

// Activar/Desactivar repartidor
const toggleRepartidorActivo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Cambiando estado de repartidor ID: ${id}`);

    // Verificar que el repartidor existe
    const [existing] = await db.query(
      "SELECT id_repartidor, nombre, activo FROM REPARTIDOR WHERE id_repartidor = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Repartidor no encontrado",
      });
    }

    const nuevoEstado = !existing[0].activo;

    // Si se está desactivando, cambiar estado a NO_DISPONIBLE
    // Si se está activando, cambiar estado a DISPONIBLE
    const nuevoEstadoDisponibilidad = nuevoEstado
      ? "DISPONIBLE"
      : "NO_DISPONIBLE";

    const hasEstadoColumn = await checkEstadoColumn();

    if (hasEstadoColumn) {
      await db.query(
        "UPDATE REPARTIDOR SET activo = ?, estado_disponibilidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id_repartidor = ?",
        [nuevoEstado, nuevoEstadoDisponibilidad, id],
      );
    } else {
      await db.query(
        "UPDATE REPARTIDOR SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id_repartidor = ?",
        [nuevoEstado, id],
      );
    }

    console.log(
      `✅ Repartidor ${existing[0].nombre} ${nuevoEstado ? "activado" : "desactivado"}`,
    );

    // Obtener el repartidor actualizado
    const [updatedRepartidor] = await db.query(
      `
      SELECT
        id_repartidor,
        codigo,
        nombre,
        dni,
        licencia_conducir,
        telefono,
        activo,
        created_at,
        updated_at
      FROM REPARTIDOR
      WHERE id_repartidor = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedRepartidor[0],
      message: `Repartidor ${existing[0].nombre} ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del repartidor:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del repartidor",
      error: error.message,
    });
  }
};

module.exports = {
  getRepartidores,
  getRepartidorById,
  createRepartidor,
  updateRepartidor,
  deleteRepartidor,
  searchRepartidores,
  getRepartidoresActivos,
  getRepartidoresConEstadisticas,
  toggleRepartidorActivo,
  // Aliases para compatibilidad
  getAll: getRepartidores,
  getById: getRepartidorById,
  create: createRepartidor,
  update: updateRepartidor,
  delete: deleteRepartidor,
};

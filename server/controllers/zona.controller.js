const db = require("../config/db");

// Obtener todas las zonas
const getZonas = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de zonas...");

    const [zonas] = await db.query(`
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      ORDER BY codigo ASC
    `);

    console.log(`✅ Se encontraron ${zonas.length} zonas`);

    res.json({
      success: true,
      data: zonas,
      count: zonas.length,
      message: "Zonas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener zonas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener zonas",
      error: error.message,
    });
  }
};

// Obtener una zona por código
const getZonaByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log(`🔍 Buscando zona con código: ${codigo}`);

    const [zona] = await db.query(
      `
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      WHERE codigo = ?
    `,
      [codigo],
    );

    if (zona.length === 0) {
      console.log(`⚠️ Zona con código ${codigo} no encontrada`);
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada",
      });
    }

    console.log(`✅ Zona encontrada: ${zona[0].nombre}`);

    res.json({
      success: true,
      data: zona[0],
      message: "Zona obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener zona",
      error: error.message,
    });
  }
};

// Obtener una zona por ID
const getZonaById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando zona con ID: ${id}`);

    const [zona] = await db.query(
      `
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      WHERE id_zona = ?
    `,
      [id],
    );

    if (zona.length === 0) {
      console.log(`⚠️ Zona con ID ${id} no encontrada`);
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada",
      });
    }

    console.log(`✅ Zona encontrada: ${zona[0].nombre}`);

    res.json({
      success: true,
      data: zona[0],
      message: "Zona obtenida exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener zona",
      error: error.message,
    });
  }
};

// Crear una nueva zona
const createZona = async (req, res) => {
  try {
    const { codigo, descripcion, latitud, longitud } = req.body;

    console.log("➕ Creando nueva zona:", { codigo, descripcion, latitud, longitud });

    // Validaciones básicas
    if (!codigo || !descripcion) {
      return res.status(400).json({
        success: false,
        message: "Código y descripción son requeridos",
      });
    }

    // Validar coordenadas si se proporcionan
    if (latitud !== undefined && (latitud < -90 || latitud > 90)) {
      return res.status(400).json({
        success: false,
        message: "La latitud debe estar entre -90 y 90 grados",
      });
    }

    if (longitud !== undefined && (longitud < -180 || longitud > 180)) {
      return res.status(400).json({
        success: false,
        message: "La longitud debe estar entre -180 y 180 grados",
      });
    }

    // Verificar que el código no exista
    const [existingCodigo] = await db.query(
      "SELECT id_zona FROM ZONA WHERE codigo = ?",
      [codigo],
    );

    if (existingCodigo.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una zona con ese código",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO ZONA (codigo, descripcion, latitud, longitud)
      VALUES (?, ?, ?, ?)
    `,
      [codigo, descripcion, latitud || null, longitud || null],
    );

    console.log(`✅ Zona creada con ID: ${result.insertId}`);

    // Obtener la zona creada
    const [newZona] = await db.query(
      `
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      WHERE id_zona = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newZona[0],
      message: "Zona creada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear zona",
      error: error.message,
    });
  }
};

// Actualizar una zona
const updateZona = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, descripcion, latitud, longitud } = req.body;

    console.log(`✏️ Actualizando zona ID: ${id}`, { codigo, descripcion, latitud, longitud });

    // Verificar que la zona existe
    const [existing] = await db.query(
      "SELECT id_zona FROM ZONA WHERE id_zona = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada",
      });
    }

    // Verificar código único (si se está cambiando)
    if (codigo) {
      const [existingCodigo] = await db.query(
        "SELECT id_zona FROM ZONA WHERE codigo = ? AND id_zona != ?",
        [codigo, id],
      );

      if (existingCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otra zona con ese código",
        });
      }
    }

    // Validar coordenadas si se proporcionan
    if (latitud !== undefined && latitud !== null && (latitud < -90 || latitud > 90)) {
      return res.status(400).json({
        success: false,
        message: "La latitud debe estar entre -90 y 90 grados",
      });
    }

    if (longitud !== undefined && longitud !== null && (longitud < -180 || longitud > 180)) {
      return res.status(400).json({
        success: false,
        message: "La longitud debe estar entre -180 y 180 grados",
      });
    }

    await db.query(
      `
      UPDATE ZONA
      SET
        codigo = COALESCE(?, codigo),
        descripcion = COALESCE(?, descripcion),
        latitud = CASE WHEN ? IS NULL THEN latitud ELSE ? END,
        longitud = CASE WHEN ? IS NULL THEN longitud ELSE ? END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_zona = ?
    `,
      [codigo, descripcion, latitud, latitud, longitud, longitud, id],
    );

    console.log(`✅ Zona ${id} actualizada exitosamente`);

    // Obtener la zona actualizada
    const [updatedZona] = await db.query(
      `
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      WHERE id_zona = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedZona[0],
      message: "Zona actualizada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar zona",
      error: error.message,
    });
  }
};

// Eliminar una zona
const deleteZona = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando zona ID: ${id}`);

    // Verificar que la zona existe
    const [existing] = await db.query(
      "SELECT id_zona, descripcion FROM ZONA WHERE id_zona = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Zona no encontrada",
      });
    }



    await db.query("DELETE FROM ZONA WHERE id_zona = ?", [id]);

    console.log(`✅ Zona ${existing[0].descripcion} eliminada exitosamente`);

    res.json({
      success: true,
      message: `Zona eliminada exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al eliminar zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar zona",
      error: error.message,
    });
  }
};

// Buscar zonas
const searchZonas = async (req, res) => {
  try {
    const { q } = req.query;
    console.log(`🔍 Buscando zonas con término: ${q}`);

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        codigo LIKE ? OR
        descripcion LIKE ?
      )`;
      params.push(searchTerm, searchTerm);
    }

    const [zonas] = await db.query(
      `
      SELECT
        id_zona,
        codigo,
        descripcion,
        latitud,
        longitud,
        created_at,
        updated_at
      FROM ZONA
      ${whereClause}
      ORDER BY codigo ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${zonas.length} resultados`);

    res.json({
      success: true,
      data: zonas,
      count: zonas.length,
      message: `${zonas.length} zonas encontradas`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de zonas:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de zonas",
      error: error.message,
    });
  }
};

// Obtener zonas con estadísticas
const getZonasConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo zonas con estadísticas...");

    const [zonas] = await db.query(`
      SELECT
        z.id_zona,
        z.codigo,
        z.descripcion,
        z.latitud,
        z.longitud,
        0 as total_clientes,
        0 as clientes_activos,
        z.created_at,
        z.updated_at
      FROM ZONA z
      ORDER BY z.codigo ASC
    `);

    console.log(`✅ Se encontraron ${zonas.length} zonas con estadísticas`);

    res.json({
      success: true,
      data: zonas,
      count: zonas.length,
      message: "Zonas con estadísticas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener zonas con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener zonas con estadísticas",
      error: error.message,
    });
  }
};

module.exports = {
  getZonas,
  getZonaById,
  getZonaByCodigo,
  createZona,
  updateZona,
  deleteZona,
  searchZonas,
  getZonasConEstadisticas,
  // Aliases para compatibilidad
  getAll: getZonas,
  getById: getZonaById,
  getByCodigo: getZonaByCodigo,
  create: createZona,
  update: updateZona,
  delete: deleteZona,
};

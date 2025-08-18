const db = require("../config/db");

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    console.log("📋 Obteniendo lista de clientes...");

    const [clientes] = await db.query(`
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      ORDER BY c.nombre ASC
    `);

    console.log(`✅ Se encontraron ${clientes.length} clientes`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: "Clientes obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

// Obtener un cliente por ID
const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando cliente con ID: ${id}`);

    const [cliente] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.id_cliente = ?
    `,
      [id],
    );

    if (cliente.length === 0) {
      console.log(`⚠️ Cliente con ID ${id} no encontrado`);
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    console.log(`✅ Cliente encontrado: ${cliente[0].nombre}`);

    res.json({
      success: true,
      data: cliente[0],
      message: "Cliente obtenido exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener cliente",
      error: error.message,
    });
  }
};

// Crear un nuevo cliente
const createCliente = async (req, res) => {
  try {
    const { codigo, nombre, direccion, id_zona, activo = true } = req.body;

    console.log("➕ Creando nuevo cliente:", { codigo, nombre });

    // Validaciones básicas
    if (!codigo || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Código y nombre son requeridos",
      });
    }

    // Verificar que el código no exista
    const [existingCodigo] = await db.query(
      "SELECT id_cliente FROM CLIENTE WHERE codigo = ?",
      [codigo],
    );

    if (existingCodigo.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un cliente con ese código",
      });
    }

    // Verificar que la zona existe (si se proporciona)
    if (id_zona) {
      const [zona] = await db.query(
        "SELECT id_zona FROM ZONA WHERE id_zona = ?",
        [id_zona],
      );

      if (zona.length === 0) {
        return res.status(400).json({
          success: false,
          message: "La zona especificada no existe",
        });
      }
    }

    const [result] = await db.query(
      `
      INSERT INTO CLIENTE (codigo, nombre, direccion, id_zona, activo)
      VALUES (?, ?, ?, ?, ?)
    `,
      [codigo, nombre, direccion || null, id_zona || null, activo],
    );

    console.log(`✅ Cliente creado con ID: ${result.insertId}`);

    // Obtener el cliente creado con información de zona
    const [newCliente] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.id_cliente = ?
    `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: newCliente[0],
      message: "Cliente creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear cliente",
      error: error.message,
    });
  }
};

// Actualizar un cliente
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, direccion, id_zona, activo } = req.body;

    console.log(`✏️ Actualizando cliente ID: ${id}`, {
      codigo,
      nombre,
      direccion,
      id_zona,
      activo,
    });

    // Verificar que el cliente existe
    const [existing] = await db.query(
      "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    // Verificar código único (si se está cambiando)
    if (codigo) {
      const [existingCodigo] = await db.query(
        "SELECT id_cliente FROM CLIENTE WHERE codigo = ? AND id_cliente != ?",
        [codigo, id],
      );

      if (existingCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otro cliente con ese código",
        });
      }
    }

    // Verificar que la zona existe (si se proporciona)
    if (id_zona) {
      const [zona] = await db.query(
        "SELECT id_zona FROM ZONA WHERE id_zona = ?",
        [id_zona],
      );

      if (zona.length === 0) {
        return res.status(400).json({
          success: false,
          message: "La zona especificada no existe",
        });
      }
    }

    // Construir la consulta dinámicamente para solo actualizar campos enviados
    const fieldsToUpdate = [];
    const values = [];

    if (codigo !== undefined) {
      fieldsToUpdate.push("codigo = ?");
      values.push(codigo);
    }

    if (nombre !== undefined) {
      fieldsToUpdate.push("nombre = ?");
      values.push(nombre);
    }

    if (direccion !== undefined) {
      fieldsToUpdate.push("direccion = ?");
      values.push(direccion);
    }

    if (id_zona !== undefined) {
      fieldsToUpdate.push("id_zona = ?");
      values.push(id_zona);
    }

    if (activo !== undefined) {
      fieldsToUpdate.push("activo = ?");
      values.push(activo);
    }

    // Siempre actualizar updated_at
    fieldsToUpdate.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    if (fieldsToUpdate.length === 1) {
      // Solo updated_at
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron campos para actualizar",
      });
    }

    const updateQuery = `UPDATE CLIENTE SET ${fieldsToUpdate.join(", ")} WHERE id_cliente = ?`;
    console.log("📝 Query de actualización:", updateQuery);
    console.log("📝 Valores:", values);

    await db.query(updateQuery, values);

    console.log(`✅ Cliente ${id} actualizado exitosamente`);

    // Obtener el cliente actualizado
    const [updatedCliente] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.id_cliente = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedCliente[0],
      message: "Cliente actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar cliente",
      error: error.message,
    });
  }
};

// Eliminar un cliente (soft delete)
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando cliente ID: ${id}`);

    // Verificar que el cliente existe
    const [existing] = await db.query(
      "SELECT id_cliente, nombre FROM CLIENTE WHERE id_cliente = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    // Verificar si tiene visitas asociadas
    const [visitas] = await db.query(
      "SELECT COUNT(*) as count FROM VISITA WHERE id_cliente = ?",
      [id],
    );

    if (visitas[0].count > 0) {
      // Si tiene visitas, hacer soft delete
      await db.query(
        "UPDATE CLIENTE SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id_cliente = ?",
        [id],
      );

      console.log(`✅ Cliente ${existing[0].nombre} desactivado (soft delete)`);

      res.json({
        success: true,
        message: `Cliente ${existing[0].nombre} desactivado exitosamente`,
      });
    } else {
      // Si no tiene visitas, eliminar completamente
      await db.query("DELETE FROM CLIENTE WHERE id_cliente = ?", [id]);

      console.log(`✅ Cliente ${existing[0].nombre} eliminado completamente`);

      res.json({
        success: true,
        message: `Cliente ${existing[0].nombre} eliminado exitosamente`,
      });
    }
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar cliente",
      error: error.message,
    });
  }
};

// Buscar clientes
const searchClientes = async (req, res) => {
  try {
    const { q, activo } = req.query;
    console.log(`🔍 Buscando clientes con término: ${q}, activo: ${activo}`);

    let whereClause = "WHERE 1=1";
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClause += ` AND (
        c.codigo LIKE ? OR
        c.nombre LIKE ? OR
        c.direccion LIKE ? OR
        z.descripcion LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (activo !== undefined) {
      whereClause += " AND c.activo = ?";
      params.push(activo === "true");
    }

    const [clientes] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      ${whereClause}
      ORDER BY c.nombre ASC
    `,
      params,
    );

    console.log(`✅ Búsqueda completada: ${clientes.length} resultados`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: `${clientes.length} clientes encontrados`,
    });
  } catch (error) {
    console.error("❌ Error en búsqueda de clientes:", error);
    res.status(500).json({
      success: false,
      message: "Error en búsqueda de clientes",
      error: error.message,
    });
  }
};

// Obtener clientes activos
const getClientesActivos = async (req, res) => {
  try {
    console.log("📋 Obteniendo clientes activos...");

    const [clientes] = await db.query(`
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.activo = TRUE
      ORDER BY c.nombre ASC
    `);

    console.log(`✅ Se encontraron ${clientes.length} clientes activos`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: "Clientes activos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes activos",
      error: error.message,
    });
  }
};

// Obtener clientes por zona
const getClientesByZona = async (req, res) => {
  try {
    const { id_zona } = req.params;
    console.log(`🔍 Obteniendo clientes de zona ID: ${id_zona}`);

    const [clientes] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.id_zona = ?
      ORDER BY c.nombre ASC
    `,
      [id_zona],
    );

    console.log(`✅ Se encontraron ${clientes.length} clientes en la zona`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: `${clientes.length} clientes encontrados en la zona`,
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes por zona:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes por zona",
      error: error.message,
    });
  }
};

// Obtener clientes con estadísticas de visitas
const getClientesConEstadisticas = async (req, res) => {
  try {
    console.log("📊 Obteniendo clientes con estadísticas...");

    const [clientes] = await db.query(`
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        COALESCE(stats.total_visitas, 0) as total_visitas,
        COALESCE(stats.total_pedidos, 0) as total_pedidos,
        COALESCE(stats.ultima_visita, NULL) as ultima_visita,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      LEFT JOIN (
        SELECT
          id_cliente,
          COUNT(*) as total_visitas,
          SUM(pedidos) as total_pedidos,
          MAX(v.created_at) as ultima_visita
        FROM VISITA v
        JOIN VIAJE vj ON v.id_viaje = vj.id_viaje
        GROUP BY id_cliente
      ) stats ON c.id_cliente = stats.id_cliente
      ORDER BY c.nombre ASC
    `);

    console.log(
      `✅ Se encontraron ${clientes.length} clientes con estadísticas`,
    );

    res.json({
      success: true,
      data: clientes,
      count: clientes.length,
      message: "Clientes con estadísticas obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al obtener clientes con estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes con estadísticas",
      error: error.message,
    });
  }
};

// Activar/Desactivar cliente
const toggleClienteActivo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Cambiando estado de cliente ID: ${id}`);

    // Verificar que el cliente existe
    const [existing] = await db.query(
      "SELECT id_cliente, nombre, activo FROM CLIENTE WHERE id_cliente = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    const nuevoEstado = !existing[0].activo;

    await db.query(
      "UPDATE CLIENTE SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id_cliente = ?",
      [nuevoEstado, id],
    );

    console.log(
      `✅ Cliente ${existing[0].nombre} ${nuevoEstado ? "activado" : "desactivado"}`,
    );

    // Obtener el cliente actualizado
    const [updatedCliente] = await db.query(
      `
      SELECT
        c.id_cliente,
        c.codigo,
        c.nombre,
        c.direccion,
        c.id_zona,
        z.descripcion as zona_nombre,
        z.codigo as zona_codigo,
        c.activo,
        c.created_at,
        c.updated_at
      FROM CLIENTE c
      LEFT JOIN ZONA z ON c.id_zona = z.id_zona
      WHERE c.id_cliente = ?
    `,
      [id],
    );

    res.json({
      success: true,
      data: updatedCliente[0],
      message: `Cliente ${existing[0].nombre} ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado del cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar estado del cliente",
      error: error.message,
    });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  searchClientes,
  getClientesActivos,
  getClientesByZona,
  getClientesConEstadisticas,
  toggleClienteActivo,
  // Aliases para compatibilidad
  getAll: getClientes,
  getById: getClienteById,
  create: createCliente,
  update: updateCliente,
  delete: deleteCliente,
};

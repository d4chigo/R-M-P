const db = require('../config/db');

// Obtener todos los centros de distribución
const getAllCentros = async (req, res) => {
    try {
        const query = `
            SELECT 
                id_centro,
                codigo,
                nombre,
                descripcion,
                direccion,
                ciudad,
                estado,
                capacidad_almacen,
                personal_asignado,
                telefono,
                email,
                latitud,
                longitud,
                created_at,
                updated_at
            FROM CENTRO_DISTRIBUCION 
            ORDER BY nombre ASC
        `;
        
        const [centros] = await db.execute(query);
        
        res.json({
            success: true,
            data: centros,
            message: 'Centros de distribución obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener centros de distribución:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener un centro de distribución por ID
const getCentroById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                id_centro,
                codigo,
                nombre,
                descripcion,
                direccion,
                ciudad,
                estado,
                capacidad_almacen,
                personal_asignado,
                telefono,
                email,
                latitud,
                longitud,
                created_at,
                updated_at
            FROM CENTRO_DISTRIBUCION 
            WHERE id_centro = ?
        `;
        
        const [centros] = await db.execute(query, [id]);
        
        if (centros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Centro de distribución no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: centros[0],
            message: 'Centro de distribución obtenido exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener centro de distribución:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Crear un nuevo centro de distribución
const createCentro = async (req, res) => {
    try {
        const {
            codigo,
            nombre,
            descripcion,
            direccion,
            ciudad,
            estado,
            capacidad_almacen,
            personal_asignado,
            telefono,
            email,
            latitud,
            longitud
        } = req.body;

        // Validaciones básicas
        if (!codigo || !nombre || !direccion || !ciudad) {
            return res.status(400).json({
                success: false,
                message: 'Los campos código, nombre, dirección y ciudad son obligatorios'
            });
        }

        // Verificar si el código ya existe
        const checkQuery = 'SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE codigo = ?';
        const [existingCentros] = await db.execute(checkQuery, [codigo]);
        
        if (existingCentros.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un centro de distribución con ese código'
            });
        }

        // Insertar nuevo centro
        const insertQuery = `
            INSERT INTO CENTRO_DISTRIBUCION (
                codigo, nombre, descripcion, direccion, ciudad, estado,
                capacidad_almacen, personal_asignado, telefono, email,
                latitud, longitud
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [
            codigo,
            nombre,
            descripcion || null,
            direccion,
            ciudad,
            estado || 'activo',
            capacidad_almacen || null,
            personal_asignado || null,
            telefono || null,
            email || null,
            latitud || null,
            longitud || null
        ]);

        // Obtener el centro creado
        const [newCentro] = await db.execute(
            'SELECT * FROM CENTRO_DISTRIBUCION WHERE id_centro = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: newCentro[0],
            message: 'Centro de distribución creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear centro de distribución:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar un centro de distribución
const updateCentro = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            codigo,
            nombre,
            descripcion,
            direccion,
            ciudad,
            estado,
            capacidad_almacen,
            personal_asignado,
            telefono,
            email,
            latitud,
            longitud
        } = req.body;

        // Validaciones básicas
        if (!codigo || !nombre || !direccion || !ciudad) {
            return res.status(400).json({
                success: false,
                message: 'Los campos código, nombre, dirección y ciudad son obligatorios'
            });
        }

        // Verificar si el centro existe
        const checkQuery = 'SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE id_centro = ?';
        const [existingCentros] = await db.execute(checkQuery, [id]);
        
        if (existingCentros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Centro de distribución no encontrado'
            });
        }

        // Verificar si el código ya existe en otro centro
        const checkCodigoQuery = 'SELECT id_centro FROM CENTRO_DISTRIBUCION WHERE codigo = ? AND id_centro != ?';
        const [codigoExists] = await db.execute(checkCodigoQuery, [codigo, id]);
        
        if (codigoExists.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe otro centro de distribución con ese código'
            });
        }

        // Actualizar centro
        const updateQuery = `
            UPDATE CENTRO_DISTRIBUCION SET
                codigo = ?,
                nombre = ?,
                descripcion = ?,
                direccion = ?,
                ciudad = ?,
                estado = ?,
                capacidad_almacen = ?,
                personal_asignado = ?,
                telefono = ?,
                email = ?,
                latitud = ?,
                longitud = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_centro = ?
        `;
        
        await db.execute(updateQuery, [
            codigo,
            nombre,
            descripcion || null,
            direccion,
            ciudad,
            estado || 'activo',
            capacidad_almacen || null,
            personal_asignado || null,
            telefono || null,
            email || null,
            latitud || null,
            longitud || null,
            id
        ]);

        // Obtener el centro actualizado
        const [updatedCentro] = await db.execute(
            'SELECT * FROM CENTRO_DISTRIBUCION WHERE id_centro = ?',
            [id]
        );

        res.json({
            success: true,
            data: updatedCentro[0],
            message: 'Centro de distribución actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar centro de distribución:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar un centro de distribución
const deleteCentro = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el centro existe
        const checkQuery = 'SELECT id_centro, codigo FROM CENTRO_DISTRIBUCION WHERE id_centro = ?';
        const [existingCentros] = await db.execute(checkQuery, [id]);
        
        if (existingCentros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Centro de distribución no encontrado'
            });
        }

        // Eliminar centro
        const deleteQuery = 'DELETE FROM CENTRO_DISTRIBUCION WHERE id_centro = ?';
        await db.execute(deleteQuery, [id]);

        res.json({
            success: true,
            message: `Centro de distribución ${existingCentros[0].codigo} eliminado exitosamente`
        });
    } catch (error) {
        console.error('Error al eliminar centro de distribución:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Buscar centros de distribución
const searchCentros = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El término de búsqueda es requerido'
            });
        }

        const searchTerm = `%${q.trim()}%`;
        
        const query = `
            SELECT 
                id_centro,
                codigo,
                nombre,
                descripcion,
                direccion,
                ciudad,
                estado,
                capacidad_almacen,
                personal_asignado,
                telefono,
                email,
                latitud,
                longitud,
                created_at,
                updated_at
            FROM CENTRO_DISTRIBUCION 
            WHERE 
                codigo LIKE ? OR
                nombre LIKE ? OR
                descripcion LIKE ? OR
                direccion LIKE ? OR
                ciudad LIKE ?
            ORDER BY nombre ASC
        `;
        
        const [centros] = await db.execute(query, [
            searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
        ]);
        
        res.json({
            success: true,
            data: centros,
            message: `Se encontraron ${centros.length} centros de distribución`
        });
    } catch (error) {
        console.error('Error en búsqueda de centros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener centros por estado
const getCentrosByEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        
        const validEstados = ['activo', 'inactivo', 'mantenimiento'];
        if (!validEstados.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido. Debe ser: activo, inactivo o mantenimiento'
            });
        }

        const query = `
            SELECT 
                id_centro,
                codigo,
                nombre,
                descripcion,
                direccion,
                ciudad,
                estado,
                capacidad_almacen,
                personal_asignado,
                telefono,
                email,
                latitud,
                longitud,
                created_at,
                updated_at
            FROM CENTRO_DISTRIBUCION 
            WHERE estado = ?
            ORDER BY nombre ASC
        `;
        
        const [centros] = await db.execute(query, [estado]);
        
        res.json({
            success: true,
            data: centros,
            message: `Se encontraron ${centros.length} centros de distribución con estado ${estado}`
        });
    } catch (error) {
        console.error('Error al obtener centros por estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener estadísticas de centros
const getCentrosStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_centros,
                COUNT(CASE WHEN estado = 'activo' THEN 1 END) as centros_activos,
                COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as centros_inactivos,
                COUNT(CASE WHEN estado = 'mantenimiento' THEN 1 END) as centros_mantenimiento,
                COUNT(CASE WHEN latitud IS NOT NULL AND longitud IS NOT NULL THEN 1 END) as centros_con_coordenadas,
                COALESCE(SUM(capacidad_almacen), 0) as capacidad_total,
                COALESCE(SUM(personal_asignado), 0) as personal_total
            FROM CENTRO_DISTRIBUCION
        `;
        
        const [stats] = await db.execute(statsQuery);
        
        res.json({
            success: true,
            data: stats[0],
            message: 'Estadísticas obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    getAllCentros,
    getCentroById,
    createCentro,
    updateCentro,
    deleteCentro,
    searchCentros,
    getCentrosByEstado,
    getCentrosStats
}; 
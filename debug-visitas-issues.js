#!/usr/bin/env node

/**
 * Script de debug para problemas específicos del módulo de visitas
 * Simula las operaciones CRUD y verifica los errores reportados
 */

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'rmp_db',
  port: process.env.DB_PORT || 3306
};

async function debugVisitasIssues() {
  let connection;

  try {
    console.log('🔍 DEBUG: Problemas reportados en módulo de visitas\n');

    // Conectar a la base de datos
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión a MySQL establecida\n');

    // === PROBLEMA 1: No se pueden agregar registros nuevos ===
    console.log('🐛 PROBLEMA 1: Verificando creación de nuevos registros...\n');

    // Verificar que existen viajes y clientes para referenciar
    const [viajesCount] = await connection.execute('SELECT COUNT(*) as total FROM VIAJE');
    const [clientesCount] = await connection.execute('SELECT COUNT(*) as total FROM CLIENTE');

    console.log(`📊 Datos disponibles para referencias:`);
    console.log(`   - Viajes: ${viajesCount[0].total}`);
    console.log(`   - Clientes: ${clientesCount[0].total}\n`);

    if (viajesCount[0].total === 0 || clientesCount[0].total === 0) {
      console.log('❌ ERROR: No hay viajes o clientes para referenciar');
      console.log('💡 SOLUCIÓN: Crear primero viajes y clientes\n');
    } else {
      // Obtener IDs válidos para prueba
      const [viajesSample] = await connection.execute('SELECT id_viaje FROM VIAJE LIMIT 1');
      const [clientesSample] = await connection.execute('SELECT id_cliente FROM CLIENTE LIMIT 1');

      if (viajesSample.length > 0 && clientesSample.length > 0) {
        const testVisita = {
          id_viaje: viajesSample[0].id_viaje,
          id_cliente: clientesSample[0].id_cliente,
          pedidos: 5,
          entrega_cf: 150.50,
          recojo_cf: 75.25,
          peso_kg: 25.75,
          distancia_km: 12.30
        };

        console.log('🧪 Simulando INSERT de nueva visita:');
        console.log('   Datos:', JSON.stringify(testVisita, null, 2));

        try {
          const [insertResult] = await connection.execute(`
            INSERT INTO VISITA (id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            testVisita.id_viaje,
            testVisita.id_cliente,
            testVisita.pedidos,
            testVisita.entrega_cf,
            testVisita.recojo_cf,
            testVisita.peso_kg,
            testVisita.distancia_km
          ]);

          console.log(`✅ INSERT exitoso - ID generado: ${insertResult.insertId}\n`);

          // Verificar el registro creado con JOIN
          const [visitaCreada] = await connection.execute(`
            SELECT
              vis.id_visita,
              vis.id_viaje,
              vis.id_cliente,
              vis.pedidos,
              vis.entrega_cf,
              vis.recojo_cf,
              vis.peso_kg,
              vis.distancia_km,
              c.nombre as cliente_nombre,
              v.nro_viaje,
              v.fecha as viaje_fecha
            FROM VISITA vis
            LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
            LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
            WHERE vis.id_visita = ?
          `, [insertResult.insertId]);

          if (visitaCreada.length > 0) {
            console.log('📋 Datos completos de la visita creada:');
            console.log('   ', JSON.stringify(visitaCreada[0], null, 2));
          }

          // Limpiar el registro de prueba
          await connection.execute('DELETE FROM VISITA WHERE id_visita = ?', [insertResult.insertId]);
          console.log('🧹 Registro de prueba eliminado\n');

        } catch (insertError) {
          console.log('❌ ERROR al insertar:', insertError.message);
          if (insertError.code === 'ER_NO_REFERENCED_ROW_2') {
            console.log('💡 CAUSA: Referencias inválidas (foreign key)');
          }
          console.log('');
        }
      }
    }

    // === PROBLEMA 2: Formulario de edición no muestra/guarda IDs ===
    console.log('🐛 PROBLEMA 2: Verificando edición de registros...\n');

    const [visitasExistentes] = await connection.execute(`
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.nro_viaje,
        v.fecha as viaje_fecha
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LIMIT 1
    `);

    if (visitasExistentes.length > 0) {
      const visitaOriginal = visitasExistentes[0];
      console.log('📝 Visita a editar:');
      console.log('   ID:', visitaOriginal.id_visita);
      console.log('   Viaje ID:', visitaOriginal.id_viaje);
      console.log('   Cliente ID:', visitaOriginal.id_cliente);
      console.log('   Datos actuales:', {
        pedidos: visitaOriginal.pedidos,
        entrega_cf: visitaOriginal.entrega_cf,
        recojo_cf: visitaOriginal.recojo_cf
      });

      // Simular actualización
      const nuevosValores = {
        pedidos: (visitaOriginal.pedidos || 0) + 1,
        entrega_cf: (visitaOriginal.entrega_cf || 0) + 10.50,
        recojo_cf: (visitaOriginal.recojo_cf || 0) + 5.25
      };

      console.log('\n🔄 Simulando UPDATE:');
      console.log('   Nuevos valores:', nuevosValores);

      try {
        await connection.execute(`
          UPDATE VISITA
          SET pedidos = ?, entrega_cf = ?, recojo_cf = ?
          WHERE id_visita = ?
        `, [
          nuevosValores.pedidos,
          nuevosValores.entrega_cf,
          nuevosValores.recojo_cf,
          visitaOriginal.id_visita
        ]);

        // Verificar actualización
        const [visitaActualizada] = await connection.execute(`
          SELECT * FROM VISITA WHERE id_visita = ?
        `, [visitaOriginal.id_visita]);

        if (visitaActualizada.length > 0) {
          console.log('✅ UPDATE exitoso');
          console.log('   Valores actualizados:', {
            pedidos: visitaActualizada[0].pedidos,
            entrega_cf: visitaActualizada[0].entrega_cf,
            recojo_cf: visitaActualizada[0].recojo_cf
          });

          // Verificar que los IDs no cambiaron
          if (visitaActualizada[0].id_viaje === visitaOriginal.id_viaje &&
              visitaActualizada[0].id_cliente === visitaOriginal.id_cliente) {
            console.log('✅ IDs de viaje y cliente conservados correctamente');
          } else {
            console.log('❌ ERROR: IDs de viaje/cliente fueron modificados incorrectamente');
          }
        }

        // Restaurar valores originales
        await connection.execute(`
          UPDATE VISITA
          SET pedidos = ?, entrega_cf = ?, recojo_cf = ?
          WHERE id_visita = ?
        `, [
          visitaOriginal.pedidos,
          visitaOriginal.entrega_cf,
          visitaOriginal.recojo_cf,
          visitaOriginal.id_visita
        ]);
        console.log('🔄 Valores originales restaurados\n');

      } catch (updateError) {
        console.log('❌ ERROR al actualizar:', updateError.message);
      }
    } else {
      console.log('⚠️ No hay visitas existentes para probar edición\n');
    }

    // === PROBLEMA 3: Verificar estructura de respuesta del controlador ===
    console.log('🐛 PROBLEMA 3: Verificando estructura de respuesta...\n');

    // Simular consulta del controlador getVisitas
    const [visitasControllerQuery] = await connection.execute(`
      SELECT
        vis.id_visita,
        vis.id_viaje,
        vis.id_cliente,
        vis.pedidos,
        vis.entrega_cf,
        vis.recojo_cf,
        vis.peso_kg,
        vis.distancia_km,
        vis.created_by,
        vis.updated_by,
        c.codigo as cliente_codigo,
        c.nombre as cliente_nombre,
        v.fecha as viaje_fecha,
        v.nro_viaje,
        vh.placa as vehiculo_placa,
        r.codigo as repartidor_codigo,
        r.nombre as repartidor_nombre,
        uc.nombre_completo as created_by_name,
        uu.nombre_completo as updated_by_name,
        vis.created_at,
        vis.updated_at
      FROM VISITA vis
      LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
      LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
      LEFT JOIN VEHICULO vh ON v.id_vehiculo = vh.id_vehiculo
      LEFT JOIN REPARTIDOR r ON v.id_repartidor = r.id_repartidor
      LEFT JOIN USUARIO uc ON vis.created_by = uc.id_usuario
      LEFT JOIN USUARIO uu ON vis.updated_by = uu.id_usuario
      ORDER BY v.fecha DESC, v.nro_viaje ASC, vis.id_visita ASC
      LIMIT 3
    `);

    console.log(`📊 Consulta del controlador retorna ${visitasControllerQuery.length} registros`);

    if (visitasControllerQuery.length > 0) {
      console.log('📋 Estructura de respuesta:');
      const primerRegistro = visitasControllerQuery[0];
      Object.keys(primerRegistro).forEach(key => {
        console.log(`   ${key}: ${primerRegistro[key]}`);
      });
    }

    // === VERIFICACIONES ADICIONALES ===
    console.log('\n🔍 VERIFICACIONES ADICIONALES:\n');

    // Verificar constraints de foreign key
    const [fkInfo] = await connection.execute(`
      SELECT
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'VISITA'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [config.database]);

    console.log('🔗 Foreign Keys de tabla VISITA:');
    fkInfo.forEach(fk => {
      console.log(`   ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    // Verificar tipos de datos
    const [columnInfo] = await connection.execute('DESCRIBE VISITA');
    console.log('\n📊 Tipos de datos de columnas:');
    columnInfo.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key || ''}`);
    });

    console.log('\n🎯 RESUMEN DE PROBLEMAS Y SOLUCIONES:\n');

    console.log('1️⃣ PROBLEMA: No se pueden agregar registros nuevos');
    console.log('   🔧 CAUSAS POSIBLES:');
    console.log('      - Hook no recarga la lista después de crear');
    console.log('      - Error en el endpoint del controlador');
    console.log('      - Referencias inválidas de viaje/cliente');
    console.log('      - Validaciones frontend fallando');

    console.log('\n2️⃣ PROBLEMA: Formulario edición no muestra/guarda IDs');
    console.log('   🔧 CAUSAS POSIBLES:');
    console.log('      - useEffect no se ejecuta correctamente');
    console.log('      - Conversión de tipos string/number');
    console.log('      - Select no encuentra el valor en options');
    console.log('      - Estado del formulario no se resetea');

    console.log('\n3️⃣ PROBLEMA: Falta alerta de eliminación');
    console.log('   🔧 SOLUCIÓN IMPLEMENTADA:');
    console.log('      - Alerta personalizada con información detallada');
    console.log('      - Verificación de referencias antes de eliminar');
    console.log('      - Mensajes de confirmación y éxito');

  } catch (error) {
    console.error('❌ Error durante el debug:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCION: Iniciar MySQL:');
      console.log('   docker-compose up -d mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 SOLUCION: Crear base de datos:');
      console.log('   Ejecutar script de inicialización');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugVisitasIssues()
    .then(() => {
      console.log('\n✨ Debug completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { debugVisitasIssues };

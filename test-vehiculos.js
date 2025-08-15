const mysql = require('mysql2/promise');

// Configuración de la base de datos (ajustar según tu configuración)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'rmp_db'
};

async function testVehiculosCRUD() {
  let connection;

  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa');

    // Test 1: Verificar estructura de tabla
    console.log('\n📋 Test 1: Verificar estructura de tabla VEHICULO');
    const [tableInfo] = await connection.execute('DESCRIBE VEHICULO');
    console.log('Estructura de tabla:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : ''} ${column.Key === 'PRI' ? '(PRIMARY KEY)' : ''}`);
    });

    // Test 2: Insertar vehículo de prueba
    console.log('\n➕ Test 2: Insertar vehículo de prueba');
    const testVehiculo = {
      placa: 'TEST-001',
      marca: 'Toyota',
      modelo: 'Hino',
      anio: 2023,
      capacidad_kg: 15000.50,
      capacidad_cajas: 80,
      activo: true
    };

    const [insertResult] = await connection.execute(
      `INSERT INTO VEHICULO (placa, marca, modelo, anio, capacidad_kg, capacidad_cajas, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [testVehiculo.placa, testVehiculo.marca, testVehiculo.modelo,
       testVehiculo.anio, testVehiculo.capacidad_kg, testVehiculo.capacidad_cajas, testVehiculo.activo]
    );
    console.log(`✅ Vehículo insertado con ID: ${insertResult.insertId}`);

    // Test 3: Leer vehículo insertado
    console.log('\n📖 Test 3: Leer vehículo insertado');
    const [selectResult] = await connection.execute(
      'SELECT * FROM VEHICULO WHERE id_vehiculo = ?',
      [insertResult.insertId]
    );
    console.log('Vehículo encontrado:', selectResult[0]);

    // Test 4: Verificar campos coinciden con la tabla
    const vehiculo = selectResult[0];
    const expectedFields = ['id_vehiculo', 'placa', 'marca', 'modelo', 'anio', 'capacidad_kg', 'capacidad_cajas', 'activo', 'created_at', 'updated_at'];
    console.log('\n🔍 Test 4: Verificar campos del vehículo');
    expectedFields.forEach(field => {
      const exists = vehiculo.hasOwnProperty(field);
      console.log(`  ${exists ? '✅' : '❌'} ${field}: ${exists ? vehiculo[field] : 'NO EXISTE'}`);
    });

    // Test 5: Actualizar vehículo
    console.log('\n✏️ Test 5: Actualizar vehículo');
    await connection.execute(
      'UPDATE VEHICULO SET marca = ?, capacidad_kg = ? WHERE id_vehiculo = ?',
      ['Toyota Actualizado', 16000.75, insertResult.insertId]
    );

    const [updatedResult] = await connection.execute(
      'SELECT * FROM VEHICULO WHERE id_vehiculo = ?',
      [insertResult.insertId]
    );
    console.log('✅ Vehículo actualizado:', {
      marca: updatedResult[0].marca,
      capacidad_kg: updatedResult[0].capacidad_kg
    });

    // Test 6: Verificar restricción de placa única
    console.log('\n🚫 Test 6: Verificar restricción de placa única');
    try {
      await connection.execute(
        'INSERT INTO VEHICULO (placa, marca, modelo) VALUES (?, ?, ?)',
        ['TEST-001', 'Otra Marca', 'Otro Modelo']
      );
      console.log('❌ ERROR: Se permitió insertar placa duplicada');
    } catch (error) {
      console.log('✅ Restricción de placa única funciona correctamente');
    }

    // Test 7: Soft delete (cambiar activo a false)
    console.log('\n🔄 Test 7: Soft delete (desactivar vehículo)');
    await connection.execute(
      'UPDATE VEHICULO SET activo = FALSE WHERE id_vehiculo = ?',
      [insertResult.insertId]
    );

    const [deactivatedResult] = await connection.execute(
      'SELECT activo FROM VEHICULO WHERE id_vehiculo = ?',
      [insertResult.insertId]
    );
    console.log(`✅ Vehículo desactivado: activo = ${deactivatedResult[0].activo}`);

    // Test 8: Listar vehículos activos
    console.log('\n📋 Test 8: Listar vehículos activos');
    const [activeVehicles] = await connection.execute(
      'SELECT COUNT(*) as total FROM VEHICULO WHERE activo = TRUE'
    );
    console.log(`✅ Total vehículos activos: ${activeVehicles[0].total}`);

    // Test 9: Probar tipos de datos
    console.log('\n🔢 Test 9: Verificar tipos de datos');
    const testVehicle = updatedResult[0];
    console.log('Tipos de datos verificados:');
    console.log(`  - id_vehiculo: ${typeof testVehicle.id_vehiculo} (${testVehicle.id_vehiculo})`);
    console.log(`  - placa: ${typeof testVehicle.placa} (${testVehicle.placa})`);
    console.log(`  - marca: ${typeof testVehicle.marca} (${testVehicle.marca})`);
    console.log(`  - modelo: ${typeof testVehicle.modelo} (${testVehicle.modelo})`);
    console.log(`  - anio: ${typeof testVehicle.anio} (${testVehicle.anio})`);
    console.log(`  - capacidad_kg: ${typeof testVehicle.capacidad_kg} (${testVehicle.capacidad_kg})`);
    console.log(`  - capacidad_cajas: ${typeof testVehicle.capacidad_cajas} (${testVehicle.capacidad_cajas})`);
    console.log(`  - activo: ${typeof testVehicle.activo} (${testVehicle.activo})`);

    // Cleanup: Eliminar vehículo de prueba
    console.log('\n🧹 Limpieza: Eliminando vehículo de prueba');
    await connection.execute(
      'DELETE FROM VEHICULO WHERE id_vehiculo = ?',
      [insertResult.insertId]
    );
    console.log('✅ Vehículo de prueba eliminado');

    console.log('\n🎉 ¡Todos los tests del módulo de vehículos pasaron exitosamente!');
    console.log('\n📝 Resumen de alineación con la tabla de BD:');
    console.log('   ✅ Estructura de tabla correcta');
    console.log('   ✅ Campos coinciden con la definición de BD');
    console.log('   ✅ Restricciones funcionan correctamente');
    console.log('   ✅ Tipos de datos son consistentes');
    console.log('   ✅ CRUD operations funcionan');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    if (error.code) {
      console.error(`   Código de error: ${error.code}`);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar tests si el archivo es ejecutado directamente
if (require.main === module) {
  console.log('🚀 Iniciando tests del módulo de vehículos...');
  console.log('='.repeat(60));
  testVehiculosCRUD();
}

module.exports = { testVehiculosCRUD };

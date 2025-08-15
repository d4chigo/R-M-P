const db = require('./server/config/db');

async function testCreateVisita() {
  try {
    console.log('🧪 Testing createVisita function...');

    // Simular req.body y req.usuario
    const mockReqBody = {
      id_viaje: 1,
      id_cliente: 1,
      pedidos: 5,
      entrega_cf: 150.75,
      recojo_cf: 25.50,
      peso_kg: 45.25,
      distancia_km: 12.8
    };

    const mockReqUsuario = {
      id_usuario: 1
    };

    console.log('📋 Mock data:', {
      body: mockReqBody,
      usuario: mockReqUsuario
    });

    // Extraer datos igual que en el controlador
    const {
      id_viaje,
      id_cliente,
      pedidos,
      entrega_cf,
      recojo_cf,
      peso_kg,
      distancia_km,
    } = mockReqBody;

    const created_by = mockReqUsuario?.id_usuario || null;

    console.log('✅ Variables extraídas correctamente');
    console.log('   created_by:', created_by);

    // Validaciones básicas
    if (!id_viaje || !id_cliente) {
      console.log('❌ Validación falló: Viaje y cliente son requeridos');
      return;
    }

    console.log('✅ Validaciones básicas pasaron');

    // Verificar que el viaje existe
    console.log('🔍 Verificando si el viaje existe...');
    const [viaje] = await db.query(
      "SELECT id_viaje FROM VIAJE WHERE id_viaje = ?",
      [id_viaje],
    );

    if (viaje.length === 0) {
      console.log('❌ El viaje especificado no existe');
      return;
    }

    console.log('✅ Viaje existe');

    // Verificar que el cliente existe
    console.log('🔍 Verificando si el cliente existe...');
    const [cliente] = await db.query(
      "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?",
      [id_cliente],
    );

    if (cliente.length === 0) {
      console.log('❌ El cliente especificado no existe');
      return;
    }

    console.log('✅ Cliente existe');

    // Verificar que no exista ya una visita para el mismo viaje y cliente
    console.log('🔍 Verificando visita duplicada...');
    const [existingVisita] = await db.query(
      "SELECT id_visita FROM VISITA WHERE id_viaje = ? AND id_cliente = ?",
      [id_viaje, id_cliente],
    );

    if (existingVisita.length > 0) {
      console.log('❌ Ya existe una visita para este viaje y cliente');
      console.log('   ID de visita existente:', existingVisita[0].id_visita);
      return;
    }

    console.log('✅ No hay visitas duplicadas');

    // Intentar insertar
    console.log('💾 Insertando nueva visita...');

    const insertQuery = `
      INSERT INTO VISITA (
        id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      id_viaje,
      id_cliente,
      pedidos || 0,
      entrega_cf || 0,
      recojo_cf || 0,
      peso_kg || 0,
      distancia_km || 0,
      created_by,
    ];

    console.log('📋 Query:', insertQuery);
    console.log('📋 Values:', insertValues);

    const [result] = await db.query(insertQuery, insertValues);

    console.log(`✅ Visita creada con ID: ${result.insertId}`);

    // Obtener la visita creada con información relacionada
    console.log('🔍 Consultando visita creada...');
    const [newVisita] = await db.query(
      `
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
      WHERE vis.id_visita = ?
    `,
      [result.insertId],
    );

    console.log('✅ Visita consultada exitosamente:');
    console.log(JSON.stringify(newVisita[0], null, 2));

    // Limpiar - eliminar la visita de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await db.query('DELETE FROM VISITA WHERE id_visita = ?', [result.insertId]);
    console.log('✅ Visita de prueba eliminada');

    console.log('\n🎉 Test completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el test:', error);
    console.error('📋 Mensaje:', error.message);
    console.error('📋 Código:', error.code);
    console.error('📋 SQL State:', error.sqlState);

    if (error.sql) {
      console.error('📋 SQL:', error.sql);
    }
  }
}

// Ejecutar el test
console.log('🧪 ====================================');
console.log('🧪 TEST SIMPLE DE CREACIÓN DE VISITA');
console.log('🧪 ====================================\n');

testCreateVisita().then(() => {
  console.log('\n🏁 Test finalizado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Test falló:', error);
  process.exit(1);
});

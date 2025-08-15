const mysql = require("mysql2/promise");

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "rmp_user",
  password: process.env.DB_PASSWORD || "rmp_password123",
  database: process.env.DB_NAME || "rmp_db",
  port: process.env.DB_PORT || 3306,
};

async function testVisitaInsert() {
  let connection;

  try {
    console.log("🔗 Conectando a la base de datos...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Conexión exitosa a la BD");

    // 1. Verificar que existan las tablas necesarias
    console.log("\n📋 Verificando estructura de tablas...");

    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);

    const requiredTables = ["VIAJE", "CLIENTE", "VISITA", "USUARIO"];
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`✅ Tabla ${table} existe`);
      } else {
        console.log(`❌ Tabla ${table} NO existe`);
        return;
      }
    }

    // 2. Verificar estructura de tabla VISITA
    console.log("\n🔍 Estructura de tabla VISITA:");
    const [visitaStructure] = await connection.query("DESCRIBE VISITA");
    visitaStructure.forEach((column) => {
      console.log(
        `   ${column.Field}: ${column.Type} ${column.Null === "NO" ? "(NOT NULL)" : "(NULL)"} ${column.Key ? `[${column.Key}]` : ""}`,
      );
    });

    // 3. Verificar datos de prueba disponibles
    console.log("\n📊 Verificando datos disponibles...");

    const [viajes] = await connection.query(
      "SELECT id_viaje, fecha, nro_viaje FROM VIAJE LIMIT 5",
    );
    console.log(`   Viajes disponibles: ${viajes.length}`);
    if (viajes.length > 0) {
      console.log(
        `   Ejemplo: ID ${viajes[0].id_viaje}, Fecha: ${viajes[0].fecha}, Nro: ${viajes[0].nro_viaje}`,
      );
    }

    const [clientes] = await connection.query(
      "SELECT id_cliente, codigo, nombre FROM CLIENTE LIMIT 5",
    );
    console.log(`   Clientes disponibles: ${clientes.length}`);
    if (clientes.length > 0) {
      console.log(
        `   Ejemplo: ID ${clientes[0].id_cliente}, Código: ${clientes[0].codigo}, Nombre: ${clientes[0].nombre}`,
      );
    }

    const [usuarios] = await connection.query(
      "SELECT id_usuario, username FROM USUARIO LIMIT 5",
    );
    console.log(`   Usuarios disponibles: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log(
        `   Ejemplo: ID ${usuarios[0].id_usuario}, Username: ${usuarios[0].username}`,
      );
    }

    // 4. Verificar si ya existe una visita para el viaje y cliente de prueba
    if (viajes.length > 0 && clientes.length > 0) {
      const testViajeId = viajes[0].id_viaje;
      const testClienteId = clientes[0].id_cliente;
      const testUserId = usuarios.length > 0 ? usuarios[0].id_usuario : null;

      console.log(
        `\n🔍 Verificando si ya existe visita para Viaje ${testViajeId} y Cliente ${testClienteId}...`,
      );
      const [existingVisita] = await connection.query(
        "SELECT id_visita FROM VISITA WHERE id_viaje = ? AND id_cliente = ?",
        [testViajeId, testClienteId],
      );

      let finalTestClienteId = testClienteId;

      if (existingVisita.length > 0) {
        console.log(
          `   ⚠️  Ya existe visita con ID: ${existingVisita[0].id_visita}`,
        );
        console.log("   💡 Usando datos diferentes para la prueba...");

        // Buscar otro cliente
        const [otherClientes] = await connection.query(
          "SELECT id_cliente, codigo, nombre FROM CLIENTE WHERE id_cliente != ? LIMIT 1",
          [testClienteId],
        );

        if (otherClientes.length > 0) {
          console.log(
            `   🔄 Usando Cliente ${otherClientes[0].id_cliente} (${otherClientes[0].codigo})`,
          );
          finalTestClienteId = otherClientes[0].id_cliente;
        }
      } else {
        console.log("   ✅ No existe visita previa, se puede crear");
      }

      // 5. Intentar insertar una visita de prueba
      console.log("\n🧪 Insertando visita de prueba...");

      const visitaData = {
        id_viaje: testViajeId,
        id_cliente: finalTestClienteId,
        pedidos: 5,
        entrega_cf: 150.75,
        recojo_cf: 25.5,
        peso_kg: 45.25,
        distancia_km: 12.8,
        created_by: testUserId,
      };

      console.log("   Datos a insertar:", visitaData);

      try {
        const [result] = await connection.query(
          `
          INSERT INTO VISITA (
            id_viaje, id_cliente, pedidos, entrega_cf, recojo_cf, peso_kg, distancia_km, created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            visitaData.id_viaje,
            visitaData.id_cliente,
            visitaData.pedidos,
            visitaData.entrega_cf,
            visitaData.recojo_cf,
            visitaData.peso_kg,
            visitaData.distancia_km,
            visitaData.created_by,
          ],
        );

        console.log(
          `   ✅ Visita insertada exitosamente con ID: ${result.insertId}`,
        );

        // 6. Verificar la inserción consultando la visita creada
        console.log("\n🔍 Verificando visita insertada...");
        const [newVisita] = await connection.query(
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
            c.codigo as cliente_codigo,
            c.nombre as cliente_nombre,
            v.fecha as viaje_fecha,
            v.nro_viaje,
            u.username as created_by_username
          FROM VISITA vis
          LEFT JOIN CLIENTE c ON vis.id_cliente = c.id_cliente
          LEFT JOIN VIAJE v ON vis.id_viaje = v.id_viaje
          LEFT JOIN USUARIO u ON vis.created_by = u.id_usuario
          WHERE vis.id_visita = ?
        `,
          [result.insertId],
        );

        if (newVisita.length > 0) {
          console.log("   ✅ Visita consultada exitosamente:");
          console.log("   ", JSON.stringify(newVisita[0], null, 2));
        } else {
          console.log("   ❌ No se pudo consultar la visita insertada");
        }

        // 7. Limpiar - eliminar la visita de prueba
        console.log("\n🧹 Limpiando datos de prueba...");
        await connection.query("DELETE FROM VISITA WHERE id_visita = ?", [
          result.insertId,
        ]);
        console.log("   ✅ Visita de prueba eliminada");
      } catch (insertError) {
        console.error("   ❌ Error al insertar visita:", insertError.message);
        console.error("   📋 Código de error:", insertError.code);
        console.error("   📋 SQL State:", insertError.sqlState);

        if (insertError.code === "ER_NO_REFERENCED_ROW_2") {
          console.log(
            "   💡 Error de clave foránea - verificando restricciones...",
          );

          // Verificar que el viaje existe
          const [viajeCheck] = await connection.query(
            "SELECT id_viaje FROM VIAJE WHERE id_viaje = ?",
            [testViajeId],
          );
          console.log(
            `   Viaje ${testViajeId} existe: ${viajeCheck.length > 0 ? "SÍ" : "NO"}`,
          );

          // Verificar que el cliente existe
          const [clienteCheck] = await connection.query(
            "SELECT id_cliente FROM CLIENTE WHERE id_cliente = ?",
            [finalTestClienteId],
          );
          console.log(
            `   Cliente ${finalTestClienteId} existe: ${clienteCheck.length > 0 ? "SÍ" : "NO"}`,
          );

          // Verificar que el usuario existe
          if (testUserId) {
            const [usuarioCheck] = await connection.query(
              "SELECT id_usuario FROM USUARIO WHERE id_usuario = ?",
              [testUserId],
            );
            console.log(
              `   Usuario ${testUserId} existe: ${usuarioCheck.length > 0 ? "SÍ" : "NO"}`,
            );
          }
        }
      }
    } else {
      console.log("\n❌ No hay datos suficientes para realizar la prueba");
      console.log(`   Viajes: ${viajes.length}, Clientes: ${clientes.length}`);
    }
  } catch (error) {
    console.error("❌ Error general:", error.message);
    console.error("📋 Stack:", error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Conexión cerrada");
    }
  }
}

// Ejecutar el test
console.log("🧪 =================================");
console.log("🧪 TEST DE INSERCIÓN DE VISITAS");
console.log("🧪 =================================\n");

testVisitaInsert()
  .then(() => {
    console.log("\n🏁 Test completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test falló:", error);
    process.exit(1);
  });

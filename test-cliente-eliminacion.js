const axios = require("axios");

// Configuración de la API
const API_BASE = "http://localhost:4000/api";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Función para hacer login y obtener token
async function login() {
  try {
    console.log("🔐 Iniciando sesión...");
    console.log("📡 URL:", `${API_BASE}/auth/login`);

    const response = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: "admin@rmp.com",
        password: "admin123",
      },
      { headers },
    );

    console.log("📊 Response status:", response.status);
    console.log("📊 Response data:", response.data);

    if (
      response.data.success &&
      response.data.data &&
      response.data.data.token
    ) {
      console.log("✅ Login exitoso");
      return response.data.data.token;
    } else {
      console.log("❌ Estructura de respuesta inesperada:", response.data);
      throw new Error("Login fallido - estructura de respuesta incorrecta");
    }
  } catch (error) {
    console.error("❌ Error en login:", error.response?.data || error.message);
    console.error("❌ Error completo:", error);
    return null;
  }
}

// Función para crear un cliente de prueba
async function crearClientePrueba(token, clienteData) {
  try {
    console.log(`📝 Creando cliente de prueba: ${clienteData.nombre}`);
    const response = await axios.post(`${API_BASE}/clientes`, clienteData, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log(`✅ Cliente creado con ID: ${response.data.data.id_cliente}`);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error(
      "❌ Error creando cliente:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Función para crear una visita para un cliente
async function crearVisitaPrueba(token, clienteId) {
  try {
    console.log(`🚚 Creando visita para cliente ID: ${clienteId}`);

    // Primero obtener un viaje existente
    const viajesResponse = await axios.get(`${API_BASE}/viajes`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!viajesResponse.data.success || viajesResponse.data.data.length === 0) {
      console.log("⚠️ No hay viajes disponibles, creando uno...");
      // Aquí podrías crear un viaje de prueba si es necesario
      return null;
    }

    const viajeId = viajesResponse.data.data[0].id_viaje;

    const visitaData = {
      id_viaje: viajeId,
      id_cliente: clienteId,
      orden: 1,
      pedidos: 5,
      observaciones: "Visita de prueba para test de eliminación",
    };

    const response = await axios.post(`${API_BASE}/visitas`, visitaData, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log(`✅ Visita creada con ID: ${response.data.data.id_visita}`);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error(
      "❌ Error creando visita:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Función para verificar visitas de un cliente
async function verificarVisitasCliente(token, clienteId) {
  try {
    console.log(`🔍 Verificando visitas del cliente ID: ${clienteId}`);
    const response = await axios.get(
      `${API_BASE}/visitas?id_cliente=${clienteId}`,
      {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const visitas = response.data.data || [];
    console.log(`📊 Cliente tiene ${visitas.length} visitas registradas`);
    return visitas.length;
  } catch (error) {
    console.error(
      "❌ Error verificando visitas:",
      error.response?.data || error.message,
    );
    return 0;
  }
}

// Función para eliminar un cliente
async function eliminarCliente(token, clienteId, clienteNombre) {
  try {
    console.log(`🗑️ Eliminando cliente: ${clienteNombre} (ID: ${clienteId})`);
    const response = await axios.delete(`${API_BASE}/clientes/${clienteId}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      const mensaje = response.data.message;
      const esDesactivacion = mensaje.includes("desactivado");
      const esEliminacion = mensaje.includes("eliminado");

      console.log(`✅ Resultado: ${mensaje}`);

      if (esDesactivacion) {
        console.log("📝 Tipo: SOFT DELETE (Desactivación)");
        console.log("💾 Datos históricos preservados");
      } else if (esEliminacion) {
        console.log("📝 Tipo: HARD DELETE (Eliminación física)");
        console.log("🗑️ Registro completamente removido");
      }

      return {
        success: true,
        tipo: esDesactivacion ? "soft_delete" : "hard_delete",
        mensaje,
      };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error(
      "❌ Error eliminando cliente:",
      error.response?.data || error.message,
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

// Función para verificar estado del cliente después de eliminar
async function verificarEstadoCliente(token, clienteId) {
  try {
    console.log(`🔍 Verificando estado del cliente ID: ${clienteId}`);
    const response = await axios.get(`${API_BASE}/clientes/${clienteId}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      const cliente = response.data.data;
      console.log(`📊 Cliente encontrado - Activo: ${cliente.activo}`);
      return { existe: true, activo: cliente.activo };
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("📊 Cliente no encontrado (eliminado físicamente)");
      return { existe: false, activo: false };
    }
    console.error(
      "❌ Error verificando estado:",
      error.response?.data || error.message,
    );
    return { existe: false, activo: false };
  }
}

// Función principal de prueba
async function testEliminacionClientes() {
  console.log("🧪 INICIANDO PRUEBAS DE ELIMINACIÓN DE CLIENTES");
  console.log("=".repeat(60));

  // 1. Login
  const token = await login();
  if (!token) {
    console.log("❌ No se pudo obtener token, terminando pruebas");
    return;
  }

  // 2. Crear cliente SIN visitas
  console.log("\n📋 PRUEBA 1: Cliente SIN visitas");
  console.log("-".repeat(40));

  const clienteSinVisitas = await crearClientePrueba(token, {
    codigo: "TEST001",
    nombre: "Cliente Test Sin Visitas",
    direccion: "Dirección de prueba 123",
    activo: true,
  });

  if (clienteSinVisitas) {
    const visitasAntes = await verificarVisitasCliente(
      token,
      clienteSinVisitas.id_cliente,
    );
    console.log(`📊 Visitas antes de eliminar: ${visitasAntes}`);

    const resultadoEliminacion1 = await eliminarCliente(
      token,
      clienteSinVisitas.id_cliente,
      clienteSinVisitas.nombre,
    );

    if (resultadoEliminacion1.success) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo
      const estadoFinal1 = await verificarEstadoCliente(
        token,
        clienteSinVisitas.id_cliente,
      );
      console.log(
        `📊 Estado final - Existe: ${estadoFinal1.existe}, Activo: ${estadoFinal1.activo}`,
      );
    }
  }

  // 3. Crear cliente CON visitas
  console.log("\n📋 PRUEBA 2: Cliente CON visitas");
  console.log("-".repeat(40));

  const clienteConVisitas = await crearClientePrueba(token, {
    codigo: "TEST002",
    nombre: "Cliente Test Con Visitas",
    direccion: "Dirección de prueba 456",
    activo: true,
  });

  if (clienteConVisitas) {
    // Crear una visita para este cliente
    const visita = await crearVisitaPrueba(token, clienteConVisitas.id_cliente);

    if (visita) {
      const visitasAntes = await verificarVisitasCliente(
        token,
        clienteConVisitas.id_cliente,
      );
      console.log(`📊 Visitas antes de eliminar: ${visitasAntes}`);

      const resultadoEliminacion2 = await eliminarCliente(
        token,
        clienteConVisitas.id_cliente,
        clienteConVisitas.nombre,
      );

      if (resultadoEliminacion2.success) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo
        const estadoFinal2 = await verificarEstadoCliente(
          token,
          clienteConVisitas.id_cliente,
        );
        console.log(
          `📊 Estado final - Existe: ${estadoFinal2.existe}, Activo: ${estadoFinal2.activo}`,
        );
      }
    } else {
      console.log(
        "⚠️ No se pudo crear visita, probando eliminación sin visitas...",
      );
      await eliminarCliente(
        token,
        clienteConVisitas.id_cliente,
        clienteConVisitas.nombre,
      );
    }
  }

  console.log("\n✅ PRUEBAS COMPLETADAS");
  console.log("=".repeat(60));
  console.log("💡 Resumen:");
  console.log("• Cliente sin visitas → Eliminación física (HARD DELETE)");
  console.log("• Cliente con visitas → Desactivación (SOFT DELETE)");
  console.log("• Los datos históricos se preservan automáticamente");
}

// Función para limpiar datos de prueba
async function limpiarDatosPrueba() {
  console.log("\n🧹 LIMPIANDO DATOS DE PRUEBA...");

  const token = await login();
  if (!token) return;

  try {
    // Buscar clientes de prueba que puedan haber quedado
    const response = await axios.get(`${API_BASE}/clientes`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      const clientesPrueba = response.data.data.filter(
        (cliente) =>
          cliente.codigo?.startsWith("TEST") ||
          cliente.nombre?.includes("Test"),
      );

      for (const cliente of clientesPrueba) {
        console.log(`🗑️ Eliminando cliente de prueba: ${cliente.nombre}`);
        await eliminarCliente(token, cliente.id_cliente, cliente.nombre);
      }
    }
  } catch (error) {
    console.error("❌ Error limpiando datos:", error.message);
  }

  console.log("✅ Limpieza completada");
}

// Ejecutar pruebas
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--clean")) {
    limpiarDatosPrueba();
  } else {
    testEliminacionClientes()
      .then(() => {
        console.log("\n🎯 Para limpiar datos de prueba ejecuta:");
        console.log("node test-cliente-eliminacion.js --clean");
      })
      .catch(console.error);
  }
}

module.exports = {
  testEliminacionClientes,
  limpiarDatosPrueba,
  login,
  crearClientePrueba,
  eliminarCliente,
  verificarEstadoCliente,
};

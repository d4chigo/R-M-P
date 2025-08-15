const bcrypt = require('bcryptjs');

// Simular el proceso de login para verificar que funciona
async function testLogin() {
  console.log('🧪 Probando proceso de login...\n');

  // Datos de prueba
  const username = 'admin';
  const password = 'admin123';

  // Hash almacenado en la BD (del script 01-init.sql)
  const storedHash = '$2a$10$iUbSmL2uwaU5sIryjMYRVect6MhXSBNx85f5plAEF3p2GSwbxFXoa';

  console.log(`👤 Username: ${username}`);
  console.log(`🔐 Password: ${password}`);
  console.log(`📝 Hash almacenado: ${storedHash}`);
  console.log();

  try {
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, storedHash);

    if (isValid) {
      console.log('✅ LOGIN EXITOSO - La contraseña coincide con el hash');
      console.log('✅ El usuario admin puede autenticarse correctamente');
    } else {
      console.log('❌ LOGIN FALLIDO - La contraseña no coincide');
    }

    console.log();

    // Probar también con el usuario demo
    const demoHash = '$2a$10$S16xtRVcad4th4ktbcUuY.RsU8rscIx02AXu17S1xBoKvhPSVRS6W';
    const demoPassword = 'demo123';

    console.log('🧪 Probando usuario demo...');
    console.log(`👤 Username: demo`);
    console.log(`🔐 Password: ${demoPassword}`);

    const isDemoValid = await bcrypt.compare(demoPassword, demoHash);

    if (isDemoValid) {
      console.log('✅ LOGIN DEMO EXITOSO - La contraseña coincide con el hash');
    } else {
      console.log('❌ LOGIN DEMO FALLIDO - La contraseña no coincide');
    }

    console.log('\n📋 Resumen del test:');
    console.log(`   Admin login: ${isValid ? '✅ OK' : '❌ FAIL'}`);
    console.log(`   Demo login:  ${isDemoValid ? '✅ OK' : '❌ FAIL'}`);

    if (isValid && isDemoValid) {
      console.log('\n🎉 Todos los tests de login pasaron correctamente!');
      console.log('📤 El frontend debería poder autenticarse con estas credenciales:');
      console.log('   - admin / admin123');
      console.log('   - demo / demo123');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar el test
testLogin();

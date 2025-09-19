const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const passwords = ['admin123', 'demo123', 'user123'];
  const saltRounds = 10;

  console.log('🔐 Generando contraseñas hash para usuarios de prueba...\n');

  for (const password of passwords) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      console.log(`Contraseña: ${password}`);
      console.log(`Hash: ${hash}\n`);
    } catch (error) {
      console.error(`Error generando hash para ${password}:`, error);
    }
  }

  console.log('✅ Contraseñas generadas exitosamente');
  console.log('\n📝 Puedes usar estos hashes en tu script SQL para insertar usuarios de prueba');
}

// Ejecutar solo si el archivo se ejecuta directamente
if (require.main === module) {
  generatePasswords();
}

module.exports = { generatePasswords };

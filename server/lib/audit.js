const db = require('../config/db');

async function ensureAuditTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS TESORERIA_AUDIT (
      id INT PRIMARY KEY AUTO_INCREMENT,
      fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      evento VARCHAR(32) NOT NULL,
      entidad VARCHAR(32) NOT NULL,
      entity_id INT NULL,
      user_id INT NULL,
      ip VARCHAR(64) NULL,
      detalle LONGTEXT NULL,
      KEY idx_fecha_evento (fecha_evento),
      KEY idx_entidad_evento (entidad, evento),
      KEY idx_entity_id (entity_id),
      CONSTRAINT fk_tesoreria_audit_user FOREIGN KEY (user_id) REFERENCES USUARIO(id_usuario) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function getIp(req) {
  try {
    const xff = req?.headers?.['x-forwarded-for'];
    return (Array.isArray(xff) ? xff[0] : xff?.split(',')[0]) || req?.ip || null;
  } catch {
    return null;
  }
}

async function logAudit({ req, evento, entidad, entityId, detalle }) {
  try {
    await ensureAuditTable();
    const userId = req?.usuario ? req.usuario.id_usuario : null;
    const ip = getIp(req);
    const payload = JSON.stringify(detalle ?? {});
    await db.query(
      'INSERT INTO TESORERIA_AUDIT (evento, entidad, entity_id, user_id, ip, detalle) VALUES (?, ?, ?, ?, ?, ?)',
      [String(evento), String(entidad), entityId ?? null, userId, ip, payload]
    );
  } catch (err) {
    // No romper el flujo principal por errores de auditoría
    console.error('AUDIT log error:', err?.message || err);
  }
}

module.exports = { logAudit };

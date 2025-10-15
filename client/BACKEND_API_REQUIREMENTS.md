# Requerimientos de API Backend para Tesorería con Centros de Distribución

Este documento detalla las rutas API que deben implementarse en el backend para soportar el manejo de saldos independientes por centro de distribución en el módulo de tesorería.

## Rutas Nuevas Requeridas

### 1. Obtener saldos por centro de distribución
**Endpoint:** `GET /api/tesoreria/saldo/por-centro`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_centro": 1,
      "nombre_centro": "Lima Centro",
      "codigo": "LC001",
      "saldo": 15000.50
    },
    {
      "id_centro": 2,
      "nombre_centro": "Callao Norte",
      "codigo": "CN002",
      "saldo": 8500.75
    }
  ]
}
```

**Descripción:** Retorna todos los centros de distribución con sus saldos individuales actuales.

---

### 2. Establecer saldo específico de un centro
**Endpoint:** `PUT /api/tesoreria/saldo/por-centro/:id_centro`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "saldo": 10000.00,
  "motivo": "Ajuste de saldo inicial del mes"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Saldo establecido correctamente",
  "data": {
    "id_centro": 1,
    "saldo": 10000.00,
    "updated_by": "Juan Pérez",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validaciones:**
- El usuario debe ser administrador
- El monto debe ser mayor o igual a 0
- El motivo es obligatorio
- El centro de distribución debe existir

**Descripción:** Establece un saldo específico para un centro de distribución (sobrescribe el saldo anterior). Se debe registrar en una tabla de historial/auditoría el cambio con el motivo.

---

### 3. Incrementar saldo de un centro
**Endpoint:** `POST /api/tesoreria/saldo/por-centro/:id_centro/incrementar`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "monto": 5000.00,
  "motivo": "Depósito de caja chica"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Saldo incrementado correctamente",
  "data": {
    "id_centro": 1,
    "saldo_anterior": 10000.00,
    "monto_agregado": 5000.00,
    "saldo_nuevo": 15000.00,
    "updated_by": "Juan Pérez",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Validaciones:**
- El usuario debe ser administrador
- El monto debe ser mayor a 0
- El motivo es obligatorio
- El centro de distribución debe existir

**Descripción:** Agrega dinero al saldo existente de un centro de distribución. Se debe registrar en una tabla de historial/auditoría el incremento con el motivo.

---

## Modificaciones a Rutas Existentes

### 4. Crear registro de tesorería (modificar existente)
**Endpoint:** `POST /api/tesoreria`

**Cambios necesarios:**
1. El campo `id_centro` ahora es **obligatorio**
2. Al crear un registro, el `monto` debe restarse del saldo del centro especificado en `id_centro`
3. No debe afectar los saldos de otros centros
4. Validar que el centro tenga saldo suficiente antes de crear el registro

**Body (ejemplo):**
```json
{
  "fecha": "2024-01-15",
  "placa": "ABC-123",
  "nombre": "Juan Pérez",
  "id_centro": 1,
  "cargo": "Conductor",
  "categoria": "Combustible",
  "detalle": "Gasolina para ruta norte",
  "distrito": "Lima",
  "turno": 1,
  "encargado": "María López",
  "monto": 150.00
}
```

**Validación adicional:**
```sql
-- Antes de crear el registro, verificar:
SELECT saldo FROM tesoreria_saldos_centros WHERE id_centro = :id_centro;
-- Si saldo >= monto, proceder
-- Luego restar: UPDATE tesoreria_saldos_centros SET saldo = saldo - :monto WHERE id_centro = :id_centro;
```

**Respuesta de error si saldo insuficiente (400):**
```json
{
  "success": false,
  "message": "Saldo insuficiente en el centro de distribución seleccionado",
  "data": {
    "saldo_disponible": 100.00,
    "monto_solicitado": 150.00
  }
}
```

---

### 5. Actualizar registro de tesorería (modificar existente)
**Endpoint:** `PUT /api/tesoreria/:id`

**Cambios necesarios:**
1. Si se cambia el `id_centro`, se debe:
   - Devolver el monto anterior al centro original
   - Restar el nuevo monto del nuevo centro
2. Si solo cambia el monto (sin cambiar centro):
   - Si el nuevo monto es menor: devolver la diferencia al centro
   - Si el nuevo monto es mayor: validar saldo y restar la diferencia adicional
3. Validar que no se aumente el monto (mantener restricción actual del frontend)

**Lógica de ejemplo:**
```javascript
// Si cambió el centro
if (old_id_centro !== new_id_centro) {
  // Devolver al centro anterior
  UPDATE saldos SET saldo = saldo + old_monto WHERE id_centro = old_id_centro;
  // Restar del nuevo centro (validar saldo primero)
  UPDATE saldos SET saldo = saldo - new_monto WHERE id_centro = new_id_centro;
}
// Si solo cambió el monto (mismo centro)
else if (old_monto !== new_monto) {
  const diferencia = new_monto - old_monto;
  UPDATE saldos SET saldo = saldo - diferencia WHERE id_centro = id_centro;
}
```

---

### 6. Eliminar (soft delete) registro de tesorería
**Endpoint:** `DELETE /api/tesoreria/:id` o `PUT /api/tesoreria/:id/trash`

**Cambios necesarios:**
1. Al eliminar/archivar un registro, devolver el monto al saldo del centro correspondiente
2. Marcar el registro como eliminado pero mantener el `id_centro` para referencia

**Lógica:**
```javascript
// Al hacer soft delete
UPDATE saldos SET saldo = saldo + registro.monto WHERE id_centro = registro.id_centro;
UPDATE tesoreria SET deleted_at = NOW() WHERE id = :id;
```

---

### 7. Restaurar registro de tesorería desde papelera
**Endpoint:** `PUT /api/tesoreria/:id/restore`

**Cambios necesarios:**
1. Al restaurar, validar que el centro tenga saldo suficiente
2. Restar nuevamente el monto del saldo del centro

**Lógica:**
```javascript
// Al restaurar
const saldo_actual = SELECT saldo FROM saldos WHERE id_centro = registro.id_centro;
if (saldo_actual >= registro.monto) {
  UPDATE saldos SET saldo = saldo - registro.monto WHERE id_centro = registro.id_centro;
  UPDATE tesoreria SET deleted_at = NULL WHERE id = :id;
}
```

---

## Esquema de Base de Datos Sugerido

### Tabla: `tesoreria_saldos_centros`
```sql
CREATE TABLE tesoreria_saldos_centros (
  id SERIAL PRIMARY KEY,
  id_centro INTEGER NOT NULL REFERENCES centros_distribucion(id_centro),
  saldo DECIMAL(12, 2) NOT NULL DEFAULT 0,
  updated_by INTEGER REFERENCES usuarios(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_centro)
);
```

### Tabla: `tesoreria_saldos_historial`
```sql
CREATE TABLE tesoreria_saldos_historial (
  id SERIAL PRIMARY KEY,
  id_centro INTEGER NOT NULL REFERENCES centros_distribucion(id_centro),
  tipo ENUM('establecer', 'incrementar', 'gasto', 'devolucion') NOT NULL,
  saldo_anterior DECIMAL(12, 2) NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  saldo_nuevo DECIMAL(12, 2) NOT NULL,
  motivo TEXT,
  id_registro_tesoreria INTEGER REFERENCES tesoreria(id),
  created_by INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modificación a tabla `tesoreria`
```sql
-- Agregar columna si no existe
ALTER TABLE tesoreria 
ADD COLUMN id_centro INTEGER REFERENCES centros_distribucion(id_centro);

-- Hacer obligatorio después de migrar datos existentes
ALTER TABLE tesoreria 
ALTER COLUMN id_centro SET NOT NULL;
```

---

## Triggers Recomendados

### Trigger para auditoría automática
```sql
CREATE OR REPLACE FUNCTION registrar_cambio_saldo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tesoreria_saldos_historial (
    id_centro, tipo, saldo_anterior, monto, saldo_nuevo, created_by
  ) VALUES (
    NEW.id_centro, 
    TG_ARGV[0], -- 'establecer', 'incrementar', etc
    OLD.saldo, 
    NEW.saldo - OLD.saldo, 
    NEW.saldo,
    NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saldo_cambio
AFTER UPDATE ON tesoreria_saldos_centros
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_saldo('modificacion');
```

---

## Notas Importantes

1. **Transacciones**: Todas las operaciones que modifiquen saldos deben ejecutarse dentro de transacciones para garantizar consistencia.

2. **Validaciones de saldo**: Siempre validar que el saldo sea suficiente ANTES de realizar cualquier operación que reste dinero.

3. **Auditoría**: Mantener un registro completo de todos los cambios de saldo con motivos y usuarios que realizaron las operaciones.

4. **Permisos**: Solo usuarios con rol de administrador deben poder establecer o incrementar saldos directamente.

5. **Inicialización**: Crear un endpoint o script para inicializar saldos de centros existentes (migración de datos).

6. **Sincronización**: Considerar agregar un endpoint para recalcular saldos basándose en los registros de tesorería existentes en caso de inconsistencias.

---

## Endpoint Adicional Sugerido

### Recalcular saldos (para mantenimiento)
**Endpoint:** `POST /api/tesoreria/saldo/recalcular`

**Descripción:** Recalcula los saldos de todos los centros basándose en:
1. Un saldo base inicial configurado
2. La suma de todos los egresos registrados en tesorería por centro
3. Los incrementos registrados en el historial

Solo accesible por super administradores.

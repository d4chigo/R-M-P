# 🧪 Test Manual de la Funcionalidad de Alerta de Eliminación

## 📋 Descripción

Este documento describe cómo probar manualmente la funcionalidad implementada para la alerta de eliminación de clientes.

## 🚀 Pasos para Probar

### 1. Iniciar el Sistema

```bash
# Terminal 1: Iniciar el servidor backend
cd R-M-P/server
npm start

# Terminal 2: Iniciar el cliente frontend
cd R-M-P/client
npm run dev
```

### 2. Acceder al Sistema

1. Abrir navegador en `http://localhost:3001` (o el puerto disponible)
2. Iniciar sesión con:
   - **Email**: admin@rmp.com
   - **Contraseña**: admin123

### 3. Navegar al Módulo de Clientes

1. Hacer clic en "Gestión de Clientes" desde el dashboard
2. Se mostrará la lista de clientes existentes

### 4. Probar la Eliminación

#### Caso A: Cliente SIN Visitas
1. Crear un nuevo cliente de prueba:
   ```
   Código: TEST001
   Nombre: Cliente Test Sin Visitas
   Dirección: Calle de Prueba 123
   Zona: (cualquiera)
   ```

2. En la tabla, hacer clic en "Eliminar" para este cliente
3. **Verificar**: Se debe mostrar el AlertDialog con:
   - ✅ Título: "Eliminar Cliente"
   - ✅ Información detallada sobre el proceso
   - ✅ Explicación de eliminación física vs desactivación
   - ✅ Botones "Cancelar" y "Confirmar Eliminación"

4. Hacer clic en "Confirmar Eliminación"
5. **Verificar**: 
   - ✅ Aparece toast: "Cliente eliminado completamente del sistema"
   - ✅ El cliente desaparece de la tabla
   - ✅ El registro se elimina físicamente de la BD

#### Caso B: Cliente CON Visitas
1. Seleccionar un cliente existente que tenga visitas registradas
2. Hacer clic en "Eliminar"
3. **Verificar**: El mismo AlertDialog aparece con la misma información
4. Hacer clic en "Confirmar Eliminación"
5. **Verificar**:
   - ✅ Aparece toast: "Cliente desactivado, datos históricos preservados"
   - ✅ El cliente cambia a estado "Inactivo" en la tabla
   - ✅ El registro permanece en la BD pero con `activo = false`

#### Caso C: Cancelar Eliminación
1. Hacer clic en "Eliminar" en cualquier cliente
2. En el AlertDialog, hacer clic en "Cancelar"
3. **Verificar**:
   - ✅ El diálogo se cierra
   - ✅ No se realizan cambios en el cliente
   - ✅ No aparecen notificaciones

## 🎨 Elementos de UI a Verificar

### AlertDialog
- [ ] **Icono de información** (🔵) en el título
- [ ] **Título claro**: "Eliminar Cliente"
- [ ] **Nombre del cliente** resaltado en la descripción
- [ ] **Caja informativa azul** con bullets explicativos
- [ ] **Botón Cancelar** con estilo outline
- [ ] **Botón Confirmar** con estilo destructivo (rojo)
- [ ] **Tema oscuro** funciona correctamente

### Toast Notifications
- [ ] **Aparecen en la esquina** de la pantalla
- [ ] **Título descriptivo** según el tipo de eliminación
- [ ] **Descripción clara** del resultado
- [ ] **Se desvanecen automáticamente**
- [ ] **Estilo apropiado** (éxito vs error)

### Tabla de Clientes
- [ ] **Actualización inmediata** después de eliminar
- [ ] **Estados visuales correctos** (Activo/Inactivo)
- [ ] **Icono de eliminación** visible en acciones
- [ ] **Hover effects** funcionan correctamente

## 🔍 Verificaciones Técnicas

### Frontend
```javascript
// Verificar en DevTools Console que no hay errores
// Verificar que el estado local se actualiza correctamente
console.log('Clientes actuales:', clientes);
```

### Backend
```bash
# Verificar logs del servidor
# Buscar mensajes como:
# "✅ Cliente [nombre] desactivado (soft delete)"
# "✅ Cliente [nombre] eliminado completamente"
```

### Base de Datos
```sql
-- Verificar estado de clientes de prueba
SELECT id_cliente, codigo, nombre, activo 
FROM CLIENTE 
WHERE codigo LIKE 'TEST%';

-- Verificar visitas asociadas
SELECT c.nombre, COUNT(v.id_visita) as total_visitas
FROM CLIENTE c
LEFT JOIN VISITA v ON c.id_cliente = v.id_cliente
WHERE c.codigo LIKE 'TEST%'
GROUP BY c.id_cliente, c.nombre;
```

## 📊 Resultados Esperados

### Comportamiento Correcto

| Escenario | Input | Proceso | Output | DB Result |
|-----------|-------|---------|--------|-----------|
| Sin visitas | Eliminar cliente nuevo | Hard Delete | Toast "eliminado" | Registro removido |
| Con visitas | Eliminar cliente usado | Soft Delete | Toast "desactivado" | `activo = false` |
| Cancelar | Cancelar diálogo | Sin acción | Sin toast | Sin cambios |

### Mensajes de Error Esperados

- **Error de conexión**: "No se pudo conectar con el servidor"
- **Cliente no encontrado**: "Cliente no encontrado"
- **Error general**: "Error al eliminar cliente"

## ✅ Checklist de Funcionalidad

- [ ] AlertDialog se abre correctamente
- [ ] Información mostrada es clara y precisa
- [ ] Eliminación física funciona (clientes sin visitas)
- [ ] Eliminación lógica funciona (clientes con visitas)
- [ ] Notificaciones toast aparecen
- [ ] Tabla se actualiza inmediatamente
- [ ] Botón cancelar funciona
- [ ] Manejo de errores funciona
- [ ] Tema oscuro compatible
- [ ] Responsivo en móviles

## 🎯 Casos Edge a Probar

1. **Conexión lenta**: Verificar spinners/loading states
2. **Múltiples eliminaciones rápidas**: No debe causar inconsistencias
3. **Eliminación mientras se edita**: Debe manejar conflictos
4. **Refresh de página**: Estado debe persistir correctamente

## 📝 Notas de Testing

- La funcionalidad preserva **integridad referencial**
- Los **datos históricos** nunca se pierden
- La **experiencia de usuario** es transparente e informativa
- El **comportamiento** es consistente en todo el sistema

---

**✅ Estado**: Listo para testing
**🕒 Tiempo estimado**: 15-20 minutos
**👥 Requerimientos**: Acceso a admin panel + datos de prueba
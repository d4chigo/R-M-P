# Debug: Problema de Fechas entre Backend y Frontend

## Problema Identificado
Las fechas en la interfaz web muestran `15/8/2025` mientras que en la base de datos aparecen como `2025-08-16`. Hay una diferencia de un día.

## Diagnóstico Paso a Paso

### 1. Verificar que Backend envíe fechas como strings YYYY-MM-DD

**Test Backend:**
```bash
# Verificar que el servidor esté corriendo
curl -X GET "http://localhost:4000/api/reportes/resumen-rutas?fecha=2025-08-16" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "Fecha": "2025-08-16",  // <- Debe ser string, no Date object
      "Placa": "ABC-123",
      "Vehiculo": "Hyundai HD78",
      // ... otros campos
    }
  ]
}
```

### 2. Verificar función formatDate en Frontend

**Test en consola del navegador:**
```javascript
// Función actual del frontend
const formatDate = (dateString) => {
  if (!dateString) return "";
  
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Tests
console.log("Test 1:", formatDate("2025-08-16")); // Debería mostrar: 16/08/2025
console.log("Test 2:", formatDate("2025-08-15")); // Debería mostrar: 15/08/2025
console.log("Test 3:", formatDate("2025-01-16")); // Debería mostrar: 16/01/2025
```

### 3. Verificar configuración de MySQL

**Ejecutar en MySQL:**
```sql
-- Verificar zona horaria del servidor
SELECT @@global.time_zone, @@session.time_zone;

-- Verificar datos reales en la vista
SELECT 
  Fecha,
  DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha_Formateada,
  Placa,
  Vehiculo,
  Repartidor
FROM v_resumen_rutas 
WHERE DATE(Fecha) = '2025-08-16'
LIMIT 5;

-- Verificar tipo de datos de la columna Fecha
DESCRIBE v_resumen_rutas;
```

### 4. Test de Zona Horaria en JavaScript

**En consola del navegador:**
```javascript
// Verificar zona horaria del navegador
console.log("Zona horaria:", Intl.DateTimeFormat().resolvedOptions().timeZone);

// Test de conversión de fechas
const testDate = "2025-08-16";
console.log("String original:", testDate);
console.log("Como Date object:", new Date(testDate));
console.log("ISO String:", new Date(testDate).toISOString());
console.log("Local date string:", new Date(testDate).toLocaleDateString());
console.log("Con zona Lima:", new Date(testDate).toLocaleDateString("es-PE", {timeZone: "America/Lima"}));
```

## Checklist de Verificación

### ✅ Backend Fixes Applied:
- [ ] `DATE_FORMAT(Fecha, '%Y-%m-%d')` en queries SQL
- [ ] Función `processResponseData()` agregada
- [ ] Función `formatDateForResponse()` implementada
- [ ] Logs de debug habilitados

### ✅ Frontend Fixes Applied:
- [ ] Función `formatDate()` simplificada
- [ ] Eliminada dependencia de zona horaria
- [ ] Títulos dinámicos basados en filtros
- [ ] useEffect con dependencias correctas

## Comandos de Debug

### 1. Verificar logs del backend:
```bash
# En el directorio del servidor
tail -f logs/server.log | grep "Fecha"
```

### 2. Test de API directa:
```bash
# Reemplazar TOKEN con tu token de autenticación real
curl -v "http://localhost:4000/api/reportes/resumen-rutas?fecha=2025-08-16" \
  -H "Authorization: Bearer TOKEN" | jq '.data[0].Fecha'
```

### 3. Test en navegador:
```javascript
// En DevTools -> Console
fetch('/api/reportes/resumen-rutas?fecha=2025-08-16', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log("Tipo de Fecha:", typeof data.data[0]?.Fecha);
  console.log("Valor de Fecha:", data.data[0]?.Fecha);
  console.log("Formato aplicado:", formatDate(data.data[0]?.Fecha));
});
```

## Solución Definitiva

### Cambios en Backend (`reportes.controller.js`):
```javascript
// En todas las queries, usar DATE_FORMAT
SELECT DATE_FORMAT(Fecha, '%Y-%m-%d') as Fecha, ...

// Función para procesar respuestas
const processResponseData = (data) => {
  // Asegurar que las fechas sean strings YYYY-MM-DD
  if (Array.isArray(data)) {
    return data.map(item => {
      if (item.Fecha instanceof Date) {
        item.Fecha = item.Fecha.toISOString().split('T')[0];
      }
      return item;
    });
  }
  return data;
};
```

### Cambios en Frontend (`page.tsx`):
```javascript
const formatDate = (dateString) => {
  if (!dateString) return "";
  
  // Parsear YYYY-MM-DD directamente
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  
  return dateString; // Fallback
};
```

## Expected Result

Después de aplicar estos cambios:

**Input del backend:** `"2025-08-16"` (string)
**Output del frontend:** `"16/08/2025"` (string formateado)

**NO MÁS:**
- Conversiones de Date objects
- Problemas de zona horaria  
- Diferencias de un día
- Inconsistencias entre filtro y datos

El problema debería estar completamente resuelto.
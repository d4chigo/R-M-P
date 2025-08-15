# TEST RÁPIDO - COMPONENTE SELECT

## Problema Resuelto
**Error**: "A Select Item must have a value prop that is not an empty string"

## Solución Aplicada
1. ✅ Eliminado `<SelectItem value="">Sin especificar</SelectItem>`
2. ✅ Cambiado `tipo_viaje: ""` por `tipo_viaje: undefined`
3. ✅ Ajustado tipos TypeScript para permitir `string | undefined`
4. ✅ Mejorado manejo del valor en `<Select value={formData.tipo_viaje || undefined}>`

## Pruebas a Realizar

### 1. Abrir Formulario Nuevo
- [ ] Navegar a `/viajes`
- [ ] Hacer clic en "Nuevo Viaje"
- [ ] Verificar que NO aparezca el error en consola
- [ ] Verificar que el Select de "Tipo de Viaje" muestre "Seleccionar tipo"

### 2. Crear Viaje Sin Tipo
- [ ] Llenar campos obligatorios (fecha, vehículo, repartidor, nro_viaje)
- [ ] Dejar "Tipo de Viaje" sin seleccionar
- [ ] Guardar viaje
- [ ] Verificar que se guarde correctamente con `tipo_viaje = NULL` en BD

### 3. Crear Viaje Con Tipo
- [ ] Llenar campos obligatorios
- [ ] Seleccionar un tipo (ej: "Entrega")
- [ ] Guardar viaje
- [ ] Verificar que se guarde con `tipo_viaje = 'ENTREGA'` en BD

### 4. Editar Viaje Sin Tipo
- [ ] Editar un viaje que tiene `tipo_viaje = NULL` en BD
- [ ] Verificar que el Select muestre "Seleccionar tipo" (placeholder)
- [ ] Verificar que NO aparezca error en consola

### 5. Editar Viaje Con Tipo
- [ ] Editar un viaje que tiene `tipo_viaje = 'ENTREGA'` en BD
- [ ] Verificar que el Select muestre "Entrega" seleccionado
- [ ] Verificar que NO aparezca error en consola

## Estados del Select

### Valor Undefined (Sin Seleccionar)
```typescript
formData.tipo_viaje = undefined
// Select muestra: "Seleccionar tipo" (placeholder)
```

### Valor Definido
```typescript
formData.tipo_viaje = "ENTREGA"
// Select muestra: "Entrega" (seleccionado)
```

## Opciones Disponibles
- ENTREGA → "Entrega"
- RECOJO → "Recojo"  
- MIXTO → "Mixto"
- ESPECIAL → "Especial"
- MANTENIMIENTO → "Mantenimiento"
- EMERGENCIA → "Emergencia"

## Comandos de Verificación

### Verificar en BD
```sql
-- Ver tipos de viaje existentes
SELECT DISTINCT tipo_viaje FROM VIAJE;

-- Ver viajes sin tipo
SELECT id_viaje, fecha, tipo_viaje FROM VIAJE WHERE tipo_viaje IS NULL;

-- Ver viajes con tipo
SELECT id_viaje, fecha, tipo_viaje FROM VIAJE WHERE tipo_viaje IS NOT NULL;
```

### Verificar en Consola del Navegador
```javascript
// No debería aparecer:
// "Error: A Select Item must have a value prop that is not an empty string"

// Debería aparecer (logs de debug):
// "🔄 useEffect ejecutado con viaje: ..."
// "📝 Estableciendo datos del formulario: ..."
```

## Resultado Esperado
✅ **ÉXITO**: El formulario se abre sin errores y el Select funciona correctamente tanto para valores undefined como definidos.
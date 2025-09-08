# Sistema de Tutorial Interactivo

Este sistema proporciona una experiencia de tutorial completa y reutilizable para guiar a los usuarios a través de la aplicación.

## Características

- ✅ **Tutorial Interactivo**: Guía paso a paso con highlights visuales
- ✅ **Persistencia**: Recuerda qué tutoriales ha visto el usuario
- ✅ **Reutilizable**: Sistema modular que se puede usar en cualquier página
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla
- ✅ **Accesible**: Navegación con teclado y lectores de pantalla
- ✅ **Personalizable**: Configuración flexible de pasos y comportamiento

## Componentes Principales

### 1. TutorialProvider
Contexto global que maneja el estado del tutorial.

```tsx
import { TutorialProvider } from '@/contexts/TutorialContext';

// Envolver la aplicación
<TutorialProvider>
  <App />
</TutorialProvider>
```

### 2. TutorialTour
Componente que renderiza el tutorial activo.

```tsx
import { TutorialTour } from '@/components/TutorialTour';

// Se incluye automáticamente en el layout
<TutorialTour />
```

### 3. TutorialFloatingButton
Botón flotante para reactivar tutoriales.

```tsx
import { TutorialFloatingButton } from '@/components/TutorialFloatingButton';

// Se incluye automáticamente en el layout
<TutorialFloatingButton />
```

### 4. useTutorial Hook
Hook para interactuar con el sistema de tutorial.

```tsx
import { useTutorial } from '@/contexts/TutorialContext';

const { startTutorial, hasSeenTutorial, resetTutorial } = useTutorial();
```

## Uso Básico

### Crear un Tutorial

```tsx
const tutorialConfig = {
  id: 'mi-tutorial',
  title: 'Tutorial de Mi Página',
  description: 'Aprende a usar esta funcionalidad',
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'paso-1',
      selector: '#mi-elemento',
      title: 'Mi Elemento',
      description: 'Este es el primer paso del tutorial',
      position: 'bottom', // 'top', 'bottom', 'left', 'right'
    },
    // ... más pasos
  ],
};

// Iniciar tutorial
startTutorial(tutorialConfig);
```

### Verificar si el Usuario ha Visto un Tutorial

```tsx
const hasSeen = hasSeenTutorial('mi-tutorial');
if (!hasSeen) {
  // Mostrar tutorial para usuarios nuevos
  startTutorial(tutorialConfig);
}
```

### Reiniciar un Tutorial

```tsx
// Marcar como no visto
resetTutorial('mi-tutorial');

// Ahora se puede mostrar nuevamente
startTutorial(tutorialConfig);
```

## Configuración Avanzada

### Posicionamiento del Tooltip

El sistema calcula automáticamente la mejor posición para el tooltip basándose en el espacio disponible:

```tsx
{
  selector: '#mi-elemento',
  position: 'bottom', // Preferencia, pero se ajusta automáticamente
}
```

### Acciones en Pasos

Puedes ejecutar acciones cuando se llega a un paso específico:

```tsx
{
  id: 'paso-interactivo',
  selector: '#mi-boton',
  title: 'Hacer Clic',
  description: 'Haz clic en este botón para continuar',
  action: () => {
    // Ejecutar acción cuando se llegue a este paso
    document.getElementById('mi-boton')?.click();
  },
}
```

### Auto-inicio para Usuarios Nuevos

```tsx
useEffect(() => {
  const hasSeen = hasSeenTutorial('tutorial-principal');
  if (!hasSeen) {
    const timer = setTimeout(() => {
      startTutorial(tutorialConfig);
    }, 1000); // Delay para asegurar que la página esté cargada
    return () => clearTimeout(timer);
  }
}, []);
```

## Personalización Visual

### Estilos del Highlight

El sistema aplica automáticamente estilos de highlight que se adaptan al tema:

- **Modo Claro**: Borde azul con sombra suave
- **Modo Oscuro**: Borde púrpura con sombra más intensa

### Posicionamiento del Tooltip

El tooltip se posiciona automáticamente para evitar salirse del viewport:

1. Intenta usar la posición preferida
2. Si no hay espacio, cambia a la posición opuesta
3. Ajusta las coordenadas para mantenerse dentro del viewport

## Persistencia

Los tutoriales vistos se guardan en `localStorage` con la clave `rmp-seen-tutorials`:

```json
["tutorial-principal", "tutorial-avanzado"]
```

### Limpiar Persistencia

```tsx
// Reiniciar un tutorial específico
resetTutorial('mi-tutorial');

// O limpiar manualmente desde localStorage
localStorage.removeItem('rmp-seen-tutorials');
```

## Mejores Prácticas

1. **IDs Únicos**: Usa IDs únicos para cada tutorial
2. **Selectores Estables**: Asegúrate de que los selectores CSS sean estables
3. **Pasos Concisos**: Mantén las descripciones claras y concisas
4. **Testing**: Prueba en diferentes tamaños de pantalla
5. **Accesibilidad**: Considera usuarios con discapacidades visuales

## Ejemplo Completo

```tsx
import { useTutorial } from '@/contexts/TutorialContext';

export default function MiPagina() {
  const { startTutorial, hasSeenTutorial } = useTutorial();

  const tutorialConfig = {
    id: 'tutorial-mi-pagina',
    title: 'Bienvenido a Mi Página',
    description: 'Te guiaremos a través de las funcionalidades principales',
    showProgress: true,
    allowSkip: true,
    steps: [
      {
        id: 'header',
        selector: '#page-header',
        title: 'Encabezado',
        description: 'Aquí encontrarás la navegación principal',
        position: 'bottom',
      },
      {
        id: 'formulario',
        selector: '#mi-formulario',
        title: 'Formulario Principal',
        description: 'Completa este formulario para crear un nuevo registro',
        position: 'right',
      },
      {
        id: 'boton-guardar',
        selector: '#btn-guardar',
        title: 'Guardar',
        description: 'Haz clic aquí para guardar tus cambios',
        position: 'top',
        action: () => {
          // Resaltar el botón
          document.getElementById('btn-guardar')?.focus();
        },
      },
    ],
  };

  useEffect(() => {
    if (!hasSeenTutorial('tutorial-mi-pagina')) {
      setTimeout(() => startTutorial(tutorialConfig), 1000);
    }
  }, []);

  return (
    <div>
      <header id="page-header">...</header>
      <form id="mi-formulario">...</form>
      <button id="btn-guardar">Guardar</button>
    </div>
  );
}
```

## Solución de Problemas

### El Tutorial No Aparece

1. Verifica que el selector CSS sea correcto
2. Asegúrate de que el elemento exista en el DOM
3. Comprueba que el TutorialProvider esté envolviendo la aplicación

### Posicionamiento Incorrecto

1. El sistema ajusta automáticamente la posición
2. Verifica que haya suficiente espacio en el viewport
3. Considera usar `position: 'bottom'` como fallback

### Persistencia No Funciona

1. Verifica que localStorage esté disponible
2. Comprueba la consola por errores de JavaScript
3. Asegúrate de usar el mismo ID del tutorial

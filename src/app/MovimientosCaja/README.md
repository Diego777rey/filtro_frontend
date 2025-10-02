# Módulo Movimientos de Caja

Este módulo implementa la gestión de movimientos de caja siguiendo el patrón del módulo Personas, con funcionalidades específicas para el manejo de ventas y aprobaciones por parte del cajero.

## Características Principales

### 1. Gestión de Movimientos de Caja
- **CRUD completo**: Crear, leer, actualizar y eliminar movimientos de caja
- **Tabla paginada**: Visualización eficiente de grandes volúmenes de datos
- **Búsqueda en tiempo real**: Filtrado por descripción, tipo, caja, etc.
- **Formulario reactivo**: Validaciones en tiempo real y manejo de errores

### 2. Aprobación de Ventas
- **Ventas pendientes**: Vista específica para ventas que requieren aprobación del cajero
- **Aceptar/Cancelar**: El cajero puede aprobar o rechazar ventas
- **Integración automática**: Al aceptar una venta, se crea automáticamente un movimiento de caja

### 3. Funcionalidades Técnicas
- **GraphQL**: Integración completa con el backend GraphQL
- **RxJS**: Manejo reactivo de datos con operadores avanzados
- **Material Design**: UI moderna y consistente
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Optimización**: Evita duplicación de código y sigue mejores prácticas

## Estructura del Módulo

```
MovimientosCaja/
├── components/
│   ├── movimiento-caja.ts          # Interfaces TypeScript
│   └── movimiento-caja.service.ts  # Servicio con métodos CRUD
├── page/
│   ├── movimientos-caja/           # Componente principal
│   ├── formulario-movimientos/     # Formulario CRUD
│   └── ventas-pendientes/          # Gestión de ventas
├── movimientos-caja.module.ts      # Configuración del módulo
├── movimientos-caja-routing.module.ts # Rutas
└── README.md                       # Esta documentación
```

## Uso del Módulo

### Navegación
- `/movimientos-caja` - Lista principal de movimientos
- `/movimientos-caja/nuevo` - Crear nuevo movimiento
- `/movimientos-caja/editar/:id` - Editar movimiento existente
- `/movimientos-caja/ventas-pendientes` - Gestionar ventas pendientes

### Flujo de Trabajo
1. **Vendedor crea venta** → Venta queda en estado "PENDIENTE"
2. **Venta llega a caja** → Aparece en "Ventas Pendientes"
3. **Cajero revisa** → Puede ver detalles de cliente, vendedor, productos
4. **Cajero decide** → Acepta (crea movimiento de caja) o Cancela la venta

## Interfaces TypeScript

### MovimientoCaja
```typescript
interface MovimientoCaja {
  id?: number;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  fecha: string;
  descripcion?: string;
  caja?: { id: number; nombre: string };
  venta?: { id: number; total: number; estado: string };
}
```

### Venta
```typescript
interface Venta {
  id?: number;
  total: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA';
  cliente?: { id: number; nombre: string; apellido: string };
  vendedor?: { id: number; nombre: string; apellido: string };
  items?: Array<{
    id: number;
    cantidad: number;
    precio: number;
    producto: { id: number; nombre: string };
  }>;
}
```

## Servicios GraphQL

El módulo utiliza las siguientes operaciones GraphQL:

### Queries
- `GET_MOVIMIENTOS_CAJA` - Obtener todos los movimientos
- `GET_MOVIMIENTO_CAJA_BY_ID` - Obtener movimiento específico
- `GET_MOVIMIENTOS_CAJA_PAGINADOS` - Paginación y búsqueda
- `GET_VENTAS_PENDIENTES` - Ventas que requieren aprobación

### Mutations
- `CREATE_MOVIMIENTO_CAJA` - Crear nuevo movimiento
- `UPDATE_MOVIMIENTO_CAJA` - Actualizar movimiento
- `DELETE_MOVIMIENTO_CAJA` - Eliminar movimiento
- `ACEPTAR_VENTA` - Aprobar venta y crear movimiento
- `CANCELAR_VENTA` - Cancelar venta

## Mejores Prácticas Implementadas

1. **Reutilización de Código**: Sigue el patrón del módulo Personas
2. **Manejo de Errores**: Centralizado y consistente
3. **Performance**: Lazy loading y paginación
4. **UX**: Loading states, validaciones, mensajes informativos
5. **Accesibilidad**: Etiquetas, tooltips, navegación por teclado
6. **Responsive**: Adaptable a móviles y tablets

## Dependencias

- Angular Material (UI components)
- Apollo GraphQL (comunicación con backend)
- RxJS (programación reactiva)
- Angular Forms (formularios reactivos)

## Configuración

El módulo está configurado para:
- Inyección de dependencias
- Lazy loading
- Material Design theming
- Responsive breakpoints
- Error handling global

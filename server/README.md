# Sistema de Gestión de Puntos de Recolección de Residuos

## Descripción
API REST para la gestión automatizada de diferentes tipos de puntos de recolección de residuos. Este sistema resuelve el problema de actualización manual que tenían los administradores, automatizando el proceso de registro, actualización y consulta de puntos de recolección.

## Tipos de Puntos de Recolección

1. **Contenedores de Basura**: Instalados en parques, esquinas, etc.
2. **Puntos de Reciclaje**: Contenedores diferenciados o pequeños puntos de recolección
3. **Residuos Voluminosos**: Puntos fijos o móviles
4. **Residuos Peligrosos**: Puntos fijos, móviles o centros de acopio
5. **Residuos Orgánicos**: Puntos fijos o móviles
6. **Residuos Electrónicos**: Puntos fijos o móviles
7. **Residuos Textiles**: Puntos fijos o móviles
8. **Residuos Peligrosos Especiales**: Puntos fijos, móviles o centros de acopio
9. **Puntos Críticos**: Lugares con acumulación frecuente de basura

## Estados Disponibles
- `activo`: Punto funcionando normalmente
- `dañado`: Punto que necesita reparación
- `retirado`: Punto removido
- `en_mantenimiento`: Punto en proceso de mantenimiento

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Instalación
```bash
npm install
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```

### Ejecutar en producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### 1. Health Check
```
GET /api/health
```
Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente",
  "timestamp": "2025-07-03T10:00:00.000Z"
}
```

### 2. Obtener todos los puntos de recolección
```
GET /api/puntos-recoleccion
```

**Parámetros de consulta opcionales:**
- `tipo`: Filtrar por tipo de punto
- `estado`: Filtrar por estado
- `subtipo`: Filtrar por subtipo

**Ejemplo:**
```
GET /api/puntos-recoleccion?tipo=reciclaje&estado=activo
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pr-001",
      "direccion": "Av. Principal 123, Parque Central",
      "tipo": "contenedor_basura",
      "subtipo": "fijo",
      "estado": "activo",
      "observaciones": "",
      "fechaCreacion": "2025-01-15T10:00:00Z",
      "fechaActualizacion": "2025-01-15T10:00:00Z",
      "coordenadas": {
        "latitud": -0.1807,
        "longitud": -78.4678
      }
    }
  ],
  "total": 1
}
```

### 3. Obtener un punto específico
```
GET /api/puntos-recoleccion/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "pr-001",
    "direccion": "Av. Principal 123, Parque Central",
    "tipo": "contenedor_basura",
    "subtipo": "fijo",
    "estado": "activo",
    "observaciones": "",
    "fechaCreacion": "2025-01-15T10:00:00Z",
    "fechaActualizacion": "2025-01-15T10:00:00Z",
    "coordenadas": {
      "latitud": -0.1807,
      "longitud": -78.4678
    }
  }
}
```

### 4. Crear un nuevo punto de recolección
```
POST /api/puntos-recoleccion
```

**Cuerpo de la petición:**
```json
{
  "direccion": "Calle Nueva 123",
  "tipo": "reciclaje",
  "subtipo": "contenedores_diferenciados",
  "estado": "activo",
  "observaciones": "Contenedores nuevos instalados",
  "coordenadas": {
    "latitud": -0.1800,
    "longitud": -78.4680
  }
}
```

**Campos obligatorios:**
- `direccion`: Dirección del punto
- `tipo`: Tipo de punto (debe ser uno de los tipos válidos)

**Campos opcionales:**
- `subtipo`: Se asigna automáticamente el primer subtipo válido si no se especifica
- `estado`: Por defecto es "activo"
- `observaciones`: Notas adicionales
- `coordenadas`: Ubicación GPS
- `usuario`: Usuario que crea el punto (por defecto "sistema")

**Nota:** Al crear un punto, se registra automáticamente en el historial.

### 5. Actualizar un punto de recolección
```
PUT /api/puntos-recoleccion/:id
```

**Cuerpo de la petición (todos los campos son opcionales):**
```json
{
  "estado": "dañado",
  "observaciones": "Contenedor vandalizado, requiere reparación",
  "usuario": "admin"
}
```

**Respuesta incluye cambios detectados:**
```json
{
  "success": true,
  "data": {
    "id": "pr-001",
    "estado": "dañado",
    "fechaActualizacion": "2025-07-03T10:30:00Z"
  },
  "cambios": [
    {
      "campo": "estado",
      "valorAnterior": "activo",
      "valorNuevo": "dañado"
    }
  ],
  "message": "Punto de recolección actualizado exitosamente. 1 cambio(s) registrado(s)."
}
```

### 6. Eliminar un punto de recolección
```
DELETE /api/puntos-recoleccion/:id
```

### 7. Obtener tipos de punto disponibles
```
GET /api/tipos-punto
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "contenedor_basura": {
      "nombre": "Contenedores de Basura",
      "descripcion": "Contenedores instalados en parques, esquinas, etc.",
      "subtipos": ["fijo"]
    },
    "reciclaje": {
      "nombre": "Puntos de Reciclaje",
      "descripcion": "Contenedores diferenciados o pequeños puntos de recolección",
      "subtipos": ["contenedores_diferenciados", "punto_pequeño"]
    }
  }
}
```

### 8. Obtener estados disponibles
```
GET /api/estados
```

**Respuesta:**
```json
{
  "success": true,
  "data": ["activo", "dañado", "retirado", "en_mantenimiento"]
}
```

### 9. Obtener estadísticas
```
GET /api/estadisticas
```

### 10. Obtener historial completo
```
GET /api/historial
```

**Parámetros de consulta opcionales:**
- `puntoId`: Filtrar por ID de punto
- `tipoAccion`: Filtrar por tipo de acción (creacion, actualizacion, eliminacion)
- `usuario`: Filtrar por usuario que realizó el cambio
- `fechaDesde`: Filtrar desde una fecha específica (ISO 8601)
- `fechaHasta`: Filtrar hasta una fecha específica (ISO 8601)

**Ejemplo:**
```
GET /api/historial?puntoId=pr-001&tipoAccion=actualizacion
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "h-001",
      "puntoId": "pr-003",
      "fechaCambio": "2025-02-15T16:45:00Z",
      "tipoAccion": "actualizacion",
      "campo": "estado",
      "valorAnterior": "activo",
      "valorNuevo": "dañado",
      "observaciones": "Contenedor vandalizado, requiere reparación",
      "usuario": "admin"
    }
  ],
  "total": 1
}
```

### 11. Obtener historial de un punto específico
```
GET /api/puntos-recoleccion/:id/historial
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "punto": {
      "id": "pr-001",
      "direccion": "Av. Principal 123, Parque Central",
      "tipo": "contenedor_basura",
      "estado": "activo"
    },
    "historial": [
      {
        "id": "h-002",
        "puntoId": "pr-001",
        "fechaCambio": "2025-07-03T10:00:00Z",
        "tipoAccion": "creacion",
        "campo": "punto_completo",
        "valorAnterior": null,
        "valorNuevo": { "..." },
        "observaciones": "Punto de recolección creado",
        "usuario": "admin"
      }
    ]
  },
  "total": 1
}

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 4,
    "porTipo": {
      "contenedor_basura": 1,
      "reciclaje": 1,
      "residuos_voluminosos": 1,
      "punto_critico": 1
    },
    "porEstado": {
      "activo": 3,
      "dañado": 1
    },
    "porSubtipo": {
      "fijo": 1,
      "contenedores_diferenciados": 1,
      "movil": 1,
      "acumulacion_frecuente": 1
    }
  }
}
```

## Gestión de Historial

### Funcionalidades del Historial
- **Registro automático**: Todos los cambios se registran automáticamente
- **Trazabilidad completa**: Se guarda qué cambió, cuándo y quién lo hizo
- **Detección inteligente**: Solo se registran los campos que realmente cambiaron
- **Consultas flexibles**: Múltiples opciones de filtrado

### Tipos de Acciones
- `creacion`: Cuando se crea un nuevo punto
- `actualizacion`: Cuando se modifica un punto existente
- `eliminacion`: Cuando se elimina un punto

### Campos Registrados en el Historial
- `id`: ID único del registro de historial
- `puntoId`: ID del punto que fue modificado
- `fechaCambio`: Timestamp del cambio
- `tipoAccion`: Tipo de acción realizada
- `campo`: Campo específico que cambió
- `valorAnterior`: Valor antes del cambio
- `valorNuevo`: Valor después del cambio
- `observaciones`: Comentarios adicionales
- `usuario`: Usuario que realizó el cambio

## Beneficios del Sistema de Historial

1. **Auditoría Completa**: Registro detallado de todos los cambios
2. **Responsabilidad**: Identificación del usuario que realizó cada cambio
3. **Recuperación**: Posibilidad de ver estados anteriores
4. **Análisis**: Estadísticas sobre patrones de cambio
5. **Cumplimiento**: Trazabilidad para auditorías externas

## Validaciones

### Tipos y Subtipos
El sistema valida que:
- El tipo de punto sea válido según la configuración
- El subtipo corresponda al tipo seleccionado
- Si no se especifica subtipo, asigna el primero disponible

### Estados
Solo se permiten los estados definidos en la configuración.

### Campos Obligatorios
- `direccion`: Requerida para crear un punto
- `tipo`: Requerido para crear un punto

## Manejo de Errores

Todos los endpoints devuelven respuestas consistentes:

**Éxito:**
```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

**Códigos de estado HTTP:**
- `200`: Operación exitosa
- `201`: Recurso creado
- `400`: Error en los datos enviados
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Estructura de Datos

### Punto de Recolección
```json
{
  "id": "string",              // ID único generado automáticamente
  "direccion": "string",       // Dirección del punto
  "tipo": "string",           // Tipo de punto
  "subtipo": "string",        // Subtipo específico
  "estado": "string",         // Estado actual
  "observaciones": "string",  // Notas adicionales
  "fechaCreacion": "string",  // ISO timestamp
  "fechaActualizacion": "string", // ISO timestamp
  "coordenadas": {
    "latitud": "number",
    "longitud": "number"
  }
}
```

## Ejemplos de Uso

### Crear un punto de reciclaje
```bash
curl -X POST http://localhost:3000/api/puntos-recoleccion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Av. Amazonas 1234",
    "tipo": "reciclaje",
    "subtipo": "contenedores_diferenciados",
    "coordenadas": {
      "latitud": -0.1850,
      "longitud": -78.4700
    }
  }'
```

### Actualizar estado de un punto
```bash
curl -X PUT http://localhost:3000/api/puntos-recoleccion/pr-001 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "en_mantenimiento",
    "observaciones": "Mantenimiento programado"
  }'
```

### Obtener puntos por tipo
```bash
curl "http://localhost:3000/api/puntos-recoleccion?tipo=residuos_electronicos"
```

### Consultar historial de cambios
```bash
# Historial completo
curl "http://localhost:3000/api/historial"

# Historial de un punto específico
curl "http://localhost:3000/api/puntos-recoleccion/pr-001/historial"

# Historial filtrado por tipo de acción
curl "http://localhost:3000/api/historial?tipoAccion=actualizacion"

# Historial filtrado por usuario
curl "http://localhost:3000/api/historial?usuario=admin"

# Historial filtrado por fechas
curl "http://localhost:3000/api/historial?fechaDesde=2025-07-01T00:00:00Z&fechaHasta=2025-07-03T23:59:59Z"
```

### Ejemplo de flujo completo con historial
```bash
# 1. Crear un punto (se registra en historial automáticamente)
curl -X POST http://localhost:3000/api/puntos-recoleccion \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Av. Amazonas 1234",
    "tipo": "reciclaje",
    "usuario": "admin"
  }'

# 2. Actualizar el punto (cambios se registran automáticamente)
curl -X PUT http://localhost:3000/api/puntos-recoleccion/pr-XXX \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "en_mantenimiento",
    "observaciones": "Mantenimiento programado",
    "usuario": "tecnico"
  }'

# 3. Consultar el historial del punto
curl "http://localhost:3000/api/puntos-recoleccion/pr-XXX/historial"
```

## Beneficios del Sistema

1. **Automatización**: Elimina la necesidad de tachar y escribir manualmente
2. **Trazabilidad**: Registro automático de fechas de creación y actualización
3. **Validación**: Previene errores en tipos y estados
4. **Filtrado**: Búsqueda eficiente por diferentes criterios
5. **Estadísticas**: Información consolidada en tiempo real
6. **API REST**: Fácil integración con aplicaciones web y móviles

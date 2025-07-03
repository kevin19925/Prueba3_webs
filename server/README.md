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

### 5. Actualizar un punto de recolección
```
PUT /api/puntos-recoleccion/:id
```

**Cuerpo de la petición (todos los campos son opcionales):**
```json
{
  "estado": "dañado",
  "observaciones": "Contenedor vandalizado, requiere reparación"
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

## Beneficios del Sistema

1. **Automatización**: Elimina la necesidad de tachar y escribir manualmente
2. **Trazabilidad**: Registro automático de fechas de creación y actualización
3. **Validación**: Previene errores en tipos y estados
4. **Filtrado**: Búsqueda eficiente por diferentes criterios
5. **Estadísticas**: Información consolidada en tiempo real
6. **API REST**: Fácil integración con aplicaciones web y móviles

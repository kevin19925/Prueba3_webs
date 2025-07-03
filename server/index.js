const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Función para leer la base de datos
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer la base de datos:', error);
        return { puntosRecoleccion: [], tiposPunto: {}, estados: [] };
    }
}

// Función para escribir en la base de datos
function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error al escribir en la base de datos:', error);
        return false;
    }
}

// Función para generar ID único para historial
function generateHistorialId() {
    return 'h-' + uuidv4().substring(0, 8);
}

// Función para registrar cambio en el historial
function registrarCambio(puntoId, tipoAccion, campo, valorAnterior, valorNuevo, observaciones, usuario = 'sistema') {
    const db = readDB();
    
    const cambio = {
        id: generateHistorialId(),
        puntoId: puntoId,
        fechaCambio: new Date().toISOString(),
        tipoAccion: tipoAccion, // 'creacion', 'actualizacion', 'eliminacion'
        campo: campo,
        valorAnterior: valorAnterior,
        valorNuevo: valorNuevo,
        observaciones: observaciones || '',
        usuario: usuario
    };
    
    db.historialPuntos.push(cambio);
    writeDB(db);
    return cambio;
}

// Función para comparar objetos y detectar cambios
function detectarCambios(objetoAnterior, objetoNuevo) {
    const cambios = [];
    const campos = ['direccion', 'tipo', 'subtipo', 'estado', 'observaciones', 'coordenadas'];
    
    campos.forEach(campo => {
        const valorAnterior = objetoAnterior[campo];
        const valorNuevo = objetoNuevo[campo];
        
        if (campo === 'coordenadas') {
            // Comparación especial para coordenadas
            if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
                cambios.push({
                    campo: campo,
                    valorAnterior: valorAnterior,
                    valorNuevo: valorNuevo
                });
            }
        } else if (valorAnterior !== valorNuevo) {
            cambios.push({
                campo: campo,
                valorAnterior: valorAnterior,
                valorNuevo: valorNuevo
            });
        }
    });
    
    return cambios;
}

// Función para generar ID único
function generateId() {
    return 'pr-' + uuidv4().substring(0, 8);
}

// Middleware para validar tipos de punto
function validateTipoPunto(req, res, next) {
    const db = readDB();
    const { tipo, subtipo } = req.body;
    
    if (!tipo) {
        return next(); // Si no hay tipo, se valida en el endpoint
    }
    
    const tipoInfo = db.tiposPunto.find(t => t.id === tipo);
    if (!tipoInfo) {
        return res.status(400).json({
            error: 'Tipo de punto inválido',
            tiposDisponibles: db.tiposPunto.map(t => ({ id: t.id, nombre: t.nombre }))
        });
    }
    
    if (subtipo && !tipoInfo.subtipos.includes(subtipo)) {
        return res.status(400).json({
            error: 'Subtipo inválido para este tipo de punto',
            subtiposDisponibles: tipoInfo.subtipos
        });
    }
    
    next();
}

// Middleware para validar estado
function validateEstado(req, res, next) {
    const db = readDB();
    const { estado } = req.body;
    
    if (!estado) {
        return next(); // Si no hay estado, se usa el valor por defecto
    }
    
    const estadoValido = db.estados.find(e => e.id === estado);
    if (!estadoValido) {
        return res.status(400).json({
            error: 'Estado inválido',
            estadosDisponibles: db.estados.map(e => ({ id: e.id, nombre: e.nombre }))
        });
    }
    
    next();
}

// RUTAS

// Obtener todos los puntos de recolección
app.get('/api/puntos-recoleccion', (req, res) => {
    try {
        const db = readDB();
        const { tipo, estado, subtipo } = req.query;
        
        let puntos = db.puntosRecoleccion;
        
        // Filtros opcionales
        if (tipo) {
            puntos = puntos.filter(p => p.tipo === tipo);
        }
        if (estado) {
            puntos = puntos.filter(p => p.estado === estado);
        }
        if (subtipo) {
            puntos = puntos.filter(p => p.subtipo === subtipo);
        }
        
        res.json({
            success: true,
            data: puntos,
            total: puntos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener un punto específico por ID
app.get('/api/puntos-recoleccion/:id', (req, res) => {
    try {
        const db = readDB();
        const punto = db.puntosRecoleccion.find(p => p.id === req.params.id);
        
        if (!punto) {
            return res.status(404).json({
                success: false,
                error: 'Punto de recolección no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: punto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Crear un nuevo punto de recolección
app.post('/api/puntos-recoleccion', validateTipoPunto, validateEstado, (req, res) => {
    try {
        const db = readDB();
        const {
            direccion,
            tipo,
            subtipo,
            estado = 'activo',
            observaciones = '',
            coordenadas,
            usuario = 'sistema'
        } = req.body;
        
        // Validar campos obligatorios
        if (!direccion || !tipo) {
            return res.status(400).json({
                success: false,
                error: 'Los campos dirección y tipo son obligatorios'
            });
        }
        
        // Obtener el subtipo por defecto si no se proporciona
        const tipoInfo = db.tiposPunto.find(t => t.id === tipo);
        const subtipoFinal = subtipo || (tipoInfo ? tipoInfo.subtipos[0] : 'fijo');
        
        // Crear nuevo punto
        const nuevoPunto = {
            id: generateId(),
            direccion,
            tipo,
            subtipo: subtipoFinal,
            estado,
            observaciones,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            coordenadas: coordenadas || { latitud: null, longitud: null }
        };
        
        db.puntosRecoleccion.push(nuevoPunto);
        
        // Registrar en el historial
        registrarCambio(
            nuevoPunto.id,
            'creacion',
            'punto_completo',
            null,
            nuevoPunto,
            `Punto de recolección creado: ${direccion}`,
            usuario
        );
        
        if (writeDB(db)) {
            res.status(201).json({
                success: true,
                data: nuevoPunto,
                message: 'Punto de recolección creado exitosamente'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error al guardar el punto de recolección'
            });
        }
    } catch (error) {
        console.error('Error en POST /api/puntos-recoleccion:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Actualizar un punto de recolección
app.put('/api/puntos-recoleccion/:id', validateTipoPunto, validateEstado, (req, res) => {
    try {
        const db = readDB();
        const puntoIndex = db.puntosRecoleccion.findIndex(p => p.id === req.params.id);
        
        if (puntoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Punto de recolección no encontrado'
            });
        }
        
        const puntoActual = { ...db.puntosRecoleccion[puntoIndex] };
        const {
            direccion,
            tipo,
            subtipo,
            estado,
            observaciones,
            coordenadas,
            usuario = 'sistema'
        } = req.body;
        
        // Crear el objeto actualizado
        const puntoActualizado = {
            ...puntoActual,
            direccion: direccion !== undefined ? direccion : puntoActual.direccion,
            tipo: tipo !== undefined ? tipo : puntoActual.tipo,
            subtipo: subtipo !== undefined ? subtipo : puntoActual.subtipo,
            estado: estado !== undefined ? estado : puntoActual.estado,
            observaciones: observaciones !== undefined ? observaciones : puntoActual.observaciones,
            coordenadas: coordenadas !== undefined ? coordenadas : puntoActual.coordenadas,
            fechaActualizacion: new Date().toISOString()
        };
        
        // Detectar cambios
        const cambios = detectarCambios(puntoActual, puntoActualizado);
        
        // Registrar cada cambio en el historial
        cambios.forEach(cambio => {
            registrarCambio(
                puntoActual.id,
                'actualizacion',
                cambio.campo,
                cambio.valorAnterior,
                cambio.valorNuevo,
                observaciones || `Campo ${cambio.campo} actualizado`,
                usuario
            );
        });
        
        // Actualizar el punto en la base de datos
        db.puntosRecoleccion[puntoIndex] = puntoActualizado;
        
        if (writeDB(db)) {
            res.json({
                success: true,
                data: puntoActualizado,
                cambios: cambios,
                message: `Punto de recolección actualizado exitosamente. ${cambios.length} cambio(s) registrado(s).`
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar el punto de recolección'
            });
        }
    } catch (error) {
        console.error('Error en PUT /api/puntos-recoleccion/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Eliminar un punto de recolección
app.delete('/api/puntos-recoleccion/:id', (req, res) => {
    try {
        const db = readDB();
        const puntoIndex = db.puntosRecoleccion.findIndex(p => p.id === req.params.id);
        
        if (puntoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Punto de recolección no encontrado'
            });
        }
        
        const puntoEliminado = db.puntosRecoleccion.splice(puntoIndex, 1)[0];
        const { usuario = 'sistema' } = req.body;
        
        // Registrar eliminación en el historial
        registrarCambio(
            puntoEliminado.id,
            'eliminacion',
            'punto_completo',
            puntoEliminado,
            null,
            `Punto de recolección eliminado: ${puntoEliminado.direccion}`,
            usuario
        );
        
        if (writeDB(db)) {
            res.json({
                success: true,
                data: puntoEliminado,
                message: 'Punto de recolección eliminado exitosamente'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error al eliminar el punto de recolección'
            });
        }
    } catch (error) {
        console.error('Error en DELETE /api/puntos-recoleccion/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener historial completo
app.get('/api/historial', (req, res) => {
    try {
        const db = readDB();
        const { puntoId, tipoAccion, usuario, fechaDesde, fechaHasta } = req.query;
        
        let historial = db.historialPuntos;
        
        // Filtros opcionales
        if (puntoId) {
            historial = historial.filter(h => h.puntoId === puntoId);
        }
        if (tipoAccion) {
            historial = historial.filter(h => h.tipoAccion === tipoAccion);
        }
        if (usuario) {
            historial = historial.filter(h => h.usuario === usuario);
        }
        if (fechaDesde) {
            historial = historial.filter(h => new Date(h.fechaCambio) >= new Date(fechaDesde));
        }
        if (fechaHasta) {
            historial = historial.filter(h => new Date(h.fechaCambio) <= new Date(fechaHasta));
        }
        
        // Ordenar por fecha descendente (más reciente primero)
        historial.sort((a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio));
        
        res.json({
            success: true,
            data: historial,
            total: historial.length
        });
    } catch (error) {
        console.error('Error en GET /api/historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener historial de un punto específico
app.get('/api/puntos-recoleccion/:id/historial', (req, res) => {
    try {
        const db = readDB();
        const puntoId = req.params.id;
        
        // Verificar que el punto existe
        const punto = db.puntosRecoleccion.find(p => p.id === puntoId);
        if (!punto) {
            return res.status(404).json({
                success: false,
                error: 'Punto de recolección no encontrado'
            });
        }
        
        const historial = db.historialPuntos
            .filter(h => h.puntoId === puntoId)
            .sort((a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio));
        
        res.json({
            success: true,
            data: {
                punto: punto,
                historial: historial
            },
            total: historial.length
        });
    } catch (error) {
        console.error('Error en GET /api/puntos-recoleccion/:id/historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener tipos de punto disponibles
app.get('/api/tipos-punto', (req, res) => {
    try {
        const db = readDB();
        res.json({
            success: true,
            data: db.tiposPunto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener estados disponibles
app.get('/api/estados', (req, res) => {
    try {
        const db = readDB();
        res.json({
            success: true,
            data: db.estados
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
    try {
        const db = readDB();
        const puntos = db.puntosRecoleccion;
        
        const estadisticas = {
            total: puntos.length,
            porTipo: {},
            porEstado: {},
            porSubtipo: {}
        };
        
        puntos.forEach(punto => {
            // Por tipo
            estadisticas.porTipo[punto.tipo] = (estadisticas.porTipo[punto.tipo] || 0) + 1;
            
            // Por estado
            estadisticas.porEstado[punto.estado] = (estadisticas.porEstado[punto.estado] || 0) + 1;
            
            // Por subtipo
            estadisticas.porSubtipo[punto.subtipo] = (estadisticas.porSubtipo[punto.subtipo] || 0) + 1;
        });
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

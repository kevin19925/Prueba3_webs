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

// Función para generar ID único
function generateId() {
    return 'pr-' + uuidv4().substring(0, 8);
}

// Middleware para validar tipos de punto
function validateTipoPunto(req, res, next) {
    const db = readDB();
    const { tipo, subtipo } = req.body;
    
    if (!tipo || !db.tiposPunto[tipo]) {
        return res.status(400).json({
            error: 'Tipo de punto inválido',
            tiposDisponibles: Object.keys(db.tiposPunto)
        });
    }
    
    if (subtipo && !db.tiposPunto[tipo].subtipos.includes(subtipo)) {
        return res.status(400).json({
            error: 'Subtipo inválido para este tipo de punto',
            subtiposDisponibles: db.tiposPunto[tipo].subtipos
        });
    }
    
    next();
}

// Middleware para validar estado
function validateEstado(req, res, next) {
    const db = readDB();
    const { estado } = req.body;
    
    if (estado && !db.estados.includes(estado)) {
        return res.status(400).json({
            error: 'Estado inválido',
            estadosDisponibles: db.estados
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
            coordenadas
        } = req.body;
        
        // Validar campos obligatorios
        if (!direccion || !tipo) {
            return res.status(400).json({
                success: false,
                error: 'Los campos dirección y tipo son obligatorios'
            });
        }
        
        // Crear nuevo punto
        const nuevoPunto = {
            id: generateId(),
            direccion,
            tipo,
            subtipo: subtipo || db.tiposPunto[tipo].subtipos[0],
            estado,
            observaciones,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            coordenadas: coordenadas || { latitud: null, longitud: null }
        };
        
        db.puntosRecoleccion.push(nuevoPunto);
        
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
        
        const puntoActual = db.puntosRecoleccion[puntoIndex];
        const {
            direccion,
            tipo,
            subtipo,
            estado,
            observaciones,
            coordenadas
        } = req.body;
        
        // Actualizar solo los campos proporcionados
        const puntoActualizado = {
            ...puntoActual,
            direccion: direccion || puntoActual.direccion,
            tipo: tipo || puntoActual.tipo,
            subtipo: subtipo || puntoActual.subtipo,
            estado: estado || puntoActual.estado,
            observaciones: observaciones !== undefined ? observaciones : puntoActual.observaciones,
            coordenadas: coordenadas || puntoActual.coordenadas,
            fechaActualizacion: new Date().toISOString()
        };
        
        db.puntosRecoleccion[puntoIndex] = puntoActualizado;
        
        if (writeDB(db)) {
            res.json({
                success: true,
                data: puntoActualizado,
                message: 'Punto de recolección actualizado exitosamente'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar el punto de recolección'
            });
        }
    } catch (error) {
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

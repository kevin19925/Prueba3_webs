// Script de prueba para la API de puntos de recolección
// Para ejecutar: node test-api.js (con el servidor corriendo)

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🚀 Iniciando pruebas de la API...\n');
    
    try {
        // 1. Health Check
        console.log('1. Probando Health Check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData.message);
        console.log('');
        
        // 2. Obtener todos los puntos
        console.log('2. Obteniendo todos los puntos de recolección...');
        const puntosResponse = await fetch(`${API_BASE}/puntos-recoleccion`);
        const puntosData = await puntosResponse.json();
        console.log(`✅ Se encontraron ${puntosData.total} puntos de recolección`);
        console.log('');
        
        // 3. Crear un nuevo punto
        console.log('3. Creando un nuevo punto de recolección...');
        const nuevoPunto = {
            direccion: 'Av. Test 123, Prueba',
            tipo: 'c-2', // Puntos de Reciclaje
            subtipo: 'contenedores_diferenciados',
            estado: 'e-1', // Activo
            observaciones: 'Punto creado desde prueba automática',
            coordenadas: {
                latitud: -0.1800,
                longitud: -78.4600
            },
            usuario: 'admin-test'
        };
        
        const createResponse = await fetch(`${API_BASE}/puntos-recoleccion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoPunto)
        });
        
        const createData = await createResponse.json();
        console.log('✅ Punto creado:', createData.data.id);
        console.log('Dirección:', createData.data.direccion);
        const puntoId = createData.data.id;
        console.log('');
        
        // 4. Actualizar el punto
        console.log('4. Actualizando el punto creado...');
        const actualizacion = {
            estado: 'e-2', // Dañado
            observaciones: 'Punto actualizado desde prueba - requiere mantenimiento',
            usuario: 'admin-test'
        };
        
        const updateResponse = await fetch(`${API_BASE}/puntos-recoleccion/${puntoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(actualizacion)
        });
        
        const updateData = await updateResponse.json();
        console.log('✅ Punto actualizado');
        console.log('Cambios registrados:', updateData.cambios.length);
        console.log('');
        
        // 5. Obtener historial del punto
        console.log('5. Obteniendo historial del punto...');
        const historialResponse = await fetch(`${API_BASE}/puntos-recoleccion/${puntoId}/historial`);
        const historialData = await historialResponse.json();
        console.log(`✅ Historial obtenido: ${historialData.total} registros`);
        historialData.data.historial.forEach((registro, index) => {
            console.log(`   ${index + 1}. ${registro.tipoAccion} - ${registro.campo} - ${registro.fechaCambio}`);
        });
        console.log('');
        
        // 6. Obtener estadísticas
        console.log('6. Obteniendo estadísticas...');
        const statsResponse = await fetch(`${API_BASE}/estadisticas`);
        const statsData = await statsResponse.json();
        console.log('✅ Estadísticas:');
        console.log('   Total de puntos:', statsData.data.total);
        console.log('   Por tipo:', JSON.stringify(statsData.data.porTipo, null, 2));
        console.log('   Por estado:', JSON.stringify(statsData.data.porEstado, null, 2));
        console.log('');
        
        // 7. Obtener historial completo
        console.log('7. Obteniendo historial completo...');
        const historialCompletoResponse = await fetch(`${API_BASE}/historial`);
        const historialCompletoData = await historialCompletoResponse.json();
        console.log(`✅ Historial completo: ${historialCompletoData.total} registros`);
        console.log('');
        
        // 8. Eliminar el punto de prueba
        console.log('8. Eliminando punto de prueba...');
        const deleteResponse = await fetch(`${API_BASE}/puntos-recoleccion/${puntoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: 'admin-test' })
        });
        
        const deleteData = await deleteResponse.json();
        console.log('✅ Punto eliminado:', deleteData.data.direccion);
        console.log('');
        
        console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testAPI();

const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');

// Middleware de protección para asegurar que el usuario ha iniciado sesión
const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Acceso no autorizado' });
    }
};

router.post('/predict', protegerRuta, (req, res) => {
    // Los datos del estado actual del juego vienen en el body de la petición
    const gameData = req.body; // ej: { puntaje: 100, vidas: 3, tiempo_reaccion: 1.2 }

    const options = {
        mode: 'text',
        pythonOptions: ['-u'], // Unbuffered, para que los resultados lleguen rápido
        scriptPath: path.join(__dirname, '..'), // Apunta a la carpeta raíz del proyecto
        args: [JSON.stringify(gameData)] // Pasamos los datos como un string JSON
    };

    PythonShell.run('predict.py', options, (err, results) => {
        if (err) {
            console.error("Error al ejecutar el script de Python:", err);
            return res.status(500).json({ error: 'Error en el servidor de IA' });
        }
        
        try {
            // El resultado de Python es un array de strings, tomamos el primero
            const predictionResult = JSON.parse(results[0]);
            res.json(predictionResult);
        } catch (parseError) {
            console.error("Error al parsear el resultado de Python:", parseError, "Resultado crudo:", results);
            res.status(500).json({ error: 'Respuesta inválida del servidor de IA' });
        }
    });
});

module.exports = router;
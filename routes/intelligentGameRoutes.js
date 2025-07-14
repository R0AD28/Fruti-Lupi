const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// (tu middleware protegerRuta está bien)
const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Acceso no autorizado' });
    }
};


router.post('/predict', protegerRuta, (req, res) => {
    const dataString = JSON.stringify(req.body);

    const scriptPath = path.join(__dirname, '..', 'predict.py'); 

    const pythonProcess = spawn('python', [scriptPath, dataString]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0 || errorOutput) {
            console.error(`Python script exited with code ${code}: ${errorOutput}`);
            return res.json({ error: errorOutput.trim() || `Python script exited with code ${code}` });
        }
        try {
            const parsed = JSON.parse(result);
            res.json(parsed);
        } catch (err) {
            console.error("Error parseando la respuesta del modelo:", err, "Respuesta cruda:", result);
            res.json({ error: "Error parseando la respuesta del modelo." });
        }
    });
});

module.exports = router;
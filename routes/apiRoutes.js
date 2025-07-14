const express = require('express');
const router = express.Router();
const db = require('../config/db');


const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Acceso no autorizado' });
    }
};


router.get('/users', (req, res) => {
    db.query('SELECT id_usuario, nombre FROM usuarios', (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

router.post('/register', (req, res) => {
    const { nombre, edad } = req.body;
    db.query('INSERT INTO usuarios (nombre, edad) VALUES (?, ?)', [nombre, edad], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'El nombre ya está registrado.' });
        res.json({ success: true, message: '¡Registro exitoso!' });
    });
});

router.post('/login', (req, res) => {
    const { nombre } = req.body;
    db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ success: false, message: 'Nombre no encontrado.' });
        }
        req.session.usuario = { id: results[0].id_usuario, nombre: results[0].nombre };
        res.json({ success: true, message: '¡Login exitoso!' });
    });
});

router.post('/save-score', protegerRuta, (req, res) => {
    const nuevoPuntaje = req.body.puntos;
    const id_usuario = req.session.usuario.id;

    // 1. Primero, buscar si ya existe un puntaje para este usuario
    const sqlSelect = 'SELECT puntos FROM puntajes WHERE id_usuario = ?';

    db.query(sqlSelect, [id_usuario], (err, results) => {
        if (err) {
            console.error("Error al buscar puntaje:", err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos.' });
        }

        if (results.length === 0) {
            // 2. Si no existe un puntaje, es la primera vez. Hacemos un INSERT.
            const sqlInsert = 'INSERT INTO puntajes (id_usuario, puntos) VALUES (?, ?)';
            db.query(sqlInsert, [id_usuario, nuevoPuntaje], (err, result) => {
                if (err) {
                    console.error("Error al insertar nuevo puntaje:", err);
                    return res.status(500).json({ success: false, message: 'Error al guardar.' });
                }
                res.json({ success: true, message: '¡Nuevo récord personal guardado!' });
            });
        } else {
            // 3. Si ya existe un puntaje, lo comparamos.
            const puntajeExistente = results[0].puntos;

            if (nuevoPuntaje > puntajeExistente) {
                // 4. Si el nuevo puntaje es MAYOR, hacemos un UPDATE.
                const sqlUpdate = 'UPDATE puntajes SET puntos = ? WHERE id_usuario = ?';
                db.query(sqlUpdate, [nuevoPuntaje, id_usuario], (err, result) => {
                    if (err) {
                        console.error("Error al actualizar puntaje:", err);
                        return res.status(500).json({ success: false, message: 'Error al actualizar.' });
                    }
                    res.json({ success: true, message: '¡Nuevo récord personal guardado!' });
                });
            } else {
                // 5. Si el nuevo puntaje NO es mayor, no hacemos nada en la BD.
                res.json({ success: true, message: '¡Buen intento! Tu récord anterior es más alto.' });
            }
        }
    });
});

router.get('/leaderboard', (req, res) => {
    // Tabla de puntaje - ordena por puntos de mayor a menor y limita a los 10 mejores.
    const sql = `
        SELECT u.nombre, p.puntos 
        FROM puntajes p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY p.puntos DESC
        LIMIT 10;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener el leaderboard:", err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
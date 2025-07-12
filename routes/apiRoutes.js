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
    const { puntos } = req.body;
    const id_usuario = req.session.usuario.id;
    db.query('INSERT INTO puntajes (id_usuario, puntos) VALUES (?, ?)', [id_usuario, puntos], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al guardar puntaje.' });
        res.json({ success: true, message: 'Puntaje guardado.' });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
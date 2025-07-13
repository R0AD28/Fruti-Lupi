const express = require('express');
const path = require('path');
const router = express.Router();


const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/');
    }
};


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

router.get('/menu', protegerRuta, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.get('/game', protegerRuta, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'game.html'));
});

router.get('/game-inteligente', protegerRuta, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'game_inteligente.html'));
});

module.exports = router;
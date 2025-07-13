require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');


const viewRoutes = require('./routes/viewRoutes');
const apiRoutes = require('./routes/apiRoutes');
const intelligentGameRoutes = require('./routes/intelligentGameRoutes');

// Inicializar la conexión a la base de datos
require('./config/db');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


app.use('/api', apiRoutes);
app.use('/', viewRoutes);
app.use('/ia', intelligentGameRoutes); 


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
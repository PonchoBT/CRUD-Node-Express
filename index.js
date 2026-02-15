require('dotenv').config();

const express = require('express');
const itemsRouter = require('./routes/items');
const { PORT } = require('./config/env');
const { connectToDatabase } = require('./config/database');

const app = express();

// Middleware para parsear JSON.
app.use(express.json());

// Rutas
app.use('/api/items', itemsRouter);

// Middleware de manejo de errores global
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor.
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

connectToDatabase();

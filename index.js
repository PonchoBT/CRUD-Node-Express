const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const items = require('./routes/items');

const app = express();

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://ponchobt:diegoangel@cluster0.ssmefhs.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Añadir opciones adicionales recomendadas
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Conectado a MongoDB exitosamente');
  })
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1); // Terminar la aplicación si no se puede conectar a la BD
  });

// Rutas
app.use('/api/items', items);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

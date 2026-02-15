require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const APP_ENV = (process.env.APP_ENV || 'prod').trim();
const ATLAS_URI = process.env.MONGODB_URI;
const LOCAL_URI = process.env.MONGODB_LOCAL_URI;

// Middleware para parsear JSON.
app.use(express.json());
const mongoOptions = {
  // Timeout corto para no bloquear el arranque si Atlas no está disponible.
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const tryConnectMongo = async (uri, label) => {
  await mongoose.connect(uri, mongoOptions);
  console.log(`Conectado a MongoDB ${label} exitosamente`);
};

const connectToMongo = async () => {
  if (ATLAS_URI) {
    try {
      await tryConnectMongo(ATLAS_URI, APP_ENV);
      return;
    } catch (atlasError) {
      console.error(`No se pudo conectar a MongoDB ${APP_ENV}:`, atlasError.message);
      console.warn('Intentando conexión con MongoDB local...');
    }
  } else {
    console.warn('MONGODB_URI no está definida. Se intentará MongoDB local.');
  }

  if (!LOCAL_URI) {
    console.warn('MONGODB_LOCAL_URI no está definida. No hay fallback local configurado.');
    console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
    return;
  }

  try {
    await tryConnectMongo(LOCAL_URI, 'local');
  } catch (localError) {
    console.error('No se pudo conectar a MongoDB local:', localError.message);
    console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
  }
};

connectToMongo();

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

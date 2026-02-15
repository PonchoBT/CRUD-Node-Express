const mongoose = require('mongoose');
const { APP_ENV, ATLAS_URI, LOCAL_URI } = require('./env');

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const connect = async (uri, label) => {
  await mongoose.connect(uri, mongoOptions);
  console.log(`Conectado a MongoDB ${label} exitosamente`);
};

const connectToDatabase = async () => {
  if (APP_ENV === 'dev') {
    if (!LOCAL_URI) {
      console.warn('APP_ENV=dev requiere MONGODB_LOCAL_URI.');
      console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
      return;
    }

    try {
      await connect(LOCAL_URI, 'local');
      return;
    } catch (error) {
      console.error('No se pudo conectar a MongoDB local:', error.message);
      console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
      return;
    }
  }

  if (!ATLAS_URI) {
    console.warn('APP_ENV=prod requiere MONGODB_URI.');
    console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
    return;
  }

  try {
    await connect(ATLAS_URI, 'prod');
  } catch (error) {
    console.error('No se pudo conectar a MongoDB prod:', error.message);
    console.warn('La API sigue en ejecución, pero las rutas que usan BD podrían fallar.');
  }
};

module.exports = {
  connectToDatabase,
};

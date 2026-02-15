const DEFAULT_PORT = 3000;
const SUPPORTED_ENVS = new Set(['dev', 'prod']);

const parsePort = (rawPort) => {
  const parsedPort = Number.parseInt(rawPort, 10);
  return Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort;
};

const parseAppEnv = (rawAppEnv) => {
  const normalizedEnv = (rawAppEnv || 'prod').trim().toLowerCase();
  if (!SUPPORTED_ENVS.has(normalizedEnv)) {
    console.warn(`APP_ENV="${normalizedEnv}" no es válido. Se usará "prod".`);
    return 'prod';
  }
  return normalizedEnv;
};

module.exports = {
  PORT: parsePort(process.env.PORT),
  APP_ENV: parseAppEnv(process.env.APP_ENV),
  ATLAS_URI: process.env.MONGODB_URI?.trim(),
  LOCAL_URI: process.env.MONGODB_LOCAL_URI?.trim(),
};

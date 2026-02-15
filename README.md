# CRUD Node + Express + MongoDB

API REST de ejemplo para gestionar items usando Node.js, Express y MongoDB.

## Requisitos

- Node.js 18+ (recomendado)
- npm
- MongoDB Atlas (opcional) y/o MongoDB local

## Instalación

```bash
npm install
```

## Configuración de entorno

1. Crea un archivo `/.env` (puedes copiar `/.env.example`).
2. Completa las variables:

```env
PORT=3000
APP_ENV=dev
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
MONGODB_LOCAL_URI=mongodb://localhost:27017/myFirstDatabase
```

### Perfiles recomendados

**Desarrollo local**

```env
APP_ENV=dev
MONGODB_LOCAL_URI=mongodb://localhost:27017/myFirstDatabase
MONGODB_URI=
```

**Producción**

```env
APP_ENV=prod
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
MONGODB_LOCAL_URI=
```

### Qué hace cada variable

- `PORT`: puerto del servidor HTTP.
- `APP_ENV`: define el modo de conexión (`dev` o `prod`).
- `MONGODB_URI`: conexión de MongoDB Atlas/remota (usada en `APP_ENV=prod`).
- `MONGODB_LOCAL_URI`: conexión local (usada en `APP_ENV=dev`).

## Ejecución

Modo desarrollo (con autorecarga):

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

### Scripts útiles

```bash
npm run env:dev    # copia .env.dev -> .env
npm run env:prod   # copia .env.prod -> .env
npm run dev:local  # activa entorno local y levanta nodemon
npm run dev:prod   # activa entorno prod y levanta nodemon
```

Servidor disponible en:

- `http://localhost:3000`

## Flujo de conexión a base de datos

La API conecta de forma estricta según `APP_ENV`:

1. `APP_ENV=dev` -> intenta solo `MONGODB_LOCAL_URI`
2. `APP_ENV=prod` -> intenta solo `MONGODB_URI`
3. Si falla la conexión configurada, la API sigue levantada pero las rutas de BD pueden devolver error

## Endpoints

Base URL:

- `http://localhost:3000/api/items`

### 1) Obtener todos los items

- Método: `GET`
- URL: `/api/items`
- Query params opcionales:
  - `page` (por defecto `1`)
  - `limit` (por defecto `10`, máximo `100`)

Ejemplo:

```bash
curl "http://localhost:3000/api/items?page=1&limit=10"
```

### 2) Obtener item por ID

- Método: `GET`
- URL: `/api/items/:id`

Ejemplo:

```bash
curl "http://localhost:3000/api/items/65f0c2f3a1b2c3d4e5f67890"
```

### 3) Crear item

- Método: `POST`
- URL: `/api/items`
- Body JSON:

```json
{
  "name": "Laptop Dell XPS 13",
  "description": "Ultrabook ligera con 16GB de RAM, SSD de 512GB y pantalla Full HD."
}
```

Ejemplo con curl:

```bash
curl -X POST "http://localhost:3000/api/items" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 13",
    "description": "Ultrabook ligera con 16GB de RAM, SSD de 512GB y pantalla Full HD."
  }'
```

### 4) Actualizar item

- Método: `PUT`
- URL: `/api/items/:id`
- Body JSON:

```json
{
  "name": "Laptop Dell XPS 13 Plus",
  "description": "Ultrabook con 32GB de RAM y SSD de 1TB."
}
```

Ejemplo con curl:

```bash
curl -X PUT "http://localhost:3000/api/items/65f0c2f3a1b2c3d4e5f67890" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 13 Plus",
    "description": "Ultrabook con 32GB de RAM y SSD de 1TB."
  }'
```

### 5) Eliminar item

- Método: `DELETE`
- URL: `/api/items/:id`

Ejemplo:

```bash
curl -X DELETE "http://localhost:3000/api/items/65f0c2f3a1b2c3d4e5f67890"
```

## Validaciones implementadas

- `id` debe ser un ObjectId válido de MongoDB.
- `name`:
  - requerido
  - entre 3 y 50 caracteres (validación en ruta)
- `description`:
  - requerida
  - entre 10 y 500 caracteres (validación en ruta)
- no permite crear dos items con el mismo `name`.

## Respuestas comunes

- `200 OK`: lectura/actualización/eliminación exitosa.
- `201 Created`: creación exitosa.
- `400 Bad Request`: datos inválidos o incompletos.
- `404 Not Found`: item no encontrado.
- `500 Internal Server Error`: error interno o fallo de base de datos.

## Estructura del proyecto

```text
.
├── index.js            # entrada de la app y conexión Mongo
├── config/
│   ├── env.js          # lectura/normalización de variables
│   └── database.js     # conexión a Mongo según APP_ENV
├── constants/
│   └── item.js         # reglas de validación de Item
├── routes/
│   └── items.js        # endpoints CRUD
├── models/
│   └── item.js         # esquema de Mongoose
├── .env.example        # plantilla de variables de entorno
└── package.json
```

## Notas de seguridad

- `/.env` está en `.gitignore`: no se sube al repositorio.
- No guardes credenciales reales en `index.js` ni en commits.
- Si usas Atlas, habilita tu IP en `Network Access` y valida usuario en `Database Access`.


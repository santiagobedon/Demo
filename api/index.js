// ======================================================
// SERVIDOR PRINCIPAL (app.js)
// ======================================================

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { connectDB } = require("./config/database");
const routes = require("./routes/index"); // index.js dentro de /routes

const app = express();

// ======================================================
// MIDDLEWARES
// ======================================================

// parsear JSON en el cuerpo de las solicitudes
app.use(express.json());

// parsear datos codificados en URL (formularios)
app.use(express.urlencoded({ extended: true }));

// ======================================================
// CONFIGURACION DE CORS
// ======================================================

// reemplaza esta URL por la de tu frontend en Vercel
const allowedOrigins = [
  "http://localhost:3000",             // front local
  "http://localhost:8000",             // otro puerto local si aplica
  "https://demoooo-six.vercel.app/"    // frontend en vercel
];

app.use(cors({
  origin: function(origin, callback) {
    // permitir solicitudes sin origin (ej: Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `La URL ${origin} no está permitida por CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // si planeas usar cookies
}));

// ======================================================
// RUTA BASICA DE TEST
// ======================================================

app.get("/", (req, res) => res.send("Server is running"));

// ======================================================
// RUTAS DE LA API
// ======================================================

app.use("/api/v1", routes);

// ======================================================
// CONEXION A LA BASE DE DATOS
// ======================================================

connectDB();

// ======================================================
// PUERTO DE ESCUCHA
// ======================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(` server running on http://localhost:${PORT}`);
  });
}

// ======================================================
// EXPORTAR APP
// ======================================================

module.exports = app;

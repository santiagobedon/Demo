// ======================================================
// RUTAS DE TAREAS
// ======================================================

const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// CREAR TAREA
// ======================================================
// POST /tasks
// esta ruta esta protegida con authMiddleware
// solo usuarios autenticados pueden crear tareas
router.post("/", authMiddleware, TaskController.createTask);

// ======================================================
// OBTENER TAREAS DEL USUARIO
// ======================================================
// GET /tasks/mytasks
// esta ruta devuelve solo las tareas creadas por el usuario autenticado
router.get("/mytasks", authMiddleware, TaskController.getUserTasks);

// exportamos el router para usarlo en index.js de rutas
module.exports = router;

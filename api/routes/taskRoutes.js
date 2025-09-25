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

// ======================================================
// ACTUALIZAR TAREA
// ======================================================
// PUT /tasks/:id
// esta ruta actualiza una tarea del usuario autenticado
router.put("/:id", authMiddleware, TaskController.updateTask);

// ======================================================
// OBTENER UNA TAREA POR ID
// ======================================================
// GET /tasks/:id
// esta ruta devuelve una sola tarea del usuario autenticado
router.get("/:id", authMiddleware, TaskController.getTaskById);
// ======================================================
// ELIMINAR UNA TAREA POR ID
// ======================================================
// DELETE /tasks/:id
// esta ruta elimina una sola tarea del usuario autenticado
router.delete("/:id", authMiddleware, TaskController.deleteTask);


// exportamos el router para usarlo en index.js de rutas
module.exports = router;

// ======================================================
// CONTROLADOR DE TAREAS
// ======================================================

// importamos el modelo de Task para interactuar con la base de datos
const Task = require("../models/Task");

// ======================================================
// FUNCION PARA CREAR UNA TAREA
// ======================================================
const createTask = async (req, res) => {
  try {
    // destructuramos title y detail desde el cuerpo de la solicitud
    const { title, detail, status } = req.body;

    // validamos que el campo title exista
    if (!title) {
      return res.status(400).json({ message: "El campo title es obligatorio" });
    }

    // generamos fecha y hora actual
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // yyyy-mm-dd
    const time = now.toTimeString().split(" ")[0].slice(0, 5); // hh:mm

    // creamos la tarea usando el modelo Task
    const newTask = await Task.create({
      title,                // titulo obligatorio
      detail,               // detalle opcional
      date,                 // fecha actual
      time,                 // hora actual
      status: status || "Por hacer",  // estado inicial
      user: req.userId,     // asociamos la tarea al usuario logueado
    });

    // enviamos respuesta 201 con datos de la tarea creada
    res.status(201).json({
      message: "Tarea creada exitosamente",
      task: {
        id: newTask._id,
        title: newTask.title,
        detail: newTask.detail,
        date: newTask.date,
        time: newTask.time,
        status: newTask.status,
        user: newTask.user,
      },
    });
  } catch (err) {
    console.error("createTask error:", err.message);
    res.status(500).json({
      message: "No pudimos guardar tu tarea, inténtalo de nuevo",
      error: err.message,
    });
  }
};

// ======================================================
// FUNCION PARA OBTENER TODAS LAS TAREAS DEL USUARIO
// ======================================================
const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).lean();

    res.status(200).json({
      message: "Tareas obtenidas exitosamente",
      tasks,
    });
  } catch (err) {
    console.error("getUserTasks error:", err.message);
    res.status(500).json({
      message: "No pudimos obtener las tareas, inténtalo de nuevo",
      error: err.message,
    });
  }
};

// ======================================================
// FUNCION PARA EDITAR UNA TAREA
// ======================================================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, detail, date, time, status } = req.body;

    // validar título obligatorio
    if (!title) {
      return res.status(400).json({ message: "El campo title es obligatorio" });
    }

    // validar fecha futura (si se envía)
    if (date) {
      const today = new Date().toISOString().split("T")[0];
      if (date < today) {
        return res.status(400).json({ message: "La fecha debe ser futura" });
      }
    }

    // buscar la tarea que pertenezca al usuario autenticado
    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // actualizar campos
    task.title = title;
    task.detail = detail;
    task.date = date || task.date;
    task.time = time || task.time;
    task.status = status || task.status;
    task.updatedAt = new Date().toISOString(); // guardamos en formato ISO-8601

    await task.save();

    res.status(200).json({
      message: "Tarea actualizada",
      task: {
        id: task._id,
        title: task.title,
        detail: task.detail,
        date: task.date,
        time: task.time,
        status: task.status,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    console.error("updateTask error:", err.message);
    res.status(500).json({
      message: "No pudimos actualizar tu tarea",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ======================================================
// EXPORTAR FUNCIONES
// ======================================================
module.exports = { createTask, getUserTasks, updateTask };

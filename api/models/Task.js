// ======================================================
// MODELO DE TAREAS (Task)
// ======================================================

const mongoose = require("mongoose");

// definimos el esquema de la colección Task
const TaskSchema = new mongoose.Schema({
  // titulo de la tarea (obligatorio, maximo 50 caracteres)
  title: {
    type: String,
    required: true,
    maxlength: 50,
  },
  // detalle de la tarea (opcional, maximo 500 caracteres)
  detail: {
    type: String,
    maxlength: 500,
  },
  // fecha de la tarea (yyyy-mm-dd), por defecto la fecha actual
  date: {
    type: String,
    default: () => new Date().toISOString().split("T")[0]
  },
  // hora de la tarea (hh:mm), por defecto la hora actual
  time: {
    type: String,
    default: () => new Date().toISOString().split("T")[1].substring(0,5)
  },
  // estado de la tarea, valores permitidos: Por hacer, Haciendo, Hecho
  // por defecto es "Por hacer"
  status: {
    type: String,
    enum: ["Por hacer", "Haciendo", "Hecho"],
  },
  // referencia al usuario que creo la tarea (relacion con User)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // fecha de creacion del documento
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// exportamos el modelo para usarlo en controladores y rutas
module.exports = mongoose.model("Task", TaskSchema);

// ======================================================
// RUTAS DE USUARIOS
// ======================================================

const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// importamos el middleware de autenticación
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// REGISTRO DE USUARIO
// ======================================================
// POST /users/signup
// recibe datos del usuario y crea un nuevo registro
router.post("/signup", UserController.signup);

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================
// GET /users
// devuelve todos los usuarios, excluyendo password y __v
router.get("/", UserController.getUsers);

// ======================================================
// ACTUALIZAR PERFIL DE USUARIO
// ======================================================
// PUT /users/me
// actualiza datos del usuario logueado (nombres, apellidos, edad y correo)
router.put("/me", authMiddleware, UserController.updateProfile);

// exportamos el router para usarlo en index.js de rutas
module.exports = router;

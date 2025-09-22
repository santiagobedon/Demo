const express = require("express");
const router = express.Router();
const { login, logout, forgotPassword, resetPassword, getProfile } = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// RUTAS DE AUTENTICACION
// ======================================================

// login
router.post("/login", login);

// logout
router.post("/logout", authMiddleware, logout);

// olvido de contraseña
router.post("/forgot-password", forgotPassword);

// resetear contraseña
router.post("/reset-password/:token", resetPassword);

// obtener perfil del usuario logueado
router.get("/me", authMiddleware, getProfile);

module.exports = router;


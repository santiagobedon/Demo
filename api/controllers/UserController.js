// ======================================================
// CONTROLADOR DE USUARIOS
// ======================================================

// importamos modelo User para interactuar con la base de datos
const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");

// ======================================================
// FUNCION PARA REGISTRAR USUARIO (SIGNUP)
// ======================================================
const signup = async (req, res) => {
  try {
    const { firstName, lastName, age, email, password, confirmPassword } = req.body;

    // validamos que ningun campo este vacío
    if (!firstName || !lastName || !age || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // edad mínima 13 años
    if (age < 13) {
      return res.status(400).json({ message: "Age must be at least 13" });
    }

    // password y confirmPassword deben coincidir
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // verificamos si email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // creamos nuevo usuario
    const newUser = new User({ firstName, lastName, age, email, password });
    await newUser.save();

    // respuesta exitosa
    res.status(201).json({ id: newUser._id, message: "User created successfully" });
  } catch (err) {
    console.error("signup error:", err);

    // manejamos errores de validación de mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    // error de clave duplicada
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // otros errores
    return res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// ======================================================
// FUNCION PARA OBTENER TODOS LOS USUARIOS
// ======================================================
const getUsers = async (req, res) => {
  try {
    // buscamos todos los usuarios, excluyendo password y __v
    const users = await User.find().select("-password -__v");
    res.status(200).json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ======================================================
// FUNCION PARA EDITAR PERFIL DE USUARIO
// ======================================================
// PUT /users/me
// actualiza nombres, apellidos, edad y correo del usuario logueado
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, age, email } = req.body;

    // validamos campos requeridos
    if (!firstName || !lastName || !age || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // validación de edad mínima
    if (age < 13) {
      return res.status(400).json({ message: "Age must be at least 13" });
    }

    // validación de email con regex (RFC 5322 básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // verificamos que el correo no esté en uso por otro usuario
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.userId }, // usamos req.userId en lugar de req.user.id
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // actualizamos perfil
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, // siempre con req.userId
      { firstName, lastName, age, email },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // respuesta exitosa
    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser: {
        ...updatedUser.toObject(),
        updatedAt: updatedUser.updatedAt?.toISOString(),
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// ======================================================
// FUNCION PARA ELIMINAR USUARIO Y SUS TAREAS
// ======================================================
const deleteAccount = async (req, res) => {
  try {
    const { password, confirm } = req.body;

    // validar confirmacion
    if (confirm !== "ELIMINAR") {
      return res.status(400).json({ message: "Debes escribir ELIMINAR para confirmar" });
    }

    // buscamos usuario
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    // validamos contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // eliminamos tareas asociadas
    await Task.deleteMany({ user: req.userId });

    // eliminamos usuario
    await user.deleteOne();

    // respondemos con 204 sin contenido
    return res.status(204).send();
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    return res.status(500).json({
      message: "No pudimos eliminar la cuenta, inténtalo más tarde",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// exportamos funciones para usarlas en rutas
module.exports = { signup, getUsers, updateProfile, deleteAccount };

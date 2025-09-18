// ======================================================
// CONTROLADOR DE AUTENTICACION
// ======================================================

// importamos modelo de usuario para consultas a la DB
const User = require("../models/User");
// importamos jsonwebtoken para crear/verificar tokens JWT
const jwt = require("jsonwebtoken");
// randomUUID para generar identificadores únicos de tokens
const { randomUUID } = require("crypto");
// crypto para generar tokens de recuperación seguros
const crypto = require("crypto");
// modelo para tokens revocados (logout)
const RevokedToken = require("../models/RevokedToken");
// bcrypt para hashear y comparar contraseñas
const bcrypt = require("bcrypt");

// servicio para enviar correos
const { sendMail } = require("../services/emailService");

// ======================================================
// LOGIN
// ======================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validamos que los campos existan
    if (!email || !password)
      return res.status(400).json({ message: "Todos los campos son requeridos" });

    // buscamos el usuario por email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Correo o contraseña inválidos" });

    // verificamos la contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Correo o contraseña inválidos" });

    // generamos un identificador unico para el token (jti)
    const jti = randomUUID();

    // generamos token JWT con 2 horas de expiración
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h", jwtid: jti }
    );

    // respondemos con mensaje y token
    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
  }
};

// ======================================================
// LOGOUT
// ======================================================
const logout = async (req, res) => {
  try {
    // obtenemos token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    // guardamos el jti en la colección de tokens revocados
    if (decoded && decoded.jti && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await RevokedToken.create({ jti: decoded.jti, expiresAt });
    }

    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (err) {
    console.error("logout error:", err.message);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

// ======================================================
// OLVIDO DE CONTRASEÑA
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // siempre respondemos igual para no filtrar emails
      return res.status(202).json({ message: "Si el correo existe, recibirás un enlace" });
    }

    // generar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex");

    // expiración 1 hora
    const resetPasswordExpires = Date.now() + 3600000;

    // guardar token y expiración en el usuario
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    const resetLink = `http://localhost:8080/api/v1/auth/reset-password/${resetToken}`;

    // enviar correo
    const previewUrl = await sendMail(
      user.email,
      "Recuperación de contraseña",
      `<p>Haz clic aquí para restablecer tu contraseña:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>El enlace expira en 1 hora.</p>`
    );

    res.json({
      message: "Revisa tu correo para continuar",
      previewUrl,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Error en forgot password" });
  }
};

// ======================================================
// RESETEAR CONTRASEÑA
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;       // token enviado en la url
    const { password } = req.body;      // nueva contraseña en JSON

    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    // buscamos usuario con token válido y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // asignamos la nueva contraseña directamente
    // el pre("save") del modelo se encargará de hacer hash
    user.password = password;

    // limpiamos campos de reset
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // guardamos los cambios en la base de datos
    await user.save();

    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Error al restablecer contraseña" });
  }
};

module.exports = { resetPassword };


// ======================================================
// EXPORTAR FUNCIONES
// ======================================================
module.exports = { login, logout, forgotPassword, resetPassword };

// ======================================================
// SERVICIO DE ENVÍO DE CORREOS CON SENDGRID
// ======================================================

const sgMail = require("@sendgrid/mail");

// seteamos la API key desde .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ======================================================
// FUNCION PARA ENVIAR CORREOS
// ======================================================
const sendMail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM, // remitente verificado en SendGrid
        name: "Soporte ToDoList",      // nombre visible en el correo
      },
      subject,
      html,
    };

    const info = await sgMail.send(msg);

    console.log("📧 correo enviado a:", to);
    return info;
  } catch (err) {
    console.error("Error enviando correo con SendGrid:", err);
    throw err;
  }
};

module.exports = { sendMail };

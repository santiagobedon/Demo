// ======================================================
// EMAIL SERVICE USING SENDGRID
// ======================================================

const sgMail = require("@sendgrid/mail");

// set API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ======================================================
// FUNCTION TO SEND EMAILS
// ======================================================
/**
 * sendMail(to, subject, html)
 * 
 * Sends an email using SendGrid.
 * Parameters:
 *   - to (string): recipient email address
 *   - subject (string): email subject
 *   - html (string): email content in HTML format
 * 
 * Returns:
 *   - info (object): information about the sent email
 * 
 * Throws:
 *   - error: if sending fails
 * 
 * Notes:
 *   - "from" email is set from environment variable EMAIL_FROM
 *   - sender name is "Soporte ToDoList"
 */
const sendMail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM, // verified sender in SendGrid
        name: "Soporte ToDoList",      // display name
      },
      subject,
      html,
    };

    const info = await sgMail.send(msg);

    console.log("📧 Email sent to:", to);
    return info;
  } catch (err) {
    console.error("Error sending email via SendGrid:", err);
    throw err;
  }
};

// export the service function
module.exports = { sendMail };

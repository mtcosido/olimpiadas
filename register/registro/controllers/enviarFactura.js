// Importar nodemailer para enviar correos electrónicos
import nodemailer from "nodemailer";
// Importar las dependencias necesarias
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "huevohuevohuevin@gmail.com",
    pass: "itmc rzkt spfj ntcs",
  },
});
// Función para enviar la factura por correo electrónico
export function enviarFactura(userEmail, facturaPath) {
  try {
    const mailOptions = {
      from: "huevohuevohuevin@gmail.com",
      to: userEmail,
      subject: "Factura de tu compra",
      text: "Adjuntamos tu factura en formato PDF.",
      attachments: [{ path: facturaPath }],
    };
    // Enviar el correo electrónico con la factura adjunta
    const info = transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
    return { status: "success", message: "Factura enviada correctamente." };
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return {
      status: "error",
      message: "Error al enviar la factura por correo.",
    };
  }
}
// Exportar la función enviarFactura
export default enviarFactura;
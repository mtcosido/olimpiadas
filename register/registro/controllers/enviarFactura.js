
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "huevohuevohuevin@gmail.com",
        pass: "itmc rzkt spfj ntcs"
    }
});

 export function enviarFactura(userEmail, facturaPath) {
    try {
        const mailOptions = {
            from: "huevohuevohuevin@gmail.com", 
            to: userEmail, 
            subject: "Factura de tu compra",
            text: "Adjuntamos tu factura en formato PDF.",
            attachments: [{ path: facturaPath }]
        };

        const info =  transporter.sendMail(mailOptions);
        console.log("Correo enviado:", info.response);
        return { status: "success", message: "Factura enviada correctamente." };
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        return { status: "error", message: "Error al enviar la factura por correo." };
    }
}

export default enviarFactura;


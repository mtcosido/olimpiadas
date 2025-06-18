
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function generarFactura(userId, productos, total) {
    const facturaDir = path.join(__dirname, "facturas");


    if (!fs.existsSync(facturaDir)) {
        fs.mkdirSync(facturaDir, { recursive: true });
    }

    const facturaPath = path.join(facturaDir, `factura_${Date.now()}.pdf`);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(facturaPath);
    doc.pipe(stream);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Factura para Usuario ID: ${userId}`, { align: "center" });
    doc.text("\nProductos comprados:");

    productos.forEach(producto => {
        doc.text(`- ${producto.titulo}: $${producto.precio} x ${producto.cantidad}`);
    });

    doc.text(`\nTotal: $${total}`, { align: "right" });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on("finish", () => resolve(facturaPath));
        stream.on("error", (err) => reject(err));
    });
}

export default generarFactura;

// File: registro/controllers/generarFactura.js
// Importar las dependencias necesarias
import PDFDocument from "pdfkit";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Función para generar una factura en PDF
export function generarFactura(nombre, cuil, productos, total) {
  // Verificar que los parámetros sean válidos
  const facturaDir = path.join(__dirname, "facturas");
  const pageWidth = 500;
  const margin = 50;
  let y = 130;
  // Verificar que los parámetros sean válidos
  if (!fs.existsSync(facturaDir)) {
    fs.mkdirSync(facturaDir, { recursive: true });
  }
  // Verificar que los parámetros sean válidos
  const facturaPath = path.join(facturaDir, `factura_${Date.now()}.pdf`);
  const doc = new PDFDocument({ margin });
  // Verificar que los parámetros sean válidos
  const stream = fs.createWriteStream(facturaPath);
  doc.pipe(stream);

  // Encabezado
  doc.font("Helvetica-Bold").fontSize(16).text("Ecomerce", { align: "center" });
  doc.moveDown();
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Cliente: ${nombre}`, { align: "left" })
    .text(`Cuil: ${cuil}`, { align: "left" })
    .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "left" })
    .text(`Hora: ${new Date().toLocaleTimeString()}`, { align: "left" });
  doc.moveDown();

  // Encabezado de tabla
  y = doc.y + 10;
  doc.font("Helvetica-Bold");
  doc.text("Producto", margin, y);
  doc.text("Cantidad", margin + 220, y, { width: 60, align: "right" });
  doc.text("Precio", pageWidth - margin - 60, y, { width: 60, align: "right" });
  doc
    .moveTo(margin, y + 15)
    .lineTo(pageWidth - margin, y + 15)
    .stroke();

  // Filas de productos
  doc.font("Helvetica");
  y += 25;
  productos.forEach((producto) => {
    doc.text(producto.titulo, margin, y);
    doc.text(producto.cantidad, margin + 220, y, { width: 60, align: "right" });
    doc.text(`$${producto.precio}`, pageWidth - margin - 60, y, {
      width: 60,
      align: "right",
    });
    y += 20;
  });

  // Línea separadora
  doc
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .stroke();

  // Total
  y += 10;
  doc.font("Helvetica-Bold");
  doc.text("Total:", pageWidth - margin - 120, y, {
    width: 60,
    align: "right",
  });
  doc.text(`$${total}`, pageWidth - margin - 60, y, {
    width: 60,
    align: "right",
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(facturaPath));
    stream.on("error", (err) => reject(err));
  });
}
// Exportar la función para que pueda ser utilizada en otros módulos
export default generarFactura;
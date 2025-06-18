import PDFDocument from 'pdfkit';

export async function generarFactura(userId, productos, total) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Factura para Usuario ID: ${userId}`, { align: "center" });
    doc.text("\nProductos comprados:");

    productos.forEach(producto => {
      doc.text(`- ${producto.titulo}: $${producto.precio} x ${producto.cantidad}`);
    });

    doc.text(`\nTotal: $${total}`, { align: "right" });
    doc.end();
  });
}

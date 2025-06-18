import express from "express";
import { conexion } from "./db.js";
import { generarFactura } from "./generarFactura.js";
import { enviarFactura } from "./enviarFactura.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/compra", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { productos, formaPago, infoPago } = req.body;

  if (!userId || !productos || productos.length === 0) {
    return res.status(400).json({ error: "Usuario o productos inválidos." });
  }

  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const fecha = new Date().toISOString().split("T")[0];

  try {
    const [productoExistente] = await conexion.execute(
      "SELECT id_producto FROM producto WHERE id_producto = ?",
      [productos[0].id]
    );
    if (productoExistente.length === 0) {
      return res.status(400).json({ error: `El producto con ID ${productos[0].id} no existe.` });
    }

    const [carritoResult] = await conexion.execute(
      "INSERT INTO carrito (id_producto, id_usuario, fecha, hora) VALUES (?, ?, ?, CURRENT_TIME)",
      [productos[0].id, userId, fecha]
    );
    const idCarrito = carritoResult.insertId;

    const infoPagoSeguro = infoPago?.trim() !== "" ? infoPago : "Transferencia";

    const [pagoResult] = await conexion.execute(
      "INSERT INTO pago (forma_pago, validar_pago, info_pago, precio, id_carrito) VALUES (?, ?, ?, ?, ?)",
      [formaPago, 1, infoPagoSeguro, total, idCarrito]
    );
    const idPago = pagoResult.insertId;

    await conexion.execute(
      "INSERT INTO detalle_carrito (id_carrito, id_pago, detalles, precio_final, estado) VALUES (?, ?, ?, ?, ?)",
      [idCarrito, idPago, 0, total, true]
    );

    const facturaBuffer = await generarFactura(userId, productos, total);
    if (!facturaBuffer) {
      return res.status(500).json({ error: "Error generando el archivo PDF." });
    }

    await conexion.execute(
      "INSERT INTO historial_compras (id, usuario_id, fecha, total, factura) VALUES (?, ?, ?, ?, ?)",
      [idCarrito, userId, fecha, total, facturaBuffer]
    );

    await conexion.execute(
      "UPDATE detalle_carrito SET factura = ? WHERE id_carrito = ?",
      [facturaBuffer, idCarrito]
    );

    const [usuarioResult] = await conexion.execute(
      "SELECT mail FROM usuario WHERE id_usuario = ?",
      [userId]
    );
    const userEmail = usuarioResult[0]?.mail;
    if (!userEmail) {
      return res.status(400).json({ error: "No se encontró el correo del usuario." });
    }

    const envioCorreo = await enviarFactura(userEmail, facturaBuffer);
    if (envioCorreo.status === "success") {
      return res.json({ status: "success", message: "Factura generada, guardada y enviada correctamente." });
    } else {
      return res.status(500).json({ error: envioCorreo.message });
    }
  } catch (error) {
    console.error("Error en el proceso de compra:", error);
    res.status(500).json({ error: "Error procesando la compra." });
  }
});

export default router;

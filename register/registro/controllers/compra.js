// registro/controllers/compra.js
// Importar las dependencias necesarias
import express from "express";
import { conexion } from "./db.js";
import { generarFactura } from "./generarFactura.js";
import { enviarFactura } from "./enviarFactura.js";
import fs from "fs";
import { verifyToken } from "../middlewares/verifyToken.js";
// controllers/compra.js
const router = express.Router();
// Endpoint para procesar la compra
router.post("/compra", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { productos, formaPago, infoPago } = req.body;

  if (!userId || !productos || productos.length === 0) {
    return res.status(400).json({ error: "Usuario o productos inválidos." });
  }
  // Verificar que los productos tengan un formato válido
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const fecha = new Date().toISOString().split("T")[0];
  // Verificar que la forma de pago sea válida
  try {
    const [productoExistente] = await conexion.execute(
      "SELECT id_producto FROM producto WHERE id_producto = ?",
      [productos[0].id]
    );
    if (productoExistente.length === 0) {
      return res
        .status(400)
        .json({ error: `El producto con ID ${productos[0].id} no existe.` });
    }
    // Verificar que el usuario tenga un carrito activo
    const [carritoResult] = await conexion.execute(
      "INSERT INTO carrito (id_producto, id_usuario, fecha, hora) VALUES (?, ?, ?, CURRENT_TIME)",
      [productos[0].id, userId, fecha]
    );
    const idCarrito = carritoResult.insertId;
    // Verificar que se haya insertado el carrito correctamente
    const infoPagoSeguro = infoPago?.trim() !== "" ? infoPago : "Transferencia";
    // Verificar que se haya insertado el carrito correctamente
    const [pagoResult] = await conexion.execute(
      "INSERT INTO pago (forma_pago, validar_pago, info_pago, precio, id_carrito) VALUES (?, ?, ?, ?, ?)",
      [formaPago, 1, infoPagoSeguro, total, idCarrito]
    );
    const idPago = pagoResult.insertId;
    // Verificar que se haya insertado el pago correctamente
    await conexion.execute(
      "INSERT INTO detalle_carrito (id_carrito, id_pago, detalles, precio_final, estado) VALUES (?, ?, ?, ?, ?)",
      [idCarrito, idPago, 0, total, true]
    );

    //obtener el nombre del usuario
    const [usuarioNombreResult] = await conexion.execute(
      "SELECT nombre FROM usuario WHERE id_usuario = ?",
      [userId]
    );
    const userNombre = usuarioNombreResult[0]?.nombre;
    //obtener el cuil del usuario
    const [usuarioCuilResult] = await conexion.execute(
      "SELECT cuil FROM usuario WHERE id_usuario = ?",
      [userId]
    );
    const userCuil = usuarioCuilResult[0]?.cuil;
    // Verificar que se obtuvo el nombre y cuil del usuario
    const facturaPath = await generarFactura(
      userNombre,
      userCuil,
      productos,
      total
    );
    if (!fs.existsSync(facturaPath)) {
      return res.status(500).json({ error: "Error generando la factura PDF." });
    }
    // Guardar la factura en la base de datos
    await conexion.execute(
      "INSERT INTO historial_compras (id, usuario_id, fecha, total, factura) VALUES (?, ?, ?, ?, ?)",
      [idCarrito, userId, fecha, total, facturaPath]
    );
    // Actualizar el detalle del carrito con la ruta de la factura
    await conexion.execute(
      "UPDATE detalle_carrito SET factura = ? WHERE id_carrito = ?",
      [facturaPath, idCarrito]
    );
    // Obtener el correo del usuario para enviar la factura
    const [usuarioResult] = await conexion.execute(
      "SELECT mail FROM usuario WHERE id_usuario = ?",
      [userId]
    );
    const userEmail = usuarioResult[0]?.mail;
    // Verificar si se encontró el correo del usuario
    if (!userEmail) {
      return res
        .status(400)
        .json({ error: "No se encontró el correo del usuario." });
    }
    // Enviar la factura por correo
    const envioCorreo = await enviarFactura(userEmail, facturaPath);
    if (envioCorreo.status === "success") {
      return res.json({
        status: "success",
        message: "Factura enviada y guardada correctamente.",
      });
    } else {
      return res.status(500).json({ error: envioCorreo.message });
    }
  } catch (error) {
    console.error("Error en el proceso de compra:", error);
    res.status(500).json({ error: "Error procesando la compra." });
  }
});
// Endpoint para obtener el historial de compras del usuario
export default router;
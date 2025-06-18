import express from "express";
import { methods as admin } from "./admin.controller.js";
const router = express.Router();

// Ruta para registrar un nuevo paquete
router.post("/paquetes", admin.crearPaquete);

// Ruta para buscar usuarios por ID o nombre
router.get("/usuarios", admin.buscarUsuarios);

// Ruta para ver facturas de un usuario
router.get("/usuarios/:id/facturas", admin.verFacturasUsuario);
router.get("/factura/:id", admin.descargarFactura);

export default router;

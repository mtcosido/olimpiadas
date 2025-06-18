// controllers/productos.js
import express from 'express';
import { conexion } from './db.js';

const router = express.Router();

router.get('/productos', async (req, res) => {
  try {
    const [rows] = await conexion.execute("SELECT * FROM producto");
    const productos = rows.map(row => ({
      id: row.id_producto,
      titulo: row.nombre,
      precio: row.precio_unidad,
      categoria: {
        id: String(row.continente).toLowerCase(),
        nombre: String(row.continente).charAt(0).toUpperCase() + String(row.continente).slice(1)
      }
    }));
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos: ' + err.message });
  }
});

export default router;

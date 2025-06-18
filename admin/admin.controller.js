import { conexion } from "../controllers/db.js";

// Crear un nuevo paquete de viaje
async function crearPaquete(req, res) {
  const { nombre, precio_unidad, informacion, continente } = req.body;

  if (!nombre || !precio_unidad || !informacion || !continente) {
    return res.status(400).json({ status: "error", message: "Faltan campos obligatorios" });
  }

  try {
    await conexion.execute(
      "INSERT INTO producto (nombre, precio_unidad, informacion, continente) VALUES (?, ?, ?, ?)",
      [nombre, precio_unidad, informacion, continente]
    );

    res.status(201).json({ status: "success", message: "Paquete creado exitosamente" });
  } catch (error) {
    console.error("Error al crear paquete:", error);
    res.status(500).json({ status: "error", message: "Error interno al crear paquete" });
  }
}

// Buscar usuario por ID o nombre (parámetros por query: ?id=... o ?nombre=...)
async function buscarUsuarios(req, res) {
  const { id, nombre } = req.query;

  try {
    let query = "SELECT * FROM usuario";
    let params = [];

    if (id) {
      query += " WHERE id_usuario = ?";
      params.push(id);
    } else if (nombre) {
      query += " WHERE nombre LIKE ?";
      params.push(`%${nombre}%`);
    }

    const [usuarios] = await conexion.execute(query, params);
    res.status(200).json({ status: "success", usuarios });
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ status: "error", message: "Error interno al buscar usuario" });
  }
}

// Ver facturas de un usuario por su ID
async function verFacturasUsuario(req, res) {
  const { id } = req.params;

  try {
    const [facturas] = await conexion.execute(
      "SELECT id, fecha, total, factura FROM historial_compras WHERE usuario_id = ?",
      [id]
    );

    const facturasFormateadas = facturas.map((f) => {
      // Extrae solo el nombre del archivo (sin el path local feo)
      const tieneFactura = f.factura instanceof Buffer && f.factura.length > 0;
        return {
          id: f.id,
          fecha: f.fecha,
          total: f.total,
          tieneFactura
        };


      return {
        id: f.id,
        fecha: f.fecha,
        total: f.total,
        factura: nombreArchivo, // esto será accesible como descarga
      };
    });

    res.status(200).json({ status: "success", facturas: facturasFormateadas });
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({ status: "error", message: "Error interno al obtener facturas" });
  }
}

async function descargarFactura(req, res) {
  const { id } = req.params;
  try {
    const [facturas] = await conexion.execute(
      "SELECT factura FROM historial_compras WHERE id = ?",
      [id]
    );

    if (!facturas.length || !facturas[0].factura) {
      return res.status(404).send("Factura no encontrada");
    }

    const bufferPDF = facturas[0].factura;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=factura_${id}.pdf`);
    res.send(bufferPDF);
  } catch (error) {
    console.error("Error al descargar la factura:", error);
    res.status(500).send("Error al obtener la factura.");
  }
}

export const methods = {
  crearPaquete,
  buscarUsuarios,
  verFacturasUsuario,
  descargarFactura
};


import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { conexion } from './db.js';

async function login(req, res) {
    const user = req.body.nombre;
    const password = req.body.password;
    const email = req.body.email;
    
    if (!user || !password || !email ) {
        return res.status(400).send({ status: "Error", message: "Los campos están sin completar" });
    }

    try {
        const [rows] = await conexion.execute(
            "SELECT * FROM usuario WHERE nombre = ? AND mail = ?",
            [user, email]
        );

        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "Usuario no encontrado" });
        }

        const usuarioBD = rows[0];
        const loginCorrecto = await bcryptjs.compare(password, usuarioBD.contraseña);

        if (!loginCorrecto) {
            return res.status(401).send({ status: "Error", message: "Contraseña incorrecta" });
        }

        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION || !process.env.JWT_COOKIE_EXPIRES) {
            console.error("Faltan variables de entorno JWT");
            return res.status(500).send({ status: "Error", message: "Error interno de configuración" });
        }

        const token = jsonwebtoken.sign(
            { user: usuarioBD.nombre, id: usuarioBD.id_usuario },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const cookieOption = {
            expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            path: "/"
        };

        res.cookie("jwt", token, cookieOption);
        return res.status(201).send({ status: "ok", redirect: "/index" });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).send({ status: "Error", message: "Error en el servidor" });
    }
}

async function register(req, res) {
    const user = req.body.nombre;
    const password = req.body.password;
    const email = req.body.email;
    const cuil = req.body.cuil;
    if (!user || !password || !email|| !cuil) {
        return res.status(400).send({ status: "Error", message: "Los campos están sin completar" });
    }

    try {
        const [existente] = await conexion.execute(
            "SELECT * FROM usuario WHERE nombre = ? OR mail = ?",
            [user, email]
        );

        if (existente.length > 0) {
            return res.status(400).send({ status: "Error", message: "El nombre de usuario o correo ya está en uso" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        await conexion.execute(
            "INSERT INTO usuario (nombre, contraseña, mail,cuil) VALUES (?, ?, ?, ?)",
            [user, hashedPassword, email,cuil]
        );

        return res.status(201).send({ status: "ok", message: "Usuario registrado exitosamente", redirect: "/" });

    } catch (error) {
        console.error("Error en el registro:", error);
        return res.status(500).send({ status: "Error", message: "Error en el servidor durante el registro" });
    }
}

export const methods = {
    login,
    register
};

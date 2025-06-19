import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
// console.log("ENV CHECK:", {
//   JWT_SECRET: process.env.JWT_SECRET,
//   JWT_EXPIRATION: process.env.JWT_EXPIRATION,
//   JWT_COOKIE_EXPIRES: process.env.JWT_COOKIE_EXPIRES
// });

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import { methods as authentication } from "./controllers/authentication.controller.js";
import './controllers/compra.js';
import productosRouter from './controllers/productos.js';
import compraRouter from './controllers/compra.js';
import adminRoutes from "./admin/admin.routes.js";





//server
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("port", 1364);
app.listen(app.get("port"));
console.log("servidor corriendo en puerto", app.get("port"));

//config
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser()); 
app.use("/admin/views", express.static(path.join(__dirname, "admin", "views")));
//rutas
app.get("/", (rec, res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get("/registro", (rec, res)=> res.sendFile(__dirname + "/pages/registro.html"));
app.get("/login", (rec, res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get("/index", (rec, res)=> res.sendFile(__dirname + "/pages/index.html"));
app.get("/carrito", (rec, res)=> res.sendFile(__dirname + "/pages/carrito.html"));
app.get('/controllers/main.js', (req, res) => {res.sendFile(path.join(__dirname, 'controllers', 'main.js'));});
app.get("/controllers/carrito.js", (req, res) => res.sendFile(path.join(__dirname, "controllers", "carrito.js")));
app.get("/controllers/menu.js", (req, res) =>res.sendFile(path.join(__dirname, "controllers", "menu.js")));
app.post("/api/registro",authentication.register);
app.post("/api/login",authentication.login);
app.use("/facturas", express.static(path.join(__dirname, "registro", "controllers", "facturas")));
app.use('/api', productosRouter);
app.use('/api', compraRouter);
app.use("/admin", adminRoutes);
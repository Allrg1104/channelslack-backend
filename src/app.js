import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "../src/routes/routes.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
await connectDB(); // conecta antes de montar rutas
app.use('/api-rest/slack', userRoutes);

//Ruta raiz
app.get('/', async (req, res) => {
  res.send("Bienvenido a la API del proytecto app slack");
});

export default app;

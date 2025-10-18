// server.js
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as SlackStrategy } from "passport-slack-oauth2";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Workspace from "./models/Workspace.js";
import slackRoutes from "./src/routes/slack.routes.js";
import { connectDB } from "./src/config/db.js"; // ✅ importa la conexión de MongoClient

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => res.send("✅ ChannelSlack backend activo"));

// ✅ monta el router exactamente en /api-rest/slack
app.use("/api-rest/slack", slackRoutes);

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configuración de SlackStrategy
passport.use(
  new SlackStrategy(
    {
      clientID: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      callbackURL: process.env.SLACK_CALLBACK_URL,
      scope: ["identity.basic", "identity.email", "identity.team"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar o crear workspace en MongoDB (Mongoose)
        let workspace = await Workspace.findOne({ slackId: profile.team.id });
        if (!workspace) {
          workspace = new Workspace({
            slackId: profile.team.id,
            name: profile.team.name,
            accessToken,
          });
          await workspace.save();
        }
        done(null, profile);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Rutas de autenticación
app.get("/auth/slack", passport.authenticate("slack"));
app.get(
  "/auth/slack/callback",
  passport.authenticate("slack", { failureRedirect: "/" }),
  (req, res) => res.redirect("/dashboard")
);

// Conexión a MongoDB y arranque del servidor
const startServer = async () => {
  try {
    // ✅ Conectar Mongoose
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB con Mongoose");

    // ✅ Conectar cliente nativo usado por getDB()
    await connectDB();
    console.log("✅ Cliente MongoDB inicializado");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
};

startServer();

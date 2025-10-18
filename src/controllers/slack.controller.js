import axios from "axios";
import { getDB } from "../config/db.js";

// 🔹 Paso 1: Instalar app (redirige a Slack)
export const slackInstall = (req, res) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      scope: "channels:read,channels:manage,groups:read,groups:write,chat:write,commands,users:read",
      redirect_uri: process.env.SLACK_OAUTH_REDIRECT_URI,
    });

    res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  } catch (error) {
    console.error("❌ Error en slackInstall:", error.message);
    res.status(500).json({ error: "Error iniciando instalación de Slack" });
  }
};

// 🔹 Paso 2: Redirección OAuth
export const slackOAuthRedirect = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Código OAuth no proporcionado" });

  try {
    // Intercambiamos el código por tokens
    const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        code,
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: process.env.SLACK_OAUTH_REDIRECT_URI,
      },
    });

    const data = response.data;
    if (!data.ok) {
      console.error("❌ Error en OAuth Slack:", data);
      return res.status(400).json(data);
    }

    const db = getDB();
    const installations = db.collection("installations");

    // Guardar instalación
    await installations.updateOne(
      { team_id: data.team.id },
      {
        $set: {
          team_name: data.team.name,
          bot_token: data.access_token,
          bot_user_id: data.bot_user_id,
          scopes: data.scope.split(","),
          installed_at: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Instalación registrada para ${data.team.name}`);
    
    // 🔹 Redirigir al frontend
    res.redirect(`https://channelslack-frontend.vercel.app/installed?team=${encodeURIComponent(data.team.name)}`);
  } catch (error) {
    console.error("🔴 ERROR DETALLADO DE SLACK:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en OAuth Slack" });
  }
};

    // 🔹 Crear canal automáticamente
    try {
      const createChannel = await axios.post(
        "https://slack.com/api/conversations.create",
        { name: "general-channel" }, // 👈 puedes cambiar el nombre aquí
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (createChannel.data.ok) {
        console.log(`🎉 Canal creado: ${createChannel.data.channel.name}`);
      } else {
        console.warn("⚠️ No se pudo crear el canal automáticamente:", createChannel.data.error);
      }
    } catch (err) {
      console.error("❌ Error creando canal en Slack:", err.response?.data || err.message);
    };

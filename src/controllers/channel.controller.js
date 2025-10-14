import { getDB } from "../config/db.js";
import { createChannel } from "../utils/slackApi.js";

export const createSlackChannel = async (req, res) => {
  const { team_id, name, is_private = false } = req.body;
  if (!team_id || !name)
    return res.status(400).json({ error: "Faltan parámetros requeridos" });

  try {
    const db = getDB();
    const installation = await db.collection("installations").findOne({ team_id });
    if (!installation) return res.status(404).json({ error: "Workspace no encontrado" });

    const channel = await createChannel(installation.bot_token, name, is_private);
    res.json({ ok: true, channel });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error creando canal" });
  }
};

import axios from "axios";
import { getDB } from "../config/db.js";

export const slackInstall = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: "channels:read,channels:manage,groups:read,groups:write,chat:write",
    redirect_uri: process.env.SLACK_OAUTH_REDIRECT_URI,
  });
  res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
};

export const slackOAuthRedirect = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Código OAuth no proporcionado" });

  try {
    const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        code,
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: process.env.SLACK_OAUTH_REDIRECT_URI,
      },
    });

    const data = response.data;
    if (!data.ok) return res.status(400).json(data);

    const db = getDB();
    const installations = db.collection("installations");

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

    res.redirect(`${process.env.APP_BASE_URL}/installed?team=${data.team.name}`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error en OAuth Slack" });
  }
};

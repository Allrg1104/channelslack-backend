// src/routes/slack.routes.js
import express from "express";
import { slackInstall, slackOAuthRedirect } from "../controllers/slack.controller.js";
import { createSlackChannel } from "../controllers/channel.controller.js";

const router = express.Router();

router.get("/install", slackInstall);                //para definir
router.get("/oauth_redirect", slackOAuthRedirect);   //para definir
router.post("/create", createSlackChannel);          //para definir

export default router;

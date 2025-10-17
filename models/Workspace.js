import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  team_id: { type: String, required: true, unique: true },
  team_name: String,
  access_token: String,
  bot_user_id: String,
  installed_by: String
});

export default mongoose.model("Workspace", workspaceSchema);

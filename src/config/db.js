import { MongoClient } from "mongodb";

let db;
export const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(); // base de datos "slackdb"
    console.log("✅ Se conecto correctamente a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando MongoDB:", error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) throw new Error("❌ La base de datos no está inicializada");
  return db;
};



//ejemplo de datos en BD

//{
//  "_id": { "$oid": "67400c2f7c42be8a9d83b123" },
//  "team_id": "T04ABCD12",
// "team_name": "Mi Empresa",
// "bot_token": "xoxb-123456...",
// "bot_user_id": "U0BOT",
// "scopes": ["channels:read", "channels:manage", "chat:write"],
// "installed_at": { "$date": "2025-10-13T20:00:00Z" }
//}

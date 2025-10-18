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

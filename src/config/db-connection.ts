import mongoose from "mongoose";
import logger from "jet-logger";
import dotenv from "dotenv";

dotenv.config();

export const mongodbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  maxPoolSize: 1000,
};

const connectionString = process.env.MONGO_URI as string;

export const connectToDB = () => {
  mongoose.connect(connectionString, mongodbOptions);
  const db = mongoose.connection;

  db.on("error", async function (error) {
    logger.err("[❌ database] Connection error " + error);
    process.exit();
  });
  db.once("open", async function () {
    logger.info("[🔌 database] Connected Successfully ✅");
    // try {
    //   await seedData();
    //   logger.info("[🌱 seeding] Ended");
    // } catch (error) {
    //   console.error("[🌱 seeding] Error", error);
    // }
  });
};

async function seedData() {}

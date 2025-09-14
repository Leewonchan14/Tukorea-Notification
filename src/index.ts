import express from "express";
import mongoose from "mongoose";
import { getEnv } from "./env";
import { scheduleTasks } from "./schedule";

const app = express();
const PORT = getEnv("PORT");
const MONGODB_URI = getEnv("MONGODB_URI");

app.get("/health", async (req, res) => {
  mongoose
    .connect(`mongodb://${MONGODB_URI}`)
    .then(() => {
      res.json({ status: "ok" });
    })
    .catch((e) => {
      res.status(500).json({ status: "error", message: e.message });
    });
});

const main = async () => {
  await mongoose.connect(`mongodb://${MONGODB_URI}`);
  console.log("Connected to MongoDB");

  await scheduleTasks();

  app.listen(Number(PORT), () => {
    console.log(`Example app listening on port ${PORT}`);
  });
};

main();

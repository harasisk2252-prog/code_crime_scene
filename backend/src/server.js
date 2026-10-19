import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import api from "./routes/api.js";
import { setMongoReady } from "./store.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", api);
app.get("/", (_req, res) => res.json({ name: "Code Crime Scene API", docs: "/api/health" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => { setMongoReady(true); console.log("MongoDB connected"); })
    .catch(err => { setMongoReady(false); console.warn("MongoDB unavailable; using local JSON demo mode:", err.message); });
} else {
  console.log("MONGODB_URI not set; using local JSON demo mode.");
}

app.listen(PORT, () => console.log(`Code Crime Scene API listening on http://localhost:${PORT}`));

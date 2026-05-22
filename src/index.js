import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import servicesRouter from "./routes/services.js";
import authRouter from "./routes/auth.js";
import projectsRouter from "./routes/projects.js";
import { authMiddleware } from "./middleware/auth.js";
import { startScheduler } from "./scheduler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/services", authMiddleware, servicesRouter);
app.use("/api/projects", authMiddleware, projectsRouter);

app.get("/", (_, res) => res.json({ status: "ok", message: "✅ API is running!" }));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  startScheduler();
});

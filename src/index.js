import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import servicesRouter from "./routes/services.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/services", servicesRouter);

app.get("/", (_, res) => res.json({ status: "ok", message: "✅ API is running!" }));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});

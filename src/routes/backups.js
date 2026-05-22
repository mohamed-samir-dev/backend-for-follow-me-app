import { Router } from "express";
import Backup from "../models/Backup.js";

const router = Router();

router.get("/", async (_, res) => {
  const backups = await Backup.find().sort({ backupDate: 1 });
  res.json(backups);
});

router.post("/", async (req, res) => {
  const backup = await Backup.create(req.body);
  res.status(201).json(backup);
});

router.put("/:id", async (req, res) => {
  const backup = await Backup.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(backup);
});

router.delete("/:id", async (req, res) => {
  await Backup.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;

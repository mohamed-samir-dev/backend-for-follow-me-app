import { Router } from "express";
import Project from "../models/Project.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { $or: [{ clientName: { $regex: search, $options: "i" } }, { projectName: { $regex: search, $options: "i" } }] } : {};
    const projects = await Project.find(query).sort({ renewalDate: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [total, active, expired, expiringSoon, maintenanceExpired] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "active" }),
      Project.countDocuments({ status: "expired" }),
      Project.countDocuments({ status: "expiring-soon" }),
      Project.countDocuments({ maintenanceStatus: "expired" }),
    ]);
    res.json({ total, active, expired, expiringSoon, maintenanceExpired });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { clientName, projectName } = req.body;
    if (!clientName || !projectName) return res.status(400).json({ error: "clientName and projectName are required" });
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

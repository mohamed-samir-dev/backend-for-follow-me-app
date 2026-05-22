import { Router } from "express";
import Service from "../models/Service.js";

const router = Router();

// GET all services
router.get("/", async (req, res) => {
  try {
    const { type, sort, search } = req.query;
    let query = {};
    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: "i" };

    const sortOption = sort === "renewal" ? { renewalDate: 1 } : { createdAt: -1 };
    const services = await Service.find(query).sort(sortOption);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const [total, active, expired, expiringSoon] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ status: "active" }),
      Service.countDocuments({ status: "expired" }),
      Service.countDocuments({ status: "expiring-soon" }),
    ]);
    res.json({ total, active, expired, expiringSoon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create service
router.post("/", async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update service
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE service
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

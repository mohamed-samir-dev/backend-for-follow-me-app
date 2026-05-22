import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    domain: { type: String, trim: true },
    renewalDate: { type: Date },
    maintenanceEndDate: { type: Date },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "expired", "expiring-soon"],
      default: "active",
    },
    maintenanceStatus: {
      type: String,
      enum: ["active", "expired", "expiring-soon"],
      default: "active",
    },
  },
  { timestamps: true }
);

function calcStatus(date) {
  if (!date) return "active";
  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "expired";
  if (diff <= 14) return "expiring-soon";
  return "active";
}

projectSchema.pre("save", function (next) {
  this.status = calcStatus(this.renewalDate);
  this.maintenanceStatus = calcStatus(this.maintenanceEndDate);
  next();
});

projectSchema.pre("findOneAndUpdate", function (next) {
  const u = this.getUpdate();
  if (u.renewalDate !== undefined) u.status = calcStatus(u.renewalDate);
  if (u.maintenanceEndDate !== undefined) u.maintenanceStatus = calcStatus(u.maintenanceEndDate);
  next();
});

export default mongoose.model("Project", projectSchema);

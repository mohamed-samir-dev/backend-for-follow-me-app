import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["Hosting", "Database", "Storage", "SaaS", "CDN", "Auth", "Other"],
    },
    email: { type: String, trim: true },
    plan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise", "Custom"],
      default: "Free",
    },
    renewalDate: { type: Date },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "expired", "expiring-soon"],
      default: "active",
    },
  },
  { timestamps: true }
);

serviceSchema.pre("save", function (next) {
  this.status = calcStatus(this.renewalDate);
  next();
});

serviceSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.renewalDate) {
    update.status = calcStatus(update.renewalDate);
  }
  next();
});

function calcStatus(renewalDate) {
  if (!renewalDate) return "active";
  const now = new Date();
  const diff = (new Date(renewalDate) - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "expired";
  if (diff <= 7) return "expiring-soon";
  return "active";
}

export default mongoose.model("Service", serviceSchema);

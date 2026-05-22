import mongoose from "mongoose";

const backupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    backupDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Backup", backupSchema);

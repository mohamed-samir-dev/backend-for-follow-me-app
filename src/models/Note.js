import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    color: { type: String, default: "yellow" },
    reminderDate: { type: Date, default: null },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);

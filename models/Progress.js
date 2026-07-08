import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  totalSessions: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  weakTopics: [{ type: String }],
  strongTopics: [{ type: String }],
  sessionHistory: [{
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    score: { type: Number },
    date: { type: Date },
    role: { type: String },
    company: { type: String },
  }],
}, { timestamps: true });

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);